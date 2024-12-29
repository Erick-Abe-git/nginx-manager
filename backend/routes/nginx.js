import { Router } from 'express';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
const router = Router();

const NGINX_CONF_DIR = '/etc/nginx/conf.d';
const NGINX_SITES_DIR = '/etc/nginx/sites-available';
const DEFAULT_CONFIG = '/etc/nginx/nginx.conf';

// 辅助函数：执行 Nginx 命令
async function executeNginxCommand(command) {
  try {
    const { stdout, stderr } = await execAsync(command);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 获取 Nginx 状态
router.get('/status', async (req, res) => {
  try {
    const { success, stdout, error } = await executeNginxCommand('nginx -t');
    if (!success) {
      return res.status(500).json({ error });
    }
    
    const statusResult = await executeNginxCommand('systemctl status nginx');
    res.json({
      configTest: stdout,
      status: statusResult.stdout
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取所有配置文件
router.get('/configs', async (req, res) => {
  try {
    const [confFiles, sitesFiles] = await Promise.all([
      fs.readdir(NGINX_CONF_DIR),
      fs.readdir(NGINX_SITES_DIR).catch(() => [])
    ]);

    const configs = {
      conf_d: confFiles,
      sites_available: sitesFiles
    };

    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取特定配置文件内容
router.get('/config/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const configPath = path.join(NGINX_CONF_DIR, filename);
    
    // 安全检查：确保文件路径在允许的目录内
    if (!configPath.startsWith(NGINX_CONF_DIR)) {
      return res.status(403).json({ error: '非法的文件路径' });
    }

    const config = await fs.readFile(configPath, 'utf8');
    res.json({ config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新配置文件
router.put('/config/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;
    const configPath = path.join(NGINX_CONF_DIR, filename);

    // 安全检查
    if (!configPath.startsWith(NGINX_CONF_DIR)) {
      return res.status(403).json({ error: '非法的文件路径' });
    }

    // 备份原配置
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${configPath}.backup-${timestamp}`;
    await fs.copyFile(configPath, backupPath);

    // 写入新配置
    await fs.writeFile(configPath, content, 'utf8');

    // 测试配置
    const testResult = await executeNginxCommand('nginx -t');
    if (!testResult.success) {
      // 如果测试失败，恢复备份
      await fs.copyFile(backupPath, configPath);
      return res.status(400).json({ 
        error: '配置测试失败',
        details: testResult.error 
      });
    }

    // 重新加载 Nginx
    const reloadResult = await executeNginxCommand('nginx -s reload');
    if (!reloadResult.success) {
      return res.status(500).json({ 
        error: '重新加载失败',
        details: reloadResult.error 
      });
    }

    res.json({ 
      message: '配置更新成功',
      backup: backupPath 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 重启 Nginx
router.post('/restart', async (req, res) => {
  try {
    const result = await executeNginxCommand('systemctl restart nginx');
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    res.json({ message: 'Nginx 重启成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取 Nginx 统计信息
router.get('/stats', async (req, res) => {
  try {
    const { stdout: processInfo } = await execAsync('ps aux | grep nginx');
    const { stdout: connections } = await execAsync('netstat -an | grep :80 | wc -l');
    
    res.json({
      processes: processInfo.split('\n').filter(line => line.includes('nginx')),
      activeConnections: parseInt(connections.trim())
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取 Nginx 配置文件内容
router.get('/config', async (req, res) => {
  try {
    const configPath = '/etc/nginx/conf.d/cache.conf';
    const config = await fs.readFile(configPath, 'utf8');
    res.json({ config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
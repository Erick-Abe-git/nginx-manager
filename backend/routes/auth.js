import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 模拟用户数据库
let users = [];

// 初始化默认管理员账户
async function initializeAdmin() {
  const adminUsername = 'admin';
  // 如果管理员账户不存在，创建它
  if (!users.find(u => u.username === adminUsername)) {
    const hashedPassword = await bcrypt.hash('Admin', 10);
    users.push({
      username: adminUsername,
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Default admin account created');
  }
}

// 创建默认管理员账户（只调用一次）
initializeAdmin().catch(console.error);

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({
      username,
      password: hashedPassword,
      role: 'user'  // 默认用户角色
    });

    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username }); // 添加日志
    
    const user = users.find(u => u.username === username);
    if (!user) {
      console.log('User not found:', username); // 添加日志
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('Invalid password for user:', username); // 添加日志
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign({ 
      username,
      role: user.role
    }, JWT_SECRET, { 
      expiresIn: '24h' 
    });
    
    console.log('Login successful:', username, 'Role:', user.role); // 添加日志
    res.json({ 
      token,
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error); // 添加日志
    res.status(500).json({ message: '登录失败', error: error.message });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未登录' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.username === decoded.username);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(401).json({ message: '认证失败', error: error.message });
  }
});

export default router;
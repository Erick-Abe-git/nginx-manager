<template>
  <div class="dashboard">
    <div class="system-stats">
      <div class="stat-card">
        <h3>CPU 使用率</h3>
        <div class="stat-value">{{ cpuUsage }}%</div>
        <v-progress-linear :value="cpuUsage" color="primary"></v-progress-linear>
      </div>
      
      <div class="stat-card">
        <h3>内存使用率</h3>
        <div class="stat-value">{{ memoryUsage }}%</div>
        <v-progress-linear :value="memoryUsage" color="warning"></v-progress-linear>
      </div>

      <div class="stat-card">
        <h3>磁盘使用率</h3>
        <div class="stat-value">{{ diskUsage }}%</div>
        <v-progress-linear :value="diskUsage" color="error"></v-progress-linear>
      </div>

      <div class="stat-card">
        <h3>网络流量</h3>
        <div>上传：{{ networkUp }} MB/s</div>
        <div>下载：{{ networkDown }} MB/s</div>
      </div>
    </div>

    <div class="nginx-config">
      <h2>Nginx 配置</h2>
      <pre><code>{{ nginxConfig }}</code></pre>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkUp: 0,
      networkDown: 0,
      nginxConfig: ''
    }
  },
  
  mounted() {
    this.fetchSystemStats();
    this.fetchNginxConfig();
    // 每5秒更新一次系统状态
    this.timer = setInterval(this.fetchSystemStats, 5000);
  },

  beforeDestroy() {
    clearInterval(this.timer);
  },

  methods: {
    async fetchSystemStats() {
      try {
        const response = await this.$axios.get('/api/system/stats');
        const { cpu, memory, disk, network } = response.data;
        
        this.cpuUsage = cpu.usage.toFixed(1);
        this.memoryUsage = ((memory.used / memory.total) * 100).toFixed(1);
        this.diskUsage = ((disk[0].used / disk[0].size) * 100).toFixed(1);
        this.networkUp = (network[0].tx_sec / 1024 / 1024).toFixed(2);
        this.networkDown = (network[0].rx_sec / 1024 / 1024).toFixed(2);
      } catch (error) {
        console.error('获取系统状态失败:', error);
      }
    },

    async fetchNginxConfig() {
      try {
        const response = await this.$axios.get('/api/nginx/config');
        this.nginxConfig = response.data.config;
      } catch (error) {
        console.error('获取Nginx配置失败:', error);
      }
    }
  }
}
</script> 
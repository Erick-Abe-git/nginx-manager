import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import si from 'systeminformation';
import authMiddleware from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import systemRoutes from './routes/system.js';
import nginxRoutes from './routes/nginx.js';

const app = express();

// 配置 CORS
const corsOptions = {
  origin: ['http://116.63.129.107:8080', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 解析 JSON 请求体
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  
  // 记录响应
  const oldSend = res.send;
  res.send = function(data) {
    console.log('Response:', data);
    oldSend.apply(res, arguments);
  };
  
  next();
});

// 基础路由
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to EricGY API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/auth',
      system: '/system',
      nginx: '/nginx'
    }
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API路由
app.use('/auth', authRoutes);
app.use('/system', authMiddleware, systemRoutes);
app.use('/nginx', authMiddleware, nginxRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log('CORS enabled for:', corsOptions.origin);
});
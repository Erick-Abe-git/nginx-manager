# Nginx Manager

一个基于 Vue.js 和 Node.js 的 Nginx 可视化管理系统。

## 功能特点

- 🔐 用户认证与权限管理
- 📝 Nginx 配置文件管理
- 🔄 服务状态监控
- 📊 访问日志分析

## 快速开始

### 1. 安装依赖

```bash
# 后端
cd backend && npm install

# 前端
cd frontend && npm install
```

### 2. 开发模式

```bash
# 后端
cd backend && npm run dev

# 前端
cd frontend && npm run serve
```

### 3. 生产部署

```bash
# 构建前端
cd frontend && npm run build

# 部署到 Nginx
sudo cp -r frontend/dist/* /usr/share/nginx/html/

# 启动后端
cd backend && npm start
```

## 默认账户

- 用户名：admin
- 密码：Admin

## API 文档

### 认证接口
- POST `/api/auth/login` - 用户登录
- POST `/api/auth/register` - 用户注册
- GET `/api/auth/me` - 获取当前用户信息

### Nginx 管理
- GET `/api/nginx/status` - 获取服务状态
- GET `/api/nginx/configs` - 获取配置文件列表
- GET `/api/nginx/config/:filename` - 获取配置文件内容
- PUT `/api/nginx/config/:filename` - 更新配置文件

## 技术栈

- 前端：Vue.js + Vuetify + Axios
- 后端：Node.js + Express
- 服务器：Nginx

## 目录结构

```
.
├── backend/
│   ├── routes/      # API 路由
│   ├── middleware/  # 中间件
│   └── server.js    # 服务入口
└── frontend/
    ├── src/         # 源代码
    ├── public/      # 静态资源
    └── dist/        # 构建输出
```

## 更新日志

2024-12-29
- ✨ 初始版本发布
- 🔒 添加用户认证
- 🚀 完善 Nginx 管理功能
#!/bin/bash

# 前端端口
FRONTEND_PORT=8080
# 后端端口
BACKEND_PORT=3000

# 获取进程状态
status() {
    echo "Frontend process (port $FRONTEND_PORT):"
    lsof -i :$FRONTEND_PORT
    echo -e "\nBackend process (port $BACKEND_PORT):"
    lsof -i :$BACKEND_PORT
}

# 停止特定服务
stop_service() {
    local port=$1
    local pid=$(lsof -t -i :$port)
    if [ ! -z "$pid" ]; then
        echo "Stopping process on port $port (PID: $pid)"
        kill $pid
    else
        echo "No process found on port $port"
    fi
}

# 停止所有服务
stop_all() {
    stop_service $FRONTEND_PORT
    stop_service $BACKEND_PORT
}

case "$1" in
    status)
        status
        ;;
    stop-frontend)
        stop_service $FRONTEND_PORT
        ;;
    stop-backend)
        stop_service $BACKEND_PORT
        ;;
    stop-all)
        stop_all
        ;;
    *)
        echo "Usage: $0 {status|stop-frontend|stop-backend|stop-all}"
        exit 1
        ;;
esac

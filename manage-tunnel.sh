#!/bin/bash

# Script quản lý Cloudflare Tunnel cho snet.io.vn

TUNNEL_NAME="snet-tunnel"
CONFIG_FILE="/home/hv/.cloudflared/snet-config.yml"
LOG_FILE="/home/hv/.cloudflared/snet-tunnel.log"

case "$1" in
    start)
        echo "Khởi động $TUNNEL_NAME..."
        cd /home/hv/.cloudflared
        nohup cloudflared tunnel --config $CONFIG_FILE run $TUNNEL_NAME > $LOG_FILE 2>&1 &
        sleep 3
        echo "Tunnel đã khởi động. Kiểm tra trạng thái:"
        cloudflared tunnel info $TUNNEL_NAME
        ;;
    stop)
        echo "Dừng $TUNNEL_NAME..."
        pkill -f "cloudflared.*snet-config.yml"
        echo "Tunnel đã dừng."
        ;;
    restart)
        echo "Khởi động lại $TUNNEL_NAME..."
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        echo "Trạng thái $TUNNEL_NAME:"
        cloudflared tunnel info $TUNNEL_NAME
        echo ""
        echo "Tiến trình đang chạy:"
        ps aux | grep "cloudflared.*snet-config.yml" | grep -v grep
        ;;
    log)
        echo "Log của $TUNNEL_NAME:"
        tail -50 $LOG_FILE
        ;;
    follow)
        echo "Theo dõi log của $TUNNEL_NAME (Ctrl+C để thoát):"
        tail -f $LOG_FILE
        ;;
    *)
        echo "Sử dụng: $0 {start|stop|restart|status|log|follow}"
        echo ""
        echo "  start   - Khởi động tunnel"
        echo "  stop    - Dừng tunnel"
        echo "  restart - Khởi động lại tunnel"
        echo "  status  - Kiểm tra trạng thái tunnel"
        echo "  log     - Xem 50 dòng log cuối"
        echo "  follow  - Theo dõi log realtime"
        exit 1
        ;;
esac

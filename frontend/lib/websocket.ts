import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { authService } from './auth';

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;

  connect(onMessageReceived: (message: any) => void, onConnected?: () => void) {
    const token = authService.getToken();
    if (!token) {
      console.error('No token found');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('✅ WebSocket Connected');
        this.connected = true;
        
        // Subscribe to user's private queue
        this.client?.subscribe('/user/queue/messages', (message) => {
          const payload = JSON.parse(message.body);
          console.log('📨 Received message:', payload);
          onMessageReceived(payload);
        });

        // Subscribe to online users updates
        this.client?.subscribe('/topic/online-users', (message) => {
          const users = JSON.parse(message.body);
          console.log('👥 Online users updated:', users);
        });

        if (onConnected) {
          onConnected();
        }
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
        this.connected = false;
      },
      onWebSocketClose: () => {
        console.log('🔌 WebSocket closed');
        this.connected = false;
      }
    });

    this.client.activate();
  }

  sendMessage(receiverId: number, content: string, type: string = 'TEXT') {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const message = {
      receiverId,
      content,
      type
    };

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message)
    });

    console.log('📤 Sent message:', message);
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      console.log('🔌 WebSocket disconnected');
    }
  }

  isConnected() {
    return this.connected;
  }
}

export const webSocketService = new WebSocketService();

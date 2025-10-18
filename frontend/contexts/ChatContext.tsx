'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { authService } from '@/lib/auth';
import { notificationService } from '@/lib/notifications';
import { apiService } from '@/lib/api';

interface Message {
  id: number;
  senderId: number;
  senderName?: string;
  receiverId?: number;
  receiverName?: string;
  groupId?: number;
  groupName?: string;
  content: string;
  type: string;
  status: string;
  sentAt: string;
  readAt?: string | null;
  fileId?: number;
  fileName?: string;
}

interface ChatContextType {
  client: Client | null;
  messages: Message[];
  sendMessage: (receiverId: number | null, content: string, fileId?: number, type?: string, groupId?: number) => void;
  sendGroupMessage: (groupId: number, content: string, fileId?: number, type?: string) => void;
  loadGroupMessages: (groupId: number) => Promise<void>;
  activeChat: number | null;
  setActiveChat: (userId: number | null) => void;
  activeGroup: number | null;
  setActiveGroup: (groupId: number | null) => void;
  onlineUsers: string[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const clientRef = useRef<Client | null>(null);
  const messagesRef = useRef<Message[]>(messages);

  // Log when onlineUsers changes
  useEffect(() => {
    console.log('🌐 Online users state updated:', onlineUsers);
  }, [onlineUsers]);

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const token = authService.getToken();
      const currentUser = authService.getUser();
      const currentUserId = currentUser?.id;
      
      const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://113.170.159.180:8086';
      
      const stompClient = new Client({
        webSocketFactory: () => new SockJS(`${wsUrl}/ws`),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          // Only log errors and important messages
          if (str.includes('ERROR') || str.includes('CONNECTED') || str.includes('DISCONNECT')) {
            console.log('STOMP:', str);
          }
        },
        reconnectDelay: 2000, // Giảm từ 5000ms xuống 2000ms
        heartbeatIncoming: 2000, // Giảm từ 4000ms xuống 2000ms
        heartbeatOutgoing: 2000, // Giảm từ 4000ms xuống 2000ms
      });

      stompClient.onConnect = () => {
        console.log('✅ WebSocket connected');

        // Subscribe to personal messages (includes both direct and group messages)
        stompClient.subscribe('/user/queue/messages', (message: IMessage) => {
          console.log('📨 Message received:', message.body);
          const msg = JSON.parse(message.body);
          
          setMessages(prev => {
            // Check if message already exists
            const exists = prev.some(m => m.id === msg.id);
            if (exists) {
              console.log('⚠️ Duplicate message ignored:', msg.id);
              return prev;
            }
            console.log('✅ New message added to state');
            return [...prev, msg];
          });

          const isNewMessage = msg.senderId !== currentUserId;

          // Show notification for new incoming messages only
          const shouldNotify = isNewMessage && !!msg.receiverId; // Only notify for direct messages, not group
          
          console.log('🔔 Notification check:', {
            isNewMessage,
            shouldNotify,
            hasReceiverId: !!msg.receiverId,
            hasGroupId: !!msg.groupId,
            hasFocus: document.hasFocus(),
            permission: typeof window !== 'undefined' && 'Notification' in window 
              ? Notification.permission 
              : 'not-supported'
          });

          if (shouldNotify) {
            console.log('🔔 Attempting to show notification...');
            
            // Use async IIFE to handle await
            (async () => {
              try {
                // Get sender info for notification
                const sender = await apiService.getUserProfile(msg.senderId);
                console.log('👤 Sender info:', sender.displayName);
                
                if (msg.type === 'FILE' && msg.fileName) {
                  // File notification
                  console.log('📎 Showing file notification');
                  await notificationService.showFileNotification(
                    sender.displayName,
                    msg.fileName,
                    msg.senderId,
                    {
                      avatar: apiService.getUserAvatar(msg.senderId)
                    }
                  );
                } else {
                  // Text message notification
                  console.log('💬 Showing message notification');
                  await notificationService.showMessageNotification(
                    sender.displayName,
                    msg.content,
                    msg.senderId,
                    {
                      avatar: apiService.getUserAvatar(msg.senderId),
                      verified: sender.verified
                    }
                  );
                }
                
                // Play sound
                console.log('🔊 Playing notification sound');
                notificationService.playNotificationSound();
              } catch (error) {
                console.error('❌ Error showing notification:', error);
              }
            })();
          }
        });

        // Subscribe to online users updates
        stompClient.subscribe('/topic/online-users', (message: IMessage) => {
          try {
            const users = JSON.parse(message.body);
            console.log('👥 Online users updated:', users);
            setOnlineUsers(Array.isArray(users) ? users : []);
          } catch (error) {
            console.error('❌ Error parsing online users:', error);
            setOnlineUsers([]);
          }
        });

        // Fetch initial online users list
        apiService.getOnlineUsers()
          .then((users) => {
            console.log('👥 Initial online users loaded:', users);
            const emails = users.map((u: any) => u.email);
            setOnlineUsers(emails);
          })
          .catch((error) => {
            console.error('❌ Error loading initial online users:', error);
          });
      };

      stompClient.onStompError = (frame) => {
        console.error('❌ STOMP error:', frame.headers['message']);
        console.error('Error details:', frame.body);
      };

      stompClient.activate();
      clientRef.current = stompClient;
      setClient(stompClient);

      return () => {
        if (clientRef.current) {
          clientRef.current.deactivate();
        }
      };
    }
  }, []);

  const sendMessage = (receiverId: number | null, content: string, fileId?: number, type = 'TEXT', groupId?: number) => {
    if (clientRef.current && clientRef.current.connected) {
      const message: any = {
        content,
        type: fileId ? 'FILE' : type,
      };
      
      // Either send to user or group
      if (groupId) {
        message.groupId = groupId;
      } else if (receiverId) {
        message.receiverId = receiverId;
      }
      
      if (fileId) {
        message.fileId = fileId;
      }
      
      console.log('📤 Sending message:', message);
      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message),
      });
    } else {
      console.error('❌ WebSocket not connected');
    }
  };

  const sendGroupMessage = (groupId: number, content: string, fileId?: number, type = 'TEXT') => {
    console.log('📨 Sending group message:', { groupId, content, fileId, type });
    sendMessage(null, content, fileId, type, groupId);
  };

  const loadGroupMessages = async (groupId: number) => {
    try {
      console.log('📥 Loading group messages from API for group:', groupId);
      const data = await apiService.getGroupMessages(groupId);
      console.log('📥 Received group messages:', data.length);
      
      // Add to messages state, avoid duplicates
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = data.filter((m: Message) => !existingIds.has(m.id));
        console.log('📥 Adding new messages to state:', newMessages.length);
        return [...prev, ...newMessages];
      });
    } catch (error) {
      console.error('❌ Failed to load group messages:', error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        client,
        messages,
        sendMessage,
        sendGroupMessage,
        loadGroupMessages,
        activeChat,
        setActiveChat,
        activeGroup,
        setActiveGroup,
        onlineUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

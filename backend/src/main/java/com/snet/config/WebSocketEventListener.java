package com.snet.config;

import com.snet.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {
    
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;
    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();
    
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.info("📱 WebSocket CONNECT event received");
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();
        
        if (user != null) {
            String userEmail = user.getName();
            log.info("✅ User connected: {}", userEmail);
            
            // Set user online
            userService.setUserOnlineStatus(userEmail, true);
            onlineUsers.add(userEmail);
            
            // Broadcast online users list
            broadcastOnlineUsers();
        } else {
            log.warn("⚠️ WebSocket connected but user is null - authentication might be missing");
        }
    }
    
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        log.info("📱 WebSocket DISCONNECT event received");
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();
        
        if (user != null) {
            String userEmail = user.getName();
            log.info("❌ User disconnected: {}", userEmail);
            
            // Set user offline
            userService.setUserOnlineStatus(userEmail, false);
            onlineUsers.remove(userEmail);
            
            // Broadcast online users list
            broadcastOnlineUsers();
            
            // Broadcast user status update
            broadcastUserStatus(userEmail);
        } else {
            log.warn("⚠️ WebSocket disconnected but user is null");
        }
    }
    
    private void broadcastUserStatus(String userEmail) {
        try {
            var userStatus = userService.getUserStatus(userEmail);
            messagingTemplate.convertAndSend("/topic/user-status", userStatus);
        } catch (Exception e) {
            log.error("Error broadcasting user status", e);
        }
    }
    
    private void broadcastOnlineUsers() {
        // Get all online user emails
        log.info("📡 Broadcasting online users: {} users online", onlineUsers.size());
        log.debug("Online users list: {}", onlineUsers);
        messagingTemplate.convertAndSend("/topic/online-users", onlineUsers);
    }
    
    public Set<String> getOnlineUsers() {
        return onlineUsers;
    }
}

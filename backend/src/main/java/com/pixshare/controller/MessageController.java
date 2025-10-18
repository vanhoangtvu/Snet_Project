package com.pixshare.controller;

import com.pixshare.dto.MessageRequest;
import com.pixshare.dto.MessageResponse;
import com.pixshare.service.MessageService;
import com.pixshare.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class MessageController {
    
    private final MessageService messageService;
    private final UserService userService;
    
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest request, Principal principal) {
        if (principal == null) {
            throw new RuntimeException("User not authenticated");
        }
        String senderEmail = principal.getName();
        messageService.sendMessage(senderEmail, request);
    }
    
    @GetMapping("/api/messages/chat/{userId}")
    @ResponseBody
    public ResponseEntity<org.springframework.data.domain.Page<MessageResponse>> getChatHistory(
            Authentication authentication,
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long currentUserId = userService.getCurrentUser(authentication.getName()).getId();
        return ResponseEntity.ok(messageService.getChatHistoryPaged(currentUserId, userId, page, size));
    }
    
    @GetMapping("/api/messages/group/{groupId}")
    @ResponseBody
    public ResponseEntity<List<MessageResponse>> getGroupMessages(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(messageService.getGroupMessages(groupId, page, size));
    }
    
    @PostMapping("/api/messages/{messageId}/read")
    @ResponseBody
    public ResponseEntity<Void> markAsRead(@PathVariable Long messageId) {
        messageService.markAsRead(messageId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/api/messages/{messageId}")
    @ResponseBody
    public ResponseEntity<Void> deleteMessage(
            Authentication authentication,
            @PathVariable Long messageId) {
        String userEmail = authentication.getName();
        messageService.deleteMessage(messageId, userEmail);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/api/messages/{messageId}/recall")
    @ResponseBody
    public ResponseEntity<MessageResponse> recallMessage(
            Authentication authentication,
            @PathVariable Long messageId) {
        String userEmail = authentication.getName();
        MessageResponse response = messageService.recallMessage(messageId, userEmail);
        return ResponseEntity.ok(response);
    }
}

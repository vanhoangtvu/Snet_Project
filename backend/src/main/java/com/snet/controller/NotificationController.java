package com.snet.controller;

import com.snet.dto.NotificationResponse;
import com.snet.model.Notification;
import com.snet.model.User;
import com.snet.service.NotificationService;
import com.snet.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        List<Notification> notifications = notificationService.getUserNotifications(user);
        
        List<NotificationResponse> response = notifications.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        return ResponseEntity.ok(notificationService.getUnreadCount(user));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setType(notification.getType().name());
        response.setContent(notification.getContent());
        response.setActorId(notification.getActor().getId());
        response.setActorName(notification.getActor().getDisplayName());
        response.setPostId(notification.getPost() != null ? notification.getPost().getId() : null);
        response.setCommentId(notification.getComment() != null ? notification.getComment().getId() : null);
        response.setIsRead(notification.getIsRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}

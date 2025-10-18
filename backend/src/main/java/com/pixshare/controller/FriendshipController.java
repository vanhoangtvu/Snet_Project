package com.pixshare.controller;

import com.pixshare.dto.FriendRequestResponse;
import com.pixshare.dto.UserResponse;
import com.pixshare.model.Friendship;
import com.pixshare.service.FriendshipService;
import com.pixshare.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@Tag(name = "Friends", description = "Friend request and friendship management APIs")
@SecurityRequirement(name = "bearerAuth")
public class FriendshipController {
    
    private final FriendshipService friendshipService;
    private final UserService userService;
    
    @PostMapping("/request/{friendId}")
    public ResponseEntity<Void> sendFriendRequest(
            Authentication authentication,
            @PathVariable Long friendId) {
        Long userId = userService.getCurrentUser(authentication.getName()).getId();
        friendshipService.sendFriendRequest(userId, friendId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/accept/{requestId}")
    public ResponseEntity<Void> acceptFriendRequest(@PathVariable Long requestId) {
        friendshipService.acceptFriendRequest(requestId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/reject/{requestId}")
    public ResponseEntity<Void> rejectFriendRequest(@PathVariable Long requestId) {
        friendshipService.rejectFriendRequest(requestId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping
    public ResponseEntity<List<UserResponse>> getFriendsList(Authentication authentication) {
        Long userId = userService.getCurrentUser(authentication.getName()).getId();
        return ResponseEntity.ok(friendshipService.getFriendsList(userId));
    }
    
    @GetMapping("/requests/pending")
    public ResponseEntity<List<FriendRequestResponse>> getPendingRequests(Authentication authentication) {
        Long userId = userService.getCurrentUser(authentication.getName()).getId();
        return ResponseEntity.ok(friendshipService.getPendingRequests(userId));
    }
    
    @GetMapping("/check/{userId}")
    public ResponseEntity<Boolean> areFriends(
            Authentication authentication,
            @PathVariable Long userId) {
        Long currentUserId = userService.getCurrentUser(authentication.getName()).getId();
        return ResponseEntity.ok(friendshipService.areFriends(currentUserId, userId));
    }
}

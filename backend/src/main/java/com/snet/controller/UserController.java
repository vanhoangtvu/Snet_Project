package com.snet.controller;

import com.snet.dto.UserResponse;
import com.snet.model.User;
import com.snet.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management APIs")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get profile of currently logged in user")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getUserProfile(
            userService.getCurrentUser(email).getId()
        ));
    }
    
    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID", description = "Get user profile by user ID")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @GetMapping("/{userId}/status")
    @Operation(summary = "Get user status", description = "Get user online status and last seen time")
    public ResponseEntity<?> getUserStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserStatusById(userId));
    }
    
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            Authentication authentication,
            @RequestParam(required = false) String displayName,
            @RequestParam(required = false) MultipartFile avatar,
            @RequestParam(required = false) MultipartFile coverPhoto,
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String dateOfBirth,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String website,
            @RequestParam(required = false) String facebookUrl,
            @RequestParam(required = false) String instagramUrl,
            @RequestParam(required = false) String twitterUrl,
            @RequestParam(required = false) String linkedinUrl,
            @RequestParam(required = false) String currentJob,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String school,
            @RequestParam(required = false) String university,
            @RequestParam(required = false) String hometown,
            @RequestParam(required = false) String relationshipStatus,
            @RequestParam(required = false) String languages,
            @RequestParam(required = false) String interests) throws IOException {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.updateProfileExtended(
            email, displayName, avatar, coverPhoto, bio, phoneNumber,
            dateOfBirth, gender, location, website, facebookUrl, 
            instagramUrl, twitterUrl, linkedinUrl,
            currentJob, company, school, university,
            hometown, relationshipStatus, languages, interests
        ));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by display name")
    public ResponseEntity<List<UserResponse>> searchUsers(
            Authentication authentication,
            @RequestParam String keyword) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.searchUsers(email, keyword));
    }
    
    @GetMapping("/online")
    public ResponseEntity<List<UserResponse>> getOnlineUsers() {
        return ResponseEntity.ok(userService.getOnlineUsers());
    }
    
    @GetMapping("/{userId}/avatar")
    public ResponseEntity<byte[]> getUserAvatar(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "medium") String size) {
        System.out.println("🔍 Avatar request for user ID: " + userId + " with size: " + size);
        byte[] avatar = userService.getUserAvatar(userId, size);
        if (avatar == null || avatar.length == 0) {
            System.out.println("❌ No avatar found for user: " + userId);
            // Trả về default avatar SVG thay vì 404
            User user = userService.getUserById(userId);
            String initial = user.getDisplayName() != null ? user.getDisplayName().substring(0, 1).toUpperCase() : "?";
            String svg = String.format(
                "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>" +
                "<rect fill='%236366f1' width='200' height='200'/>" +
                "<text x='100' y='120' font-size='80' fill='white' text-anchor='middle' font-family='Arial' font-weight='bold'>%s</text>" +
                "</svg>", initial
            );
            return ResponseEntity.ok()
                    .contentType(MediaType.valueOf("image/svg+xml"))
                    .body(svg.getBytes());
        }
        System.out.println("✅ Avatar found and returned for user: " + userId + " - " + avatar.length + " bytes");
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header("Cache-Control", "public, max-age=3600")
                .body(avatar);
    }
    
    @GetMapping("/{userId}/cover")
    public ResponseEntity<byte[]> getUserCoverPhoto(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "medium") String size) {
        System.out.println("📸 Request for cover photo of user: " + userId + " with size: " + size);
        byte[] coverPhoto = userService.getUserCoverPhoto(userId, size);
        if (coverPhoto == null || coverPhoto.length == 0) {
            System.out.println("⚠️ No cover photo found for user: " + userId);
            return ResponseEntity.notFound().build();
        }
        System.out.println("✅ Returning cover photo: " + coverPhoto.length + " bytes");
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header("Cache-Control", "public, max-age=3600")
                .body(coverPhoto);
    }
    
    @PostMapping("/status")
    public ResponseEntity<Void> updateOnlineStatus(
            Authentication authentication,
            @RequestParam boolean online) {
        String email = authentication.getName();
        userService.setUserOnlineStatus(email, online);
        return ResponseEntity.ok().build();
    }
}

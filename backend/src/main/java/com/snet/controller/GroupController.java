package com.snet.controller;

import com.snet.dto.CreateGroupRequest;
import com.snet.dto.GroupResponse;
import com.snet.service.GroupService;
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
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@Tag(name = "Groups", description = "Group chat management APIs")
@SecurityRequirement(name = "bearerAuth")
public class GroupController {
    
    private final GroupService groupService;
    
    @PostMapping
    @Operation(summary = "Create a new group", description = "Create a new chat group with members")
    public ResponseEntity<GroupResponse> createGroup(
            Authentication authentication,
            @RequestBody CreateGroupRequest request) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(groupService.createGroup(userEmail, request));
    }
    
    @GetMapping
    @Operation(summary = "Get user's groups", description = "Get all groups user is a member of")
    public ResponseEntity<List<GroupResponse>> getUserGroups(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(groupService.getUserGroups(userEmail));
    }
    
    @GetMapping("/{groupId}")
    @Operation(summary = "Get group details", description = "Get details of a specific group")
    public ResponseEntity<GroupResponse> getGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupById(groupId));
    }
    
    @PostMapping(value = "/{groupId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update group avatar", description = "Upload or update group avatar image")
    public ResponseEntity<GroupResponse> updateAvatar(
            Authentication authentication,
            @PathVariable Long groupId,
            @RequestParam("file") MultipartFile file) throws IOException {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(groupService.updateGroupAvatar(groupId, userEmail, file));
    }
    
    @GetMapping("/{groupId}/avatar")
    @Operation(summary = "Get group avatar", description = "Get group avatar image")
    public ResponseEntity<byte[]> getAvatar(@PathVariable Long groupId) {
        byte[] avatar = groupService.getGroupAvatar(groupId);
        if (avatar == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(avatar);
    }
    
    @PostMapping("/{groupId}/members/{userId}")
    @Operation(summary = "Add member to group", description = "Add a new member to the group (admin only)")
    public ResponseEntity<GroupResponse> addMember(
            Authentication authentication,
            @PathVariable Long groupId,
            @PathVariable Long userId) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(groupService.addMember(groupId, userEmail, userId));
    }
    
    @DeleteMapping("/{groupId}/members/{userId}")
    @Operation(summary = "Remove member from group", description = "Remove a member from the group (admin only)")
    public ResponseEntity<GroupResponse> removeMember(
            Authentication authentication,
            @PathVariable Long groupId,
            @PathVariable Long userId) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(groupService.removeMember(groupId, userEmail, userId));
    }
    
    @PostMapping("/{groupId}/leave")
    @Operation(summary = "Leave group", description = "Leave the group")
    public ResponseEntity<Void> leaveGroup(
            Authentication authentication,
            @PathVariable Long groupId) {
        String userEmail = authentication.getName();
        groupService.leaveGroup(groupId, userEmail);
        return ResponseEntity.ok().build();
    }
}

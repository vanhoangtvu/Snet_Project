package com.snet.controller;

import com.snet.dto.PostDTO;
import com.snet.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/posts")
@RequiredArgsConstructor
@Tag(name = "Public Posts", description = "Public post viewing APIs (No authentication required)")
public class PublicPostController {
    
    private final PostService postService;
    
    @GetMapping("/{postId}")
    @Operation(summary = "Get public post by ID (no auth required)")
    public ResponseEntity<PostDTO> getPublicPost(@PathVariable Long postId) {
        // Get post without authentication - only PUBLIC posts are visible
        PostDTO post = postService.getPost(postId, null);
        
        // Check if post is PUBLIC
        if (!"PUBLIC".equals(post.getPrivacy())) {
            throw new RuntimeException("This post is not public");
        }
        
        return ResponseEntity.ok(post);
    }
}


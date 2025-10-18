package com.pixshare.controller;

import com.pixshare.dto.*;
import com.pixshare.model.Post;
import com.pixshare.model.User;
import com.pixshare.service.PostService;
import com.pixshare.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@Tag(name = "Posts", description = "Social Feed API")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @GetMapping
    @Operation(summary = "Get public posts feed")
    public ResponseEntity<Page<PostDTO>> getPublicPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        User currentUser = null;
        if (authentication != null) {
            currentUser = userService.getCurrentUser(authentication.getName());
        }
        
        Page<PostDTO> posts = postService.getPublicPosts(page, size, currentUser);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get posts by user")
    public ResponseEntity<Page<PostDTO>> getUserPosts(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        User currentUser = null;
        if (authentication != null) {
            currentUser = userService.getCurrentUser(authentication.getName());
        }
        
        Page<PostDTO> posts = postService.getUserPosts(userId, page, size, currentUser);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{postId}")
    @Operation(summary = "Get single post")
    public ResponseEntity<PostDTO> getPost(
            @PathVariable Long postId,
            Authentication authentication) {
        
        User currentUser = null;
        if (authentication != null) {
            currentUser = userService.getCurrentUser(authentication.getName());
        }
        
        PostDTO post = postService.getPost(postId, currentUser);
        return ResponseEntity.ok(post);
    }

    @PostMapping
    @Operation(summary = "Create new post")
    public ResponseEntity<PostDTO> createPost(
            @RequestBody CreatePostDTO createPostDTO,
            Authentication authentication) {
        
        User user = userService.getCurrentUser(authentication.getName());
        PostDTO post = postService.createPost(createPostDTO, user);
        return ResponseEntity.ok(post);
    }

    @PostMapping("/{postId}/like")
    @Operation(summary = "Toggle like on post")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long postId,
            Authentication authentication) {
        
        User user = userService.getCurrentUser(authentication.getName());
        boolean liked = postService.toggleLike(postId, user);
        
        return ResponseEntity.ok(Map.of(
            "liked", liked,
            "message", liked ? "Post liked" : "Post unliked"
        ));
    }

    @PostMapping("/{postId}/comments")
    @Operation(summary = "Add comment to post")
    public ResponseEntity<PostCommentDTO> addComment(
            @PathVariable Long postId,
            @RequestBody CreateCommentDTO createCommentDTO,
            Authentication authentication) {
        
        User user = userService.getCurrentUser(authentication.getName());
        PostCommentDTO comment = postService.addComment(postId, createCommentDTO, user);
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/{postId}/comments")
    @Operation(summary = "Get post comments")
    public ResponseEntity<Page<PostCommentDTO>> getPostComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PostCommentDTO> comments = postService.getPostComments(postId, page, size);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{postId}/likes")
    @Operation(summary = "Get users who liked the post")
    public ResponseEntity<Page<UserResponse>> getPostLikes(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<UserResponse> likes = postService.getPostLikes(postId, page, size);
        return ResponseEntity.ok(likes);
    }

    @PutMapping("/{postId}")
    @Operation(summary = "Update post")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long postId,
            @RequestBody CreatePostDTO updatePostDTO,
            Authentication authentication) {
        
        User user = userService.getCurrentUser(authentication.getName());
        PostDTO post = postService.updatePost(postId, updatePostDTO, user);
        
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{postId}")
    @Operation(summary = "Delete post")
    public ResponseEntity<Map<String, String>> deletePost(
            @PathVariable Long postId,
            Authentication authentication) {
        
        User user = userService.getCurrentUser(authentication.getName());
        postService.deletePost(postId, user);
        
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete comment")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication) {
        
        User user = userService.getCurrentUser(authentication.getName());
        postService.deleteComment(commentId, user);
        
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }
}
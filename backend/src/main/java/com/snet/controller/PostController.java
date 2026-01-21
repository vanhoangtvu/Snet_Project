package com.snet.controller;

import com.snet.dto.*;
import com.snet.model.FileMetadata;
import com.snet.model.Post;
import com.snet.model.PostComment;
import com.snet.model.User;
import com.snet.service.FileService;
import com.snet.service.NotificationService;
import com.snet.service.PostService;
import com.snet.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@Tag(name = "Posts", description = "Social Feed API")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @Autowired
    private FileService fileService;

    @Autowired
    private NotificationService notificationService;

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

    @GetMapping("/user/{userId}/liked")
    @Operation(summary = "Get posts liked by user")
    public ResponseEntity<Page<PostDTO>> getUserLikedPosts(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        User currentUser = null;
        if (authentication != null) {
            currentUser = userService.getCurrentUser(authentication.getName());
        }
        
        Page<PostDTO> posts = postService.getUserLikedPosts(userId, page, size, currentUser);
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

    @PostMapping(consumes = "multipart/form-data")
    @Operation(summary = "Create new post with file upload")
    public ResponseEntity<PostDTO> createPostWithFile(
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String privacy,
            @RequestParam(required = false) String videoUrl,
            @RequestParam(required = false) MultipartFile file,
            Authentication authentication) throws IOException {
        
        User user = userService.getCurrentUser(authentication.getName());
        
        // Upload file nếu có
        Long fileId = null;
        if (file != null && !file.isEmpty()) {
            FileResponse uploadedFile = fileService.uploadFile(user.getEmail(), file, null);
            fileId = uploadedFile.getId();
        }
        
        // Tạo post
        CreatePostDTO createPostDTO = new CreatePostDTO();
        createPostDTO.setContent(content);
        createPostDTO.setPrivacy(privacy != null ? privacy : "PUBLIC");
        createPostDTO.setFileId(fileId);
        createPostDTO.setVideoUrl(videoUrl);
        
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
        
        // Tạo thông báo khi like
        if (liked) {
            Post post = postService.getPostById(postId);
            notificationService.notifyPostLike(post, user);
        }
        
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
        
        // Tạo thông báo
        Post post = postService.getPostById(postId);
        if (createCommentDTO.getParentCommentId() != null) {
            // Reply comment
            PostComment parentComment = postService.getCommentById(createCommentDTO.getParentCommentId());
            notificationService.notifyCommentReply(parentComment, user, createCommentDTO.getContent());
        } else {
            // Comment bài viết
            notificationService.notifyPostComment(post, user, createCommentDTO.getContent());
        }
        
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/{postId}/comments")
    @Operation(summary = "Get post comments")
    public ResponseEntity<Page<PostCommentDTO>> getPostComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        User currentUser = authentication != null ? 
            userService.getCurrentUser(authentication.getName()) : null;
        Page<PostCommentDTO> comments = postService.getPostComments(postId, page, size, currentUser);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{postId}/likes")
    @Operation(summary = "Get users who liked the post")
    public ResponseEntity<Page<UserResponse>> getPostLikes(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        User currentUser = authentication != null ? 
            userService.getCurrentUser(authentication.getName()) : null;
        Page<UserResponse> likes = postService.getPostLikes(postId, page, size, currentUser);
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

    @PostMapping("/comments/{commentId}/like")
    @Operation(summary = "Toggle like on comment")
    public ResponseEntity<Map<String, Object>> toggleCommentLike(
            @PathVariable Long commentId,
            Authentication authentication) {
        
        User user = userService.getCurrentUser(authentication.getName());
        boolean liked = postService.toggleCommentLike(commentId, user);
        
        return ResponseEntity.ok(Map.of(
            "liked", liked,
            "message", liked ? "Comment liked" : "Comment unliked"
        ));
    }
}
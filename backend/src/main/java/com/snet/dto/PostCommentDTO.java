package com.snet.dto;

import com.snet.model.PostComment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

public class PostCommentDTO {
    private Long id;
    private Long postId;
    private Long userId;
    private String userName;
    private String userDisplayName;
    private String userAvatarUrl;
    private boolean userVerified;
    private String content;
    private int likeCount;
    private boolean likedByCurrentUser;
    private LocalDateTime createdAt;
    private Long parentCommentId;
    private List<PostCommentDTO> replies = new ArrayList<>();

    // Constructors
    public PostCommentDTO() {}

    public PostCommentDTO(PostComment comment) {
        this.id = comment.getId();
        this.postId = comment.getPost().getId();
        this.userId = comment.getUser().getId();
        this.userName = comment.getUser().getEmail();
        this.userDisplayName = comment.getUser().getDisplayName();
        this.userAvatarUrl = "/api/users/" + comment.getUser().getId() + "/avatar";
        this.userVerified = comment.getUser().isVerified();
        this.content = comment.getContent();
        this.likeCount = 0;
        this.likedByCurrentUser = false;
        this.createdAt = comment.getCreatedAt();
        this.parentCommentId = comment.getParentComment() != null ? comment.getParentComment().getId() : null;
    }

    public PostCommentDTO(PostComment comment, int likeCount, boolean likedByCurrentUser) {
        this(comment);
        this.likeCount = likeCount;
        this.likedByCurrentUser = likedByCurrentUser;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserDisplayName() { return userDisplayName; }
    public void setUserDisplayName(String userDisplayName) { this.userDisplayName = userDisplayName; }

    public String getUserAvatarUrl() { return userAvatarUrl; }
    public void setUserAvatarUrl(String userAvatarUrl) { this.userAvatarUrl = userAvatarUrl; }

    public boolean isUserVerified() { return userVerified; }
    public void setUserVerified(boolean userVerified) { this.userVerified = userVerified; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public int getLikeCount() { return likeCount; }
    public void setLikeCount(int likeCount) { this.likeCount = likeCount; }

    public boolean isLikedByCurrentUser() { return likedByCurrentUser; }
    public void setLikedByCurrentUser(boolean likedByCurrentUser) { this.likedByCurrentUser = likedByCurrentUser; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getParentCommentId() { return parentCommentId; }
    public void setParentCommentId(Long parentCommentId) { this.parentCommentId = parentCommentId; }

    public List<PostCommentDTO> getReplies() { return replies; }
    public void setReplies(List<PostCommentDTO> replies) { this.replies = replies; }
}
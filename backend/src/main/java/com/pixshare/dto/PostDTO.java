package com.pixshare.dto;

import com.pixshare.model.Post;

import java.time.LocalDateTime;
import java.util.List;

public class PostDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userDisplayName;
    private String userAvatarUrl;
    private boolean userVerified;
    private String content;
    private Long fileId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String fileUrl;
    private String videoUrl;
    private String videoPlatform;
    private String privacy;
    private Integer likeCount;
    private Integer commentCount;
    private boolean likedByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PostCommentDTO> recentComments;

    // Constructors
    public PostDTO() {}

    public PostDTO(Post post, boolean likedByCurrentUser) {
        this.id = post.getId();
        this.userId = post.getUser().getId();
        this.userName = post.getUser().getEmail();
        this.userDisplayName = post.getUser().getDisplayName();
        this.userAvatarUrl = "/api/users/" + post.getUser().getId() + "/avatar";
        this.userVerified = post.getUser().isVerified();
        this.content = post.getContent();
        
        System.out.println("🏗️ Creating PostDTO for user: " + post.getUser().getEmail());
        System.out.println("👤 Avatar URL: " + this.userAvatarUrl);
        
        // File information
        if (post.getFile() != null) {
            this.fileId = post.getFile().getId();
            this.fileName = post.getFile().getFileName();
            this.fileType = post.getFile().getFileType();
            this.fileSize = post.getFile().getFileSize();
            this.fileUrl = "/api/files/" + post.getFile().getId() + "/public-preview";
            System.out.println("🗂️ File info: " + this.fileName + " (" + this.fileType + ")");
            System.out.println("🔗 Public File URL: " + this.fileUrl);
        }
        
        // Video URL information (YouTube/TikTok)
        this.videoUrl = post.getVideoUrl();
        this.videoPlatform = post.getVideoPlatform();
        if (this.videoUrl != null) {
            System.out.println("🎥 Video URL: " + this.videoUrl + " (" + this.videoPlatform + ")");
        }
        
        this.privacy = post.getPrivacy().toString();
        this.likeCount = post.getLikeCount();
        this.commentCount = post.getCommentCount();
        this.likedByCurrentUser = likedByCurrentUser;
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Long getFileId() { return fileId; }
    public void setFileId(Long fileId) { this.fileId = fileId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getVideoPlatform() { return videoPlatform; }
    public void setVideoPlatform(String videoPlatform) { this.videoPlatform = videoPlatform; }

    public String getPrivacy() { return privacy; }
    public void setPrivacy(String privacy) { this.privacy = privacy; }

    public Integer getLikeCount() { return likeCount; }
    public void setLikeCount(Integer likeCount) { this.likeCount = likeCount; }

    public Integer getCommentCount() { return commentCount; }
    public void setCommentCount(Integer commentCount) { this.commentCount = commentCount; }

    public boolean isLikedByCurrentUser() { return likedByCurrentUser; }
    public void setLikedByCurrentUser(boolean likedByCurrentUser) { this.likedByCurrentUser = likedByCurrentUser; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<PostCommentDTO> getRecentComments() { return recentComments; }
    public void setRecentComments(List<PostCommentDTO> recentComments) { this.recentComments = recentComments; }
}
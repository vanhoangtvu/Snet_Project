package com.snet.dto;

public class CreatePostDTO {
    private String content;
    private String privacy = "PUBLIC";
    private Long fileId; // ID của file đã upload
    private String videoUrl; // YouTube/TikTok URL

    // Constructors
    public CreatePostDTO() {}

    public CreatePostDTO(String content, String privacy, Long fileId) {
        this.content = content;
        this.privacy = privacy;
        this.fileId = fileId;
    }

    // Getters and Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getPrivacy() { return privacy; }
    public void setPrivacy(String privacy) { this.privacy = privacy; }

    public Long getFileId() { return fileId; }
    public void setFileId(Long fileId) { this.fileId = fileId; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
}
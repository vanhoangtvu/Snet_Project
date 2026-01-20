package com.snet.dto;

public class CreateCommentDTO {
    private String content;
    private Long parentCommentId;

    // Constructors
    public CreateCommentDTO() {}

    public CreateCommentDTO(String content) {
        this.content = content;
    }

    // Getters and Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getParentCommentId() { return parentCommentId; }
    public void setParentCommentId(Long parentCommentId) { this.parentCommentId = parentCommentId; }
}
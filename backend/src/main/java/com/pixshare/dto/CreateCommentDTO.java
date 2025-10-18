package com.pixshare.dto;

public class CreateCommentDTO {
    private String content;

    // Constructors
    public CreateCommentDTO() {}

    public CreateCommentDTO(String content) {
        this.content = content;
    }

    // Getters and Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
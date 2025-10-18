package com.pixshare.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRequest {
    
    private Long receiverId;
    
    private Long groupId;
    
    private String content;
    
    private Long fileId;
    
    private String type = "TEXT";
}

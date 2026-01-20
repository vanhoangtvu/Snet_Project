package com.snet.controller;

import com.snet.dto.PublicShareResponse;
import com.snet.service.PublicShareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Tag(name = "Public Share", description = "Public file sharing APIs (No authentication required)")
public class PublicShareController {
    
    private final PublicShareService publicShareService;
    
    @PostMapping("/share/{fileId}")
    public ResponseEntity<PublicShareResponse> createPublicShare(
            @PathVariable Long fileId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime expiresAt,
            @RequestParam(required = false) Integer maxAccessCount) {
        return ResponseEntity.ok(publicShareService.createPublicShare(fileId, expiresAt, maxAccessCount));
    }
    
    @GetMapping("/share/{shareToken}")
    public ResponseEntity<byte[]> accessPublicShareFile(@PathVariable String shareToken) {
        PublicShareResponse shareInfo = publicShareService.getShareInfo(shareToken);
        byte[] fileData = publicShareService.accessPublicShare(shareToken);
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(shareInfo.getFileType()))
                .body(fileData);
    }
    
    @GetMapping("/share/{shareToken}/download")
    public ResponseEntity<byte[]> downloadPublicShare(@PathVariable String shareToken) {
        PublicShareResponse shareInfo = publicShareService.getShareInfo(shareToken);
        byte[] fileData = publicShareService.accessPublicShare(shareToken);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + shareInfo.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(shareInfo.getFileType()))
                .body(fileData);
    }
    
    @GetMapping("/share/{shareToken}/info")
    public ResponseEntity<PublicShareResponse> getShareInfo(@PathVariable String shareToken) {
        return ResponseEntity.ok(publicShareService.getShareInfo(shareToken));
    }
    
    @GetMapping("/share/{shareToken}/qrcode")
    public ResponseEntity<byte[]> getQRCode(@PathVariable String shareToken) {
        byte[] qrCode = publicShareService.getQRCode(shareToken);
        
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrCode);
    }
    
    @DeleteMapping("/share/{shareId}")
    public ResponseEntity<Void> deactivateShare(@PathVariable Long shareId) {
        publicShareService.deactivateShare(shareId);
        return ResponseEntity.ok().build();
    }
}

package com.snet.controller;

import com.snet.dto.PostDTO;
import com.snet.dto.PostShareResponse;
import com.snet.model.Post;
import com.snet.service.PostService;
import com.snet.service.PostShareService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Post Share", description = "Post sharing APIs")
public class PostShareController {
    
    private final PostShareService postShareService;
    private final PostService postService;
    
    @GetMapping("/test-qr")
    public ResponseEntity<byte[]> testQR() {
        try {
            // Test QR generation
            com.google.zxing.common.BitMatrix bitMatrix = new com.google.zxing.MultiFormatWriter()
                .encode("https://snet.io.vn/test", com.google.zxing.BarcodeFormat.QR_CODE, 400, 400);
            
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            com.google.zxing.client.j2se.MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
            byte[] qrCode = baos.toByteArray();
            
            System.out.println("✅ Test QR generated: " + qrCode.length + " bytes");
            
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_PNG)
                    .body(qrCode);
        } catch (Exception e) {
            System.err.println("❌ Test QR failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/{postId}/share")
    public ResponseEntity<PostShareResponse> createPostShare(
            @PathVariable Long postId,
            Authentication authentication) {
        return ResponseEntity.ok(postShareService.createPostShare(postId));
    }
    
    @GetMapping("/share/{shareToken}/info")
    public ResponseEntity<PostShareResponse> getShareInfo(@PathVariable String shareToken) {
        return ResponseEntity.ok(postShareService.getShareInfo(shareToken));
    }
    
    @GetMapping("/share/{shareToken}/qrcode")
    public ResponseEntity<byte[]> getQRCode(@PathVariable String shareToken) {
        try {
            byte[] qrCode = postShareService.getQRCode(shareToken);
            
            if (qrCode == null || qrCode.length == 0) {
                System.err.println("❌ QR code is null or empty for token: " + shareToken);
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("✅ Returning QR code: " + qrCode.length + " bytes");
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header("Cache-Control", "public, max-age=3600")
                    .body(qrCode);
        } catch (Exception e) {
            System.err.println("❌ Error getting QR code: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/share/{shareToken}")
    public ResponseEntity<PostDTO> accessPostShare(@PathVariable String shareToken) {
        Post post = postShareService.accessPostShare(shareToken);
        PostDTO postDTO = new PostDTO(post, false);
        return ResponseEntity.ok(postDTO);
    }
}

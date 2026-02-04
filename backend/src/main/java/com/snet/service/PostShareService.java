package com.snet.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.snet.dto.PostShareResponse;
import com.snet.model.Post;
import com.snet.model.PostShare;
import com.snet.repository.PostRepository;
import com.snet.repository.PostShareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostShareService {
    
    private final PostShareRepository postShareRepository;
    private final PostRepository postRepository;
    
    @Value("${app.frontend-url:http://localhost:3006}")
    private String frontendUrl;
    
    @Transactional
    public PostShareResponse createPostShare(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        System.out.println("🔧 Frontend URL from config: " + frontendUrl);
        
        // Check if active share already exists
        var existingShare = postShareRepository.findFirstByPostAndActiveTrueOrderByCreatedAtDesc(post);
        if (existingShare.isPresent()) {
            PostShare share = existingShare.get();
            // Regenerate QR if null
            if (share.getQrCode() == null || share.getQrCode().length == 0) {
                String shareUrl = frontendUrl + "/share/" + share.getShareToken();
                System.out.println("🔄 Regenerating QR for URL: " + shareUrl);
                try {
                    byte[] qrCode = generateQRCode(shareUrl);
                    share.setQrCode(qrCode);
                    postShareRepository.save(share);
                    System.out.println("✅ QR regenerated: " + qrCode.length + " bytes");
                } catch (Exception e) {
                    System.err.println("❌ Failed to regenerate QR: " + e.getMessage());
                }
            }
            return convertToResponse(share);
        }
        
        String shareToken = UUID.randomUUID().toString();
        String shareUrl = frontendUrl + "/share/" + shareToken;
        
        System.out.println("🆕 Creating new share with URL: " + shareUrl);
        
        PostShare postShare = PostShare.builder()
                .post(post)
                .shareToken(shareToken)
                .accessCount(0)
                .active(true)
                .build();
        
        try {
            byte[] qrCode = generateQRCode(shareUrl);
            postShare.setQrCode(qrCode);
            System.out.println("✅ QR code generated successfully: " + qrCode.length + " bytes");
        } catch (Exception e) {
            System.err.println("❌ Failed to generate QR code: " + e.getMessage());
            e.printStackTrace();
        }
        
        postShare = postShareRepository.save(postShare);
        System.out.println("✅ Post share created: " + shareUrl);
        return convertToResponse(postShare);
    }
    
    @Transactional
    public Post accessPostShare(String shareToken) {
        PostShare postShare = postShareRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new RuntimeException("Share not found"));
        
        if (!postShare.isActive()) {
            throw new RuntimeException("Share is no longer active");
        }
        
        postShare.setAccessCount(postShare.getAccessCount() + 1);
        postShareRepository.save(postShare);
        
        return postShare.getPost();
    }
    
    public PostShareResponse getShareInfo(String shareToken) {
        PostShare postShare = postShareRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new RuntimeException("Share not found"));
        return convertToResponse(postShare);
    }
    
    public byte[] getQRCode(String shareToken) {
        PostShare postShare = postShareRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new RuntimeException("Share not found"));
        
        byte[] qrCode = postShare.getQrCode();
        
        if (qrCode == null || qrCode.length == 0) {
            System.err.println("⚠️ QR code not found in database, regenerating...");
            try {
                String shareUrl = frontendUrl + "/public/post/" + shareToken;
                qrCode = generateQRCode(shareUrl);
                postShare.setQrCode(qrCode);
                postShareRepository.save(postShare);
                System.out.println("✅ QR code regenerated: " + qrCode.length + " bytes");
            } catch (Exception e) {
                System.err.println("❌ Failed to regenerate QR code: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to generate QR code", e);
            }
        }
        
        return qrCode;
    }
    
    private byte[] generateQRCode(String text) throws Exception {
        BitMatrix bitMatrix = new MultiFormatWriter()
                .encode(text, BarcodeFormat.QR_CODE, 400, 400);
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
        return baos.toByteArray();
    }
    
    private PostShareResponse convertToResponse(PostShare postShare) {
        String shareUrl = frontendUrl + "/public/post/" + postShare.getShareToken();
        
        return PostShareResponse.builder()
                .id(postShare.getId())
                .postId(postShare.getPost().getId())
                .shareToken(postShare.getShareToken())
                .shareUrl(shareUrl)
                .expiresAt(postShare.getExpiresAt())
                .maxAccessCount(postShare.getMaxAccessCount())
                .accessCount(postShare.getAccessCount())
                .active(postShare.isActive())
                .createdAt(postShare.getCreatedAt())
                .build();
    }
}

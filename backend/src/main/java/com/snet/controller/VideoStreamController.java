package com.snet.controller;

import com.snet.model.FileMetadata;
import com.snet.repository.FileMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

/**
 * Optimized controller for video streaming with Range requests
 * Supports progressive loading - play while downloading
 */
@RestController
@RequestMapping("/api/video")
@RequiredArgsConstructor
public class VideoStreamController {
    
    private final FileMetadataRepository fileMetadataRepository;
    
    @GetMapping("/{fileId}/stream")
    public ResponseEntity<Resource> streamVideo(
            @PathVariable Long fileId,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader,
            Authentication authentication) {
        
        try {
            System.out.println("🎬 Video stream request for file: " + fileId);
            System.out.println("📊 Range: " + rangeHeader);
            
            // Get file from database
            FileMetadata file = fileMetadataRepository.findById(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found"));
            
            // Check if deleted
            if (file.isDeleted()) {
                return ResponseEntity.notFound().build();
            }
            
            // Get full file data (unavoidable with MySQL LONGBLOB)
            byte[] fileData = file.getFileData();
            long fileLength = fileData.length;
            
            System.out.println("📁 File: " + file.getFileName() + " (" + fileLength + " bytes)");
            
            // If no range header, return full file
            if (rangeHeader == null || !rangeHeader.startsWith("bytes=")) {
                InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(fileData));
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(file.getFileType()))
                        .contentLength(fileLength)
                        .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                        .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                        .body(resource);
            }
            
            // Parse range header
            String range = rangeHeader.replace("bytes=", "");
            String[] parts = range.split("-");
            
            long start = Long.parseLong(parts[0]);
            long end = (parts.length > 1 && !parts[1].isEmpty()) 
                    ? Long.parseLong(parts[1]) 
                    : fileLength - 1;
            
            // Validate range
            if (start > end || start < 0 || end >= fileLength) {
                return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                        .header(HttpHeaders.CONTENT_RANGE, "bytes */" + fileLength)
                        .build();
            }
            
            // Calculate chunk size
            long chunkSize = end - start + 1;
            
            // Optimize chunk size for better throughput (8MB chunks for 8MB/s speed)
            // Larger chunks = fewer requests = better throughput
            long maxChunkSize = 8 * 1024 * 1024;  // 8MB chunks
            if (chunkSize > maxChunkSize) {
                end = start + maxChunkSize - 1;
                chunkSize = end - start + 1;
            }
            
            // Extract the requested range
            byte[] rangeData = new byte[(int) chunkSize];
            System.arraycopy(fileData, (int) start, rangeData, 0, (int) chunkSize);
            
            InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(rangeData));
            
            String contentRange = String.format("bytes %d-%d/%d", start, end, fileLength);
            System.out.println("✅ Streaming range: " + contentRange);
            
            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .contentType(MediaType.parseMediaType(file.getFileType()))
                    .contentLength(chunkSize)
                    .header(HttpHeaders.CONTENT_RANGE, contentRange)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                    .body(resource);
            
        } catch (Exception e) {
            System.err.println("❌ Video streaming error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}


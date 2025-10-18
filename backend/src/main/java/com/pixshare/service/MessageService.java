package com.pixshare.service;

import com.pixshare.dto.MessageRequest;
import com.pixshare.dto.MessageResponse;
import com.pixshare.model.*;
import com.pixshare.repository.ChatGroupRepository;
import com.pixshare.repository.FileMetadataRepository;
import com.pixshare.repository.MessageRepository;
import com.pixshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final FileMetadataRepository fileMetadataRepository;
    private final ChatGroupRepository groupRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public MessageResponse sendMessage(String senderEmail, MessageRequest request) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        Message message = Message.builder()
                .sender(sender)
                .content(request.getContent())
                .type(MessageType.valueOf(request.getType()))
                .status(MessageStatus.SENT)
                .build();
        
        // Check if it's a group message or direct message
        if (request.getGroupId() != null) {
            // Group message
            ChatGroup group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new RuntimeException("Group not found"));
            
            // Verify sender is a member
            if (!group.getMembers().contains(sender)) {
                throw new RuntimeException("You are not a member of this group");
            }
            
            message.setGroup(group);
        } else if (request.getReceiverId() != null) {
            // Direct message
            User receiver = userRepository.findById(request.getReceiverId())
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));
            message.setReceiver(receiver);
        } else {
            throw new RuntimeException("Either receiverId or groupId must be provided");
        }
        
        if (request.getFileId() != null) {
            FileMetadata file = fileMetadataRepository.findById(request.getFileId())
                    .orElseThrow(() -> new RuntimeException("File not found"));
            message.setFile(file);
        }
        
        message = messageRepository.save(message);
        
        MessageResponse response = convertToResponse(message);
        
        // Send realtime notification via WebSocket
        if (message.getGroup() != null) {
            // Send to all group members
            for (User member : message.getGroup().getMembers()) {
                messagingTemplate.convertAndSendToUser(
                        member.getEmail(),
                        "/queue/messages",
                        response
                );
            }
        } else {
            // Send to receiver and sender for direct messages
            messagingTemplate.convertAndSendToUser(
                    message.getReceiver().getEmail(),
                    "/queue/messages",
                    response
            );
            
            messagingTemplate.convertAndSendToUser(
                    sender.getEmail(),
                    "/queue/messages",
                    response
            );
        }
        
        return response;
    }
    
    public List<MessageResponse> getChatHistory(Long userId1, Long userId2, int page, int size) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return messageRepository.findChatHistory(user1, user2, PageRequest.of(page, size))
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public org.springframework.data.domain.Page<MessageResponse> getChatHistoryPaged(Long userId1, Long userId2, int page, int size) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get messages as List and convert to Page
        List<Message> messages = messageRepository.findChatHistory(user1, user2, PageRequest.of(page, size));
        List<MessageResponse> messageResponses = messages.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        // Create Page object
        long total = messageRepository.countChatHistory(user1, user2);
        return new org.springframework.data.domain.PageImpl<>(
                messageResponses, 
                PageRequest.of(page, size), 
                total
        );
    }
    
    public List<MessageResponse> getGroupMessages(Long groupId, int page, int size) {
        ChatGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        return messageRepository.findGroupMessages(group, PageRequest.of(page, size))
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        message.setStatus(MessageStatus.READ);
        message.setReadAt(LocalDateTime.now());
        message = messageRepository.save(message);
        
        // Send WebSocket notification to sender that message was read
        MessageResponse response = convertToResponse(message);
        messagingTemplate.convertAndSendToUser(
                message.getSender().getEmail(),
                "/queue/messages",
                response
        );
    }
    
    @Transactional
    public void deleteMessage(Long messageId, String userEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!message.getSender().getId().equals(user.getId()) && 
            !message.getReceiver().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this message");
        }
        
        message.setDeleted(true);
        messageRepository.save(message);
    }
    
    @Transactional
    public MessageResponse recallMessage(Long messageId, String userEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only sender can recall message
        if (!message.getSender().getId().equals(user.getId())) {
            throw new RuntimeException("Only sender can recall this message");
        }
        
        // Update message content to recalled
        message.setContent("Tin nhắn đã được thu hồi");
        message.setType(MessageType.TEXT);
        message.setFile(null); // Remove file if any
        message.setStatus(MessageStatus.SENT); // Keep status
        
        Message savedMessage = messageRepository.save(message);
        MessageResponse response = convertToResponse(savedMessage);
        
        // Notify both sender and receiver via WebSocket
        messagingTemplate.convertAndSendToUser(
                message.getReceiver().getEmail(),
                "/queue/messages",
                response
        );
        
        messagingTemplate.convertAndSendToUser(
                message.getSender().getEmail(),
                "/queue/messages",
                response
        );
        
        return response;
    }
    
    private MessageResponse convertToResponse(Message message) {
        MessageResponse.MessageResponseBuilder builder = MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getDisplayName())
                .content(message.getContent())
                .type(message.getType().name())
                .status(message.getStatus().name())
                .sentAt(message.getSentAt())
                .readAt(message.getReadAt());
        
        // Set receiver for direct messages
        if (message.getReceiver() != null) {
            builder.receiverId(message.getReceiver().getId())
                   .receiverName(message.getReceiver().getDisplayName());
        }
        
        // Set group for group messages
        if (message.getGroup() != null) {
            builder.groupId(message.getGroup().getId())
                   .groupName(message.getGroup().getName());
        }
        
        if (message.getFile() != null) {
            builder.fileId(message.getFile().getId())
                   .fileName(message.getFile().getFileName());
        }
        
        return builder.build();
    }
}

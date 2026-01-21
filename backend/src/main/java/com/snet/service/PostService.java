package com.snet.service;

import com.snet.dto.*;
import com.snet.model.*;
import com.snet.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@Transactional
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    @Autowired
    private PostCommentRepository postCommentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    @Autowired
    private CommentLikeRepository commentLikeRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;

    // Lấy danh sách bài đăng public
    public Page<PostDTO> getPublicPosts(int page, int size, User currentUser) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts;
        
        if (currentUser != null) {
            // Lấy danh sách bạn bè từ database
            List<Friendship> friendships = friendshipRepository.findAllFriendships(currentUser, FriendshipStatus.ACCEPTED);
            List<User> friends = new ArrayList<>();
            friends.add(currentUser); // Thêm chính mình
            
            // Thêm bạn bè vào list
            for (Friendship f : friendships) {
                if (f.getUser().equals(currentUser)) {
                    friends.add(f.getFriend());
                } else {
                    friends.add(f.getUser());
                }
            }
            
            posts = postRepository.findPostsForUser(currentUser, friends, pageable);
        } else {
            // Chỉ lấy PUBLIC posts nếu chưa đăng nhập
            posts = postRepository.findPublicPosts(pageable);
        }
        
        return posts.map(post -> {
            boolean likedByCurrentUser = currentUser != null && 
                postLikeRepository.existsByPostAndUser(post, currentUser);
            PostDTO postDTO = new PostDTO(post, likedByCurrentUser);
            
            // Lấy 3 comment gần nhất
            Page<PostComment> recentComments = postCommentRepository.findByPost(
                post, PageRequest.of(0, 3));
            postDTO.setRecentComments(
                recentComments.getContent().stream()
                    .map(PostCommentDTO::new)
                    .collect(Collectors.toList())
            );
            
            return postDTO;
        });
    }

    // Lấy bài đăng của user cụ thể
    public Page<PostDTO> getUserPosts(Long userId, int page, int size, User currentUser) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findByUser(user, pageable);
        
        // Filter posts theo privacy và convert sang DTO
        List<PostDTO> filteredPosts = posts.getContent().stream()
            .filter(post -> canViewPost(post, currentUser, user))
            .map(post -> {
                boolean likedByCurrentUser = currentUser != null && 
                    postLikeRepository.existsByPostAndUser(post, currentUser);
                return new PostDTO(post, likedByCurrentUser);
            })
            .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
            filteredPosts, pageable, posts.getTotalElements()
        );
    }
    
    // Lấy posts mà user đã like
    public Page<PostDTO> getUserLikedPosts(Long userId, int page, int size, User currentUser) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size);
        
        // Lấy tất cả likes của user
        Page<PostLike> likes = postLikeRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        
        // Filter posts theo quyền xem và convert sang DTO
        List<PostDTO> filteredPosts = likes.getContent().stream()
            .map(PostLike::getPost)
            .filter(post -> canViewPost(post, currentUser, post.getUser()))
            .map(post -> {
                boolean likedByCurrentUser = currentUser != null && 
                    postLikeRepository.existsByPostAndUser(post, currentUser);
                return new PostDTO(post, likedByCurrentUser);
            })
            .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
            filteredPosts, pageable, likes.getTotalElements()
        );
    }
    
    private boolean canViewPost(Post post, User currentUser, User postOwner) {
        // Nếu là chủ post → luôn xem được
        if (currentUser != null && currentUser.getId().equals(postOwner.getId())) {
            return true;
        }
        
        // Check privacy
        switch (post.getPrivacy()) {
            case PUBLIC:
                return true; // Ai cũng xem được
                
            case FRIENDS_ONLY:
                // Chỉ bạn bè mới xem được
                if (currentUser == null) return false;
                return friendshipRepository.areFriends(currentUser, postOwner, FriendshipStatus.ACCEPTED);
                
            case PRIVATE:
                // Chỉ chủ nhân xem được
                return false;
                
            default:
                return false;
        }
    }

    // Tạo bài đăng mới
    public PostDTO createPost(CreatePostDTO createPostDTO, User user) {
        Post post = new Post();
        post.setUser(user);
        post.setContent(createPostDTO.getContent());
        post.setPrivacy(Post.PostPrivacy.valueOf(createPostDTO.getPrivacy()));

        // Liên kết với file đã upload nếu có
        if (createPostDTO.getFileId() != null) {
            FileMetadata file = fileMetadataRepository.findById(createPostDTO.getFileId())
                .orElseThrow(() -> new RuntimeException("File not found"));
            
            // Kiểm tra file thuộc về user hiện tại
            if (!file.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("You can only use your own files");
            }
            
            post.setFile(file);
        }

        // Xử lý video URL (YouTube/TikTok)
        if (createPostDTO.getVideoUrl() != null && !createPostDTO.getVideoUrl().trim().isEmpty()) {
            String videoUrl = createPostDTO.getVideoUrl().trim();
            String platform = detectVideoPlatform(videoUrl);
            
            post.setVideoUrl(videoUrl);
            post.setVideoPlatform(platform);
            
            System.out.println("🎥 Video URL detected: " + videoUrl + " (Platform: " + platform + ")");
        }

        post = postRepository.save(post);
        return new PostDTO(post, false);
    }

    // Phát hiện platform của video
    private String detectVideoPlatform(String url) {
        if (url.contains("youtube.com") || url.contains("youtu.be")) {
            return "youtube";
        } else if (url.contains("tiktok.com")) {
            return "tiktok";
        } else if (url.contains("vimeo.com")) {
            return "vimeo";
        } else if (url.contains("dailymotion.com")) {
            return "dailymotion";
        }
        return "other";
    }

    // Like/Unlike bài đăng
    public boolean toggleLike(Long postId, User user) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check quyền xem post trước khi like
        if (!canViewPost(post, user, post.getUser())) {
            throw new RuntimeException("You don't have permission to like this post");
        }

        Optional<PostLike> existingLike = postLikeRepository.findByPostAndUser(post, user);
        
        if (existingLike.isPresent()) {
            // Unlike
            postLikeRepository.delete(existingLike.get());
            post.setLikeCount(post.getLikeCount() - 1);
            postRepository.save(post);
            return false;
        } else {
            // Like
            PostLike like = new PostLike(post, user);
            postLikeRepository.save(like);
            post.setLikeCount(post.getLikeCount() + 1);
            postRepository.save(post);
            return true;
        }
    }

    // Thêm comment
    public PostCommentDTO addComment(Long postId, CreateCommentDTO createCommentDTO, User user) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check quyền xem post trước khi comment
        if (!canViewPost(post, user, post.getUser())) {
            throw new RuntimeException("You don't have permission to comment on this post");
        }

        PostComment comment = new PostComment(post, user, createCommentDTO.getContent());
        
        // Set parent comment if replying
        if (createCommentDTO.getParentCommentId() != null) {
            PostComment parentComment = postCommentRepository.findById(createCommentDTO.getParentCommentId())
                .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParentComment(parentComment);
        }
        
        comment = postCommentRepository.save(comment);
        
        // Cập nhật số lượng comment
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        return new PostCommentDTO(comment);
    }

    // Lấy comments của bài đăng
    public Page<PostCommentDTO> getPostComments(Long postId, int page, int size, User currentUser) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check quyền xem post trước khi xem comments
        if (!canViewPost(post, currentUser, post.getUser())) {
            throw new RuntimeException("You don't have permission to view comments on this post");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<PostComment> comments = postCommentRepository.findByPost(post, pageable);
        
        return comments.map(comment -> {
            int likeCount = (int) commentLikeRepository.countByComment(comment);
            boolean likedByCurrentUser = currentUser != null && 
                commentLikeRepository.existsByCommentAndUser(comment, currentUser);
            
            PostCommentDTO dto = new PostCommentDTO(comment, likeCount, likedByCurrentUser);
            
            // Load replies if this is a parent comment (no parent)
            if (comment.getParentComment() == null) {
                List<PostComment> replies = postCommentRepository.findByParentComment(comment);
                List<PostCommentDTO> replyDTOs = replies.stream()
                    .map(reply -> {
                        int replyLikeCount = (int) commentLikeRepository.countByComment(reply);
                        boolean replyLiked = currentUser != null && 
                            commentLikeRepository.existsByCommentAndUser(reply, currentUser);
                        return new PostCommentDTO(reply, replyLikeCount, replyLiked);
                    })
                    .collect(java.util.stream.Collectors.toList());
                dto.setReplies(replyDTOs);
            }
            
            return dto;
        });
    }

    // Cập nhật bài đăng
    public PostDTO updatePost(Long postId, CreatePostDTO updatePostDTO, User user) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        // Chỉ cho phép tác giả sửa
        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to update this post");
        }

        // Cập nhật content
        if (updatePostDTO.getContent() != null) {
            post.setContent(updatePostDTO.getContent());
        }

        // Cập nhật privacy
        if (updatePostDTO.getPrivacy() != null) {
            post.setPrivacy(Post.PostPrivacy.valueOf(updatePostDTO.getPrivacy()));
        }

        // Cập nhật file (optional)
        if (updatePostDTO.getFileId() != null) {
            FileMetadata file = fileMetadataRepository.findById(updatePostDTO.getFileId())
                .orElseThrow(() -> new RuntimeException("File not found"));
            
            if (!file.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("You can only use your own files");
            }
            
            post.setFile(file);
        }

        // Cập nhật video URL (optional)
        if (updatePostDTO.getVideoUrl() != null) {
            String videoUrl = updatePostDTO.getVideoUrl().trim();
            if (!videoUrl.isEmpty()) {
                String platform = detectVideoPlatform(videoUrl);
                post.setVideoUrl(videoUrl);
                post.setVideoPlatform(platform);
            } else {
                // Clear video URL if empty string provided
                post.setVideoUrl(null);
                post.setVideoPlatform(null);
            }
        }

        post = postRepository.save(post);
        
        boolean likedByCurrentUser = postLikeRepository.existsByPostAndUser(post, user);
        return new PostDTO(post, likedByCurrentUser);
    }

    // Xóa bài đăng
    public void deletePost(Long postId, User user) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        // Chỉ cho phép tác giả hoặc admin xóa
        if (!post.getUser().getId().equals(user.getId()) && 
            user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Not authorized to delete this post");
        }

        // Không xóa file gốc, chỉ xóa post
        postRepository.delete(post);
    }

    // Xóa comment
    public void deleteComment(Long commentId, User user) {
        PostComment comment = postCommentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Chỉ cho phép tác giả comment hoặc admin xóa
        if (!comment.getUser().getId().equals(user.getId()) && 
            user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Not authorized to delete this comment");
        }

        Post post = comment.getPost();
        
        // Nếu là parent comment, xóa tất cả replies trước
        if (comment.getParentComment() == null) {
            List<PostComment> replies = postCommentRepository.findByParentComment(comment);
            int replyCount = replies.size();
            
            // Xóa likes của tất cả replies
            for (PostComment reply : replies) {
                commentLikeRepository.deleteByComment(reply);
            }
            
            // Xóa replies
            postCommentRepository.deleteAll(replies);
            
            // Cập nhật comment count (parent + replies)
            post.setCommentCount(Math.max(0, post.getCommentCount() - replyCount - 1));
        } else {
            // Chỉ giảm 1 nếu là reply
            post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        }
        
        // Xóa likes của comment này
        commentLikeRepository.deleteByComment(comment);
        
        // Xóa comment
        postCommentRepository.delete(comment);
        postRepository.save(post);
    }

    // Lấy danh sách user đã like bài đăng
    public Page<UserResponse> getPostLikes(Long postId, int page, int size, User currentUser) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Check quyền xem post trước khi xem likes
        if (!canViewPost(post, currentUser, post.getUser())) {
            throw new RuntimeException("You don't have permission to view likes on this post");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<PostLike> likes = postLikeRepository.findByPostOrderByCreatedAtDesc(post, pageable);
        
        return likes.map(like -> UserResponse.builder()
            .id(like.getUser().getId())
            .email(like.getUser().getEmail())
            .displayName(like.getUser().getDisplayName())
            .verified(like.getUser().isVerified())
            .build());
    }

    // Lấy bài đăng theo ID
    public PostDTO getPost(Long postId, User currentUser) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check quyền xem post
        if (!canViewPost(post, currentUser, post.getUser())) {
            throw new RuntimeException("You don't have permission to view this post");
        }

        boolean likedByCurrentUser = currentUser != null && 
            postLikeRepository.existsByPostAndUser(post, currentUser);
        
        PostDTO postDTO = new PostDTO(post, likedByCurrentUser);
        
        // Lấy 5 comment gần nhất
        Page<PostComment> recentComments = postCommentRepository.findByPost(
            post, PageRequest.of(0, 5));
        postDTO.setRecentComments(
            recentComments.getContent().stream()
                .map(PostCommentDTO::new)
                .collect(Collectors.toList())
        );
        
        return postDTO;
    }

    // Toggle like comment
    public boolean toggleCommentLike(Long commentId, User user) {
        PostComment comment = postCommentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));

        Optional<CommentLike> existingLike = commentLikeRepository.findByCommentAndUser(comment, user);
        
        if (existingLike.isPresent()) {
            // Unlike
            commentLikeRepository.delete(existingLike.get());
            return false;
        } else {
            // Like
            CommentLike like = new CommentLike(comment, user);
            commentLikeRepository.save(like);
            return true;
        }
    }
}


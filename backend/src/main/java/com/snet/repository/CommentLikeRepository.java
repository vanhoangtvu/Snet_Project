package com.snet.repository;

import com.snet.model.CommentLike;
import com.snet.model.PostComment;
import com.snet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    
    Optional<CommentLike> findByCommentAndUser(PostComment comment, User user);
    
    boolean existsByCommentAndUser(PostComment comment, User user);
    
    long countByComment(PostComment comment);
    
    @Modifying
    @Transactional
    void deleteByCommentAndUser(PostComment comment, User user);
    
    @Modifying
    @Transactional
    void deleteByComment(PostComment comment);
}

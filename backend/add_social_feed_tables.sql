-- Social Feed tables for PixShare

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT,
    file_id BIGINT NULL,
    privacy ENUM('PUBLIC', 'FRIENDS_ONLY', 'PRIVATE') DEFAULT 'PUBLIC',
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES file_metadata(id) ON DELETE SET NULL,
    INDEX idx_posts_user_id (user_id),
    INDEX idx_posts_file_id (file_id),
    INDEX idx_posts_created_at (created_at),
    INDEX idx_posts_privacy (privacy)
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_user_like (post_id, user_id),
    INDEX idx_post_likes_post_id (post_id),
    INDEX idx_post_likes_user_id (user_id)
);

-- Post comments table
CREATE TABLE IF NOT EXISTS post_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_post_comments_post_id (post_id),
    INDEX idx_post_comments_user_id (user_id),
    INDEX idx_post_comments_created_at (created_at)
);

-- Triggers to update counters
DELIMITER //

-- Trigger to increment like count when a like is added
CREATE TRIGGER increment_like_count 
AFTER INSERT ON post_likes
FOR EACH ROW
BEGIN
    UPDATE posts 
    SET like_count = like_count + 1 
    WHERE id = NEW.post_id;
END//

-- Trigger to decrement like count when a like is removed
CREATE TRIGGER decrement_like_count 
AFTER DELETE ON post_likes
FOR EACH ROW
BEGIN
    UPDATE posts 
    SET like_count = like_count - 1 
    WHERE id = OLD.post_id;
END//

-- Trigger to increment comment count when a comment is added
CREATE TRIGGER increment_comment_count 
AFTER INSERT ON post_comments
FOR EACH ROW
BEGIN
    UPDATE posts 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.post_id;
END//

-- Trigger to decrement comment count when a comment is removed
CREATE TRIGGER decrement_comment_count 
AFTER DELETE ON post_comments
FOR EACH ROW
BEGIN
    UPDATE posts 
    SET comment_count = comment_count - 1 
    WHERE id = OLD.post_id;
END//

DELIMITER ;

-- Sample data (optional)
-- INSERT INTO posts (user_id, content, privacy) VALUES 
-- (1, 'Chào mọi người! Đây là bài đăng đầu tiên của tôi trên PixShare! 🎉', 'PUBLIC'),
-- (1, 'Hôm nay thời tiết đẹp quá! Perfect for a walk in the park 🌞', 'PUBLIC'),
-- (2, 'Just finished a great project! Feeling accomplished 💪', 'PUBLIC');
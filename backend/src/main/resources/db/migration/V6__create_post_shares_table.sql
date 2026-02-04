-- Create post_shares table
CREATE TABLE IF NOT EXISTS post_shares (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    share_token VARCHAR(255) NOT NULL UNIQUE,
    qr_code MEDIUMBLOB,
    expires_at DATETIME,
    max_access_count INT,
    access_count INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_share_token (share_token),
    INDEX idx_post_id (post_id),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

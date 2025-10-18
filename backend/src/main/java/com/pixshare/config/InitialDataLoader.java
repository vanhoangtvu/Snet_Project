package com.pixshare.config;

import com.pixshare.model.User;
import com.pixshare.model.UserRole;
import com.pixshare.model.UserStatus;
import com.pixshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InitialDataLoader implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        createAdminUser();
    }
    
    private void createAdminUser() {
        String adminEmail = "admin@pixshare.com";
        
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("hoangadmin@123"))
                    .displayName("Admin")
                    .role(UserRole.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .storageQuota(10737418240L) // 10GB for admin
                    .storageUsed(0L)
                    .online(false)
                    .build();
            
            userRepository.save(admin);
            log.info("==========================================================");
            log.info("✅ Default Admin User Created Successfully!");
            log.info("==========================================================");
            log.info("📧 Email: {}", adminEmail);
            log.info("🔑 Password: hoangadmin@123");
            log.info("👤 Role: ADMIN");
            log.info("💾 Storage Quota: 10GB");
            log.info("==========================================================");
            log.info("⚠️  IMPORTANT: Please change the password after first login!");
            log.info("==========================================================");
        } else {
            log.info("ℹ️  Admin user already exists. Skipping creation.");
        }
        
        // Tạo thêm một số user test
        createTestUsers();
    }
    
    private void createTestUsers() {
        createUserIfNotExists("user1@pixshare.com", "user123", "John Doe", UserRole.USER);
    }
    
    private void createUserIfNotExists(String email, String password, String displayName, UserRole role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .displayName(displayName)
                    .role(role)
                    .status(UserStatus.ACTIVE)
                    .storageQuota(5368709120L) // 5GB
                    .storageUsed(0L)
                    .online(false)
                    .build();
            
            userRepository.save(user);
            log.info("✅ Test user created: {} ({})", displayName, email);
        }
    }
}

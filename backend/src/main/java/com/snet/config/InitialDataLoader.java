package com.snet.config;

import com.snet.model.User;
import com.snet.model.UserRole;
import com.snet.model.UserStatus;
import com.snet.repository.UserRepository;
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
        String adminEmail = "hv@snet.com";
        
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("200417a@"))
                    .displayName("HV Admin")
                    .role(UserRole.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .storageQuota(107374182400L) // 100GB for admin
                    .storageUsed(0L)
                    .online(false)
                    .verified(true)
                    .build();
            
            userRepository.save(admin);
            log.info("==========================================================");
            log.info("✅ Snet Admin User Created Successfully!");
            log.info("==========================================================");
            log.info("📧 Email: {}", adminEmail);
            log.info("🔑 Password: 200417a@");
            log.info("👤 Role: ADMIN");
            log.info("💾 Storage Quota: 100GB");
            log.info("✓ Verified: true");
            log.info("==========================================================");
            log.info("⚠️  IMPORTANT: This is the ONLY account in the system!");
            log.info("==========================================================");
        } else {
            log.info("ℹ️  Admin user already exists. Skipping creation.");
        }
    }
}

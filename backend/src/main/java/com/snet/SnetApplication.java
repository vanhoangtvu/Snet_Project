package com.snet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SnetApplication {
    public static void main(String[] args) {
        SpringApplication.run(SnetApplication.class, args);
    }
}

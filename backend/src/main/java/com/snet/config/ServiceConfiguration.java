package com.snet.config;

import com.snet.service.FileService;
import com.snet.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class ServiceConfiguration {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private FileService fileService;
    
    @PostConstruct
    public void init() {
        // Wire FileService into UserService after both are initialized
        userService.setFileService(fileService);
    }
}


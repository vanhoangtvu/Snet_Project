package com.snet.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web configuration for optimizing file download speed
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configure cache control for static resources
        registry.addResourceHandler("/api/files/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600); // 1 hour cache
    }
}


package com.snet.config;

import org.apache.coyote.ProtocolHandler;
import org.apache.coyote.http11.AbstractHttp11Protocol;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Tomcat configuration to optimize network throughput for 8MB/s download speed
 * 
 * This configuration:
 * - Increases socket buffer sizes
 * - Disables Nagle's algorithm (TCP_NODELAY)
 * - Optimizes send buffer
 * - Improves throughput for large file transfers
 */
@Configuration
public class TomcatConfig {
    
    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatCustomizer() {
        return factory -> factory.addConnectorCustomizers(connector -> {
            ProtocolHandler handler = connector.getProtocolHandler();
            
            if (handler instanceof AbstractHttp11Protocol) {
                AbstractHttp11Protocol<?> protocol = (AbstractHttp11Protocol<?>) handler;
                
                // Enable TCP_NODELAY for better throughput (disable Nagle's algorithm)
                // This sends data immediately instead of buffering
                protocol.setTcpNoDelay(true);
                
                // Increase socket send/receive buffer to 8MB (match our chunk size)
                // This allows OS to buffer more data for sending
                connector.setProperty("socket.appReadBufSize", "8388608");  // 8MB read buffer
                connector.setProperty("socket.appWriteBufSize", "8388608"); // 8MB write buffer
                connector.setProperty("socket.txBufSize", "8388608");       // 8MB TCP send buffer
                connector.setProperty("socket.rxBufSize", "8388608");       // 8MB TCP receive buffer
                
                // Optimize for throughput over latency
                protocol.setUseSendfile(false);  // Disable sendfile for BLOB data from DB
                
                // Additional performance tuning
                connector.setProperty("socket.directBuffer", "true");        // Use direct buffers
                connector.setProperty("socket.directSslBuffer", "true");     // Direct SSL buffers
                
                System.out.println("✅ Tomcat configured for 8MB/s throughput:");
                System.out.println("   - TCP_NODELAY: true");
                System.out.println("   - Socket buffers: 8MB (read/write/tx/rx)");
                System.out.println("   - Direct buffers: enabled");
                System.out.println("   - Sendfile: disabled");
            }
        });
    }
}


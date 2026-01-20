package com.snet.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

@Slf4j
public class IpConfigInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext context) {
        String publicIp = getPublicIp();
        log.info("✅ Public IP: {}", publicIp);

        ConfigurableEnvironment env = context.getEnvironment();
        Map<String, Object> props = new HashMap<>();
        props.put("app.public-ip", publicIp);
        props.put("app.api-url", "http://" + publicIp + ":8086");
        props.put("app.frontend-url", "http://" + publicIp + ":3006");

        env.getPropertySources().addFirst(new MapPropertySource("ipConfig", props));
    }

    private String getPublicIp() {
        try {
            URL url = new URL("https://api.ipify.org");
            BufferedReader br = new BufferedReader(new InputStreamReader(url.openStream()));
            return br.readLine();
        } catch (Exception e) {
            log.warn("⚠️ Could not get public IP, using localhost");
            return "localhost";
        }
    }
}

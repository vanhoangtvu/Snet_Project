#!/bin/bash

# Get public IP
PUBLIC_IP=$(curl -s https://api.ipify.org)

if [ -z "$PUBLIC_IP" ]; then
    echo "⚠️ Could not get public IP, using localhost"
    PUBLIC_IP="localhost"
fi

echo "✅ Server IP: $PUBLIC_IP"

# Update application.yml
sed -i "s|url: http://.*:8086|url: http://$PUBLIC_IP:8086|g" src/main/resources/application.yml
sed -i "s|allowed-origins: .*|allowed-origins: http://localhost:3006,http://$PUBLIC_IP:3006,http://$PUBLIC_IP:8086|g" src/main/resources/application.yml

# Update SecurityConfig.java
sed -i "s|\"http://[0-9.]*:3006\"|\"http://$PUBLIC_IP:3006\"|g" src/main/java/com/snet/config/SecurityConfig.java
sed -i "s|\"http://[0-9.]*:8086\"|\"http://$PUBLIC_IP:8086\"|g" src/main/java/com/snet/config/SecurityConfig.java

# Update WebSocketConfig.java
sed -i "s|\"http://[0-9.]*:3006\"|\"http://$PUBLIC_IP:3006\"|g" src/main/java/com/snet/config/WebSocketConfig.java

echo "✅ Updated all configurations with IP: $PUBLIC_IP"

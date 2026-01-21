#!/bin/bash

# Sử dụng domain thay vì IP động
DOMAIN="snet.io.vn"
API_DOMAIN="api.snet.io.vn"

echo "✅ Using domain: $DOMAIN"

# Update application.yml với domain
sed -i "s|url: http://.*:8086|url: https://$API_DOMAIN|g" src/main/resources/application.yml
sed -i "s|allowed-origins: .*|allowed-origins: http://localhost:3006,https://$DOMAIN,https://$API_DOMAIN|g" src/main/resources/application.yml

echo "✅ Updated configurations with domain: $DOMAIN"

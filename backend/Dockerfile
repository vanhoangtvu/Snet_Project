# Build stage
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN apk add --no-cache curl bash

COPY --from=build /app/target/*.jar app.jar
COPY get-server-ip.sh .
RUN chmod +x get-server-ip.sh

EXPOSE 8086

CMD ["sh", "-c", "./get-server-ip.sh && java -jar app.jar"]

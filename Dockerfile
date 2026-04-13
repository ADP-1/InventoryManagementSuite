# Dockerfile for Spring Boot Application
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# The built jar path depending on Gradle build
COPY build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

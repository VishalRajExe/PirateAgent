# -------------------------------------------------------------
# Stage 1: Build Spring Boot JAR with Maven
# -------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Cache Maven dependencies & compile
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# -------------------------------------------------------------
# Stage 2: Minimal Java 21 Runtime
# -------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built jar from Stage 1
COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

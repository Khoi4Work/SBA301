
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# 1. Copy the dependency descriptor first so Docker can cache
#    the dependency-download layer independently of source changes.
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 2. Copy the full source tree and produce the fat JAR.
#    -DskipTests keeps CI fast; run tests in a separate pipeline step.
COPY src ./src
RUN mvn package -DskipTests -B

# ============================================================
# Stage 2 – Runtime
# Uses a slim JRE 21 image; the fat JAR is the only artefact
# copied from the builder stage.
# ============================================================
FROM eclipse-temurin:21-jre-jammy AS runtime

WORKDIR /app

# Non-root user for security best-practice
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

# Copy the fat JAR produced in the build stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# ---------- Runtime environment variables ----------
# All sensitive values should be supplied at container start via
# --env-file or an orchestrator secret store (never baked into the image).
#
# Required variables (see application-prod.properties):
#   DEPLOY_ENVIRONMENT     – "prod" activates application-prod.properties
#   JWT_SECRET_KEY
#   DB_URL_PROD / DB_USERNAME_PROD / DB_PASSWORD_PROD / DB_DRIVER_PROD / DB_PLATFORM_PROD
#   GOOGLE_AI_STUDIO_API_KEY
#   ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID
#   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION / AWS_S3_BUCKET
#   CLOUDINARY_URL
#   DDL_AUTO (e.g. "validate" in prod, "update" in dev)
#   SHOW_SQL  (e.g. "false" in prod)
# ---------------------------------------------------

ENV DEPLOY_ENVIRONMENT=prod \
    DDL_AUTO=validate \
    SHOW_SQL=false

# JVM tuning for a container environment:
#   -XX:+UseContainerSupport  – honour cgroup memory/cpu limits
#   -XX:MaxRAMPercentage=75   – cap heap at 75 % of available RAM
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]

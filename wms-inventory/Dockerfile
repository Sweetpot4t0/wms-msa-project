# 1단계: 빌드 환경
FROM gradle:8.5-jdk17 AS builder
WORKDIR /app

# 루트의 모든 파일을 /app으로 복사
COPY . .

# wms-inventory 폴더로 이동하여 빌드
WORKDIR /app/wms-inventory
RUN gradle build -x test --no-daemon

# 2단계: 실행 환경
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# 빌드된 jar 파일을 가져옴
COPY --from=builder /app/wms-inventory/build/libs/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
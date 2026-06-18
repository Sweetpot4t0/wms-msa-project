# 1단계: 빌드 환경
FROM gradle:8.5-jdk17 AS builder
WORKDIR /app

# 루트의 모든 파일을 /app으로 복사 (루트에 있는 settings.gradle을 포함해야 합니다)
COPY . .

# 루트(/app)에서 전체 설정을 참조하여 wms-inventory 모듈만 빌드
RUN gradle :wms-inventory:build -x test --no-daemon --stacktrace --info

# 2단계: 실행 환경
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# 빌드 단계에서 생성된 jar 파일을 가져옴
# 경로: /app/wms-inventory/build/libs/ 안에 생성된 .jar 파일을 복사
COPY --from=builder /app/wms-inventory/build/libs/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
# 1단계: 빌드 환경 (루트 컨텍스트에서 실행됨)
FROM gradle:8.5-jdk17 AS builder
WORKDIR /app

# 루트 폴더의 모든 내용을 컨테이너의 /app으로 복사
COPY . .

# 이제 루트 컨텍스트에서 빌드하므로 모듈을 정확히 찾습니다.
RUN gradle :wms-inventory:build -x test --no-daemon

# 2단계: 실행 환경
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# 빌드된 파일 복사 (이미 루트 빌드이므로 wms-inventory 경로가 맞음)
COPY --from=builder /app/wms-inventory/build/libs/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
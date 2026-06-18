# 1단계: 빌드 환경
FROM gradle:8.5-jdk17 AS builder
WORKDIR /app

# 루트 폴더(/wms-msa)의 모든 파일을 /app으로 복사
# 이렇게 해야 루트의 settings.gradle과 wms-inventory 폴더가 모두 포함됩니다.
COPY . .

# 루트(/app)에서 전체 설정을 참조하여 wms-inventory 모듈만 빌드합니다.
# 주의: 이 명령은 루트에서 실행되어야 하며, 전체 멀티모듈 구조를 다 알아야 합니다.
RUN gradle :wms-inventory:build -x test --no-daemon

# 2단계: 실행 환경
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# 빌드 단계에서 생성된 jar 파일을 가져옵니다.
# wms-inventory 내부의 build/libs 폴더에서 jar를 찾아 app.jar로 복사합니다.
COPY --from=builder /app/wms-inventory/build/libs/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
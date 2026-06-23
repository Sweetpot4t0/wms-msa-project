# 실행 환경만 설정합니다 (빌드 과정 없음)
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

# 이미 로컬에서 빌드된 jar 파일을 복사합니다
COPY wms-inventory-1.0-SNAPSHOT.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
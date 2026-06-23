FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
# wms-inventory 폴더 안의 app.jar를 도커 내부로 복사합니다.
COPY app.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
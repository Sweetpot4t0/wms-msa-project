# 빌드 과정 없이, 이미 빌드된 파일을 nginx로 서빙만 합니다.
FROM nginx:alpine

# 서버에 전송한 dist 폴더를 nginx html 경로로 복사
COPY dist /usr/share/nginx/html

# nginx 설정 파일이 있다면 복사 (없다면 이 줄은 삭제하세요)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80 포트 노출
EXPOSE 80
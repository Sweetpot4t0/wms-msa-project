# 1단계: 빌드 환경 (Node.js를 이용해 리액트 코드를 정적 파일로 컴파일합니다.)
FROM node:20-alpine AS builder
WORKDIR /app

# 의존성 설치를 위해 패키지 파일 먼저 복사 및 설치
COPY package.json package-lock.json ./
RUN npm install

# 소스 코드 복사 후 프로덕션 빌드 (dist 폴더 생성)
COPY . .
RUN npm run build

# 2단계: 실행 환경 (빌드된 가벼운 HTML/JS 파일들을 웹 서버인 Nginx를 통해 브라우저에 띄웁니다.)
FROM nginx:alpine

# Nginx의 기본 정적 파일 제공 디렉토리로 리액트 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# [추가] 우리가 만든 nginx.conf를 Nginx 설정 폴더로 복사!
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 프론트엔드 기본 웹 포트 오픈
EXPOSE 80

# Nginx 백그라운드 구동 실행 (이 줄은 그대로 두세요)
CMD ["nginx", "-g", "daemon off;"]
# 1단계: 빌드 (wms-frontend 폴더 내부로 경로를 지정)
FROM node:20-alpine AS builder
WORKDIR /app

# [수정] 루트가 아니라 wms-frontend 폴더에서 가져와야 합니다.
COPY wms-frontend/package.json wms-frontend/package-lock.json ./
RUN npm install
COPY wms-frontend/ .
RUN npm run build

# 2단계: 실행
FROM nginx:alpine
# [수정] wms-frontend 폴더 안에 있는 nginx.conf를 복사
COPY wms-frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
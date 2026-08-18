# 양파마켓

중고거래 플랫폼 토이 프로젝트입니다.

## 프로젝트 구조

```
├── be/       # 백엔드 (Express + TypeScript)
├── fe/       # 웹 프론트엔드 (React + Vite)
├── mobile/   # 모바일 앱 (Expo + React Native)
└── docs/     # API 명세, DB 스키마 문서
```

## 시작하기

### 사전 준비

- Node.js 18+
- PostgreSQL (또는 MySQL)

### 백엔드 실행

```bash
cd be
npm install
npm run dev
```

개발 서버가 `http://localhost:3000`에서 실행됩니다.

처음 실행하거나 테스트 데이터가 필요하면:

```bash
npm run seed
```

### 웹 프론트엔드 실행

```bash
cd fe
npm install
npm run dev
```

`http://localhost:5173`에서 확인할 수 있습니다.

### 모바일 앱 실행

백엔드가 먼저 실행 중이어야 합니다.

```bash
cd mobile
npm install
npm start
```

Expo Go 앱으로 QR 코드를 스캔하거나 시뮬레이터에서 실행하세요.

## 기술 스택

| 영역 | 스택 |
|------|------|
| Backend | Express, Sequelize, TypeScript |
| Web | React 19, Vite, react-router |
| Mobile | Expo SDK 57, React Native, React Navigation |
| Database | PostgreSQL |
| Auth | JWT |

## 주요 기능

- 회원가입 / 로그인
- 상품 등록 (이미지 업로드)
- 상품 목록 조회 (검색, 페이지네이션)
- 찜하기
- 마이페이지

## 환경 변수

백엔드 환경 변수는 `be/.env` 파일에 설정합니다:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yangpa
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret
```

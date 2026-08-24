# 양파마켓

중고거래 플랫폼 토이 프로젝트입니다.

## 프로젝트 구조

```
├── be/       # 백엔드 (Express + TypeScript)
├── fe/       # 웹 프론트엔드 (React + Vite)
├── mobile/   # 모바일 앱 (Expo + React Native)
└── docs/     # 설계 문서
```

## 시작하기

### 사전 준비

- Node.js 18+
- PostgreSQL

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

## API 문서

백엔드 실행 후 Swagger UI에서 API를 확인하고 테스트할 수 있습니다.

```
http://localhost:3000/api-docs
```

## 문서

| 문서 | 설명 |
|------|------|
| [기능 정의서](docs/01-feature-spec.md) | 기능 목록 및 상세 명세 |
| [화면 설계서](docs/02-screen-design.md) | 화면 구성 및 와이어프레임 |
| [아키텍처](docs/03-architecture.md) | 시스템 구조 및 기술 스택 |
| [시퀀스 다이어그램](docs/04-sequence-diagram.md) | 주요 기능 처리 흐름 |
| [환경 설정 가이드](docs/05-setup-guide.md) | 로컬 개발환경 구축 |
| [테스트 케이스](docs/06-test-cases.md) | 기능별 테스트 시나리오 |
| [DB 스키마](docs/07-db-schema.md) | 테이블 정의 및 ERD |
| [API 명세서](docs/08-api-spec.md) | REST API 상세 명세 |
| [Swagger](docs/swagger.yaml) | OpenAPI 3.0 스펙 |

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

## 테스트 계정

시드 데이터 실행 후 사용 가능한 계정:

| 이메일 | 비밀번호 |
|--------|----------|
| user1@example.com | 1234 |
| user2@example.com | 1234 |
| son@tottenham.com | 1234 |

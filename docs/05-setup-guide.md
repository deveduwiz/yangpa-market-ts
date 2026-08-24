# 환경 설정 가이드

로컬 개발환경 구축 방법입니다.

## 사전 요구사항

- Node.js 18 이상
- PostgreSQL 14 이상 (또는 Docker)
- npm 또는 yarn

## 1. 저장소 클론

```bash
git clone <repository-url>
cd yangpa-market-ts
```

## 2. 데이터베이스 설정

### Option A: Docker 사용 (권장)

```bash
docker run -d \
  --name yangpa-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=yangpa \
  -p 5432:5432 \
  postgres:14
```

### Option B: 로컬 PostgreSQL

```sql
CREATE DATABASE yangpa;
```

## 3. 백엔드 설정

### 의존성 설치

```bash
cd be
npm install
```

### 환경 변수

`be/.env` 파일 생성:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yangpa
DB_USER=postgres
DB_PASSWORD=postgres
DIALECT=postgres

# JWT
JWT_SECRET=your-secret-key-here

# Server
PORT=3000
```

### 테이블 생성 및 시드 데이터

```bash
npm run seed
```

이 명령은:
1. 기존 테이블 삭제
2. 테이블 재생성
3. 샘플 사용자/상품 데이터 삽입

### 서버 실행

```bash
# 개발 모드 (hot reload)
npm run dev

# 또는 프로덕션 모드
npm start
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 동작 확인

```bash
curl http://localhost:3000/members/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"1234"}'
```

토큰이 반환되면 정상입니다.

## 4. 웹 프론트엔드 설정

### 의존성 설치

```bash
cd fe
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속.

### 테스트 계정

시드 데이터에 포함된 계정:

| 이메일 | 비밀번호 | 이름 |
|--------|----------|------|
| user1@example.com | 1234 | 판매자1 |
| user2@example.com | 1234 | 판매자2 |
| son@tottenham.com | 1234 | 손흥민 |

## 5. 모바일 앱 설정

### 의존성 설치

```bash
cd mobile
npm install
```

### API 주소 설정

`mobile/src/api.ts`에서 백엔드 주소 확인:

```typescript
const BASE_URL = 'http://localhost:3000';
// 또는 실제 IP (시뮬레이터/에뮬레이터용)
// const BASE_URL = 'http://192.168.0.10:3000';
```

iOS 시뮬레이터는 `localhost` 사용 가능.
Android 에뮬레이터는 `10.0.2.2` 또는 실제 IP 필요.

### Expo 실행

```bash
npm start
```

- `i` - iOS 시뮬레이터
- `a` - Android 에뮬레이터
- QR 코드 - Expo Go 앱

## 프로젝트 구조

```
yangpa-market-ts/
├── be/                 # 백엔드
│   ├── src/
│   ├── files/          # 업로드 이미지
│   ├── dist/           # 빌드 결과
│   └── package.json
├── fe/                 # 웹 프론트엔드
│   ├── src/
│   └── package.json
├── mobile/             # 모바일 앱
│   ├── src/
│   └── package.json
├── docs/               # 문서
└── README.md
```

## 주요 스크립트

### 백엔드 (be/)

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (ts-node, watch) |
| `npm run build` | TypeScript 컴파일 |
| `npm start` | 프로덕션 실행 |
| `npm run seed` | DB 초기화 + 샘플 데이터 |
| `npm run db:check` | 테이블 존재 확인 |

### 웹 (fe/)

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (Vite) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |

### 모바일 (mobile/)

| 명령어 | 설명 |
|--------|------|
| `npm start` | Expo 개발 서버 |
| `npm run ios` | iOS 시뮬레이터 |
| `npm run android` | Android 에뮬레이터 |

## 문제 해결

### 포트 충돌

```bash
# 3000번 포트 사용 중인 프로세스 확인
lsof -i :3000

# 프로세스 종료
kill -9 <PID>
```

### DB 연결 실패

1. PostgreSQL 실행 중인지 확인
2. `.env` 설정값 확인
3. 방화벽/네트워크 설정 확인

### 모바일에서 API 연결 안 됨

1. 백엔드가 실행 중인지 확인
2. IP 주소가 올바른지 확인 (localhost → 실제 IP)
3. 같은 네트워크인지 확인

### TypeScript 컴파일 에러

```bash
cd be
rm -rf dist/
npm run build
```

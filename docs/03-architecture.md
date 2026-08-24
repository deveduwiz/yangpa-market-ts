# 아키텍처 설계서

양파마켓의 시스템 구조와 기술 선정 배경입니다.

## 시스템 구성도

```
┌─────────────────────────────────────────────────────────────┐
│                        클라이언트                           │
├─────────────────────────┬───────────────────────────────────┤
│      웹 (React)         │         모바일 (React Native)     │
│    localhost:5173       │            Expo Go                │
└────────────┬────────────┴──────────────────┬────────────────┘
             │                               │
             │         HTTP/REST             │
             ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    백엔드 (Express)                         │
│                    localhost:3000                           │
├─────────────────────────────────────────────────────────────┤
│  Routes → Controllers → Services → Models                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ Sequelize ORM
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL                               │
│                    localhost:5432                           │
│                    database: yangpa                         │
└─────────────────────────────────────────────────────────────┘
```

## 기술 스택

### 백엔드

| 영역 | 기술 | 버전 | 선정 이유 |
|------|------|------|-----------|
| 런타임 | Node.js | 18+ | 비동기 I/O, npm 생태계 |
| 프레임워크 | Express | 4.x | 경량, 유연한 미들웨어 구조 |
| 언어 | TypeScript | 5.x | 타입 안정성, IDE 지원 |
| ORM | Sequelize | 6.x | SQL 추상화, 마이그레이션 |
| 인증 | JWT | - | 무상태 인증, 확장성 |
| 암호화 | bcrypt | - | 안전한 비밀번호 해싱 |
| 파일업로드 | multer | - | multipart 처리 |

### 프론트엔드 (웹)

| 영역 | 기술 | 버전 | 선정 이유 |
|------|------|------|-----------|
| 라이브러리 | React | 19.x | 컴포넌트 기반, 생태계 |
| 빌드 | Vite | 6.x | 빠른 HMR, ESM 기반 |
| 라우팅 | react-router | 7.x | SPA 라우팅 표준 |
| 상태관리 | Context API | - | 간단한 전역 상태 (인증) |

### 프론트엔드 (모바일)

| 영역 | 기술 | 버전 | 선정 이유 |
|------|------|------|-----------|
| 프레임워크 | React Native | - | 웹과 코드 공유 가능 |
| 플랫폼 | Expo | SDK 57 | 빠른 개발, OTA 업데이트 |
| 네비게이션 | React Navigation | 7.x | 네이티브 경험 |

### 데이터베이스

| 영역 | 기술 | 선정 이유 |
|------|------|-----------|
| RDBMS | PostgreSQL | 안정성, JSON 지원, 무료 |

## 백엔드 레이어 구조

```
┌─────────────────────────────────────────────────────────────┐
│                         Routes                              │
│   URL 매핑, 미들웨어 적용                                   │
├─────────────────────────────────────────────────────────────┤
│                       Controllers                           │
│   요청 파싱, 응답 포맷팅, 에러 처리                         │
├─────────────────────────────────────────────────────────────┤
│                        Services                             │
│   비즈니스 로직, 트랜잭션                                   │
├─────────────────────────────────────────────────────────────┤
│                         Models                              │
│   Sequelize 모델, 데이터 접근                               │
└─────────────────────────────────────────────────────────────┘
```

### 디렉토리 구조

```
be/src/
├── app.ts              # 앱 진입점, 미들웨어 설정
├── config/
│   └── config.ts       # 환경설정
├── routes/
│   ├── memberRouter.ts # /members/*
│   ├── saleRouter.ts   # /sales/*
│   └── imageRouter.ts  # /image/*
├── controllers/
│   ├── memberController.ts
│   └── saleController.ts
├── services/
│   ├── memberService.ts
│   └── saleService.ts
├── models/
│   ├── index.ts        # Sequelize 초기화
│   ├── User.ts
│   ├── Sale.ts
│   └── Favorite.ts
├── middleware/
│   ├── authMiddleware.ts   # JWT 검증
│   ├── errorHandler.ts     # 에러 응답
│   └── upload.ts           # 파일 업로드
└── types/
    └── index.ts        # 타입 정의
```

## 인증 흐름

```
1. 로그인 요청
   Client → POST /members/sign-in { email, password }

2. 토큰 발급
   Server → { token: "eyJ..." }

3. 인증 요청
   Client → GET /sales
            Authorization: Bearer eyJ...

4. 토큰 검증
   authMiddleware → JWT 디코딩 → req.userEmail 설정

5. 응답
   Server → { documents: [...] }
```

### JWT 페이로드

```json
{
  "email": "user@example.com",
  "iat": 1723939200,
  "exp": 1724025600
}
```

- 만료: 24시간
- 갱신: 없음 (재로그인 필요)

## 파일 저장 구조

```
be/
└── files/
    ├── product_1723939200000.jpg
    ├── product_1723939300000.png
    └── ...
```

- 파일명: `{prefix}_{timestamp}.{ext}`
- DB에는 파일명만 저장
- 조회: `GET /image/:filename`

## 에러 처리

```typescript
// 비즈니스 에러
throw { status: 404, message: '상품을 찾을 수 없습니다.' };

// errorHandler 미들웨어
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || '서버 오류'
  });
});
```

| 상태 코드 | 용도 |
|-----------|------|
| 400 | 잘못된 요청 (입력값 오류) |
| 401 | 인증 필요 (토큰 없음) |
| 403 | 권한 없음 (토큰 무효, 타인 리소스) |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복 이메일) |
| 500 | 서버 내부 오류 |

## 프론트엔드 상태 관리

### 웹 (React)

```
AuthContext
├── email      # 로그인한 사용자 이메일
├── token      # JWT 토큰
├── signIn()   # 로그인 처리
└── signOut()  # 로그아웃 처리
```

- 토큰은 localStorage에 저장
- 페이지 로드 시 토큰 확인

### 컴포넌트별 상태

```
SaleList
├── items[]      # 상품 목록
├── count        # 전체 개수
├── status       # loading | done | error
└── query        # 검색어 (URL 파라미터)
```

## 보안 고려사항

1. **비밀번호**: bcrypt 해싱 (salt rounds: 10)
2. **토큰**: 서버 비밀키로 서명, 만료 시간 설정
3. **파일 업로드**: 확장자/크기 제한, 저장 경로 분리
4. **권한 검사**: 리소스 소유자 확인 (삭제 등)
5. **SQL Injection**: Sequelize 파라미터 바인딩

## 성능 고려사항

1. **페이지네이션**: limit/offset으로 대량 데이터 처리
2. **이미지 lazy loading**: 뷰포트 진입 시 로드
3. **검색 디바운스**: 300ms 지연으로 요청 최소화
4. **Optimistic Update**: 찜 토글 시 즉시 UI 반영

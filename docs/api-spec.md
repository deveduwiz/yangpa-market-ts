# API 명세서

양파마켓 REST API.

| 항목       | 값                        |
| ---------- | ------------------------- |
| 서버       | `be` (Express 4)          |
| 포트       | 3000                      |
| 베이스 URL | `http://localhost:3000`   |
| DB         | MySQL 8 / 스키마 `yangpa` |

## 공통

- 요청/응답 본문은 JSON (상품 등록만 `multipart/form-data`)
- 인증은 `Authorization: Bearer <token>` 헤더
- 토큰 payload는 `{ email }`
- 금액은 정수(원), 시각은 ISO 8601
- 🔒 표시는 토큰이 필요한 엔드포인트

## 엔드포인트 요약

| No  | 기능        | Method | Endpoint           | 인증 |
| --- | ----------- | ------ | ------------------ | ---- |
| 1   | 회원가입    | POST   | `/members/sign-up` | —    |
| 2   | 로그인      | POST   | `/members/sign-in` | —    |
| 3   | 상품 등록   | POST   | `/sales`           | 🔒   |
| 4   | 상품 목록   | GET    | `/sales`           | 🔒   |
| 5   | 상품 단건   | GET    | `/sales/:id`       | 🔒   |
| 6   | 이미지 조회 | GET    | `/image/:filename` | —    |
| 7   | 내 정보     | GET    | `/members/me`      | 🔒   |
| 8   | 상품 삭제   | DELETE | `/sales/:id`       | 🔒   |
| 9   | 찜 목록     | GET    | `/sales/favorites` | 🔒   |
| 10  | 찜 추가     | POST   | `/sales/:id/favorite` | 🔒 |
| 11  | 찜 해제     | DELETE | `/sales/:id/favorite` | 🔒 |

> 라우터에서 `/sales/favorites` 는 반드시 `/sales/:id` 보다 **먼저** 선언해야 합니다.
> 뒤에 두면 `id="favorites"` 로 잡혀 `NaN` 조회가 됩니다.

---

## 1. POST /members/sign-up

회원가입.

**요청**

```json
{ "email": "a@naver.com", "name": "홍길동", "password": "1234" }
```

| 필드     | 타입   | 필수 | 제약                   |
| -------- | ------ | ---- | ---------------------- |
| email    | String | O    | 50자, 중복 불가        |
| name     | String | O    | 50자                   |
| password | String | O    | bcrypt로 해싱되어 저장 |

**응답 201**

```json
{
  "success": true,
  "member": { "id": 1, "name": "홍길동", "email": "a@naver.com" },
  "message": "회원가입이 완료되었습니다."
}
```

| 코드 | 상황               |
| ---- | ------------------ |
| 409  | 이미 가입된 이메일 |
| 500  | 서버 오류          |

## 2. POST /members/sign-in

로그인.

**요청**

```json
{ "email": "a@naver.com", "password": "1234" }
```

**응답 200**

```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "message": "로그인에 성공했습니다."
}
```

| 코드 | 상황                 |
| ---- | -------------------- |
| 401  | 비밀번호 불일치      |
| 404  | 존재하지 않는 이메일 |

## 3. POST /sales 🔒

상품 등록. `Content-Type: multipart/form-data`

| 필드        | 타입 | 필수 | 설명                    |
| ----------- | ---- | ---- | ----------------------- |
| productName | text | O    | 상품명 (50자)           |
| description | text | O    | 설명                    |
| price       | text | O    | 가격 (정수 문자열)      |
| photo       | file | O    | 이미지 1장 (100MB 이하) |

판매자(`email`)는 토큰에서 결정되며 요청 본문으로 받지 않습니다.

**응답 201**

```json
{
  "success": true,
  "document": {
    "id": 7,
    "productName": "양파 10kg",
    "description": "국산 햇양파입니다",
    "price": 18000,
    "photo": "onion_1754000000000.png",
    "email": "a@naver.com",
    "createdAt": "2026-08-09T02:11:00.000Z",
    "updatedAt": "2026-08-09T02:11:00.000Z"
  },
  "message": "post 등록 성공"
}
```

| 코드 | 상황       |
| ---- | ---------- |
| 400  | photo 누락 |
| 401  | 토큰 없음  |
| 403  | 토큰 무효  |
| 500  | 서버 오류  |

## 4. GET /sales 🔒

상품 목록.

| 쿼리  | 타입   | 기본값 | 설명                                          |
| ----- | ------ | ------ | --------------------------------------------- |
| page  | Int    | 1      | 페이지 번호 (1부터)                           |
| size  | Int    | 10     | 페이지당 개수                                 |
| email | String | —      | 지정 시 해당 판매자 상품만                    |
| query | String | —      | 지정 시 productName이 query를 포함하는 상품만 |
| productName | String | — | `query` 의 별칭. fe 가 이 이름으로 보내서 함께 받습니다 |

정렬은 `createdAt DESC` 고정입니다.

**응답 200**

```json
{
  "success": true,
  "documents": [
    /* sale 객체 배열 */
  ],
  "count": 42,
  "hasNext": true,
  "page": 1,
  "size": 10,
  "message": "sales 조회성공"
}
```

`count`는 필터가 적용된 전체 건수(페이지 크기 아님)입니다. 총 페이지 수는 `Math.ceil(count / size)`로 계산합니다.
`hasNext`는 무한스크롤용입니다 — 클라이언트가 `count`로 직접 계산하지 않아도 됩니다.

## 5. GET /sales/:id 🔒

상품 단건.

**응답 200**

```json
{
  "success": true,
  "documents": [
    /* sale 1건 */
  ],
  "message": "sale 조회성공"
}
```

단건이지만 `findAll` 결과라 배열입니다. 없으면 빈 배열입니다.

## 6. GET /image/:filename

이미지 파일. 인증 불필요. 응답은 이미지 바이너리입니다.

`sale.photo`에 저장된 파일명을 그대로 넣습니다. 실제 파일은 서버의 `files/` 디렉터리에 있습니다.

---

## 7. GET /members/me 🔒

토큰에는 `email` 밖에 없어서, 이름·가입일·카운트는 이 엔드포인트로 받습니다.

**응답 200**

```json
{
  "success": true,
  "member": {
    "id": 1,
    "email": "a@example.com",
    "name": "김양파",
    "createdAt": "2026-08-18T00:00:00.000Z",
    "salesCount": 14,
    "favoritesCount": 3
  },
  "message": "내 정보 조회성공"
}
```

## 8. DELETE /sales/:id 🔒

본인이 등록한 상품만 삭제할 수 있습니다. 상품이 지워지면 그 상품을 가리키던 찜도 함께 정리됩니다.

| 상황               | 상태 |
| ------------------ | ---- |
| 삭제 성공          | 200  |
| 없는 상품          | 404  |
| 남의 상품          | 403  |

## 9. GET /sales/favorites 🔒

내가 찜한 상품 목록. 최근에 찜한 순서입니다.
쿼리(`page`, `size`)와 응답 모양은 `GET /sales` 와 같습니다.

## 10 / 11. POST · DELETE /sales/:id/favorite 🔒

찜 추가 / 해제. 둘 다 **멱등**이라 같은 요청을 여러 번 보내도 결과가 같습니다.

**응답 200**

```json
{ "success": true, "isFavorite": true, "favoriteCount": 2 }
```

없는 상품에 찜을 걸면 404입니다.

## 에러 코드

| 코드 | 의미                  | 발생 상황                          |
| ---- | --------------------- | ---------------------------------- |
| 400  | Bad Request           | photo 누락, 입력값 형식 오류       |
| 401  | Unauthorized          | Bearer 토큰 없음 / 비밀번호 불일치 |
| 403  | Forbidden             | 토큰이 유효하지 않음 (위조·만료)   |
| 404  | Not Found             | 존재하지 않는 이메일 / 리소스 없음 |
| 409  | Conflict              | 이미 가입된 이메일                 |
| 500  | Internal Server Error | DB 오류 등 서버 내부 오류          |

에러 응답은 `errorHandler` 미들웨어를 거쳐 다음 형태로 나옵니다.

```json
{ "message": "에러 설명" }
```

## sale 객체

| 필드        | 타입   | 설명                 |
| ----------- | ------ | -------------------- |
| id          | Int    | 상품 번호            |
| productName | String | 상품명               |
| description | String | 설명                 |
| price       | Int    | 판매가 (원)          |
| email       | String | 판매자 이메일        |
| photo       | String | 이미지 파일명        |
| createdAt   | String | 등록 시각 (ISO 8601) |
| updatedAt   | String | 수정 시각 (ISO 8601) |
| sellerName  | String \| null | 판매자 이름. `user` 를 조인해서 채웁니다 |
| isFavorite  | Bool   | **요청한 회원이** 이 상품을 찜했는지 |
| favoriteCount | Int  | 이 상품을 찜한 사람 수 |

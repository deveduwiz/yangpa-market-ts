# DB 명세서

- DBMS: MySQL 8
- 스키마: `yangpa`
- ORM: Sequelize (`timestamps: true`, `paranoid: true`)
- 문자셋: `utf8mb4` / `utf8mb4_general_ci`

백엔드 `be`(Express + Sequelize)가 이 스키마를 사용합니다.

## 요구사항 명세

1. 회원 정보는 이메일, 이름, 비밀번호 정보를 가지고 이메일로 식별한다.
2. 회원은 상품 등록을 통해 상품을 판매할 수 있다.
3. 상품 정보는 상품명, 설명, 가격, 사진 정보를 가지고 대리키를 이용해서 식별한다.
4. 한 회원은 여러 상품을 등록할 수 있고, 하나의 상품은 반드시 한 명의 판매자에 속한다.
5. 상품 사진은 파일명만 저장하고 실제 파일은 서버의 파일 시스템에 보관한다.
6. 회원 탈퇴와 상품 삭제는 실제 행을 지우지 않고 삭제 일시를 기록한다.
7. 모든 테이블은 생성 일시와 수정 일시를 가진다.
8. 상품 목록은 최신 등록순으로 정렬하며 페이지 단위로 나누어 조회한다.
9. 검색어를 입력해서 검색어를 포함하는 상품을 조회한다.
10. 상품 등록과 조회는 로그인한 회원만 가능하다.
11. 상품을 등록한 회원은 탈퇴할 수 없다. (등록 상품이 있으면 회원 삭제 거부)

## 테이블과 속성

1. user — 아이디, 이메일, 이름, 비밀번호, 생성일시, 수정일시, 삭제일시
2. sale — 아이디, 상품명, 설명, 가격, 판매자이메일, 사진파일명, 생성일시, 수정일시, 삭제일시

## ERD

```
user (1) ──< (N) sale
      email        email
```

`user.email`을 부모 키로, `sale.email`을 자식 키로 연결합니다. `id`가 아니라 `email`을 참조 키로 쓰는 구조입니다.

## user

회원 정보.

| 컬럼      | 타입               | NULL | 키  | 설명                      |
| --------- | ------------------ | ---- | --- | ------------------------- |
| id        | INT AUTO_INCREMENT | N    | PK  | 내부 식별자               |
| email     | VARCHAR(50)        | N    | UQ  | 로그인 ID 겸 FK 참조 대상 |
| name      | VARCHAR(50)        | N    |     | 표시 이름                 |
| password  | VARCHAR(200)       | N    |     | bcrypt 해시               |
| createdAt | DATETIME           | N    |     | 가입 시각                 |
| updatedAt | DATETIME           | N    |     | 수정 시각                 |
| deletedAt | DATETIME           | Y    |     | 탈퇴 시각 (soft delete)   |

- `email`은 UNIQUE. 중복 가입 시 409를 반환합니다.
- `password`는 평문을 저장하지 않으며 어떤 응답에도 포함되지 않습니다.

## sale

판매 상품.

| 컬럼        | 타입               | NULL | 키  | 설명                    |
| ----------- | ------------------ | ---- | --- | ----------------------- |
| id          | INT AUTO_INCREMENT | N    | PK  | 상품 번호               |
| productName | VARCHAR(50)        | N    |     | 상품명                  |
| description | TEXT               | N    |     | 상품 설명               |
| price       | INT                | N    |     | 판매가 (원, 0 이상)     |
| email       | VARCHAR(50)        | N    | FK  | 판매자 → `user.email`   |
| photo       | VARCHAR(200)       | N    |     | 저장된 이미지 파일명    |
| createdAt   | DATETIME           | N    |     | 등록 시각               |
| updatedAt   | DATETIME           | N    |     | 수정 시각               |
| deletedAt   | DATETIME           | Y    |     | 삭제 시각 (soft delete) |

- `photo`에는 파일명만 저장하고, 실제 파일은 서버의 `files/` 디렉터리에 둡니다. 조회는 `GET /image/:filename`.
- `email`은 토큰에서 추출한 값을 씁니다. 클라이언트가 보낸 값을 신뢰하지 않습니다.

## favorite

찜(관심 상품). 회원 한 명이 같은 상품을 두 번 찜할 수 없습니다.

| 컬럼      | 타입               | NULL | 키  | 설명                  |
| --------- | ------------------ | ---- | --- | --------------------- |
| id        | INT AUTO_INCREMENT | N    | PK  | 찜 번호               |
| email     | VARCHAR(50)        | N    | FK  | 찜한 회원 → `user.email` |
| saleId    | INT                | N    | FK  | 찜한 상품 → `sale.id` |
| createdAt | DATETIME           | N    |     | 찜한 시각             |
| updatedAt | DATETIME           | N    |     | 수정 시각             |

- `(email, saleId)` 에 유니크 인덱스가 걸려 있습니다.
- **이 테이블만 `paranoid: false`** 입니다. 찜은 껐다 켰다 하는 토글이라
  soft delete 를 쓰면 유니크 제약과 충돌합니다 (지운 행이 남아 재삽입이 막힘).
- 상품이 삭제되면 그 상품을 가리키던 찜도 애플리케이션 레벨에서 함께 지웁니다.

## 조회 규칙

- 목록은 `createdAt DESC` 정렬, `limit`/`offset` 페이지네이션.
- 목록 응답의 `isFavorite`·`favoriteCount` 는 목록 쿼리에 조인하지 않고,
  그 페이지에 실제로 담긴 `sale.id` 들만 모아 별도 쿼리 두 번으로 채웁니다.
  `limit` 과 조인이 엉켜 건수가 틀어지는 걸 피하기 위해서입니다.
- `paranoid: true`이므로 삭제된 행은 기본 조회에서 자동 제외됩니다.

## 알려진 제약

- `sale.email`은 논리적 FK일 뿐 DB 레벨 제약이 아닙니다. Sequelize `associate`로만 연결돼 있습니다.
- 상품을 등록한 회원은 탈퇴 불가 — 애플리케이션 레벨에서 삭제 전 등록 상품 여부를 확인합니다.
- 회원당 상품 수, 상품당 이미지 수(현재 1장) 제한은 애플리케이션 레벨에서만 관리합니다.

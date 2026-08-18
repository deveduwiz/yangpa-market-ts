# 양파마켓 Design System — Figma 플러그인

`mobile/` 의 React Native 코드와 **같은 값**으로 Figma 문서를 생성하는 플러그인입니다.
디자인 토큰을 손으로 옮겨 적지 않으므로 코드와 디자인이 어긋나지 않습니다.

## 실행 방법

1. Figma 데스크톱 앱을 엽니다 (브라우저 버전은 로컬 플러그인을 못 읽습니다).
2. 새 디자인 파일을 만듭니다.
3. 메뉴 → **Plugins → Development → Import plugin from manifest…**
4. 이 폴더의 `manifest.json` 을 선택합니다.
5. **Plugins → Development → 양파마켓 Design System** 실행.

10초 안팎이면 페이지 3개가 만들어집니다.

## 생성되는 것

### 🎨 Foundations

- **색상 팔레트** — Light / Dark 각 20개 토큰 (`mobile/src/theme.ts` 와 동일한 hex)
- **타이포그래피** — 11종 스케일 (크기 / 행간 / 자간 / 두께)
- **Spacing & Radius** — 4·8·12·16·20·28 / 6·8·12·16

로컬 스타일도 함께 등록됩니다.

- Paint 스타일 40개 — `Light/bg`, `Light/text`, `Dark/bg` … 형태
- Text 스타일 11개 — `Mobile/screenTitle`, `Mobile/body` … 형태

### 🧩 Components

24개의 실제 Figma 컴포넌트(⬦ 인스턴스 생성 가능). 각각 `mobile/src/` 의 같은 이름 파일과 대응합니다.

| Figma | 코드 |
|---|---|
| Button / Primary·Ghost × Default·Active·Disabled·Compact | `components/Button.tsx` |
| Field / Default·Focused·Multiline | `components/Field.tsx` |
| Alert / Error·Warn·Ok | `components/Alert.tsx` |
| ViewToggle / card·list | `components/ViewToggle.tsx` |
| SearchBar / Empty·Filled | `components/SearchBar.tsx` |
| HeartButton / Overlay 기본·찜함 | `components/HeartButton.tsx` |
| Tile (카드형·찜한 상태) · Row (목록형) | `components/SaleTile.tsx` · `SaleRow.tsx` |
| TabBar / 홈·찜·마이 선택 | `navigators/TabNavigator.tsx` |

### 📱 Screens

390 × 844 (iPhone 14/15) 프레임 10종을 **Light / Dark 두 벌** — 총 20개.

| 프레임 | 코드 | 탭바 |
|---|---|---|
| 01 · 로그인 | `SignInScreen.tsx` | — |
| 01b · 로그인 (세션 만료 + 에러) | 〃 | — |
| 02 · 회원가입 | `SignUpScreen.tsx` | — |
| 03 · 홈 (카드형) | `HomeScreen.tsx` | 홈 |
| 04 · 홈 (목록형 · 검색중) | 〃 | 홈 |
| 05 · 찜한 상품 | `FavoritesScreen.tsx` | 찜 |
| 06 · 찜 (비어 있음) | 〃 | 찜 |
| 07 · 마이 | `MyScreen.tsx` | 마이 |
| 08 · 상품 등록 (모달) | `SaleNewScreen.tsx` | — (시트) |
| 09 · 상품 상세 | `SaleDetailScreen.tsx` | — (루트 스택) |

상세와 등록은 탭 **밖**에 있어 탭바가 그려지지 않습니다 — 실제 앱 동작과 같습니다.
등록 화면은 상태바 대신 시트 손잡이(grabber)가 붙습니다.

모든 프레임은 오토레이아웃으로 구성돼 있어, 텍스트를 바꾸면 레이아웃이 코드와 같은 방식으로 따라 움직입니다.

## 값을 바꿀 때

`code.js` 상단의 `LIGHT` / `DARK` / `RADIUS` / `SPACE` / `TYPE` 만 고치면 전체 문서가 따라 바뀝니다.
같은 값이 `mobile/src/theme.ts` 에도 있으니 **양쪽을 함께** 수정해 주세요.

## 검증

`test-harness.js` 는 Figma Plugin API 목(mock) 위에서 `code.js` 를 실제로 실행해
잘못된 프로퍼티·허용되지 않는 enum 값·범위를 벗어난 색상 채널 등을 잡아냅니다.

```bash
node test-harness.js
```

## 참고

- 폰트는 Figma 기본 내장 **Inter** 를 씁니다. 별도 설치가 필요 없습니다.
  Pretendard 등으로 바꾸려면 `code.js` 의 `'Inter'` 를 치환하고, 해당 폰트를 Figma에 먼저 설치하세요.
- 상품 이미지는 `IMG` 라벨이 붙은 회색 자리표시자입니다. 실제 사진은 프레임을 선택해 직접 채우면 됩니다.
- 플러그인은 실행할 때마다 페이지 3개를 **새로** 만듭니다. 다시 돌리려면 이전 페이지를 지우세요.

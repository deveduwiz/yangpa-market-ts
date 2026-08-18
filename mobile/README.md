# 양파마켓 Mobile (Expo + React Native)

`fe/` 의 React 웹 앱을 React Native로 옮기고, 모바일 관례에 맞게 다시 짠 앱입니다.
iOS · Android 양쪽에서 같은 코드로 동작합니다.

## 실행

```bash
# 1) be 서버를 먼저 띄운다
cd ../be && npm install && npm run dev   # http://localhost:3000

# 2) 앱 실행
cd ../mobile && npm install && npm start
```

Expo Go 앱으로 QR을 찍거나, 터미널에서 `i`(iOS 시뮬레이터) / `a`(안드로이드 에뮬레이터)를 누릅니다.

## 화면 구조

하단 4탭입니다. 상세·등록은 탭 **밖(루트 스택)** 에 두어, 열릴 때 탭바가 자동으로 가려집니다.

```
RootStack
├─ 로그아웃 상태 : SignIn · SignUp
└─ 로그인 상태
   ├─ Tabs
   │  ├─ 홈    HomeScreen       검색 + 카드/리스트 토글 + 무한스크롤
   │  ├─ 찜    FavoritesScreen  하트 누른 상품 모아보기
   │  ├─  +    (화면 없음)       탭을 누르면 등록 모달을 띄운다
   │  └─ 마이  MyScreen         프로필 · 판매/찜 카운트 · 내 판매상품(삭제)
   ├─ SaleDetail   push        (탭바 숨김)
   └─ SaleNew      modal       (아래에서 올라옴, 쓸어내려 닫기)
```

가운데 `+` 는 탭이 아니라 **행동**이라 원형 버튼으로 그리고, `tabPress` 를 가로채
화면 전환 대신 모달만 띄웁니다 (`src/navigators/TabNavigator.tsx`).

로그아웃은 홈 헤더 우측에 있습니다.

## 서버 주소 설정

RN에는 Vite 프록시가 없어서 be의 **절대 주소**가 필요합니다. `src/config.ts` 가 이 순서로 결정합니다.

1. `EXPO_PUBLIC_API_BASE_URL` 환경변수 (`.env` 또는 실행 환경)
2. Metro 번들 URL의 호스트 + `:3000` — 개발 PC의 LAN IP가 들어 있어 **실기기에서도 그냥 붙습니다**
3. 플랫폼 기본값 (안드로이드 에뮬레이터 `10.0.2.2`, 그 외 `localhost`)

보통은 아무 설정 없이 2번으로 동작합니다. 배포 서버를 붙일 때만 `.env` 를 만드세요 (`.env.example` 참고).

## Expo Go 가 시작하자마자 죽을 때

크래시 로그에 `-[EXAppLoaderExpoUpdates _startLoaderTask]` 가 찍히면 **Expo Go 버전 불일치**입니다.
Expo Go 빌드 하나에는 SDK 하나만 들어 있어서, 시뮬레이터에 옛 SDK용 Expo Go 가 남아 있으면
프로젝트를 열자마자 JS 로드 전에 죽습니다.

```bash
npm run fix:expo-go     # 낡은 Expo Go + 캐시 제거
npx expo start --clear  # 그다음 터미널에서 i
```

자동 설치가 안 되면 <https://expo.dev/go> 에서 SDK 57 · iOS Simulator 빌드를 직접 받으세요.

## 구조

```
mobile/
├── App.tsx                       # 루트 스택 + 테마 + AuthProvider
└── src/
    ├── config.ts                 # API base URL 결정
    ├── api.ts                    # be 라우터와 1:1 fetch 래퍼
    ├── storage.ts                # AsyncStorage (토큰 / 보기방식)
    ├── jwt.ts                    # JWT payload 디코더 (email, exp)
    ├── AuthProvider.tsx          # 토큰 복원·만료 타이머·401 처리
    ├── authContext.ts            # useAuth()
    ├── theme.ts                  # 디자인 토큰 (라이트/다크)
    ├── format.ts                 # 원화·날짜·천단위 콤마 (Intl 비의존)
    ├── navigation.ts             # RootStackParamList / TabParamList
    ├── hooks/
    │   ├── useSaleList.ts        # 무한스크롤 목록 (홈·찜·마이 공용)
    │   └── useRefreshOnFocus.ts  # 탭 복귀 시 새로고침 (첫 포커스 제외)
    ├── navigators/TabNavigator.tsx
    ├── components/               # Button, Field, Alert, HeartButton, Skeleton, icons …
    └── screens/                  # SignIn, SignUp, Home, Favorites, My, SaleNew, SaleDetail
```

## 웹과 달라진 점

| | 웹 (`fe/`) | 모바일 |
|---|---|---|
| 내비게이션 | react-router, `<RequireAuth>` 로 라우트별 보호 | 하단 4탭 + native-stack. 로그인 여부로 **스택 자체를 교체**해 뒤로가기로도 못 돌아감 |
| 페이지네이션 | 이전/다음 버튼 | 무한스크롤 + 당겨서 새로고침 |
| 상품 등록 | 일반 페이지 | 아래에서 올라오는 모달 |
| 찜하기 | 없음 | 목록·상세에 하트. 낙관적 갱신 후 실패 시 롤백 |
| 내 상품 | 목록의 "내 상품만" 토글 | 마이 탭 (프로필 + 카운트 + 삭제) |
| 토큰 저장 | `localStorage` (동기) | `AsyncStorage` (비동기) → 부팅 시 복원 스피너 |
| 검색 상태 | URL 쿼리스트링 | 화면 로컬 state |
| 파일 업로드 | `<input type="file">` + `File` | `expo-image-picker` + `{ uri, name, type }` |
| 숫자·날짜 포맷 | `toLocaleString('ko-KR')` | `src/format.ts` (Hermes의 Intl 편차 회피) |
| 로딩 표시 | "불러오는 중..." | 스켈레톤 |
| 다크 모드 | `prefers-color-scheme` | `useColorScheme()` |

## iOS / Android 대응

- **아이콘**: `react-native-svg` 없이 `View` 로만 그렸습니다 (`src/components/icons.tsx`).
  Expo Go 에서 추가 네이티브 모듈이 필요 없고, 두 플랫폼 렌더링이 같습니다.
- **탭바**: 안드로이드는 기본 높이가 낮아 아이콘과 라벨이 붙어서 높이를 따로 줍니다.
- **헤더 정렬**: iOS 는 제목이 가운데, 안드로이드는 왼쪽이 기본이라 `headerTitleAlign: 'left'` 로 통일했습니다.
- **모달**: iOS 는 시트, 안드로이드는 `slide_from_bottom` 전환으로 매핑됩니다.
- **터치 피드백**: 안드로이드는 `android_ripple`, iOS 는 `pressed` opacity.
- **키보드**: iOS 만 `KeyboardAvoidingView behavior="padding"` (안드로이드는 `adjustResize` 기본).
- **safe area**: 목록 하단 여백에 `useSafeAreaInsets().bottom` 을 더해 탭바·홈 인디케이터에 안 가립니다.
- **그림자**: iOS `shadow*`, 안드로이드 `elevation` (`theme.ts` 의 `shadow()`).

## 디자인

`../design/figma-plugin/` 의 Figma 플러그인이 `src/theme.ts` 와 **같은 값**으로
디자인 토큰·컴포넌트·화면 프레임을 생성합니다.

## 타입 체크

```bash
npx tsc --noEmit
```

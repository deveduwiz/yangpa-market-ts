# React Native 모바일 앱 개발 과정 (20시간)

> React 개발자를 위한 Expo/React Native 입문 커리큘럼
> 교재: 양파마켓 프로젝트

## 대상

- React (hooks, 함수형 컴포넌트) 경험자
- TypeScript 기초 이해
- 모바일 개발 경험 없음

## 회차별 상세

### 1회차: 환경 설정 & React Native 기초 (3시간)

| 시간 | 내용 |
|------|------|
| 1h | Expo 소개, 설치, 프로젝트 생성, Expo Go로 실행 |
| 1h | View, Text, StyleSheet - CSS와의 차이 (flexbox 기본값, 단위 없음) |
| 1h | **실습**: 간단한 프로필 카드 만들기 |

**핵심 포인트**
- `<div>` → `<View>`
- `<span>`, `<p>` → `<Text>`
- className → style
- CSS 파일 → StyleSheet.create()

**참고 파일**: `mobile/src/components/SaleTile.tsx`

---

### 2회차: 핵심 컴포넌트 (3시간)

| 시간 | 내용 |
|------|------|
| 1h | Image, Pressable, TouchableOpacity, ScrollView |
| 1h | TextInput, KeyboardAvoidingView |
| 1h | **실습**: 로그인/회원가입 폼 UI 만들기 |

**핵심 포인트**
- `<img src="">` → `<Image source={{ uri: "" }} />`
- onClick → onPress
- `<input>` → `<TextInput>`
- 키보드가 화면을 가리는 문제 해결

**참고 파일**: `mobile/src/screens/SignInScreen.tsx`, `mobile/src/components/Field.tsx`

---

### 3회차: 리스트 & 성능 (2시간)

| 시간 | 내용 |
|------|------|
| 1h | FlatList vs ScrollView, keyExtractor, renderItem |
| 1h | **실습**: 상품 목록 화면 (그리드/리스트 뷰) |

**핵심 포인트**
- `array.map()` → `<FlatList data={array} />`
- 가상화(Virtualization)로 대량 데이터 성능 확보
- numColumns로 그리드 레이아웃
- refreshControl로 당겨서 새로고침

**참고 파일**: `mobile/src/screens/HomeScreen.tsx`

---

### 4회차: React Navigation 기초 (3시간)

| 시간 | 내용 |
|------|------|
| 1h | Stack Navigator - 화면 전환, params 전달 |
| 1h | Tab Navigator - 하단 탭 구성 |
| 1h | **실습**: 탭 + 스택 네비게이션 구조 만들기 |

**핵심 포인트**
- react-router의 `<Route>` → Navigator의 `<Screen>`
- useNavigate → useNavigation
- useParams → route.params
- 중첩 네비게이터 (Tabs 안에 Stack)

**참고 파일**: `mobile/src/navigation.ts`, `mobile/App.tsx`

---

### 5회차: 상태 관리 & API 연동 (2시간)

| 시간 | 내용 |
|------|------|
| 1h | fetch + useState/useEffect 패턴, AsyncStorage (토큰 저장) |
| 1h | **실습**: 로그인 → 토큰 저장 → 인증 API 호출 |

**핵심 포인트**
- localStorage → AsyncStorage (비동기!)
- API 호출은 React와 동일
- 인증 상태 전역 관리 (Context 또는 zustand)

**참고 파일**: `mobile/src/api.ts`, `mobile/src/storage.ts`

---

### 6회차: 커스텀 훅 & 재사용 (2시간)

| 시간 | 내용 |
|------|------|
| 1h | useSaleList 같은 페이지네이션 훅 분석 |
| 1h | **실습**: 무한 스크롤 구현 (onEndReached) |

**핵심 포인트**
- React 훅 지식 그대로 활용
- onEndReached + onEndReachedThreshold
- 로딩 상태, 에러 처리, 페이지 관리

**참고 파일**: `mobile/src/hooks/useSaleList.ts`

---

### 7회차: 플랫폼별 처리 & 네이티브 기능 (2시간)

| 시간 | 내용 |
|------|------|
| 1h | Platform.OS, SafeAreaView, 상태바, 키보드 처리 |
| 1h | **실습**: expo-image-picker로 사진 선택 |

**핵심 포인트**
- `Platform.OS === 'ios'` 분기 처리
- 노치/홈 인디케이터 영역 SafeArea
- 권한 요청 (카메라, 갤러리)
- FormData로 이미지 업로드

**참고 파일**: `mobile/src/screens/SaleNewScreen.tsx`

---

### 8회차: 테마 & 스타일링 (1시간)

| 시간 | 내용 |
|------|------|
| 1h | 다크모드, useColors 훅, 일관된 디자인 시스템 |

**핵심 포인트**
- useColorScheme()으로 시스템 테마 감지
- 색상 토큰화 (c.bg, c.text, c.primary)
- 재사용 가능한 컴포넌트 설계

**참고 파일**: `mobile/src/theme.ts`, `mobile/src/components/Button.tsx`

---

### 9회차: 최종 프로젝트 (2시간)

| 시간 | 내용 |
|------|------|
| 2h | 양파마켓 클론: 상품 등록 → 목록 → 상세 전체 플로우 완성 |

**완성 목표**
- 회원가입/로그인
- 상품 목록 (검색, 무한스크롤)
- 상품 상세 (찜하기)
- 상품 등록 (사진 업로드)

---

## 주차별 요약

```
Week 1 (6h): 기초 - 컴포넌트, 스타일, 폼
Week 2 (5h): 리스트, 네비게이션
Week 3 (4h): API, 상태관리, 커스텀 훅
Week 4 (5h): 네이티브 기능, 테마, 최종 프로젝트
```

## React vs React Native 비교표

| React (Web) | React Native | 비고 |
|-------------|--------------|------|
| `<div>` | `<View>` | 기본 컨테이너 |
| `<span>`, `<p>` | `<Text>` | 모든 텍스트는 Text로 |
| `<img>` | `<Image>` | source={{ uri }} |
| `<input>` | `<TextInput>` | |
| `<button>` | `<Pressable>` | onPress |
| `<a>` | `<Link>` 또는 navigation | |
| className | style | 객체 또는 배열 |
| CSS 파일 | StyleSheet.create() | |
| localStorage | AsyncStorage | 비동기 |
| react-router | React Navigation | |
| px, rem, % | 숫자 (dp) | 단위 없음 |
| flexDirection: row | flexDirection: column | 기본값 다름 |

## 수업 운영 팁

1. **React와 비교하며 설명** - 차이점만 강조하면 빠르게 습득
2. **양파마켓 코드를 교재로** - 실제 동작하는 앱으로 배움
3. **Expo Go로 즉시 확인** - 빌드 없이 바로 테스트
4. **매 회차 실습 필수** - 직접 쳐봐야 체득
5. **에러 메시지 읽는 법** - Red Box, Yellow Box 해석

## 사전 준비

```bash
# Node.js 18+ 설치
# 수강생 각자 스마트폰에 Expo Go 앱 설치

# 프로젝트 클론
git clone <repo>
cd yangpa-market-ts

# 백엔드 실행
cd be && npm install && npm run seed && npm run dev

# 모바일 실행
cd mobile && npm install && npm start
# QR 코드를 Expo Go로 스캔
```

## 참고 자료

- [Expo 공식 문서 (v57)](https://docs.expo.dev/versions/v57.0.0/)
- [React Navigation 문서](https://reactnavigation.org/docs/getting-started)
- [React Native 문서](https://reactnative.dev/docs/getting-started)

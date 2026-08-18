#!/usr/bin/env bash
#
# 시뮬레이터에 설치된 낡은 Expo Go 를 지우고, 프로젝트 SDK에 맞는 버전을 다시 받게 한다.
#
# 증상: 앱을 열자마자 SIGABRT 로 죽고, 크래시 로그에
#       -[EXAppLoaderExpoUpdates _startLoaderTask] 가 찍힌다.
# 원인: Expo Go 빌드 하나에는 SDK 하나만 들어 있다.
#       프로젝트 SDK와 Expo Go 의 SDK 가 다르면 JS 를 로드하기 전에 죽는다.
#
# 사용: bash scripts/fix-expo-go.sh   (또는 npm run fix:expo-go)

set -uo pipefail
cd "$(dirname "$0")/.."

if ! command -v xcrun >/dev/null 2>&1; then
  echo "✗ xcrun 을 찾을 수 없습니다. Xcode 가 설치된 macOS 에서 실행해 주세요."
  exit 1
fi

SDK=$(node -p "require('./node_modules/expo/package.json').version" 2>/dev/null || echo '?')
echo "프로젝트 Expo SDK : $SDK"
echo

# 1) 부팅된 시뮬레이터에서 Expo Go 제거 -----------------------------------------
UDIDS=$(xcrun simctl list devices booted | grep -oE '[0-9A-Fa-f]{8}-[0-9A-Fa-f-]{27}')

if [ -z "$UDIDS" ]; then
  echo "· 부팅된 시뮬레이터가 없습니다. 등록된 전체 시뮬레이터에서 제거를 시도합니다."
  UDIDS=$(xcrun simctl list devices available | grep -oE '[0-9A-Fa-f]{8}-[0-9A-Fa-f-]{27}')
fi

REMOVED=0
for UDID in $UDIDS; do
  BEFORE=$(xcrun simctl get_app_container "$UDID" host.exp.Exponent 2>/dev/null)
  if [ -n "$BEFORE" ]; then
    xcrun simctl uninstall "$UDID" host.exp.Exponent >/dev/null 2>&1 && {
      echo "· Expo Go 제거: $UDID"
      REMOVED=$((REMOVED + 1))
    }
  fi
done
[ "$REMOVED" -eq 0 ] && echo "· 설치된 Expo Go 가 없었습니다 (이미 깨끗함)"

# 2) Expo CLI 가 받아둔 낡은 Expo Go 캐시 삭제 ----------------------------------
#    크래시 로그의 Expo-Go-54.0.7.tar.app 이 여기서 나온 것이다.
for DIR in "$HOME/.expo/ios-simulator-app-cache" "$HOME/.expo/android-apk-cache"; do
  if [ -d "$DIR" ]; then
    rm -rf "$DIR"
    echo "· 캐시 삭제: $DIR"
  fi
done

# 3) Metro 캐시도 함께 정리 ------------------------------------------------------
rm -rf "$TMPDIR/metro-cache" "$TMPDIR/haste-map-"* 2>/dev/null
echo "· Metro 캐시 정리"

echo
echo "완료했습니다. 이제 아래를 실행하고 터미널에서 i 를 누르세요."
echo "  npx expo start --clear"
echo
echo "Expo CLI 가 SDK $SDK 용 Expo Go 를 자동으로 내려받아 설치합니다."
echo "자동 설치가 안 되면 https://expo.dev/go 에서 SDK $SDK · iOS Simulator 를 직접 받으세요."

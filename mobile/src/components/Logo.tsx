import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { useColors } from '../theme';

/**
 * 양파 마크.
 *
 * fe/src/components/Logo.jsx 의 SVG 를 그대로 구운 투명 PNG 를 쓴다.
 * View 조합으로 그리면 작은 크기에서 자물쇠·사과처럼 읽혀서,
 * 웹과 같은 곡선을 유지하려면 이 편이 낫다.
 * 단색 실루엣이라 tintColor 로 테마 색을 그대로 입힌다 (react-native-svg 불필요).
 */
export default function Logo({
  size = 26,
  style,
}: {
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  const c = useColors();

  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[{ width: size, height: size }, style]}
      tintColor={c.text}
      resizeMode="contain"
      accessibilityLabel="양파마켓"
    />
  );
}

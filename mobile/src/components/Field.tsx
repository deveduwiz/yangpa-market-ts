import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { radius, useColors } from '../theme';

type Props = TextInputProps & {
  label: string;
  /** textarea 대응 */
  multiline?: boolean;
};

/** 웹의 <label class="field"><span>라벨</span><input/></label> 에 대응 */
const Field = forwardRef<TextInput, Props>(function Field(
  { label, multiline = false, style, ...inputProps },
  ref,
) {
  const c = useColors();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: c.text2 }]}>{label}</Text>
      <TextInput
        ref={ref}
        multiline={multiline}
        placeholderTextColor={c.text3}
        {...inputProps}
        onFocus={(e) => {
          setFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps.onBlur?.(e);
        }}
        style={[
          styles.input,
          multiline && styles.multiline,
          {
            color: c.text,
            backgroundColor: c.bg,
            borderColor: focused ? c.text2 : c.borderStrong,
          },
          style,
        ]}
      />
    </View>
  );
});

export default Field;

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  label: { fontSize: 13, fontWeight: '500', letterSpacing: -0.1 },
  input: {
    fontSize: 15,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  multiline: { minHeight: 112, paddingTop: 11, textAlignVertical: 'top', lineHeight: 22 },
});

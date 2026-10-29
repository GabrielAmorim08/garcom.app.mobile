import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';
import { AppText } from './AppText';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  length?: number;
  editable?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

/**
 * One round cell per digit. A single invisible TextInput sits over the row and does
 * the typing, so paste, delete and the SMS autofill suggestion keep working natively.
 */
export function CodeInput({
  value,
  onChange,
  label,
  length = 6,
  editable = true,
  error = false,
  autoFocus = true,
}: CodeInputProps) {
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View style={styles.container}>
      {label ? (
        <AppText variant="caption" color={colors.textSecondary}>
          {label}
        </AppText>
      ) : null}

      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessibilityRole="none"
        style={styles.row}>
        {Array.from({ length }, (_, index) => {
          const isActive = editable && focused && index === activeIndex;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                value[index] ? styles.cellFilled : null,
                isActive ? styles.cellActive : null,
                error ? styles.cellError : null,
              ]}>
              <AppText variant="title" color={colors.textPrimary}>
                {value[index] ?? ''}
              </AppText>
            </View>
          );
        })}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={text => onChange(text.replace(/\D/g, '').slice(0, length))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          maxLength={length}
          editable={editable}
          autoFocus={autoFocus}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          caretHidden
          accessibilityLabel={label}
          style={styles.hiddenInput}
        />
      </Pressable>
    </View>
  );
}

const CELL_SIZE = 48;

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: { borderColor: colors.primary },
  cellActive: { borderColor: colors.primary, borderWidth: 2 },
  cellError: { borderColor: colors.danger },
  hiddenInput: {
    ...typography.body,
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.02,
    color: 'transparent',
  },
});

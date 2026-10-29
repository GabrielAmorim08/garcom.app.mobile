import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';
import { AppText } from './AppText';
import { BowTie } from './Wordmark';

const WORD = 'ServeUp';
const FONT_SIZE = 44;
const BOW_WIDTH = FONT_SIZE * 1.4;
const BOW_HEIGHT = BOW_WIDTH * 0.42;
const BOW_GAP = spacing.xs;
const FINAL_BOW_SCALE = 2.6;

const INTRO_MS = 350;
const HOLD_MS = 100;
const APPROACH_MS = 250;
const BITE_MS = 115;
const SETTLE_MS = 350;

interface LetterBox {
  x: number;
  width: number;
}

interface AnimatedLogoProps {
  /** The logo is laid out and about to animate: the native opening screen can go away. */
  onReady?: () => void;
  onFinished?: () => void;
}

/**
 * Opening animation: "ServeUp" fades in softly, then the bow tie crosses it and eats
 * the letters one by one, and what is left is the bow tie alone, the app's logo.
 * Everything runs on transform and opacity, so it stays on the native thread.
 */
export function AnimatedLogo({ onReady, onFinished }: AnimatedLogoProps) {
  const letters = useMemo(() => WORD.split(''), []);

  const [lineHeight, setLineHeight] = useState(0);
  const [boxes, setBoxes] = useState<(LetterBox | undefined)[]>([]);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  const intro = useRef(new Animated.Value(0)).current;
  const bowX = useRef(new Animated.Value(0)).current;
  const bowY = useRef(new Animated.Value(0)).current;
  const bowScale = useRef(new Animated.Value(1)).current;
  const letterValues = useRef(letters.map(() => new Animated.Value(1))).current;
  const started = useRef(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const measured = boxes.filter(Boolean).length === letters.length && lineHeight > 0;
  const rowWidth = measured ? boxes[letters.length - 1]!.x + boxes[letters.length - 1]!.width : 0;

  useEffect(() => {
    if (!measured || reduceMotion === null || started.current) {
      return;
    }

    started.current = true;

    const center = (x: number, y: number) => ({
      x: x - BOW_WIDTH / 2,
      y: y - BOW_HEIGHT / 2,
    });

    const restingCenter = center(rowWidth / 2, lineHeight + BOW_GAP + BOW_HEIGHT / 2);
    const finalCenter = restingCenter;

    bowX.setValue(restingCenter.x);
    bowY.setValue(restingCenter.y);

    // Two frames let the bow settle at its resting spot before the native screen,
    // which shows the same bow at the same place, fades away.
    requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));

    if (reduceMotion) {
      letterValues.forEach(value => value.setValue(0));
      intro.setValue(1);
      bowX.setValue(finalCenter.x);
      bowY.setValue(finalCenter.y);
      bowScale.setValue(FINAL_BOW_SCALE);
      onFinished?.();
      return;
    }

    const first = boxes[0]!;
    const approach = center(first.x - BOW_WIDTH * 0.25, lineHeight / 2);

    const bites = letters.map((_, index) => {
      const box = boxes[index]!;
      const target = center(box.x + box.width / 2, lineHeight / 2);

      return Animated.parallel([
        Animated.timing(bowX, {
          toValue: target.x,
          duration: BITE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(BITE_MS * 0.45),
          Animated.timing(letterValues[index], {
            toValue: 0,
            duration: BITE_MS * 1.2,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.sequence([
      Animated.timing(intro, {
        toValue: 1,
        duration: INTRO_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(HOLD_MS),
      Animated.parallel([
        Animated.timing(bowX, {
          toValue: approach.x,
          duration: APPROACH_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(bowY, {
          toValue: approach.y,
          duration: APPROACH_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(bowScale, {
          toValue: 1.2,
          duration: APPROACH_MS,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence(bites),
      Animated.parallel([
        Animated.timing(bowX, {
          toValue: finalCenter.x,
          duration: SETTLE_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(bowY, {
          toValue: finalCenter.y,
          duration: SETTLE_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(bowScale, {
          toValue: FINAL_BOW_SCALE,
          duration: SETTLE_MS,
          easing: Easing.out(Easing.back(1.6)),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) {
        onFinished?.();
      }
    });
  }, [
    measured,
    reduceMotion,
    boxes,
    letters,
    lineHeight,
    rowWidth,
    intro,
    bowX,
    bowY,
    bowScale,
    letterValues,
    onReady,
    onFinished,
  ]);

  const textScale = intro.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: BOW_GAP + BOW_HEIGHT, transform: [{ translateY: -(lineHeight + BOW_GAP) / 2 }] },
      ]}>
      <Animated.View
        style={[styles.row, { opacity: intro, transform: [{ scale: textScale }] }]}
        onLayout={event => setLineHeight(event.nativeEvent.layout.height)}>
        {letters.map((letter, index) => (
          <Animated.View
            key={`${letter}-${index}`}
            onLayout={event => {
              const { x, width } = event.nativeEvent.layout;
              setBoxes(current => {
                const next = [...current];
                next[index] = { x, width };
                return next;
              });
            }}
            style={{
              opacity: letterValues[index],
              transform: [
                { scale: letterValues[index].interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) },
              ],
            }}>
            <AppText
              variant="title"
              color={colors.textOnDark}
              style={{ fontSize: FONT_SIZE, lineHeight: FONT_SIZE * 1.15 }}>
              {letter}
            </AppText>
          </Animated.View>
        ))}
      </Animated.View>

      <Animated.View
        style={[
          styles.bow,
          { transform: [{ translateX: bowX }, { translateY: bowY }, { scale: bowScale }] },
        ]}>
        <BowTie width={BOW_WIDTH} color={colors.primary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  bow: { position: 'absolute', top: 0, left: 0 },
});

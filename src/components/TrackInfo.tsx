import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay, Easing, cancelAnimation } from 'react-native-reanimated';
import { ThemeColors } from '../types/Track';

interface Props {
  title: string;
  subtitle: string;
  theme: ThemeColors;
}

export function TrackInfo({ title, subtitle, theme }: Props) {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [textWidth, setTextWidth] = React.useState(0);
  const scrollX = useSharedValue(0);

  React.useEffect(() => {
    cancelAnimation(scrollX);
    scrollX.value = 0;

    if (textWidth > containerWidth && containerWidth > 0) {
      const offset = textWidth - containerWidth + 32; // extra padding
      scrollX.value = withRepeat(
        withSequence(
          withDelay(2000, withTiming(-offset, { duration: offset * 30, easing: Easing.linear })),
          withDelay(2000, withTiming(0, { duration: 0 }))
        ),
        -1,
        false
      );
    }
  }, [title, textWidth, containerWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scrollX.value }],
  }));

  return (
    <View style={styles.wrap} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width - 32)}>
      <View style={styles.titleContainer}>
        <Animated.View style={[styles.titleScroll, animatedStyle]}>
          <Text 
            style={[styles.title, { color: '#f0f0f0' }]} 
            onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
            numberOfLines={1}
          >
            {title}
          </Text>
        </Animated.View>
      </View>
      <Text style={[styles.sub, { color: theme.muted }]} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', marginBottom: 20, paddingHorizontal: 16 },
  titleContainer: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    height: 30,
  },
  titleScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

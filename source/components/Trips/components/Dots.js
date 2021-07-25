import React from 'react';
import {Animated, View, Dimensions, StyleSheet} from 'react-native';
import {theme} from '../../../constants';

const {width} = Dimensions.get('window');

function Dots({scrollX, trip}) {
  const dotPosition = Animated.divide(scrollX, width);

  return (
    <View style={[styles.flex, styles.row, styles.dotsContainer]}>
      {(trip.images || []).map((item, index) => {
        const opacity = dotPosition.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0.5, 1, 0.5],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={`step-${item}-${index}`}
            style={[styles.dots, {opacity}]}
          />
        );
      })}
    </View>
  );
}

export default Dots;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  dotsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 36,
    right: 0,
    left: 0,
  },
  dots: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
    backgroundColor: theme.colors.gray,
  },
});

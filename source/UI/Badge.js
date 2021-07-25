import React from 'react';
import {StyleSheet} from 'react-native';

import Block from './Block';
import {theme} from '../constants';

export default function Badge(props) {
  const {children, style, size, color, ...rest} = props;

  const badgeStyles = StyleSheet.flatten([
    styles.badge,
    size && {
      height: size,
      width: size,
      borderRadius: size,
    },
    style,
  ]);

  return (
    <Block
      flex={false}
      middle
      center
      color={color}
      style={badgeStyles}
      {...rest}>
      {children}
    </Block>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: theme.sizes.base,
    width: theme.sizes.base,
    borderRadius: theme.sizes.border,
  },
});

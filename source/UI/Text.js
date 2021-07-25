// just copy this code from the driving repo :)
import React, {Component} from 'react';
import {Text, StyleSheet} from 'react-native';

import {theme} from '../constants';

export default class Typography extends Component {
  handleMargins() {
    const {margin} = this.props;
    if (typeof margin === 'number') {
      return {
        marginTop: margin,
        marginRight: margin,
        marginBottom: margin,
        marginLeft: margin,
      };
    }

    if (typeof margin === 'object') {
      const marginSize = Object.keys(margin).length;
      switch (marginSize) {
        case 1:
          return {
            marginTop: margin[0],
            marginRight: margin[0],
            marginBottom: margin[0],
            marginLeft: margin[0],
          };
        case 2:
          return {
            marginTop: margin[0],
            marginRight: margin[1],
            marginBottom: margin[0],
            marginLeft: margin[1],
          };
        case 3:
          return {
            marginTop: margin[0],
            marginRight: margin[1],
            marginBottom: margin[2],
            marginLeft: margin[1],
          };
        default:
          return {
            marginTop: margin[0],
            marginRight: margin[1],
            marginBottom: margin[2],
            marginLeft: margin[3],
          };
      }
    }
  }

  handlePaddings() {
    const {padding} = this.props;
    if (typeof padding === 'number') {
      return {
        paddingTop: padding,
        paddingRight: padding,
        paddingBottom: padding,
        paddingLeft: padding,
      };
    }

    if (typeof padding === 'object') {
      const paddingSize = Object.keys(padding).length;
      switch (paddingSize) {
        case 1:
          return {
            paddingTop: padding[0],
            paddingRight: padding[0],
            paddingBottom: padding[0],
            paddingLeft: padding[0],
          };
        case 2:
          return {
            paddingTop: padding[0],
            paddingRight: padding[1],
            paddingBottom: padding[0],
            paddingLeft: padding[1],
          };
        case 3:
          return {
            paddingTop: padding[0],
            paddingRight: padding[1],
            paddingBottom: padding[2],
            paddingLeft: padding[1],
          };
        default:
          return {
            paddingTop: padding[0],
            paddingRight: padding[1],
            paddingBottom: padding[2],
            paddingLeft: padding[3],
          };
      }
    }
  }

  render() {
    const {
      h1,
      h2,
      h3,
      h4,
      title,
      body,
      caption,
      small,
      size,
      transform,
      align,
      // styling
      regular,
      bold,
      semibold,
      medium,
      weight,
      light,
      center,
      right,
      spacing, // letter-spacing
      height, // line-height
      // colors
      color,
      accent,
      primary,
      secondary,
      tertiary,
      black,
      white,
      gray,
      gray2,
      textGray,
      lowercase,
      uppercase,
      capitalize,
      margin,
      padding,
      style,
      children,
      ...props
    } = this.props;

    const textStyles = [
      styles.text,
      h1 && styles.h1,
      h2 && styles.h2,
      h3 && styles.h3,
      h4 && styles.h4,
      title && styles.title,
      body && styles.body,
      caption && styles.caption,
      small && styles.small,
      size && {fontSize: size},
      transform && {textTransform: transform},
      align && {textAlign: align},
      height && {lineHeight: height},
      spacing && {letterSpacing: spacing},
      weight && {fontWeight: weight},
      regular && styles.regular,
      bold && styles.bold,
      semibold && styles.semibold,
      medium && styles.medium,
      light && styles.light,
      center && styles.center,
      right && styles.right,
      color && styles[color],
      color && !styles[color] && {color},
      // color shortcuts
      accent && styles.accent,
      primary && styles.primary,
      secondary && styles.secondary,
      tertiary && styles.tertiary,
      black && styles.black,
      white && styles.white,
      gray && styles.gray,
      gray2 && styles.gray2,
      textGray && styles.textGray,
      margin && {...this.handleMargins()},
      padding && {...this.handlePaddings()},
      style, // rewrite predefined styles
    ];

    return (
      <Text style={textStyles} {...props}>
        {children}
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  // default style
  text: {
    fontSize: theme.sizes.font,
    color: theme.colors.black,
    // fontFamily: 'Helvetica Neue',
  },
  // variations
  regular: {
    fontWeight: 'normal',
  },
  bold: {
    fontWeight: 'bold',
  },
  semibold: {
    fontWeight: '500',
  },
  medium: {
    fontWeight: '500',
  },
  light: {
    fontWeight: '200',
  },
  // position
  center: {textAlign: 'center'},
  right: {textAlign: 'right'},
  // colors
  accent: {color: theme.colors.accent},
  primary: {color: theme.colors.primary},
  secondary: {color: theme.colors.secondary},
  tertiary: {color: theme.colors.tertiary},
  black: {color: theme.colors.black},
  white: {color: theme.colors.white},
  gray: {color: theme.colors.gray},
  gray2: {color: theme.colors.gray2},
  textGray: {color: theme.colors.textGray},
  // fonts
  h1: theme.fonts.h1,
  h2: theme.fonts.h2,
  h3: theme.fonts.h3,
  h4: theme.fonts.h4,
  title: theme.fonts.title,
  body: theme.fonts.body,
  caption: theme.fonts.caption,
  small: theme.fonts.small,
});

import React from 'react';
import {StyleSheet, Dimensions, ActivityIndicator} from 'react-native';

import Text from './Text';
import {theme} from '../constants';
import {View, SafeAreaView} from 'react-native';

const {width, height} = Dimensions.get('window');

export default function Loading(props) {
  let {
    overlayColor,
    backgroundColor,
    loadingText,
    spinnerColor,
    spinnerSize,
    loadingTextColor,
    show,
    noOverlay,
  } = props;

  let overlayStyle = {
    backgroundColor: overlayColor ? overlayColor : 'rgba(0,0,0,0.6)',
  };

  if (noOverlay) {
    overlayStyle = {};
  }

  const loaderStyle = {
    position: 'absolute',
    width: 350,
    height: 120,
    backgroundColor: backgroundColor ? backgroundColor : '#fff',
    shadowColor: theme.colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderRadius: 5,
    elevation: 5,
    flexDirection: 'column',
    justifyContent: 'center',
    top: height / 2 - 60,
    left: width / 2 - 175,
  };

  loadingText = loadingText ? loadingText : 'Loading...';
  spinnerColor = spinnerColor ? spinnerColor : theme.colors.primary;
  spinnerSize = spinnerSize ? spinnerSize : 42;
  loadingTextColor = loadingTextColor ? loadingTextColor : theme.colors.gray;

  if (show) {
    return (
      <SafeAreaView style={[styles.container, overlayStyle]}>
        <View style={loaderStyle}>
          <View style={styles.content}>
            <View style={styles.between}>
              <ActivityIndicator
                style={styles.spinnerStyle}
                color={spinnerColor}
                size={spinnerSize}
              />
              <Text
                numberOfLines={3}
                style={styles.textStyles}
                color={loadingTextColor}>
                {loadingText}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',

    top: 0,
    left: 0,
    width: width,
    height: height,
    zIndex: 10,
  },
  content: {
    paddingHorizontal: 20,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  spinnerStyle: {
    width: 30,
    height: 30,
    // paddingHorizontal: 20,
  },
  textStyles: {
    flex: 0.9,
    fontSize: 20,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  between: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

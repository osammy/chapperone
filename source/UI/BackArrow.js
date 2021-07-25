/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Actions} from 'react-native-router-flux';
import {theme} from '../constants';
import Block from './Block';
import Text from './Text';

export default function(props) {
  const {title, color} = props;

  if (title) {
    return (
      <TouchableOpacity
        onPress={() => Actions.pop()}
        style={
          {
            //   height: 50,
            //   justifyContent: 'center',
            //   paddingLeft: 20,
            //   paddingRight: 30,
          }
        }>
        <Block row space="between">
          <View style={styles.left}>
            <MaterialIcons
              name={Platform.OS ? 'keyboard-arrow-left' : 'keyboard-backspace'}
              color={theme.colors.primary}
              size={
                Platform.OSXF ? theme.sizes.font * 2.5 : theme.sizes.font * 1.7
              }
            />
          </View>
          <View style={styles.right}>
            <Text
              style={styles.title}
              color={color ? color : theme.colors.primary}>
              Back
            </Text>
          </View>
        </Block>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      onPress={() => Actions.pop()}
      style={{
        // height: 50,
        justifyContent: 'center',
        // paddingLeft: 20,
        // paddingRight: 30,
      }}>
      <MaterialIcons
        name={Platform.OS ? 'keyboard-arrow-left' : 'keyboard-backspace'}
        color={theme.colors.primary}
        size={Platform.OS ? theme.sizes.font * 2.5 : theme.sizes.font * 1.7}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  left: {
    paddingRight: 10,
  },
  right: {
    paddingRight: 10,
    fontSize: 18,
  },
  title: {
    fontSize: 18,
  },
});

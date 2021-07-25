/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {TouchableOpacity, StyleSheet, Dimensions} from 'react-native';

import Block from './Block';
import Text from './Text';
import {theme} from '../constants';

const {width, height} = Dimensions.get('window');

export default function prompt(props) {
  const {
    cancelBtnText,
    cancelBtn,
    okBtnText,
    okBtn,
    showPrompt,
    overlay,
    style,
    middle,
    hideActionBtns,
  } = props;

  const promptStyles = [
    styles.container,
    showPrompt && styles.showPrompt,
    middle && styles.middle,
    overlay && styles.overlay,
    style,
  ];

  return (
    <Block style={promptStyles}>
      <Block style={[styles.content]}>
        <Block>{props.children}</Block>
        <Block style={[styles.btnControls]} row space="between">
          <TouchableOpacity onPress={cancelBtn}>
            <Text
              style={{paddingHorizontal: 10}}
              color={theme.colors.accent}
              bold>
              {props.cancelBtnText || 'CANCEL'}
            </Text>
          </TouchableOpacity>
          {hideActionBtns ? (
            <Text />
          ) : (
            <>
              <TouchableOpacity onPress={okBtn}>
                <Text
                  style={{paddingHorizontal: 10}}
                  color={theme.colors.primary}
                  bold>
                  {props.okBtnText || 'OK'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Block>
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    top: '5%',
    left: '5%',
    // right: 'auto',
    // bottom: 'auto',
    width: '90%',
    maxHeight: height,
    zIndex: 10,
    padding: 30,
    backgroundColor: 'white',
    shadowColor: theme.colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  container: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    top: 0,
    left: 0,
    width: width,
    zIndex: 5,
  },
  showPrompt: {
    opacity: 1,
    height: '100%',
  },
  btnControls: {
    flex: 1,
    justifyContent: 'space-between',
    bottom: 5,
    marginTop: 40,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: height,
  },
  middle: {
    top: 100,
  },
});

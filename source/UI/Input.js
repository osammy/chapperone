import React, {Component} from 'react';
import {StyleSheet, TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import Text from './Text';
import Block from './Block';
import Button from './Button';
import {theme} from '../constants';

class Input extends Component {
  state = {
    toggleSecure: false,
  };

  renderLabel() {
    const {label, error} = this.props;

    return (
      <Block flex={false}>
        {label ? (
          <Text gray2={!error} accent={error}>
            {label}
          </Text>
        ) : null}
      </Block>
    );
  }

  renderToggle() {
    const {secure, rightLabel} = this.props;
    const {toggleSecure} = this.state;

    if (!secure) {
      return null;
    }

    return (
      <Button
        style={styles.toggle}
        onPress={() => this.setState({toggleSecure: !toggleSecure})}>
        {rightLabel ? (
          rightLabel
        ) : (
          <Icon
            name={toggleSecure ? 'eye-slash' : 'eye'}
            size={theme.sizes.font * 1.95}
            color={theme.colors.gray}
            style={styles.secureStyle}
          />
        )}
      </Button>
    );
  }

  renderRight() {
    const {rightLabel, rightStyle, onRightPress} = this.props;

    if (!rightLabel) {
      return null;
    }

    return (
      <Button
        style={[styles.toggle, rightStyle]}
        onPress={() => onRightPress && onRightPress()}>
        {rightLabel}
      </Button>
    );
  }

  render() {
    const {email, phone, number, secure, error, style, ...props} = this.props;

    const {toggleSecure} = this.state;
    const isSecure = toggleSecure ? false : secure;

    const inputStyles = [
      styles.input,
      error && {borderColor: theme.colors.accent},
      style,
    ];

    const inputType = email
      ? 'email-address'
      : number
      ? 'numeric'
      : phone
      ? 'phone-pad'
      : 'default';

    return (
      <Block flex={false} margin={[theme.sizes.base, 0]}>
        {this.renderLabel()}
        <TextInput
          style={inputStyles}
          secureTextEntry={isSecure}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={inputType}
          {...props}
        />
        {this.renderToggle()}
        {this.renderRight()}
      </Block>
    );
  }
}

export default Input;

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.black,
    borderRadius: theme.sizes.radius,
    fontSize: theme.sizes.font,
    fontWeight: '500',
    color: theme.colors.black,
    height: theme.sizes.base * 3,
    width: '100%',
  },
  toggle: {
    position: 'absolute',
    alignItems: 'flex-end',
    width: theme.sizes.base * 2,
    height: theme.sizes.base * 2,
    top: theme.sizes.base * 0.05,
    backgroundColor: 'transparent',
    right: 0,
  },
});

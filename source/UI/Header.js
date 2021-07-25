import React from 'react';
import {StatusBar, StyleSheet, Text} from 'react-native';
import {
  Header,
  Left,
  Body,
  Right,
  Button,
  Icon as NativeBaseIcon,
  Title,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {theme} from '../constants';

export default function(props) {
  const {leftItems, rightItems, title} = props;
  let Icon = NativeBaseIcon;

  const getIcon = type => {
    switch (type) {
      case 'MaterialIcons':
        return MaterialIcons;

      case 'Ionicons':
        return Ionicons;

      default:
        return MaterialIcons;
    }
  };

  return (
    <Header style={styles.header}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />
      <Left>
        {(leftItems || []).map((el, index) => {
          if (el.iconType) {
            Icon = getIcon(el.iconType);
          }
          if (el.component) {
            const Component = el.component;

            return (
              <Button key={`left-${index}`} transparent>
                <Component key={index} {...el.spread} />
              </Button>
            );
          }

          if (el.showCondition) {
            if (el.text) {
              return (
                <Text key={`left-${index}`} style={el.style}>
                  {el.text}
                </Text>
              );
            }

            return (
              <Button key={`left-${index}`} transparent onPress={el.onPress}>
                <Icon style={{...el.style}} name={el.iconName} />
              </Button>
            );
          }
        })}
      </Left>
      <Body>
        <Title style={{color: theme.colors.primary}}>{title}</Title>
      </Body>
      <Right>
        {(rightItems || []).map((el, index) => {
          if (el.iconType) {
            Icon = getIcon(el.iconType);
          }
          if (el.component) {
            const Component = el.component;

            return (
              <Button key={`right-${index}`} transparent>
                <Component {...el.spread} />
              </Button>
            );
          }
          if (el.showCondition) {
            return (
              <Button key={`right-${index}`} transparent onPress={el.onPress}>
                <Icon style={{...el.style}} name={el.iconName} />
              </Button>
            );
          }
        })}
      </Right>
    </Header>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 0,
  },
  header: {
    backgroundColor: theme.colors.white,
    color: 'white',
  },
  relative: {
    position: 'relative',
  },
  notify: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
});

import React, {Component} from 'react';
import {StyleSheet} from 'react-native';

import Badge from './Badge';

import {theme} from '../constants';
import {View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function NotificationBell(props) {
  const {unreadNotification} = props;
  return (
    <View style={styles.container}>
      <MaterialIcons
        name="notifications-none"
        color={theme.colors.primary}
        size={theme.sizes.font * 2}
      />
      {unreadNotification && (
        <Badge color={theme.colors.accent} size={10} style={styles.badge} />
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    // borderWidth: 1,
  },
  container: {
    position: 'relative',
    // borderWidth: 1,
  },
});

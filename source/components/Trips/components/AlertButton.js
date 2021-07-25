import React from 'react';
import {StyleSheet, TouchableOpacity, Platform} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {Button, Badge} from '../../../UI';
import {theme} from '../../../constants';

function AlertButton(props) {
  const {showBroadcastPrompt, role} = props;
  if (role !== 'teacher') {
    return null;
  }
  //this.state.user?.role
  if (Platform.OS === 'ios') {
    return (
      <Button style={styles.broadcast} onPress={showBroadcastPrompt}>
        <Badge
          color={theme.colors.lightSecondary}
          size={80}
          onPress={showBroadcastPrompt}>
          <Badge color={theme.colors.secondary} size={42}>
            <FontAwesome name="bullhorn" size={62 / 2.5} color="white" />
          </Badge>
        </Badge>
      </Button>
    );
  } else {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.broadcast}
        onPress={this.showBroadcastPrompt}>
        <Badge
          color={theme.colors.lightSecondary}
          size={80}
          onPress={this.showBroadcastPrompt}>
          <Badge color={theme.colors.secondary} size={42}>
            <FontAwesome name="bullhorn" size={62 / 2.5} color="white" />
          </Badge>
        </Badge>
      </TouchableOpacity>
    );
  }
}

export default AlertButton;

const styles = StyleSheet.create({
  broadcast: {
    ...Platform.select({
      android: {
        position: 'absolute',
        bottom: -35,
        right: 20,
        zIndex: 1,
      },
    }),
  },
});

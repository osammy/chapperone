import React from 'react';
import {StyleSheet, View} from 'react-native';
import MoreMenu from '../../MoreMenu';

import {Block, Text, Button, Badge, NotificationBell} from '../../../UI';
import {theme} from '../../../constants';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Actions} from 'react-native-router-flux';

function Header(props) {
  const {
    superAdmin,
    activeNotification,
    indicateBroadcastUnread,
    handleAddBtnClick,
  } = props;
  return (
    <View style={styles.headerContainer}>
      <Block middle>
        <Text h2 primary>
          Trips
        </Text>
      </Block>

      <View style={styles.content}>
        {superAdmin && (
          <>
            <Button
              style={styles.verifyBtn}
              onPress={Actions.submissions}
              transparent>
              <Text style={styles.verifyText} primary bold>
                VERIFY
              </Text>
            </Button>
          </>
        )}
        <Button
          style={styles.horizPadding}
          onPress={Actions.Notifications}
          transparent>
          <NotificationBell unreadNotification={indicateBroadcastUnread} />
        </Button>
        <Button
          style={styles.horizPadding}
          onPress={handleAddBtnClick}
          transparent>
          <MaterialIcons
            name="add"
            color={theme.colors.primary}
            size={theme.sizes.font * 2}
          />
          <Text style={styles.dot}>
            {activeNotification && (
              <Badge size={10} color={theme.colors.accent} />
            )}
          </Text>
        </Button>
        <View style={styles.centerJustify}>
          <MoreMenu color={theme.colors.primary} />
        </View>
      </View>
    </View>
  );
}

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: theme.colors.gray2,
    margin: 0,
    paddingVertical: 5,
    paddingHorizontal: theme.sizes.horizontal,
  },
  dot: {
    position: 'absolute',
    top: 5,
    left: -20,
  },
  verifyBtn: {
    paddingHorizontal: 20,
  },
  verifyText: {
    backgroundColor: theme.colors.primary,
    padding: 5,
    color: theme.colors.white,
  },
  horizPadding: {paddingHorizontal: 20},
  centerJustify: {justifyContent: 'center'},
  content: {flexDirection: 'row', marginRight: 10},
});

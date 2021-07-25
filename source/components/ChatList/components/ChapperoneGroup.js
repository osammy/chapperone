import React from 'react';
import {TouchableHighlight, View, StyleSheet, Platform} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {formatDateTime} from '../../../resources/utils';
import {theme} from '../../../constants';
import {Badge, Text} from '../../../UI';

function ChapperonesGroup(props) {
  const {tripId, lastChapperoneGroupMessage, handleChapperoneMsgPress} = props;
  let name = '';
  let data;
  const key = tripId;

  try {
    data = lastChapperoneGroupMessage[key];
    name = `${data.name}: `;
  } catch (e) {
    data = {};
  }

  function renderContent() {
    //
    if (data?.image && !data?.message) {
      return (
        <Text>
          <Text gray style={styles.lastMessage}>
            {name}{' '}
          </Text>
          <FontAwesome name="image" size={20} color={theme.colors.gray} />
        </Text>
      );
    }
    return (
      <Text numberOfLines={1} gray style={[styles.lastMessage, italicize()]}>
        {data.message ? (
          <Text gray>
            <Text gray bold>
              {name}
            </Text>
            {data.message}
          </Text>
        ) : (
          'No new message'
        )}
        {/* All members should be available by 5pm */}
      </Text>
    );
  }

  const italicize = () => (data.message ? {} : {fontStyle: 'italic'});
  const handleDate = () =>
    data.createdAt ? formatDateTime(data?.createdAt) : '';

  return (
    <TouchableHighlight
      style={styles.container}
      onPress={handleChapperoneMsgPress}>
      <View style={styles.listItem}>
        <Badge color={theme.colors.secondary} size={55}>
          <FontAwesome name="users" size={62 / 2.5} color="white" />
        </Badge>
        <View style={styles.adminContent}>
          <View style={[styles.spaceBetween, styles.chatTop]}>
            <Text color="black" style={styles.chatName}>
              Chapperones
            </Text>
            <Text color={theme.colors.primary}>{handleDate()}</Text>
          </View>
          <View style={styles.spaceBetween}>
            {/* <Text
              numberOfLines={1}
              gray
              style={[styles.lastMessage, italicize()]}>
              {data.message ? (
                <Text gray>
                  <Text gray style={styles.textStyle}>
                    {name}
                  </Text>
                  {data.message}
                </Text>
              ) : (
                'No new message'
              )}
            </Text> */}
            {renderContent()}
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
}

export default ChapperonesGroup;

const styles = StyleSheet.create({
  container: {height: 80, backgroundColor: 'rgba(10,196,186, 0.1)'},
  floatingButtonStyle: {
    resizeMode: 'contain',
    width: 55,
    height: 55,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
  },
  avatar: {width: 60, height: 60, borderRadius: 30},
  chatTop: {width: '100%', margin: 0, padding: 0},
  chatName: {fontSize: 15, fontWeight: 'bold'},
  content: {
    marginLeft: 15,
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: theme.colors.gray2,
  },
  adminContent: {
    marginLeft: 15,
    flex: 1,
    borderColor: theme.colors.gray2,
  },
  lastMessage: {fontSize: 13, width: '93%'},
  textStyle: {fontWeight: 'bold'},
  spaceBetween: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

import React from 'react';
import {
  FlatList,
  TouchableHighlight,
  View,
  StyleSheet,
  Image,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {formatDateTime} from '../../../resources/utils';
import {theme} from '../../../constants';
import {Badge, Text, Block} from '../../../UI';

function Messages(props) {
  const {data, handleItemClick} = props;

  function renderItem({item, index}) {
    const determineBold = unread => {
      if (unread) {
        return {
          fontWeight: 'bold',
        };
      }

      return {
        fontWeight: 'normal',
      };
    };

    return (
      <TouchableHighlight key={item._id} onPress={() => handleItemClick(item)}>
        <View style={styles.listItem}>
          <Image source={{uri: item.avatar}} style={styles.avatar} />
          <View style={styles.content}>
            <Block style={styles.chatTop} row space="between">
              <Text style={styles.chatName}>
                {item.first_name + ' ' + item.last_name}
              </Text>
              <Text
                style={determineBold(item.unread)}
                color={theme.colors.primary}>
                {formatDateTime(item.createdAt)}
              </Text>
            </Block>
            <Block row space="between">
              <Text
                numberOfLines={1}
                color={theme.colors.gray}
                style={[styles.lastMessage, determineBold(item.unread)]}>
                {item.lastMessage}
              </Text>

              {item?.unread_count ? (
                <Badge color={theme.colors.primary} size={20}>
                  <Text color={theme.colors.white}>{item.unread_count}</Text>
                </Badge>
              ) : null}
            </Block>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => `${item._id}`}
    />
  );
}

export default Messages;

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

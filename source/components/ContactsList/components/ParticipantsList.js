import React, {useMemo, useCallback} from 'react';
import {View, TouchableHighlight, Image, StyleSheet} from 'react-native';
import {RNToasty} from 'react-native-toasty';
import {Actions} from 'react-native-router-flux';

import {capitalize} from '../../../resources/utils';
import LoadingPage from './LoadingPage';
import {Block, Text} from '../../../UI';
import {theme} from '../../../constants';

function ParticipantsList(props) {
  const {
    participants,
    handleShowModal,
    handleCloseModal,
    user,
    loadingParticipants,
  } = props;

  console.log(participants.length);

  const renderItem = useCallback(
    item => {
      function handleItemClick() {
        handleCloseModal();
        if (user?._id === item?.user_id?._id) {
          RNToasty.Normal({
            title: 'You cannot message yourself!',
          });
          return;
        }
        if (user?.role === 'student' && item?.user_id?.role === 'student') {
          RNToasty.Normal({
            title: 'You cannot only message chaperones!',
          });
          return;
        }
        Actions.chat({
          participant: item,
          user,
        });
      }
      const name =
        capitalize(item?.user_id?.first_name) +
        ' ' +
        capitalize(item?.user_id?.last_name);
      const role =
        item?.user_id?.role === 'teacher' ? 'Chaperone' : 'Student/Parent';

      const avatar = item?.user_id?.avatar;

      const handleClick =
        user?.role === 'teacher'
          ? () => handleShowModal(item)
          : () => handleItemClick(item);

      return (
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor="#DDDDDD"
          style={styles.item}
          onPress={handleClick}
          key={item?._id}>
          <View style={styles.listItem}>
            <Image source={{uri: avatar}} style={styles.avatar} />
            <View style={styles.content}>
              <Block style={styles.chatTop} row space="between">
                <Text style={styles.chatName}>{name}</Text>
              </Block>
              <Block row space="between">
                <Text
                  numberOfLines={1}
                  color={theme.colors.gray}
                  style={styles.lastMessage}>
                  {role}
                </Text>
              </Block>
            </View>
          </View>
        </TouchableHighlight>
      );
    },
    [handleCloseModal, handleShowModal, user],
  );

  const buff = {};

  const sortedArr = useMemo(() => {
    participants.forEach(el => {
      if (buff[el.user_id.role]) {
        buff[el.user_id.role].push(el);
      } else {
        buff[el.user_id.role] = [el];
      }
    });

    let result = [];

    if (buff.teacher) {
      result = buff.teacher;
      if (buff.student) {
        result = buff.teacher.concat(buff.student);
      }
    } else {
      result = buff.student;
    }
    return result || [];
  }, [participants, buff]);

  return (
    <View>
      {loadingParticipants && <LoadingPage />}
      {sortedArr.map(el => {
        return renderItem(el);
      })}
    </View>
  );
}

export default ParticipantsList;

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
  },
  avatar: {width: 60, height: 60, borderRadius: 30},
  chatTop: {width: '100%', margin: 0, padding: 0},
  chatName: {fontSize: 15, fontWeight: 'bold'},
  content: {
    marginLeft: 15,
    flex: 1,
    borderColor: theme.colors.gray2,
  },
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.gray,
  },
});

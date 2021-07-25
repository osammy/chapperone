import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  Image,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import _ from 'lodash';
import firebase from 'firebase';
import {Actions} from 'react-native-router-flux';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {connect} from 'react-redux';

import {Block, Text, Header} from '../../UI';
import {theme} from '../../constants';
import {formatFullDateTime} from '../../resources/utils';
import {getDataFromParticipants} from './helpers';

const statusBarHeight = getStatusBarHeight();

function BroadcastSeenList(props) {
  const [seenUsers, setSeenUsers] = useState([]);
  const [unReadUsers, setUnreadUsers] = useState(
    getDataFromParticipants(props.participants),
  );

  // alert(JSON.stringify(getDataFromParticipants(props.participants)));

  useEffect(() => {
    //   const message = props.messageId;

    const ref = firebase
      .database()
      .ref(`/users_read_broadcast/${props.tripId}/${props.messageId}`);

    const handler = snapShot => {
      if (!snapShot.exists()) {
        return;
      }
      const usersReadBroadcast = _.values(snapShot.val());

      const seenDict = getSeenDictionary(usersReadBroadcast);

      const read = [];
      const unread = [];

      props.participants.forEach(eachParticipant => {
        const isReadUser = seenDict[(eachParticipant?.user_id?._id)];
        if (isReadUser) {
          read.push(isReadUser);
          return;
        } else {
          const name = `${eachParticipant?.user_id?.first_name} ${
            eachParticipant?.user_id?.last_name
          }`;
          const data = {
            _id: eachParticipant?._id,
            name,
            avatar: eachParticipant?.user_id?.avatar,
            reader_id: eachParticipant?.user_id?._id,
          };
          unread.push(data);
        }
      });

      setSeenUsers(read);
      setUnreadUsers(unread);
    };

    ref.on('value', handler);

    return () => ref.off('value', handler);
  }, [props.tripId, props.messageId, props.participants]);

  function getSeenDictionary(list) {
    const dict = {};
    list.forEach(el => {
      if (!dict[el.reader_id]) {
        dict[el.reader_id] = el;
      }
    });

    return dict;
  }

  const leftItems = [
    {
      iconName: 'arrow-back',
      showCondition: true,
      onPress: Actions.pop,
      style: {color: theme.colors.primary},
    },
  ];

  const renderTheItem = item => {
    return (
      <View key={item?._id}>
        <View style={styles.listItem}>
          <Image source={{uri: item.avatar}} style={styles.avatar} />
          <View style={styles.itemDetail}>
            <Block style={styles.chatTop} row space="between">
              <Text style={styles.chatName}>{item.name}</Text>
            </Block>
            <Block row space="between">
              {item?.read_at && (
                <Text
                  numberOfLines={1}
                  color={theme.colors.gray}
                  style={styles.lastMessage}>
                  {formatFullDateTime(item.read_at)}
                </Text>
              )}
            </Block>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        leftItems={leftItems}
        //   rightItems={this.state.rightItems}
        title="Read Receipts"
      />

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.subHeaderContainer}>
            <Block row space="between">
              <Text style={styles.subHeader} primary>
                Not Read
              </Text>
              <Text style={styles.countText} gray semibold>{`(${
                unReadUsers.length
              } / ${props.participants?.length})`}</Text>
            </Block>
          </View>
          {unReadUsers.map(el => renderTheItem(el))}
        </View>
        <View style={styles.card}>
          <View style={styles.subHeaderContainer}>
            <Block row space="between">
              <Text style={styles.subHeader} primary>
                Read
              </Text>
              <Text style={styles.countText} gray semibold>{`(${
                seenUsers.length
              } / ${props.participants?.length})`}</Text>
            </Block>
          </View>
          {seenUsers.map(el => renderTheItem(el))}
        </View>
      </ScrollView>
    </View>
  );
}

const mapStateToProps = state => {
  return {
    participants: state.ListContactsReducer.participants,
    // loadingParticipants: state.ListContactsReducer.loadingParticipants,
    // trip: state.TripReducer.trip,
    // failedToLoadParticipants:
    //   state.ListContactsReducer.failedToLoadParticipants,
    // highlight_mode: state.ListContactsReducer.highlight_mode,
    // userPermissions: state.TripReducer.userPermissions,
    // userSubPermissions: state.TripReducer.userSubPermissions,
  };
};
export default connect(mapStateToProps)(BroadcastSeenList);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: statusBarHeight,
  },
  avatar: {width: 40, height: 40, borderRadius: 20},
  chatTop: {},
  chatName: {fontSize: 15, textTransform: 'capitalize'},
  // content: {
  //   marginLeft: 15,
  //   flex: 1,
  //   borderColor: theme.colors.gray2,
  // },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
    // paddingVertical: 20,
    alignItems: 'center',
    // height: 100,
    width: '100%',
  },
  subHeaderContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.gray2,
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subHeader: {
    fontSize: 16,
    paddingLeft: 10,
    // backgroundColor: 'black',

    // borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.primary,
  },
  card: {
    backgroundColor: 'white',
    shadowColor: theme.colors.black,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 13,
    marginTop: 15,
    borderRadius: 5,
    // elevation: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  itemDetail: {
    paddingLeft: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.gray2,
    width: '100%',
    // paddingBottom: 40,
    paddingBottom: 10,
  },
  countText: {
    textAlign: 'right',
    marginRight: 10,
  },
});

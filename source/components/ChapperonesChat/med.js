import React, {Component} from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import {
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Clipboard,
  Keyboard,
} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import firebase from 'firebase';
import {Actions} from 'react-native-router-flux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as RNFS from 'react-native-fs';

import {
  capitalize,
  realmToJson,
  handleError,
  //
  getUserFromAsyncStorage,
  addFirebaseListerDetails,
  generateRandomStrings,
} from '../../resources/utils';
import {
  getLocalChats,
  postToLocalChats,
  updateRealmData,
  deleteLocalChats,
  updateLocalChats,
} from '../../db/controllers/ChatsController';
import {theme} from '../../constants';
import {Block, Text, Badge} from '../../UI';
import {
  updateGroupMessage,
  appendToChapperoneChats,
  setChapperonesMessages,
  appendMsgsToChapperoneChats,
} from '../../actions/ChapperoneChatActions';
import {changeTripBroadcastUnreadNotification} from '../../actions/AppActions';

import RnBgTask from 'react-native-bg-thread';
import {postWithAuth} from '../../resources/controllers/data';
import {getUrl} from '../../resources/controllers/url';
import {pickSingleImage} from '../../resources/utils/imageUploader';

import {
  onPressPhoneNumber,
  saveToDisk,
  getFirebaseRef,
  handleImageUpload,
  checkIfUserAlreadyRead,
} from '../../globals/helpers';
import {getInputProp} from './helpers';
import {MessageImage, Header, UploadDisplay} from '../../globals/components';

class BroadcastChats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      user: {},
      loadingEarlier: false,
      showImageModal: false,
      imageToUpload: {},
      inputPosition: 0,
      imageCaptionText: '',
      uploadingImage: false,
    };

    this.step = 5;
  }

  _keyboardDidShow = e => {
    this.setState({inputPosition: e.endCoordinates.height});
  };

  _keyboardDidHide = e => {
    this.setState({inputPosition: 0});
  };

  async componentDidMount() {
    Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    this.user = await getUserFromAsyncStorage();
    this.setState({user: this.user});
    this.messagesDict = {};

    // Run in native background thread to free up UI thread
    RnBgTask.runInBackground(async () => {
      try {
        const tripId = this.props.trip._id;
        // All broadcast messages for each trip has the id_key at the
        //tripId since that unique
        const query = `id_key = "chapperones-${tripId}" SORT(createdAt DESC) LIMIT(100)`;

        const messages = await getLocalChats(query);

        let startAt;

        if (messages[0]) {
          // startAt = messages[0].createdAt; // 125 is an offset
          startAt = messages[0].createdAt + 500; // 125 is an offset
          const plainArrMessages = realmToJson(messages);
          // console.log(plainArrMessages);
          const key = tripId;
          const dataToStore = {};
          const m = this.getMessagesNotInState(plainArrMessages);
          dataToStore[key] = m;

          this.props.setChapperonesMessages(dataToStore);
        }
        // Get the messages whose status isnt received
        const unreadMsgs = messages.filter(
          message => message.status !== 'received',
        );
        const user = await getUserFromAsyncStorage();
        this.listenForMessages(tripId, startAt, this.user);

        // Perform updates if found unread broadcast message.
        if (unreadMsgs.length > 0) {
          //Update Broadcast read receipt
          const toPlainArr = realmToJson(unreadMsgs);

          await this.updateReadReceipts(tripId, user, toPlainArr);
          //Update realm broadcast message status to 'received';
          await updateRealmData(unreadMsgs, {status: 'received'});
        }
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    });
  }

  async componentWillUnmount() {
    const tripId = this.props.trip._id;
    firebase
      .database()
      .ref(`/chapperones_broadcasts/${tripId}`)
      .off();
  }

  getMessagesNotInState(messagesArr) {
    const uniqueMsgs = [];
    messagesArr.forEach(eachMessage => {
      if (!this.messagesDict[eachMessage._id]) {
        this.messagesDict[eachMessage._id] = true;
        uniqueMsgs.push(eachMessage);
      }
    });

    return uniqueMsgs;
  }

  // componentDidUpdate(prevProps) {
  //   try {
  //     // Typical usage (don't forget to compare props):
  //     const key = this.props.trip?._id;
  //     if (
  //       this.props?.chapperonesGroupMessages?.messages[key] !==
  //       prevProps.chapperonesGroupMessages?.messages[key]
  //     ) {
  //       this.fetchData(this.props.userID);
  //     }
  //   } catch (e) {}
  // }

  sendPushNotification = (message, tripId) => {
    if (Array.isArray(message)) {
      message = message[0];
    }
    const {_id: messageId, text, user: currUser, createdAt} = message;
    // Made the data payload as consistent as possible with the localchats schema so it can be stored on reception
    const date_created = `${+createdAt}`; // convert to string because Firebase Cloud Messaging only accepts strings.
    const data = {
      page_to_open: 'chapperone_broadcast',
      _id: messageId,
      tripId,
      firebase_key: this.msgKey,
      text,
      user: JSON.stringify(currUser),
      createdAt: date_created,
    };
    // const maxNotifBody = 30;
    const notifBody = text;
    // text.length > maxNotifBody ? `${text.substring(1, maxNotifBody)}...` : text;

    const title = `${currUser.name} sent a message on the chapperone group`;

    const notification = {
      title,
      body: notifBody,
      // badge: "1",
      // imageUrl,
    };

    const body = {
      notification,
      data,
    };

    const baseUrl = getUrl('users');
    const url = `${baseUrl}/trip/${tripId}/chapperones/notifications`;

    return postWithAuth(url, body);
  };

  updateReadReceipts = (tripId, user, messages) => {
    const updates = {};
    const {_id: reader_id, avatar, first_name, last_name} = user;
    const name = `${first_name} ${last_name}`;

    let msgLength = messages.length;
    let count = 0;

    messages.forEach(async message => {
      count += 1;
      const messageId = message._id;
      const chapperones_read_broadcast_node = `/chapperones_read_broadcast/${tripId}/${messageId}`;
      const ref = firebase.database().ref(chapperones_read_broadcast_node);

      const found = await this.checkIfUserAlreadyRead(
        reader_id,
        tripId,
        messageId,
      );
      // Check if curr user made the broadcast do not update if so
      const iSentBroadcast = message.user._id === user._id;

      const shouldBeUpdated = !found && !iSentBroadcast;

      if (shouldBeUpdated) {
        const read_receipt_key = ref.push().key;

        const payload = {
          name,
          reader_id,
          messageId,
          avatar,
          read_at: firebase.database.ServerValue.TIMESTAMP,
        };

        updates[
          `${chapperones_read_broadcast_node}/${read_receipt_key}`
        ] = payload;
      }
      if (count === msgLength) {
        return firebase
          .database()
          .ref()
          .update(updates);
      }
    });
  };

  checkIfUserAlreadyRead = (userId, tripId, messageId) => {
    return new Promise((resolve, reject) => {
      const chapperones_read_broadcast_node = `/chapperones_read_broadcast/${tripId}/${messageId}`;
      const ref = firebase.database().ref(chapperones_read_broadcast_node);
      ref
        .orderByChild('reader_id')
        .equalTo(userId)
        .once('value', snapShot => {
          if (!snapShot.exists()) {
            resolve(false);
          }

          resolve(true);
        })
        .catch(reject);
    });
  };

  navigateToRead = messageId => {
    Actions.BroadcastList({tripId: this.props.trip._id, messageId});
  };

  onLongPress = (context, currentMessage) => {
    if (currentMessage.text) {
      const options = ['Copy Text', 'View Seen', 'Cancel'];
      const cancelButtonIndex = options.length - 1;
      context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        buttonIndex => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(currentMessage.text);
              break;
            case 1:
              this.navigateToRead(currentMessage._id);
              break;
          }
        },
      );
    }
  };
  getFirebaseRef(url) {
    return firebase.database().ref(url);
  }

  sendBroadcastInTrip = async (messages, tripId) => {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }

    const {text, user, _id: messageId, image, imageLocalPath} = messages[0];
    const createdAt = firebase.database.ServerValue.TIMESTAMP;
    const broadcastNode = `/chapperones_broadcasts/${tripId}`;
    const broadcastConvoNode = `/chapperones_broadcasts_conversation/${tripId}`;

    this.msgKey = this.getFirebaseRef(broadcastNode).push().key;

    const payload = {
      _id: messageId,
      firebase_key: this.msgKey,
      text: text,
      type: 'chapperones_broadcast',
      user,
      createdAt,
    };

    const lastBroadcastConversationMsg = {
      sender_id: user._id,
      msgId: messageId,
      name: capitalize(user.name),
      createdAt,
      message: messages[0].text,
    };

    if (image) {
      payload.image = image;
      lastBroadcastConversationMsg.image = image;
    }
    if (imageLocalPath) {
      payload.imageLocalPath = imageLocalPath;
      lastBroadcastConversationMsg.imageLocalPath = imageLocalPath;
    }

    const updates = {};
    updates[`${broadcastNode}/${this.msgKey}`] = payload;
    updates[`${broadcastConvoNode}`] = lastBroadcastConversationMsg;

    return firebase
      .database()
      .ref()
      .update(updates);
  };

  sendPushNotification = (message, tripId) => {
    if (Array.isArray(message)) {
      message = message[0];
    }
    const {_id: messageId, text, user: currUser, createdAt} = message;
    // Made the data payload as consistent as possible with the localchats schema so it can be stored on reception
    const date_created = `${createdAt}`; // convert to string because Firebase Cloud Messaging only accepts strings.
    const data = {
      page_to_open: 'chapperones_broadcast',
      _id: messageId,
      tripId,
      firebase_key: this.msgKey,
      text,
      user: JSON.stringify(currUser),
      createdAt: date_created,
    };
    // const maxNotifBody = 30;
    const notifBody = text;
    // text.length > maxNotifBody ? `${text.substring(1, maxNotifBody)}...` : text;

    const title = `${currUser.name} in Chapperones`;

    const notification = {
      title,
      body: notifBody,
      // badge: "1",
      // imageUrl,
    };

    const body = {
      notification,
      data,
    };

    const baseUrl = getUrl('users');
    const url = `${baseUrl}/trip/${tripId}/chapperones/notifications`;

    return postWithAuth(url, body);
  };

  onSend = async (messages = []) => {
    try {
      await this.sendBroadcastInTrip(messages, this.props.trip._id);
      this.sendPushNotification(messages, this.props.trip._id);
    } catch (e) {
      handleError(e);
    }
  };

  getUniqueMessages(msgArr) {
    const uniqueMessages = [];
    msgArr.forEach(eachMsg => {
      if (!this.messagesDict[eachMsg._id]) {
        uniqueMessages.push(eachMsg);
      }
    });
  }

  onLoadEarlier = async () => {
    try {
      const {trip, user} = this.props;
      const tripId = trip._id;
      const key = tripId;
      const id_key = `chapperones-${tripId}`;

      const messages = this.props.chapperonesGroupMessages.messages[key];
      const oldestMsg = messages[messages.length - 1];

      const query = `id_key = "${id_key}" AND createdAt < ${
        oldestMsg.createdAt
      } SORT(createdAt DESC) LIMIT(${this.step})`;

      const Lmessages = await getLocalChats(query);
      const payload = {};
      const convertedMsgs = realmToJson(Lmessages);
      payload[key] = convertedMsgs;
      // getUniqueMessages;
      this.getMessagesNotInState(convertedMsgs);

      this.props.appendMsgsToChapperoneChats(payload);
    } catch (e) {
      Alert.alert(e.message);
    }
  };
  listenForMessages = (tripId, startAt, user) => {
    const refNode = `/chapperones_broadcasts/${tripId}`;
    // store the ref to a class varaible to access everywhere
    let msgRef = this.getFirebaseRef(refNode);
    // add listener
    if (startAt) {
      msgRef = msgRef
        .orderByChild('createdAt')
        .limitToLast(100)
        .startAt(startAt);
    } else {
      msgRef = msgRef.orderByChild('createdAt').limitToLast(100);
    }

    // MAKE BROADCAST MESSAGE READ FOR THIS TRIP
    const notifDetails = {};
    notifDetails[tripId] = false;
    this.props.changeTripBroadcastUnreadNotification(notifDetails);
    msgRef.on('child_added', async snapshot => {
      if (!snapshot.exists()) {
        return;
      }

      const key = tripId;
      const dataToSend = {};
      const data = snapshot.val();

      dataToSend[key] = data;

      const payload = {};

      const dataToSaveLocally = {...data};
      dataToSaveLocally.id_key = `chapperones-${tripId}`;
      dataToSaveLocally.trip_id = tripId;
      dataToSaveLocally.sender_id = data.user._id;
      dataToSaveLocally.receiver_id = user._id;
      //   dataToSaveLocally.status = 'delivered';
      dataToSaveLocally.status = 'received';

      try {
        await postToLocalChats(dataToSaveLocally);
        //Append to conversations
        // const messages = this.props.chapperonesGroupMessages.messages[key];
        // if (messages) {
        //   const foundIndex = messages.findIndex(el => {
        //     return el._id === data?._id;
        //   });
        //   if (foundIndex !== -1) {
        //     // alert('duplicate: ' + messages[foundIndex].text);
        //     return;
        //   }
        // }
        const uniqueMsg = this.getMessagesNotInState([data]);

        if (uniqueMsg.length === 0) {
          return;
        }

        payload[key] = uniqueMsg[0];

        this.props.appendToChapperoneChats(dataToSend);
        this.updateReadReceipts(tripId, user, [data]);
      } catch (e) {
        Alert.alert(e.message);
      }
      //
      //
    });
    //store the reference
    addFirebaseListerDetails({from: 'chapperones_broadcasts', refUrl: refNode});
  };

  sendImageMsg = async () => {
    try {
      this.setState({uploadingImage: true});
      Keyboard.dismiss();

      const imageUrl = await handleImageUpload(this.state.imageToUpload);
      const userObj = await getUserFromAsyncStorage();
      const user = {
        _id: userObj._id,
        avatar: userObj.avatar,
        name: `${userObj.first_name} ${userObj.last_name} `,
      };

      const message = {
        _id: generateRandomStrings(16),
        text: this.state.imageCaptionText,
        user,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        image: imageUrl,
        imageLocalPath: this.state.imageToUpload?.imageLocalPath,
      };

      await this.onSend([message]);

      this.handleCloseModal();
      this.setState({imageCaptionText: '', uploadingImage: false});
      // Now update with the right image
      // const updates = {}
      // updates[`${users_read_broadcast_node}/${read_receipt_key}`] = payload;

      // return firebase
      //     .database()
      //     .ref()
      //     .update(updates);
    } catch (e) {
      this.setState({uploadingImage: false});
      handleError(e);
    }
  };

  pickImageToUpload = async () => {
    try {
      const imageObj = await pickSingleImage({multiple: false});

      const userObj = await getUserFromAsyncStorage();
      const path = `${RNFS.DocumentDirectoryPath}/${userObj._id}_${
        this.props.trip?._id
      }_${imageObj.filename}`;

      await RNFS.copyFile(imageObj.uri, path);
      imageObj.uri = path;
      imageObj.imageLocalPath = path;
      this.setState({
        imageToUpload: imageObj,
        showImageModal: true,
      });

      return imageObj;
    } catch (e) {}
  };

  handleCloseModal = () => {
    this.setState({showImageModal: false});
  };

  handleTextChange = text => this.setState({imageCaptionText: text});

  renderActions = props => {
    if (this.state.user?.role !== 'teacher') {
      return null;
    }
    return (
      <TouchableOpacity
        onPress={this.pickImageToUpload}
        style={styles.centerIcon}>
        <FontAwesome name="image" color="gray" size={25} />
      </TouchableOpacity>
    );
  };

  renderMessageImage = imageProps => {
    return (
      <MessageImage
        imageProps={imageProps}
        onDownloadPress={this.storeToDevice}
      />
    );
  };

  storeToDevice = async currentMessage => {
    RnBgTask.runInBackground_withPriority('MIN', async () => {
      // Your Javascript code here
      // Javascript executed here runs on the passed thread priority which in this case is minimum.
      try {
        const message = {...currentMessage};
        const {_id, image} = message;
        const path = await saveToDisk(image);
        if (path) {
          const dataToSend = {};
          const query = `_id = "${_id}"`;
          await updateLocalChats(query, {imageLocalPath: path});
          message.imageLocalPath = path;
          dataToSend[(this.props.trip?._id)] = message;
          this.props.updateGroupMessage(dataToSend);
        }
      } catch (e) {}
    });
  };

  render() {
    const {trip, user} = this.props;

    const key = trip._id;
    let messages;

    try {
      messages = this.props.chapperonesGroupMessages.messages[key];
      // console.log(messages[0]);
    } catch (e) {
      messages = [];
    }
    const name = `${capitalize(user.first_name)} ${capitalize(user.last_name)}`;

    const userDetails = {_id: user._id, avatar: user.avatar, name};
    const role = this.state.user?.role;
    const {textInputProps, textInputPlaceholder} = getInputProp(role);

    return (
      <SafeAreaView style={styles.container}>
        <Header title="Chaperones" />
        <TouchableOpacity onPress={() => deleteLocalChats('')}>
          <Text>delete</Text>
        </TouchableOpacity>
        <GiftedChat
          messages={messages}
          onLoadEarlier={this.onLoadEarlier}
          onSend={this.onSend}
          user={userDetails} // TODO: Change this ID to something better suited
          loadEarlier
          renderUsernameOnMessage
          onLongPress={this.onLongPress}
          textInputProps={textInputProps}
          placeholder={textInputPlaceholder}
          parsePatterns={linkStyle => [
            {
              type: 'phone',
              style: linkStyle,
              onPress: onPressPhoneNumber,
            },
            {
              pattern: /#(\w+)/,
              // style: {...linkStyle},
              onPress: this.onPressHashtag,
            },
          ]}
          // renderBubble={this.renderBubble}
          renderMessageImage={this.renderMessageImage}
          renderActions={this.renderActions}
        />
        <UploadDisplay
          onUpload={this.sendImageMsg}
          handleTextChange={this.handleTextChange}
          uploadingImage={this.state.uploadingImage}
          showImageModal={this.state.showImageModal}
          imageToUploadUri={this.state.imageToUpload?.uri}
          inputPosition={this.state.inputPosition}
          handleCloseModal={this.handleCloseModal}
        />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {
    chapperonesGroupMessages: state.ChapperonesReducer,
    trip: state.TripReducer.trip,
  };
};

export default connect(
  mapStateToProps,
  {
    updateGroupMessage,
    appendToChapperoneChats,
    setChapperonesMessages,
    appendMsgsToChapperoneChats,
    changeTripBroadcastUnreadNotification,
  },
)(BroadcastChats);

const styles = StyleSheet.create({
  avatar: {width: 40, height: 40, borderRadius: 20},
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 0.5,
    borderColor: theme.colors.gray,
    margin: 0,
    shadowColor: theme.colors.black,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 13,
    // height: 60,
  },
  centerIcon: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 15,
    paddingLeft: 10,
    // paddingTop: 20,
  },
});

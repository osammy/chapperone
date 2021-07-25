/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable no-return-assign */
/* eslint-disable prettier/prettier */
/* eslint-disable curly */
/* eslint-disable handle-callback-err */
/* eslint-disable no-undef */
/* eslint-disable react-native/no-inline-styles */
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RnBgTask from 'react-native-bg-thread';
import firebase from 'firebase';
import {Actions} from 'react-native-router-flux';
import * as RNFS from 'react-native-fs';

import {Text} from '../../UI';
import {postWithAuth} from '../../resources/controllers/data';
import {capitalize, realmToJson, handleError} from '../../resources/utils';
import {
  getLocalChats,
  postToLocalChats,
  deleteLocalChats,
  updateLocalChats,
} from '../../db/controllers/ChatsController';

import {
  appendToBroadcast,
  setBroadcastMessages,
  updateAMessage,
  prependMsgsToBroadcast,
  changeTripBroadcastUnreadNotification,
} from '../../actions/AppActions';
import {
  getUserFromAsyncStorage,
  addFirebaseListerDetails,
  removeFirebaseListenerByRef,
  generateRandomStrings,
} from '../../resources/utils';
import {updateRealmData} from '../../db/controllers/ChatsController';
import {getUrl} from '../../resources/controllers/url';
import {pickSingleImage} from '../../resources/utils/imageUploader';
import {
  onPressPhoneNumber,
  saveToDisk,
  getFirebaseRef,
  handleImageUpload,
  checkIfUserAlreadyRead,
} from '../../globals/helpers';
// import {sendPushNotification} from './helpers';
import {
  MessageImage,
  Header,
  UploadDisplay,
  //   sendBroadcastInTrip,
  //   updateReadReceipts,
} from '../../globals/components';
import {getInputProp} from './helpers';
import {AlertMessage} from './components';

class BroadcastChats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      user: {},
      showImageModal: false,
      imageToUpload: {},
      inputPosition: 0,
      imageCaptionText: '',
      uploadingImage: false,
    };

    this.step = 20;
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
    // Run in native background thread to free up UI thread
    this.messagesDict = {};
    const user = await getUserFromAsyncStorage();
    this.setState({user});
    RnBgTask.runInBackground(async () => {
      try {
        const tripId = this.props.trip._id;
        // All broadcast messages for each trip has the id_key at the
        //tripId since that unique
        const query = `id_key = "${tripId}" SORT(createdAt DESC) LIMIT(50)`;

        const messages = await getLocalChats(query);

        let startAt;

        if (messages[0]) {
          startAt = messages[0].createdAt + 500; // 125 is an offset
          const plainArrMessages = realmToJson(messages);
          const key = tripId;
          const dataToStore = {};
          const uniqueMsgs = this.getMessagesNotInState(plainArrMessages);
          dataToStore[key] = uniqueMsgs;
          this.props.setBroadcastMessages(dataToStore);
        }
        // Get the messages whose status isnt received
        const unreadMsgs = messages.filter(
          message => message.status !== 'received',
        );
        this.listenForNewMessages(tripId, startAt, user);

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
    Keyboard.removeListener('keyboardDidShow', this._keyboardDidShow);
    Keyboard.removeListener('keyboardDidHide', this._keyboardDidHide);
    if (this.refUrl) await removeFirebaseListenerByRef(this.refUrl);
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

  sendImageMsg = async () => {
    try {
      //   const imageObj = await this.pickImageToUpload();
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
        // _id: 773663663,
        _id: generateRandomStrings(16),
        text: this.state.imageCaptionText,
        user,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        image: imageUrl,
        imageLocalPath: this.state.imageToUpload.imageLocalPath,
      };

      await this.onSend([message]);

      this.handleCloseModal();
      this.setState({imageCaptionText: '', uploadingImage: false});
    } catch (e) {
      this.setState({uploadingImage: false});
      handleError(e);
    }
  };

  pickImageToUpload = async () => {
    const imageObj = await pickSingleImage({multiple: false});
    // console.log(imageObj);
    // const imageObj = {
    //   uri:
    //     '/Users/mac/Library/Developer/CoreSimulator/Devices/546C0070-55B1-442D-8F6C-5853A86FDE96/data/Containers/Data/Application/9F3B7703-6BFC-49B4-A1B7-9E1D33BAE7A1/tmp/react-native-image-crop-picker/81C7ACD2-3D6A-42D1-8208-FAB61CEBB098.jpg',
    // };
    const userObj = await getUserFromAsyncStorage();

    const path =
      RNFS.DocumentDirectoryPath + '/' + userObj._id + '_' + imageObj.filename;
    // const path = RNFS.DocumentDirectoryPath + '/testImage.jpg';

    await RNFS.copyFile(imageObj.uri, path);
    // // console.log('FILE COPIED!');
    imageObj.uri = path;

    // write the file
    //       await RNFS.writeFile(path, 'Lorem ipsum dolor sit amet', 'utf8');
    //     //   console.log('FILE WRITTEN!');
    // await RNFS.unlink(path);
    //     console.log('FILE DELETED!');
    //     const file = await RNFS.readFile(path, 'utf8');
    //     console.log(file);
    imageObj.imageLocalPath = path;
    this.setState({
      imageToUpload: imageObj,
      showImageModal: true,
    });

    return imageObj;
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

  sendBroadcastInTrip = async (messages, tripId) => {
    if (!Array.isArray(messages)) messages = [messages];

    const {text, user, _id: messageId, image, imageLocalPath} = messages[0];
    const createdAt = firebase.database.ServerValue.TIMESTAMP;
    const broadcastNode = `/broadcasts/${tripId}`;
    const broadcastConvoNode = `/broadcasts_conversation/${tripId}`;

    this.msgKey = getFirebaseRef(broadcastNode).push().key;

    const payload = {
      _id: messageId,
      firebase_key: this.msgKey,
      text: text,
      type: 'broadcast',
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
    const date_created = `${+createdAt}`; // convert to string because Firebase Cloud Messaging only accepts strings.
    const data = {
      page_to_open: 'trip_broadcast',
      _id: messageId,
      tripId,
      firebase_key: this.msgKey,
      text,
      user: JSON.stringify(currUser),
      createdAt: date_created,
    };
    const notifBody = text;

    const title = `New broadcast from ${currUser.name}`;

    const notification = {
      title,
      body: notifBody,
    };

    const body = {
      notification,
      data,
    };

    const baseUrl = getUrl('users');
    const url = `${baseUrl}/trip/${tripId}/broadcast/notifications`;

    return postWithAuth(url, body);
  };

  onSend = async (messages = []) => {
    // console.log(JSON.stringify(messages));
    try {
      await this.sendBroadcastInTrip(messages, this.props.trip._id);

      // this.sendPushNotification(messages, this.props.trip._id);
    } catch (e) {
      handleError(e);
    }
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
      const users_read_broadcast_node = `/users_read_broadcast/${tripId}/${messageId}`;
      const ref = firebase.database().ref(users_read_broadcast_node);

      const found = await checkIfUserAlreadyRead(reader_id, tripId, messageId);
      // Check if curr user made the broadcast do not update if so
      //   const iSentBroadcast = message.user._id === user._id;

      const shouldBeUpdated = !found;

      if (shouldBeUpdated) {
        const read_receipt_key = ref.push().key;

        const payload = {
          name,
          reader_id,
          messageId,
          avatar,
          read_at: firebase.database.ServerValue.TIMESTAMP,
        };

        updates[`${users_read_broadcast_node}/${read_receipt_key}`] = payload;
      }
      if (count === msgLength) {
        return firebase
          .database()
          .ref()
          .update(updates);
      }
    });
  };
  listenForNewMessages = (tripId, startAt, user) => {
    const refNode = `/broadcasts/${tripId}`;
    // store the ref to a class varaible to access everywhere
    this.refUrl = refNode;
    let msgRef = getFirebaseRef(refNode);
    // add listener

    if (startAt) {
      msgRef = msgRef.orderByChild('createdAt').startAt(startAt);
    }

    // MAKE BROADCAST MESSAGE READ FOR THIS TRIP
    const notifDetails = {};
    notifDetails[tripId] = false;
    this.props.changeTripBroadcastUnreadNotification(notifDetails);
    let count = 0;
    msgRef.on('child_added', async snapshot => {
      if (!snapshot.exists()) return;
      const key = tripId;
      count++;
      console.log('called: ' + count);

      const dataToSend = {};
      const data = snapshot.val();
      dataToSend[key] = data;

      //
      // Listen to changes to child changed

      const payload = {};

      const dataToSaveLocally = {...data};
      dataToSaveLocally.id_key = tripId;
      dataToSaveLocally.trip_id = tripId;
      dataToSaveLocally.sender_id = data.user._id;
      dataToSaveLocally.receiver_id = user._id;
      dataToSaveLocally.status = 'delivered';
      try {
        await postToLocalChats(dataToSaveLocally);
        //Append to conversations
        const uniqueMsg = this.getMessagesNotInState([data]);

        if (uniqueMsg.length === 0) {
          return;
        }

        payload[key] = uniqueMsg[0];
        this.props.appendToBroadcast(dataToSend);
        this.updateReadReceipts(tripId, user, [data]);
      } catch (error) {}
      //
      //
    });
    //store the reference
    addFirebaseListerDetails({from: 'broadcasts', refUrl: refNode});
  };

  storeToDevice = async currentMessage => {
    const message = {...currentMessage};
    const {_id, image} = message;
    const path = await saveToDisk(image);
    if (path) {
      const dataToSend = {};
      const query = `_id = "${_id}"`;
      await updateLocalChats(query, {imageLocalPath: path});
      message.imageLocalPath = path;
      dataToSend[this.props.trip._id] = message;
      this.props.updateAMessage(dataToSend);
    }
  };

  renderMessageImage = imageProps => {
    return (
      <MessageImage
        imageProps={imageProps}
        onDownloadPress={this.storeToDevice}
      />
    );
  };

  onLoadEarlier = async () => {
    try {
      const {trip} = this.props;
      const tripId = trip._id;
      const key = tripId;
      const id_key = tripId;

      const messages = this.props.broadcastMessages.messages[key];
      const oldestMsg = messages[messages.length - 1];

      const query = `id_key = "${id_key}" AND createdAt < ${
        oldestMsg.createdAt
      } SORT(createdAt DESC) LIMIT(${this.step})`;

      const Lmessages = await getLocalChats(query);
      const payload = {};
      const convertedMsgs = realmToJson(Lmessages);
      // getUniqueMessages;
      const uniqueMsgs = this.getMessagesNotInState(convertedMsgs);
      payload[key] = uniqueMsgs;

      this.props.prependMsgsToBroadcast(payload);
    } catch (e) {
      Alert.alert(e.message);
    }
  };

  render() {
    const {trip, user} = this.props;

    const key = trip._id;
    let messages;

    try {
      messages = this.props.broadcastMessages.messages[key];
    } catch (e) {
      messages = [];
    }

    const name = `${capitalize(user.first_name)} ${capitalize(user.last_name)}`;

    const userDetails = {_id: user._id, avatar: user.avatar, name};
    const role = this.state.user?.role;
    const {textInputProps, textInputPlaceholder} = getInputProp(role);

    return (
      <SafeAreaView style={styles.container}>
        <Header title="Broadcast" />
        {/* end custom header */}
        {/* <TouchableOpacity onPress={() => deleteLocalChats('')}>
          <Text>delete</Text>
        </TouchableOpacity> */}
        <AlertMessage />
        <GiftedChat
          messages={messages}
          onSend={this.onSend}
          user={userDetails} // TODO: Change this ID to something better suited
          loadEarlier
          renderUsernameOnMessage
          onLongPress={this.onLongPress}
          textInputProps={textInputProps}
          placeholder={textInputPlaceholder}
          onLoadEarlier={this.onLoadEarlier}
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

mapStateToProps = state => {
  return {
    broadcastMessages: state.ListBroadcastReducer,
    trip: state.TripReducer.trip,
  };
};

export default connect(
  mapStateToProps,
  {
    appendToBroadcast,
    setBroadcastMessages,
    updateAMessage,
    prependMsgsToBroadcast,
    changeTripBroadcastUnreadNotification,
  },
)(BroadcastChats);

const styles = StyleSheet.create({
  avatar: {width: 40, height: 40, borderRadius: 20},
  container: {
    flex: 1,
    // justifyContent: 'center',
  },

  centerIcon: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 15,
    paddingLeft: 10,
    // paddingTop: 20,
  },
});

/* eslint-disable prettier/prettier */
/* eslint-disable curly */
/* eslint-disable handle-callback-err */
/* eslint-disable no-undef */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  ScrollView,
  Alert,
  TouchableOpacity,
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import PushNotification from 'react-native-push-notification';
import {Bubble, GiftedChat} from 'react-native-gifted-chat';

import firebase from 'firebase';
import {Actions} from 'react-native-router-flux';
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade,
} from 'rn-placeholder';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import * as RNFS from 'react-native-fs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {
  capitalize,
  handleError,
  addFirebaseListerDetails,
  removeFirebaseListenerByRef,
  generateRandomStrings,
  uploadFileToFirebase,
  getUserFromAsyncStorage,
} from '../../resources/utils';
import {theme} from '../../constants';
// import {Text} from '../../UI';
import {getUrl} from '../../resources/controllers/url';
import {
  postWithAuth,
  getWithAuth,
} from '../../resources/controllers/data/index';
import {
  addToUserConversations, // adds to the conversatio
  setConversations, //replaces the conversation
  updateMessage, //updates a single message status to received
  resetChatlistUnread, // to update the chatlist message unread to 0
  clearContactChats, // clear all chats for this contact from state
  changeTripsUnreadNotification, // set wether to show unread indicator badge on messages icon
} from '../../actions/AppActions';
import {
  getLocalChats,
  updateRealmData,
  updateLocalChats,
  // deleteLocalChats,
} from '../../db/controllers/ChatsController';
import {addTrip} from '../../actions/TripActions';
import {realmToJson} from '../../resources/utils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RnBgTask from 'react-native-bg-thread';
import {updateLocalChatsList} from '../../db/controllers/ChatsListController';
import emitter from '../../globals/events';
import {
  validateImages,
  pickSingleImage,
} from '../../resources/utils/imageUploader';
import {onPressPhoneNumber, saveToDisk} from '../../globals/helpers';
import {MessageImage, Header, UploadDisplay} from '../../globals/components';
import {getInputProp} from './helpers';

class Chat extends Component {
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
    /* Very Important  DO NOT DELETE THIS VARIABLES */
    // They are set to this so they can be accessed outside the `sendMessageInTrip` method that assigned values to them.
    this.msgInContactNodeKey = '';
    this.msgInUserNodeKey = '';
    /* End */

    const {trip, participant, user} = this.props;
    /*
        If you access chats from the contacts it will have participants.userId,
        if you access it from chat list contacts object w
        will not be contained in articiapnat.user_id
      */
    this.contact = participant.user_id ? participant.user_id : participant;

    this.contactId = this.contact._id;
    this.tripId = trip._id;
    this.userId = user._id;
    this.id_key = `${this.tripId}-${this.userId}-${this.contactId}`;
    this.contact_id_key = `${this.tripId}-${this.contactId}-${this.userId}`;
    this.usersFullName = `${user.first_name} ${user.last_name}`;
  }

  _handleCustomEvent = data => {
    const {tripId, contactId} = data;
    if (this.tripId !== tripId) {
      const clickedTrip = this.props.trips.find(el => el._id === tripId);
      if (!clickedTrip) {
        return;
      }
      this.props.addTrip(clickedTrip);

      Actions.MainScreen({route: 1}); // route to messages tab on MainScreen.
    } else {
      if (this.contactId !== contactId) {
        Actions.MainScreen({route: 1});
      }
    }
  };

  _handleClearNofication = () => {
    PushNotification.getDeliveredNotifications(notifs => {
      const thisChatNotifs = notifs.filter(eachNotif => {
        const {page_to_open, tripId, title} = eachNotif;
        return (
          page_to_open === 'trip' &&
          tripId === this.tripId &&
          title === this.usersFullName
        );
      });
      const identifiers = thisChatNotifs.map(el => el.identifier);
      if (identifiers && identifiers.length > 0) {
        PushNotification.removeDeliveredNotifications(identifiers);
      }
    });
  };

  getUniqueState(messagesArr) {
    const uniqueMsgs = [];
    messagesArr.forEach(eachMessage => {
      if (!this.messagesDict[eachMessage._id]) {
        this.messagesDict[eachMessage._id] = true;
        uniqueMsgs.push(eachMessage);
      }
    });

    return uniqueMsgs;
  }

  isMessageInState(messageId) {
    return !!this.messagesDict[messageId];
  }
  addToDict(messageId) {
    this.messagesDict[messageId] = true;
  }

  async componentDidMount() {
    Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    const user = await getUserFromAsyncStorage();
    this.setState({user});
    this.messagesDict = {};

    PushNotification.getDeliveredNotifications(notifs => {
      const thisChatNotifs = notifs.filter(eachNotif => {
        const {page_to_open, tripId, title} = eachNotif;
        return (
          page_to_open === 'trip' &&
          tripId === this.tripId &&
          title === this.usersFullName
        );
      });
      const identifiers = thisChatNotifs.map(el => el.identifier);
      if (identifiers && identifiers.length > 0) {
        PushNotification.removeDeliveredNotifications(identifiers);
      }
    });

    // Register custom event listener
    emitter.on('CURRENT_ROUTE_CHAT', this._handleCustomEvent);
    emitter.on('NOTIFY_CHAT_TO_CLEAR', this._handleClearNofication);

    RnBgTask.runInBackground(async () => {
      try {
        // firebase.database().ref(`/messages/${this.tripId}/${this.userId}/${this.contactId}`).off()
        const query = `id_key = "${this.id_key}" OR id_key = "${
          this.contact_id_key
        }" SORT(createdAt DESC)`;

        const messages = await getLocalChats(query);

        const dataToSend = {};
        const lastMessage = messages[0];
        let startAt;
        if (lastMessage) {
          const offset = 500;
          startAt = lastMessage.createdAt + offset;
        }
        const plainArr = realmToJson(messages);
        dataToSend[this.id_key] = plainArr;
        // Replace conversation with this
        this.props.setConversations(dataToSend);

        // Update firebase read receipt to delivered if not already delivered
        const filter = el => el.status !== 'received' && el.type === 'receive';
        const msgToChangeStatus = messages.filter(filter);

        if (msgToChangeStatus && msgToChangeStatus.length > 0) {
          // Update firebase chat status
          await this.updateMessageStatus(
            this.tripId,
            this.userId,
            this.contactId,
            plainArr,
          );
          /***  Update data in local db.
           * 'updateRealmData' takes a relam object and updates it.
           * The added advantage is that it takes advantage of how realm works.
           * Which means updates without making another query to get the data to be updated
           */
          await updateRealmData(msgToChangeStatus, {status: 'received'});
          const notifDetails = {};
          notifDetails[this.tripId] = false;
          this.props.changeTripsUnreadNotification(notifDetails);
        }
        // Listen for new messages to come from contact
        this.listenForNewMessages(
          this.tripId,
          this.userId,
          this.contactId,
          startAt,
        );

        // reset chatlist unread count
        this.resetChatlistUnread(this.tripId, this.userId, this.contactId);
      } catch (e) {
        Alert.alert('Failed', e.message || 'Could not get current user');
      }
    });
  }

  _keyboardDidShow = e => {
    this.setState({inputPosition: e.endCoordinates.height});
  };

  _keyboardDidHide = e => {
    this.setState({inputPosition: 0});
  };

  componentWillUnmount() {
    Keyboard.removeListener('keyboardDidShow', this._keyboardDidShow);
    Keyboard.removeListener('keyboardDidHide', this._keyboardDidHide);
    emitter.removeListener('NOTIFY_CHAT_TO_CLEAR', this._handleClearNofication);
    emitter.removeListener('CURRENT_ROUTE_CHAT', this._handleCustomEvent);

    this.props.clearContactChats(this.id_key);
    //Off firebase listeners
    if (this.refUrl) removeFirebaseListenerByRef(this.refUrl);
  }

  renderPlaceHolder() {
    return (
      <ScrollView contentContainerStyle={{padding: theme.sizes.padding}}>
        {[1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12].map(el => (
          <Placeholder
            key={`${el}`}
            Animation={Fade}
            Left={PlaceholderMedia}
            style={{marginBottom: 20}}
            // Right={PlaceholderMedia}
          >
            <PlaceholderLine style={styles.left} width={80} />
            <PlaceholderLine style={styles.right} width={20} />
          </Placeholder>
        ))}
      </ScrollView>
    );
  }

  getFirebaseRef(url) {
    return firebase.database().ref(url);
  }

  listenForNewMessages = (tripId, userId, contactId, startAt) => {
    const refNode = `/messages/${tripId}/${userId}/${contactId}`;
    let msgRef = this.getFirebaseRef(refNode);

    if (startAt) {
      msgRef = msgRef.orderByChild('createdAt').startAt(startAt);
    }

    msgRef.on('child_added', async snapshot => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();
      const message = [data];
      const dataToSend = {};
      dataToSend[this.id_key] = message;
      //Append to conversations
      this.props.addToUserConversations(dataToSend);
      if (data.type === 'receive') {
        if (data.status !== 'received') {
          try {
            await this.updateMessageStatus(tripId, userId, contactId, data);
            // note we dont need to save to local because this is being done in the event handler at App actions
            // reset chatlist unread count
            this.resetChatlistUnread(tripId, userId, contactId);
            // D
            const notifDetails = {};
            notifDetails[tripId] = false;
            this.props.changeTripsUnreadNotification(notifDetails);
          } catch (e) {
            handleError(e);
          }
        }
      }
    });

    msgRef.on('child_changed', async snapshot => {
      try {
        if (!snapshot.exists()) return;

        const data = snapshot.val();

        if (data.type === 'send' && data.status === 'received') {
          const dataToSend = {};
          dataToSend[this.id_key] = {_id: data._id};
          await this.props.updateMessage(dataToSend);
          // UPDATE LOCAL DATA
          updateLocalChats(`_id = "${data._id}"`, {status: 'received'});
        }
      } catch (e) {}
    });
    //store ref to listener
    this.refUrl = refNode;
    addFirebaseListerDetails({from: 'chats', refUrl: this.refUrl});
  };

  resetChatlistUnread(tripId, userId, contactId) {
    const userChatlistKey = `${tripId}-${userId}`;
    const payload = {};
    payload[userChatlistKey] = {contactId: contactId};
    this.props.resetChatlistUnread(payload);
    updateLocalChatsList(`_id = "${contactId}"`, {unread_count: 0});
  }

  updateMessageStatus(tripId, userId, contactId, messages) {
    if (!Array.isArray(messages)) messages = [messages];
    // Alert.alert('no')

    const updates = {};

    messages.forEach(message => {
      // const key = `/messages/${tripId}/${userId}/${contactId}/${
      //   message.firebase_key
      // }`;
      const {_id, createdAt, text, user, firebase_key} = message;
      const key = `/messages/${tripId}/${contactId}/${userId}/${firebase_key}`;
      const key2 = `/messages/${tripId}/${userId}/${contactId}/${firebase_key}`;
      /***
       * Here we are setting the status to recieved and also the type to send
       * we have to explicitly set the type because the message obj has type = 'receive'
       * This is because the message obj is from the current users message listening node,
       * ...which gets received as type
       */
      // Inform my contact that i have read her message to control double check marks
      const status = 'received';
      const type = 'send';
      updates[key] = {_id, createdAt, type, status, text, user, firebase_key};
      // Inform me that i have read this message to remove unread messages
      const type2 = 'receive';
      updates[key2] = {
        _id,
        createdAt,
        type: type2,
        status,
        text,
        user,
        firebase_key,
      };
    });

    return firebase
      .database()
      .ref()
      .update(updates);
  }

  sendMessageInTrip = async (messages, tripId, participant, user) => {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }
    /* If you access chats from the contacts it will have participants.userId,
    if you access it from chat list contacts object w
    will not be contained in articiapnat.user_id*/
    const createdAt = firebase.database.ServerValue.TIMESTAMP;

    let contact = participant;
    if (participant.user_id) {
      contact = participant.user_id;
    }

    const {
      _id: contactId,
      email: contactEmail,
      avatar: contactAvatar,
      role: contactRole,
    } = contact;

    const {
      text,
      user: currUser,
      _id: messageId,
      image,
      imageLocalPath,
    } = messages[0];
    // const createdAt = created_at;
    // use firebase createdAt to ensure accuracy
    const {
      _id: userId,
      email: userEmail,
      avatar: userAvatar,
      role: userRole,
    } = user;
    const userName = `${capitalize(user.first_name)} ${capitalize(
      user.last_name,
    )}`;
    // Set Name and Avatar to current user
    currUser.avatar = userAvatar;
    currUser.name = userName;
    // Push to firebase (send and receive)
    // NOTE: This variable is used else where do not change.
    this.msgInUserNodeKey = this.getFirebaseRef(
      `/messages/${tripId}/${userId}/${contactId}`,
    ).push().key;
    this.msgInContactNodeKey = this.getFirebaseRef(
      `/messages/${tripId}/${contactId}/${userId}`,
    ).push().key;

    const msgInUserNode = {
      _id: messageId,
      firebase_key: this.msgInContactNodeKey,
      text: text,
      type: 'send',
      user: currUser,
      createdAt,
      status: 'delivered', // e.g delivered, received
    };

    const msgInContactNode = {
      ...msgInUserNode,
      type: 'receive',
      firebase_key: this.msgInContactNodeKey,
    };
    // ther is duplications of keys to handle here later to be more efficicent
    const conInUserNode = {
      _id: contactId,
      senderId: userId,
      receiverId: contactId,
      msgId: messageId,
      role: contactRole,
      first_name: capitalize(contact.first_name),
      last_name: capitalize(contact.last_name),
      avatar: contactAvatar,
      email: contactEmail,
      createdAt,
      lastMessage: messages[0].text,
    };

    const conInContactNode = {
      _id: userId,
      senderId: userId,
      receiverId: contactId,
      msgId: messageId,
      role: userRole,
      first_name: capitalize(user.first_name),
      last_name: capitalize(user.last_name),
      avatar: userAvatar,
      email: userEmail,
      createdAt,
      lastMessage: messages[0].text,
    };

    if (image) {
      msgInUserNode.image = image;
      msgInContactNode.image = image;
      conInUserNode.image = image;
      conInContactNode.image = image;
    }

    if (imageLocalPath) {
      msgInUserNode.imageLocalPath = imageLocalPath;
      msgInContactNode.imageLocalPath = imageLocalPath;
      conInUserNode.imageLocalPath = imageLocalPath;
      conInContactNode.imageLocalPath = imageLocalPath;
    }

    const updates = {};
    updates[
      `/messages/${tripId}/${userId}/${contactId}/${this.msgInContactNodeKey}`
    ] = msgInUserNode;
    // updates[
    //   `/messages/${tripId}/${contactId}/${userId}/${this.msgInUserNodeKey}`
    // ] = msgInContactNode;
    updates[
      `/messages/${tripId}/${contactId}/${userId}/${this.msgInContactNodeKey}`
    ] = msgInContactNode;
    updates[
      `/user_conversations/${tripId}/${userId}/${contactId}`
    ] = conInUserNode;
    updates[
      `/user_conversations/${tripId}/${contactId}/${userId}`
    ] = conInContactNode;
    return firebase
      .database()
      .ref()
      .update(updates);
  };

  getUserActiveTokens = userId => {
    return new Promise((resolve, reject) => {
      const baseUrl = getUrl('devices');
      const url = `${baseUrl}/users/${userId}/tokens/active`;

      getWithAuth(url)
        .then(res => {
          const {data: tokenData} = res;
          resolve(tokenData.data);
        })
        .catch(reject);
    });
  };

  sendPushNotification = (message, tripId, contact) => {
    if (Array.isArray(message)) {
      message = message[0];
    }
    const contactId = contact._id;
    const {_id: messageId, text, user: currUser, createdAt} = message;
    const cOU = {...currUser};
    const name = cOU.name;
    const baseUrl = getUrl('users');
    const url = `${baseUrl}/${contactId}/notifications`;
    // Set Name and Avatar to current user
    currUser.avatar = this.props.user.avatar;
    currUser.name = this.props.user.username;
    const date_created = `${+createdAt}`; // convert to string because Firebase Cloud Messaging only accepts strings.
    const data = {
      page_to_open: 'trip',
      _id: messageId,
      tripId,
      contactId,
      firebase_key: this.msgInContactNodeKey,
      text,
      type: 'receive',
      user: JSON.stringify(currUser),
      createdAt: date_created,
      status: 'delivered',
    };
    const maxNotifBody = 30;
    const notifBody =
      text.length > maxNotifBody
        ? `${text.substring(1, maxNotifBody)}...`
        : text;

    const notification = {
      // title: contactName,
      title: name,
      body: notifBody,
      // badge: "1",
      // imageUrl,
    };

    const body = {
      // tokens,
      notification,
      data,
    };

    return postWithAuth(url, body);
  };

  onSend = async (messages = []) => {
    try {
      // Contact: This is the contact's user object*/
      const {
        participant: contact,
        trip: {_id: tripId},
      } = this.props;

      const user = await getUserFromAsyncStorage();

      await this.sendMessageInTrip(messages, tripId, contact, user);

      await this.sendPushNotification(messages, tripId, contact);
    } catch (e) {
      // RNToasty.Normal({title: 'Please check your connection!'});
      console.log(e);
      handleError(e);
    }
  };
  renderTicks = currentMessage => {
    let iconName;
    if (currentMessage.user?._id !== this.props?.user?._id) {
      return;
    }
    switch (currentMessage.status) {
      case 'delivered':
        iconName = 'done';
        break;
      case 'received':
        iconName = 'done-all';
        break;
      default:
        iconName = 'done';
    }

    return (
      <View style={styles.tickView}>
        <MaterialIcons
          name={iconName}
          // color={theme.colors.white}
          color="lightgreen"
          size={16}
        />
      </View>
    );
  };

  sendImageMsg = async () => {
    try {
      this.setState({uploadingImage: true});
      Keyboard.dismiss();
      const imageUrl = await this.handleImageUpload(this.state.imageToUpload);
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
    } catch (e) {
      Alert.alert(e.message);
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
    } catch (e) {
      Alert.alert(e.message);
    }
  };

  handleImageUpload = async imageObj => {
    const validOptions = {
      max_size_per_image: 10, //
      max_no_of_images: 1,
      total_images_size: 10,
    };

    const result = validateImages(imageObj, validOptions);
    if (result.error) {
      throw new Error(result.message);
    }

    //   this.setState({imageUploadLoading: true});
    const refNode = `/user_assets/${imageObj.filename}`;

    const imageUrl = await uploadFileToFirebase(imageObj, refNode);

    return imageUrl;
  };

  handleCloseModal = () => {
    this.setState({showImageModal: false});
  };

  storeToDevice = async currentMessage => {
    try {
      const message = {...currentMessage};
      const {_id, image} = message;
      const path = await saveToDisk(image);
      if (path) {
        const dataToSend = {};
        const query = `_id = "${_id}"`;
        await updateLocalChats(query, {imageLocalPath: path});
        message.imageLocalPath = path;
        const tripId = this.props.trip?._id;
        dataToSend[tripId] = message;
        this.props.updateAMessage(dataToSend);
      }
    } catch (e) {}
  };

  renderActions = props => {
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
        user={this.state.user}
      />
    );
  };

  renderBubble = bubbleProps => {
    return (
      <Bubble
        {...bubbleProps}
        wrapperStyle={{
          left: {
            backgroundColor: '#F6F6F6',
          },
          right: {
            backgroundColor: theme.colors.secondary,
          },
        }}
      />
    );
  };

  render() {
    const messages = this.props.messages[this.id_key] || [];
    const populatedInUserId = this.props.participant.user_id;
    // const avatar = populatedInUserId
    //   ? this.props.participant.user_id.avatar
    //   : this.props.participant.avatar;

    const name = populatedInUserId
      ? `${this.props.participant.user_id.first_name} ${
          this.props.participant.user_id.last_name
        }`
      : `${this.props.participant.first_name} ${
          this.props.participant.last_name
        }`;

    const contactDetail =
      this.props.participant?.user_id || this.props.participant;
    const {textInputProps, textInputPlaceholder} = getInputProp(
      contactDetail,
      this.state.user?.role,
    );
    return (
      <SafeAreaView style={styles.container}>
        <Header title={name} />
        {/* <TouchableOpacity onPress={() => deleteLocalChats('')}>
          <Text>delete</Text>
        </TouchableOpacity> */}
        <GiftedChat
          messages={messages}
          onSend={this.onSend}
          user={{_id: this.props?.user?._id}}
          loadEarlier={true}
          renderTicks={this.renderTicks}
          isAnimated
          // bottomOffset={Platform.OS === 'ios' ? 49 : 0}
          renderLoading={() => <ActivityIndicator color="black" size="large" />}
          renderActions={this.renderActions}
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
          renderMessageImage={this.renderMessageImage}
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
    trip: state.TripReducer.trip,
    trips: state.TripReducer.trips,
    userPermissions: state.TripReducer.userPermissions,
    userSubPermissions: state.TripReducer.userSubPermissions,
    messages: state.ListConversation.messages,
  };
};

export default connect(
  mapStateToProps,
  {
    addToUserConversations,
    addTrip,
    setConversations,
    updateMessage,
    resetChatlistUnread,
    clearContactChats,
    changeTripsUnreadNotification,
  },
)(Chat);

const styles = StyleSheet.create({
  avatar: {width: 40, height: 40, borderRadius: 20},
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
  container: {
    flex: 1,
  },
  tickView: {
    flexDirection: 'row',
    marginRight: 10,
  },
  left: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: theme.colors.gray2,
  },
  right: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'blue',
  },
  // jsut dded
  centerIcon: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 15,
    paddingLeft: 10,
    // paddingTop: 20,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePreviewContainer: {
    // marginTop: 100,
    // backgroundColor: 'black',
    height: '100%',
    // flexDirection: 'column'
  },
  inputField: {
    // marginTop: 100,

    width: '100%',
    borderRadius: 0,
    margin: 0,
    color: 'white',
    borderWidth: 0,
    paddingLeft: 20,
    // fontSize: 18,
  },
  texInputContainer: {
    // backgroundColor: 'rgba(0, 0, 0, 0.6)',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    // flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
    // height: 50,
    width: '100%',
  },
  imageSendBtnContainer: {
    position: 'absolute',
    top: -30,
    right: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnContainer: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'center',
    // alignItems: 'center',
    top: 0,
    // top: getStatusBarHeight(),
    backgroundColor: 'black',

    height: 80,
    width: '100%',
  },
  backBtn: {
    paddingTop: getStatusBarHeight(),
    width: 45,
    paddingLeft: 10,
    // height: 40,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
  },
});

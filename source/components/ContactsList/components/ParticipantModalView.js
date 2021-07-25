import React from 'react';
import {
  View,
  Image,
  Platform,
  StyleSheet,
  Modal,
  Dimensions,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {RNToasty} from 'react-native-toasty';
import {Actions} from 'react-native-router-flux';

import {Button, Text, Badge} from '../../../UI';
import {theme} from '../../../constants';
import {capitalize, formatFullDateTime} from '../../../resources/utils';

import ListItem from './ListItem';

const statusBarHeight = getStatusBarHeight();
const {width} = Dimensions.get('window');

function ParticipantModalView(props) {
  const {
    user,
    showParticipantPermissions,
    handleCloseModal,
    participant,
    trip,
  } = props;
  async function handleSendMail(email) {
    try {
      const url = `mailto:${email}`;
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(
          'Error',
          'This device does not support opening a mail client',
        );
      }
      await Linking.openURL(url);
    } catch (e) {
      console.log(e);
    }
  }

  function handleParticipantClick() {
    // if modal is open
    handleCloseModal();
    if (user._id === participant?.user_id?._id) {
      RNToasty.Normal({
        title: 'You cannot message yourself!',
      });
      return;
    }
    Actions.chat({
      participant: participant,
      user: user,
    });
  }
  let avatar = '';
  let name = '';
  let email = '';
  let dateJoined = '';
  let role = '';
  let verified;
  let schoolName = '';
  let address = '';
  let status = '';

  try {
    avatar = participant.user_id.avatar;
    email = participant.user_id.email;
    name = `${capitalize(participant.user_id.first_name)} ${capitalize(
      participant.user_id.last_name,
    )}`;
    role =
      participant.user_id?.role === 'teacher' ? 'Chaperone' : 'Student/Teacher';
    const organisation = trip.organisation;
    schoolName = organisation?.name;
    verified = participant.user_id?.verified ? 'Verified' : 'Unverified';
    address = `${organisation?.street_address || ''} ${organisation?.city ||
      ''} ${organisation?.state || ''}`;
    status = organisation?.status;
    dateJoined = formatFullDateTime(new Date(participant.created_at));
  } catch (e) {
    // fail silently
  }

  return (
    <Modal
      animationType="slide"
      visible={showParticipantPermissions}
      onRequestClose={handleCloseModal}>
      <ScrollView style={styles.modalView}>
        <StatusBar
          animated={true}
          backgroundColor={theme.colors.primary}
          barStyle="dark-content"
        />
        <View style={styles.topContainer}>
          <Button style={styles.btnStyle} onPress={handleCloseModal}>
            <MaterialIcons
              name="arrow-back"
              color={theme.colors.white}
              size={theme.sizes.font * 2.5}
            />
          </Button>
          <View style={styles.topContent}>
            <Image source={{uri: avatar}} style={styles.avatar} />
            <View style={styles.contentInfo}>
              <Text white semibold size={20} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.text} numberOfLines={1}>
                {email}
              </Text>
              <Text style={styles.text} numberOfLines={1}>
                {role}
              </Text>
              <Text style={styles.text} numberOfLines={1}>
                {verified}
              </Text>
              <Text style={styles.text}>{dateJoined}</Text>
              <View style={styles.divider}>
                <View style={styles.dividerContent}>
                  <Button
                    style={styles.messageBtn}
                    onPress={() => handleSendMail(email)}>
                    <Text bold color={theme.colors.white} center>
                      SEND EMAIL
                    </Text>
                  </Button>
                  <View style={styles.messageBtnDot}>
                    <Badge size={5} color="white" />
                  </View>

                  <Button
                    style={styles.messageBtn}
                    onPress={handleParticipantClick}>
                    <Text bold color={theme.colors.white} center>
                      MESSSAGE PARTICIPANT
                    </Text>
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View>
          <ListItem
            leftIcon={
              <MaterialIcons
                color={theme.colors.primary}
                name="email"
                size={30}
              />
            }
            mainText={email}
          />
          <ListItem
            leftIcon={
              <MaterialIcons
                color={theme.colors.primary}
                name="place"
                size={30}
              />
            }
            mainText={schoolName}
            subText={address}
            subText2={status}
          />
        </View>
      </ScrollView>
    </Modal>
  );
}

export default ParticipantModalView;

const styles = StyleSheet.create({
  avatar: {width: 60, height: 60, borderRadius: 30},
  modalView: {
    ...Platform.select({
      ios: {
        paddingTop: statusBarHeight,
      },
    }),
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    paddingTop: 20,
  },
  topContent: {
    width: width - 80,
  },
  btnStyle: {
    width: 80,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  contentInfo: {
    marginTop: 20,
  },
  text: {
    marginVertical: 5,
    fontWeight: '300',
    color: 'white',
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    borderColor: 'white',
    marginTop: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  dividerContent: {
    width: 300,
    borderColor: 'red',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageBtn: {
    borderRadius: 0,
    backgroundColor: 'transparent',
    padding: 0,
  },
  messageBtnDot: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 0,
  },
});

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Text} from '../../../UI';
import {formatPhoneNumber} from '../../../resources/utils';

function Item(props) {
  const {item, handleEdit, deleteContent, user, editMode} = props;
  const showOptions = user?.role === 'teacher' && editMode;

  async function onPressPhoneNumber(phoneNum) {
    try {
      let phoneNumberToCall = '';

      if (Platform.OS === 'android') {
        phoneNumberToCall = `tel:${phoneNum}`;
      } else {
        phoneNumberToCall = `telprompt:${phoneNum}`;
      }

      const supported = await Linking.canOpenURL(phoneNumberToCall);
      if (!supported) {
        return;
      }

      Linking.openURL(phoneNumberToCall);
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <View key={item?._id} style={styles.content}>
      {showOptions && (
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={styles.editIconContainer}>
          <MaterialIcons name="more-horiz" size={20} />
        </TouchableOpacity>
      )}

      <View style={styles.contactCard}>
        {!!item.name && (
          <View style={[styles.item, styles.flexCenter]}>
            <Text h3 center bold>
              {item.name}
            </Text>
          </View>
        )}
        {!!item.title && (
          <View style={[styles.item, styles.flexCenter]}>
            <Text h3 center>
              {item.title}
            </Text>
          </View>
        )}
        {!!item.phoneNo && (
          <View style={[styles.item, styles.flexCenter]}>
            <Text
              onPress={() => onPressPhoneNumber(item.phoneNo)}
              color="#87ceeb"
              center>
              {formatPhoneNumber(item.phoneNo)}
            </Text>
          </View>
        )}
        {!!item.address && (
          <View style={[styles.item, styles.flexCenter]}>
            <Text>{item.address}</Text>
          </View>
        )}
        {!!item.content && (
          <View style={[styles.item, styles.flexCenter]}>
            <Text>{item.content}</Text>
          </View>
        )}
        <View style={[styles.item, styles.flexCenter]}>
          <Text>{item.other}</Text>
        </View>
      </View>

      {showOptions && (
        <TouchableOpacity
          onPress={() => deleteContent(item?._id)}
          style={styles.removeIconContainer}>
          <MaterialIcons name="remove-circle-outline" size={20} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default Item;

const styles = StyleSheet.create({
  formItem: {
    marginBottom: 15,
    // borderWidth: 1,
    // height: 100,
  },

  flexCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mlAdjust: {
    marginLeft: 20,
  },

  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignSelf: 'center',
    marginTop: 10,
    width: 230,
  },

  iconContainer: {
    marginRight: 10,
  },
  removeIconContainer: {
    marginLeft: 30,
  },
  editIconContainer: {
    marginRight: 30,
  },
  contactCard: {
    // borderWidth: 1,
  },
  centeredView: {
    marginTop: 100,
    margin: 20,
  },
  formTop: {
    marginTop: 20,
  },
});

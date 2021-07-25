/* eslint-disable no-catch-shadow */
/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  Alert,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  FlatList,
  Platform,
  Modal,
  StatusBar,
  SafeAreaView,
  ScrollView,
  View,
  Dimensions,
} from 'react-native';
import _ from 'lodash';
import {Icon, Picker} from 'native-base';
import {getUniqueId} from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import jwt_Decode from 'jwt-decode';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {Actions} from 'react-native-router-flux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {
  Autocomplete,
  withKeyboardAwareScrollView,
} from 'react-native-dropdown-autocomplete';

import {Button, Block, Input, Text, Card, Header} from '../UI';
import {subYears} from '../resources/utils/dateUtils';
import {theme} from '../constants';
import {getUrl} from '../resources/controllers/url';
import {get, post} from '../resources/controllers/data/index';
import {
  validateEmail,
  setUserToken,
  handleError,
  formatDate,
} from '../resources/utils';
import {postWithAuth} from '../resources/controllers/data';
import {TouchableOpacity} from 'react-native-gesture-handler';

const {width} = Dimensions.get('window');
const statusBarHeight = getStatusBarHeight();

function S(props) {
  const [apiUrl, setApiUrl] = useState('');
  function handleSelectItem(item, index) {
    const {onDropdownClose} = props;
    onDropdownClose();
    console.log(item);
  }

  const leftItems = [
    {
      iconName: 'arrow-back',
      showCondition: true,
      onPress: Actions.pop,
      style: {color: theme.colors.primary},
    },
  ];

  const {scrollToInput, onDropdownClose, onDropdownShow} = props;
  const orgUrl = `${getUrl('organisations')}`;

  function handleTextChange(txt) {
    setApiUrl(`${orgUrl}?name=${txt}`);
  }

  return (
    <View style={styles.autocompletesContainer}>
      <SafeAreaView>
        <Autocomplete
          key="12344"
          inputContainerStyle={styles.inputContainer}
          style={styles.autoCompleteInput}
          scrollToInput={ev => scrollToInput(ev)}
          handleSelectItem={(item, id) => handleSelectItem(item, id)}
          onDropdownClose={() => onDropdownClose()}
          onDropdownShow={() => onDropdownShow()}
          // onChangeText={handleTextChange}
          // renderIcon={() => (
          //   <Ionicons
          //     name="ios-add-circle-outline"
          //     size={20}
          //     color="#c7c6c1"
          //     style={styles.plus}
          //   />
          // )}
          fetchDataUrl={orgUrl}
          minimumCharactersCount={2}
          highlightText
          valueExtractor={item => item.name}
          // rightContent
          // rightTextExtractor={item => item.properties}
        />
      </SafeAreaView>
    </View>
  );
}

export default withKeyboardAwareScrollView(S);

const styles = StyleSheet.create({
  autoCompleteInput: {
    maxHeight: 40,
  },
  inputContainer: {
    display: 'flex',
    flexShrink: 0,
    flexGrow: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#c7c6c1',
    paddingVertical: 13,
    paddingLeft: 12,
    paddingRight: '5%',
    width: '100%',
    justifyContent: 'flex-start',
  },
  autocompletesContainer: {
    paddingTop: 0,
    zIndex: 1,
    width: '100%',
    paddingHorizontal: 8,
  },
});

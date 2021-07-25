import {AsyncStorage, Alert} from 'react-native';
import jwt_decode from 'jwt-decode';
import {RNToasty} from 'react-native-toasty';
import storage from '@react-native-firebase/storage';
import firebase from 'firebase';

import {keys} from '../../constants';
import dateUtils from './dateUtils';

export const capitalize = s => {
  if (typeof s !== 'string') {
    return '';
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const getUserFromAsyncStorage = async () => {
  const token = await AsyncStorage.getItem(keys.TOKEN_KEY);
  if (!token) {
    throw new Error('Credential is not found');
  }
  const user = jwt_decode(token);
  return user;
};
export const hasSeenReadReceiptsMessage = async () => {
  const message = await AsyncStorage.getItem(keys.READ_RECEIPT_KEY);

  return message;
};
export const setHasSeenReadReceiptMessage = async () => {
  await AsyncStorage.setItem(keys.READ_RECEIPT_KEY, 'yes');
};

export async function addFirebaseListerDetails(detail) {
  try {
    const isArray = Array.isArray(detail);
    detail = isArray ? detail : [detail];
    let listeners = JSON.stringify(detail);
    const listenerDetails = await AsyncStorage.getItem(keys.LISTENER_KEY);
    if (!listenerDetails) {
      await AsyncStorage.setItem(keys.LISTENER_KEY, listeners);
    } else {
      const parsedData = JSON.parse(listenerDetails);
      const foundIndex = parsedData.findIndex(
        el => el.refUrl === detail.refUrl,
      );

      if (foundIndex === -1) {
        listeners = isArray
          ? [...parsedData, ...detail]
          : [...parsedData, detail];
        await AsyncStorage.setItem(
          keys.LISTENER_KEY,
          JSON.stringify(listeners),
        );
      }
    }
  } catch (e) {
    console.log(e.message);
  }
}

export const noContractOrExpiredContract = user => {
  let noValidContract = true;

  try {
    if (Number(user?.contractExpiry) > +new Date()) {
      noValidContract = false;
    }
  } catch (e) {}

  return noValidContract;
};

export async function removeAllFirebaseListeners() {
  try {
    const listenerDetails = await AsyncStorage.getItem(keys.LISTENER_KEY);
    if (listenerDetails && Array.isArray(JSON.parse(listenerDetails))) {
      const arrOfListeners = JSON.parse(listenerDetails);
      arrOfListeners.forEach(listenerData => {
        firebase
          .database()
          .ref(listenerData.refUrl)
          .off();
      });
    }
    await AsyncStorage.removeItem(keys.LISTENER_KEY);
  } catch (e) {
    // console.log(e.messsage);
  }
}

export async function removeFirebaseListenerByRef(refUrl) {
  try {
    const listenerDetails = await AsyncStorage.getItem(keys.LISTENER_KEY);
    if (listenerDetails && Array.isArray(JSON.parse(listenerDetails))) {
      const arrOfListeners = JSON.parse(listenerDetails);
      const listener = arrOfListeners.filter(e => e.refUrl === refUrl);
      console.log(listener);
      listener.forEach(listenerData => {
        firebase
          .database()
          .ref(listenerData.refUrl)
          .off();
      });
      const remainingListener = arrOfListeners.filter(e => e.refUrl !== refUrl);
      await AsyncStorage.setItem(
        keys.LISTENER_KEY,
        JSON.stringify(remainingListener),
      );
    }
  } catch (e) {
    // console.log(e.messsage);
  }
}

export const generateRandomStrings = n => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < n; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

export const validateEmail = email => {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return re.test(email);
};

export const getUserToken = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(keys.TOKEN_KEY)
      .then(token => {
        if (!token) {
          reject(new Error('Credentials not found'));
        } else {
          resolve(token);
        }
      })
      .catch(reject);
  });
};

export const uploadFileToFirebase = async (image, refNode) => {
  const FireBaseStorage = storage();
  const ref = FireBaseStorage.ref(refNode);
  await ref.putFile(image.uri);
  return ref.getDownloadURL();
};

export const getValidator = type => {
  const containsOnlyNumbers = value => {
    try {
      if (typeof value === 'number') {
        value = String(value);
      }
      const numbers = /^[0-9]+$/;
      if (value.match(numbers)) {
        return true;
      }
    } catch (e) {}
    return false;
  };

  const containsSpecialCharacter = value => {
    try {
      if (typeof value === 'number') {
        value = String(value);
      }
      const format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
      if (value.match(format)) {
        return true;
      }
    } catch (e) {}
    return false;
  };
  const containsAnyNumber = value => {
    try {
      if (typeof value === 'number') {
        value = String(value);
      }
      const format = /\d/;
      if (value.match(format)) {
        return true;
      }
    } catch (e) {}
    return false;
  };
  const containsOnlyAlphabets = value => {
    try {
      if (typeof value === 'number') {
        value = String(value);
      }
      const format = /^[a-zA-Z]+$/;
      if (value.match(format)) {
        return true;
      }
    } catch (e) {}
    return false;
  };

  const isEmpty = value => {
    if (!value || value === '') {
      return true;
    }
    return false;
  };

  if (type === 'string') {
    return {
      containsOnlyNumbers,
      containsAnyNumber,
      containsSpecialCharacter,
      isEmpty,
      validateEmail,
      containsOnlyAlphabets,
    };
  }
};

export const setUserToken = token => {
  return new Promise((resolve, reject) => {
    AsyncStorage.setItem(keys.TOKEN_KEY, token)
      .then(() => {
        resolve(true);
      })
      .catch(reject);
  });
};

export const formatPhoneNumber = str => {
  //Filter only numbers from the input
  let cleaned = ('' + str).replace(/\D/g, '');

  //Check if the input is of correct length
  let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }

  return str;
};
// converts a realm object to a plain obj/array
export const realmToOrdinaryData = realmData => {
  const arr = Array.prototype.slice.call(realmData);
  const plainArr = arr.map(realmObject =>
    JSON.parse(JSON.stringify(realmObject)),
  );

  return plainArr;
};
export const realmToJson = realmData => {
  const arr = [];
  for (let i = 0; i < realmData.length; i++) {
    arr.push(JSON.parse(JSON.stringify(realmData[i].toJSON())));
  }

  return arr;
};

export const handleError = (e, type, customErr) => {
  //types 'alert', 'toast','silent', 'log' DEFAULT: Toast
  const displayError = (title, message) => {
    title = title ? title : 'Error ';
    switch (type) {
      case 'alert':
        return () => Alert.alert(title, message);
      case 'toast':
        return () => RNToasty.Normal({title: `${title}: ${message}`});
      case 'log':
        return () => console.log(`${title}: ${message}`);
      case 'silent':
        return () => {};
      default:
        return () => RNToasty.Normal({title: `${title}: ${message}`});
    }
  };
  if (customErr) {
    try {
      const {title, message} = customErr;
      const showErr = displayError(title, message);
      showErr();
    } catch (E) {
      Alert.alert('Error ', 'Could not display the error message');
    }
    return;
  }

  let dataResponseErrMsg, dataErrMsg, errMsg;
  try {
    dataResponseErrMsg = e.response.data.message;
    if (typeof dataResponseErrMsg !== 'string') {
      throw new Error('Err message must be a string');
    }
  } catch (dataErr) {
    try {
      dataErrMsg = e.data.message;
      if (typeof dataErrMsg !== 'string') {
        throw new Error('Err message must be a string');
      }
    } catch (err) {
      errMsg = e.message || 'An Error Ocurred';
    }
  }

  const msg = dataResponseErrMsg || dataErrMsg || errMsg;

  displayError('Error ', msg)();
};

export const getErrorMessage = e => {
  let dataResponseErrMsg, dataErrMsg, errMsg;
  try {
    dataResponseErrMsg = e.response.data.message;
    if (typeof dataResponseErrMsg !== 'string') {
      throw new Error('Err message must be a string');
    }
  } catch (dataErr) {
    try {
      dataErrMsg = e.data.message;
      if (typeof dataErrMsg !== 'string') {
        throw new Error('Err message must be a string');
      }
    } catch (err) {
      errMsg = e.message || 'An Error Ocurred';
    }
  }

  let msg = dataResponseErrMsg || dataErrMsg || errMsg;

  return msg;
};

export const colorStack = [
  {
    inner: 'accent',
    outerRgba: 'rgba(243, 83, 74, 0.2)',
  },
  {
    inner: 'primary',
    outerRgba: 'rgba(10,196,186, 0.2)',
  },
  {
    inner: 'active',
    outerRgba: 'rgba(0, 123, 250, 0.2)',
  },
  {
    inner: 'black',
    outerRgba: 'rgba(0, 0, 0, 0.2)',
  },
  {
    inner: 'tertiary',
    outerRgba: 'rgba(255, 227, 88, 0.2)',
  },
  {
    inner: 'secondary',
    outerRgba: 'rgba(43, 218, 142, 0.2)',
  },
  {
    inner: 'caption',
    outerRgba: 'rgba(188, 204, 212, 0.2)',
  },
  {
    inner: 'stop',
    outerRgba: 'rgba(255, 0, 0, 0.2)',
  },
];

const months = [
  'Jan',
  'Feb',
  'March',
  'April',
  'May',
  'June',
  'July',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function getDayFormat(day) {
  switch (day) {
    case 1:
      var format = 'st';
      break;
    case 2:
      var format = 'nd';
      break;
    case 3:
      var format = 'rd';
      break;
    default:
      var format = 'th';
  }
  return format;
}

export const formatDate = (date, divider, reverse) => {
  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date);
  }

  let day = date.getDate();
  let month = date.getMonth(); //Be careful! January is 0 not 1
  let year = date.getFullYear();

  const monthInString = months[month];

  const dDayFormat = getDayFormat(day);
  if (divider) {
    day = day >= 10 ? day : '0' + day;
    month = month + 1 >= 10 ? month + 1 : '0' + (month + 1);

    return reverse
      ? `${month}${divider}${day}${divider}${year}`
      : `${day}${divider}${month}${divider}${year}`;
  }

  return `${day}${dDayFormat}, ${monthInString} ${year}`;
};
export const formatTime = date => {
  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date);
  }
  let hrs = date.getHours();
  let mins = date.getMinutes(); //Be careful! January is 0 not 1

  if (hrs <= 9) {
    hrs = `0${hrs}`;
  }
  if (mins <= 9) {
    mins = `0${mins}`;
  }

  return `${hrs}:${mins}`;
};

export const formatDateTime = someDate => {
  try {
    if (typeof someDate === 'number' || typeof someDate === 'string') {
      someDate = new Date(someDate);
    }

    if (dateUtils.isToday(someDate)) {
      return formatTime(someDate);
    }

    if (dateUtils.isYesterday(someDate)) {
      return 'Yesterday';
    }

    return formatDate(someDate, '/');
  } catch (e) {
    return '';
  }
};

export const formatFullDateTime = read_at => {
  let day = '';

  if (dateUtils.isToday(read_at)) {
    day = 'Today';
  } else if (dateUtils.isYesterday(read_at)) {
    day = 'Yesterday';
  } else {
    day = formatDate(read_at);
  }

  const theTime = formatTime(read_at);

  return `${day} ${theTime}`;
};

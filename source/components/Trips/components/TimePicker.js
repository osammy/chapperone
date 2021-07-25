import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import RNDateTimePicker from '@react-native-community/datetimepicker';

import {theme} from '../../../constants';

const statusBarHeight = getStatusBarHeight();

function TimePicker({itineraryDate, setTime, openTimePicker}) {
  if (openTimePicker) {
    return (
      <RNDateTimePicker
        testID="dateTimePicker"
        style={styles.datepickerModal} //IOS ONLY
        value={itineraryDate}
        mode="time"
        is24Hour={true}
        display="default"
        onChange={setTime}
      />
    );
  }

  return null;
}

export default TimePicker;

const styles = StyleSheet.create({
  datepickerModal: {
    flex: 1,
    marginTop: statusBarHeight,
  },
  timeBtn: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    backgroundColor: theme.colors.white,
    ...Platform.select({
      android: {
        marginBottom: 1,
        borderBottomColor: 'white',
        borderBottomWidth: 1,
      },
      ios: {
        borderRadius: 0,
        fontWeight: 'bold',
        padding: 1,
      },
    }),
  },
});

import React from 'react';
import {Platform, View, StyleSheet} from 'react-native';
import {Text, Button} from '../../../UI';
import {theme} from '../../../constants';

function DateDisplayBtn(props) {
  const {hasErrors, index, itin, showDatePickerModal, showTimePicker} = props;
  if (Platform.OS === 'ios') {
    return (
      <Button
        style={[styles.timeBtn, hasErrors('time', index)]}
        onPress={() => showDatePickerModal(index)}>
        <Text>{itin.date || ''}</Text>
        <Text>{itin.time || 'Not Set'}</Text>
      </Button>
    );
  }

  return (
    <View>
      <Button
        style={[styles.timeBtn, hasErrors('date', index)]}
        onPress={() => showDatePickerModal(index)}>
        <Text color={theme.colors.white}>{itin.date || ''}</Text>
      </Button>
      <Button
        style={[styles.timeBtn, hasErrors('time', index)]}
        onPress={() => showTimePicker(index)}>
        <Text color={theme.colors.white}>{itin.time || 'Not Set'}</Text>
      </Button>
    </View>
  );
}

export default DateDisplayBtn;

const styles = StyleSheet.create({
  timeBtn: {
    // flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    paddingHorizontal: 1,
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

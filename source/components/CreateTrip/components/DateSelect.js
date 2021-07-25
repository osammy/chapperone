import React from 'react';
import {View, Platform, StyleSheet} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {Text, DateTimePicker} from '../../../UI';
import {theme} from '../../../constants';

function DateSelect(props) {
  const {
    hasErrors,
    showDate,
    handleShowDate,
    value,
    handleDateChange,
    closeDatePicker,
    formatChosenDate,
    editMode,
    title,
  } = props;
  return (
    <View>
      <Text
        semibold
        color={hasErrors ? theme.colors.accent : theme.colors.gray2}>
        {title}
      </Text>
      <DateTimePicker
        show={showDate}
        value={new Date(value)}
        customStyles={{
          datePicker: {
            backgroundColor: '#d1d3d8',
            justifyContent: 'center',
            borderWidth: 1,
            // marginLeft: 30,
          },
        }}
        locale={'en'}
        closePicker={closeDatePicker}
        mode="date"
        textStyle={styles.textStyle}
        placeHolderTextStyle={styles.placeHolderTextStyle}
        onChange={handleDateChange}
        // onChange={(_, selectedDate) =>
        //   handleDateChange('startDate', selectedDate)
        // }
        handlePickerModal={closeDatePicker}
      />
      {/* <FontAwesome
        onPress={handleShowDate}
        name="calendar"
        size={30}
        color={hasErrors ? theme.colors.accent : theme.colors.gray}
      /> */}
      <Text onPress={handleShowDate} style={styles.selectedDate}>
        {formatChosenDate(value, '/', true)}
      </Text>
      {editMode && (
        <Text style={styles.dateStyle} gray2>
          {formatChosenDate(value, '/', true)}
        </Text>
      )}
    </View>
  );
}

export default DateSelect;

const styles = StyleSheet.create({
  hasErrors: {
    borderBottomColor: theme.colors.accent,
    color: theme.colors.accent,
  },
  placeHolderTextStyle: {
    color: theme.colors.gray2,
    paddingLeft: 0,
  },

  dateStyle: {
    ...Platform.select({
      android: {
        marginTop: 50,
      },
    }),
  },
  textStyle: {color: theme.colors.gray2, paddingLeft: 0},
  selectedDate: {
    paddingVertical: 10,
  },
});

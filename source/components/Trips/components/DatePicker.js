import React from 'react';
import {Modal, StyleSheet, Platform, Dimensions} from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import {theme} from '../../../constants';
import {Text, Button} from '../../../UI';

const statusBarHeight = getStatusBarHeight();

const {width} = Dimensions.get('window');

function DatePickerModal(props) {
  const {
    showDatepickerModal,
    itineraryDate,
    setModalDate,
    handleConfirmDate,
    onRequestClose,
  } = props;

  const isIOS = Platform.OS === 'ios';

  if (showDatepickerModal && !isIOS) {
    return (
      <RNDateTimePicker
        testID="dateTimePicker"
        style={styles.datepickerModal}
        value={itineraryDate}
        mode="date"
        is24Hour={true}
        display="default"
        onChange={setModalDate}
      />
    );
  } else {
    return (
      <Modal
        style={styles.datepickerModal}
        animationType="slide"
        visible={showDatepickerModal}
        onRequestClose={onRequestClose}>
        <RNDateTimePicker
          testID="dateTimePicker"
          style={styles.datepickerModal}
          value={itineraryDate}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={setModalDate}
        />
        <Button ripple style={styles.setDateBtn} onPress={handleConfirmDate}>
          <Text color={theme.colors.primary} size={20}>
            DONE
          </Text>
        </Button>
      </Modal>
    );
  }
}

export default DatePickerModal;

const styles = StyleSheet.create({
  datepickerModal: {
    // flex: 1,
    marginTop: 2 * statusBarHeight,
    marginLeft: 0.5 * (width - 320),
    height: 700,
  },
  setDateBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: statusBarHeight * 2,
  },
});

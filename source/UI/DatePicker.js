import React from 'react';
import {Modal, View, StyleSheet, Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Text from './Text';
import Button from './Button';
import {theme} from '../constants';

export default props => {
  const {
    show,
    value,
    mode,
    onChange,
    hideModal,
    handlePickerModal,
    closePicker,
    display,
    ...rest
  } = props;
  const showForIos = show && Platform.OS === 'ios';
  const showForAndroid = show && Platform.OS === 'android';

  // useEffect(() => {
  //   Alert.alert(show ? 'True' : 'False');
  // }, []);

  if (showForAndroid) {
    return (
      <DateTimePicker
        {...rest}
        testID="dateTimePicker"
        value={value}
        mode={mode}
        is24Hour={true}
        display={display || 'default'}
        onChange={onChange}
      />
    );
  } else if (showForIos) {
    return (
      <Modal
        animationType="slide"
        // transparent={true}
        visible={showForIos}
        onRequestClose={() => {
          closePicker();
        }}>
        <View style={styles.centeredView}>
          <Text onPress={closePicker} style={styles.iconStyle}>
            <MaterialIcons size={20} name="clear" />
          </Text>
          <DateTimePicker
            {...rest}
            customStyles={{
              datePicker: {
                backgroundColor: '#d1d3d8',
                justifyContent: 'center',
                borderWidth: 1,
                // marginLeft: 30,
              },
            }}
            style={styles.adjustMargin}
            testID="dateTimePicker"
            value={value}
            mode={mode || 'date'}
            is24Hour={true}
            display={display || 'default'}
            onChange={onChange}
          />
          <Button onPress={handlePickerModal} style={styles.btnContainer}>
            <Text style={styles.btn}>SET</Text>
          </Button>
        </View>
      </Modal>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  centeredView: {
    flexDirection: 'column',
    justifyContent: 'center',
    // alignItems: 'center',
    marginTop: 120,
    width: '100%',
    // paddingLeft: 30,
  },
  centeredViewMod: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 120,
    borderWidth: 1,

    // paddingLeft: 30,
  },
  btn: {
    backgroundColor: theme.colors.lightPrimary,
    marginHorizontal: 120,
    borderRadius: 60,
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  btnContainer: {
    marginVertical: 50,
  },
  hideModal: {
    opacity: 0,
    height: 0,
  },
  iconStyle: {
    textAlign: 'right',
    padding: 10,
  },
  adjustMargin: {
    marginLeft: 40,
  },
});

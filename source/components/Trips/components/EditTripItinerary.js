import React, {useState} from 'react';
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import {RNToasty} from 'react-native-toasty';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import {getErrorMessage, generateRandomStrings} from '../../../resources/utils';
import {Text, Block, Button, Input} from '../../../UI';
import {theme} from '../../../constants';
import {
  updateTrip,
  tripItineraryBtnLoading,
  showModifyItineraryModal,
  addCpyOfTripItinerary,
} from '../../../actions/TripActions';
import DatePickerModal from './DatePicker';
import TimePicker from './TimePicker';
import DateDisplayBtn from './DateDisplayBtn';

const isIOS = Platform.OS === 'ios';

const statusBarHeight = getStatusBarHeight();

function EditTripItinerary(props) {
  const [errors, setErrors] = useState([]);

  const {
    copyOfTripItinerary,
    showDatePickerModal,
    showDatepickerModal,

    openTimePicker,
  } = props;

  const handleRemove = index => {
    const buff = [...copyOfTripItinerary];
    buff.splice(index, 1);
    props.addCpyOfTripItinerary(buff);
  };

  const handleInput = (text, index) => {
    const buff = [...copyOfTripItinerary];
    buff[index].info = text;
    // Add buff to copyOfTrip Itinerary
    props.addCpyOfTripItinerary(buff);
  };

  const addField = () => {
    const newField = {
      _id: generateRandomStrings(7),
      time: 'Not Set',
      info: '',
    };
    if (!isIOS) {
      newField.date = 'Not Set';
    }
    const buff = [...props.copyOfTripItinerary];
    buff.push(newField);
    props.addCpyOfTripItinerary(buff);
  };

  const hasErrors = (key, index) => {
    const err = errors.find(el => el.key === key && el.index === index);
    if (err) {
      return styles.hasErrors;
    }

    return null;
  };

  const saveTripItinerary = async () => {
    const errs = [];

    for (let i = 0; i < copyOfTripItinerary.length; i++) {
      if (copyOfTripItinerary[i].time === 'Not Set') {
        errs.push({
          key: 'time',
          index: i,
        });
      }
      if (copyOfTripItinerary[i].date === 'Not Set') {
        errs.push({
          key: 'date',
          index: i,
        });
      }

      if (copyOfTripItinerary[i].info === '') {
        errs.push({
          key: 'info',
          index: i,
        });
      }
    }

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const newData = {trip_itinerary: copyOfTripItinerary};

    const {_id} = props.trip;

    try {
      // throw new Error('Forcing error');
      //Add btn loader
      props.tripItineraryBtnLoading(true);

      await props.updateTrip(_id, newData);
      // Remove btn loader
      props.tripItineraryBtnLoading(false);
      // // Clear copy of trip itinerary
      props.addCpyOfTripItinerary([]);
      // Close Itinerary Modal
      props.showModifyItineraryModal(false);
      RNToasty.Normal({title: 'Trip updated successfully!'});
    } catch (e) {
      // Remove btn loader
      props.tripItineraryBtnLoading(false);
      RNToasty.Normal({title: getErrorMessage(e)});
    }
  };

  return (
    <Modal
      animationType="slide"
      visible={props.showModifyItinerary}
      onRequestClose={props.handleModalClose}>
      <View style={styles.modalTop}>
        <DatePickerModal
          handleConfirmDate={props.handleConfirmDate}
          setModalDate={props.setModalDate}
          showDatepickerModal={showDatepickerModal}
          itineraryDate={props.itineraryDate}
          onRequestClose={props.onRequestClose}
        />
        <TimePicker
          itineraryDate={props.itineraryDate}
          setTime={props.setTime}
          openTimePicker={openTimePicker}
        />
        <Button onPress={props.handleModalClose}>
          <MaterialIcons
            name="clear"
            color={theme.colors.gray}
            size={theme.sizes.font * 2.5}
          />
        </Button>
        <Button onPress={saveTripItinerary}>
          <Text color={theme.colors.primary} h3>
            Update
          </Text>
        </Button>
      </View>
      <Block
        padding={[theme.sizes.padding, theme.sizes.padding / 2]}
        space="between">
        <Text center h1>
          Trip Itinerary
        </Text>

        <ScrollView style={styles.scrollContainer}>
          {copyOfTripItinerary.length === 0 && (
            <Block margin={[20, 0]}>
              <Text h3 center color={theme.colors.gray2}>
                No Trip Itinerary, Click 'Add trip' to start
              </Text>
            </Block>
          )}

          {copyOfTripItinerary.map((itin, index) => {
            return (
              <Block row space="between" key={`${itin._id}`}>
                <DateDisplayBtn
                  itin={itin}
                  index={index}
                  showDatePickerModal={showDatePickerModal}
                  showTimePicker={props.showTimePicker}
                  hasErrors={hasErrors}
                />
                <Input
                  placeholder="Enter Field"
                  underlineColorAndroid="transparent"
                  multiline
                  autoCapitalize="sentences"
                  style={[styles.inputMod, hasErrors('info', index)]}
                  defaultValue={copyOfTripItinerary[index].info}
                  onChangeText={text => handleInput(text, index)}
                />
                <TouchableOpacity
                  style={styles.delete}
                  onPress={() => handleRemove(index)}>
                  <MaterialIcons
                    name="delete"
                    color={theme.colors.gray}
                    size={theme.sizes.font * 2}
                  />
                </TouchableOpacity>
              </Block>
            );
          })}
          <Text onPress={addField} h3 primary margin={[30, 0, 0, 0]} center>
            Add Field
          </Text>
        </ScrollView>
      </Block>
    </Modal>
  );
}

const mapStateToProps = state => {
  return {
    trip: state.TripReducer.trip,
    loadingTrip: state.TripReducer.loadingTrip,
    loadingTripItineraryBtn: state.TripReducer.loadingTripItineraryBtn,
    showModifyItinerary: state.TripReducer.showModifyItinerary,
    copyOfTripItinerary: state.TripReducer.copyOfTripItinerary,
    failedToLoadTrip: state.TripReducer.failedToLoadTrip,
  };
};

export default connect(
  mapStateToProps,
  {
    updateTrip,
    tripItineraryBtnLoading,
    showModifyItineraryModal,
    addCpyOfTripItinerary,
  },
)(EditTripItinerary);

const styles = StyleSheet.create({
  scrollContainer: {marginVertical: theme.sizes.padding},
  inputMod: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: -10,
    width: 200,
    height: 70,
  },

  delete: {justifyContent: 'center', alignItems: 'center'},
  hasErrors: {
    borderBottomColor: theme.colors.accent,
    borderBottomWidth: 2,
  },
  modalTop: {
    flex: 0,
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        marginTop: statusBarHeight,
      },
    }),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

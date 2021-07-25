import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {FloatingAction} from 'react-native-floating-action';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {RNToasty} from 'react-native-toasty';

import {Switch, Text} from '../../UI';
import {theme} from '../../constants';
import {getUrl} from '../../resources/controllers/url';
import {
  putWithAuth,
  removeWithAuth,
} from '../../resources/controllers/data/index';
import {
  updateTrip,
  updateTripEmergencyContacts,
} from '../../actions/TripActions';
import {Item, AddressFormModal, TextboxInputForm, Header} from './components';
import {validateTextBoxInput, validateInput} from './helpers';
import {handleError} from '../../resources/utils';
import {getUserFromAsyncStorage} from '../../resources/utils';
import {getErrorMessage} from '../../resources/utils';
import {result} from 'lodash';

function Emergency(props) {
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openTextModal, setOpenTextModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState([]);
  const [formValues, setFormValues] = useState({
    name: '',
    phoneNo: '',
    address: '',
    other: '',
  });
  const [textBoxValues, setTextBoxValues] = useState({
    title: '',
    content: '',
  });
  const [user, setUser] = useState({});

  useEffect(() => {
    getUserFromAsyncStorage()
      .then(loggedUser => {
        setUser(loggedUser);
      })
      .catch(console.log);
  }, []);
  useEffect(() => {
    if (editMode) {
      Alert.alert('Info', 'Long press contact details to reorder list');
    }
  }, [editMode]);

  const actions = [
    {
      text: 'Contact',
      icon: require('../../assets/images/contact-book.png'),
      name: 'contact',
      position: 1,
      color: theme.colors.primary,
    },
    {
      text: 'Textbox',
      icon: require('../../assets/images/information.png'),
      name: 'textbox',
      position: 2,
      color: theme.colors.primary,
    },
  ];

  function handleOnPressItem(name) {
    switch (name) {
      case 'contact':
        setOpenModal(true);
        break;
      case 'textbox':
        setOpenTextModal(true);
        break;
    }
  }

  async function handleListReorder(reordererdContacts) {
    try {
      const tripId = props.trip._id;
      const url = `${getUrl('trips')}/${tripId}/emergencyContact/reorder`;
      props.updateTripEmergencyContacts(reordererdContacts);
      const res = await putWithAuth(url, reordererdContacts);
      const myUpdatedTrip = res.data;
      await props.updateTrip(tripId, myUpdatedTrip);
    } catch (e) {
      //fail silently
      // alert(getErrorMessage(e));
    }
  }

  async function handleSubmit() {
    try {
      setErrors([]);
      const errs = validateInput(formValues);

      if (errs.length > 0) {
        setErrors(errs);
        return;
      }
      setLoading(true);
      const tripId = props.trip._id;
      let url = `${getUrl('trips')}/${tripId}/emergencyContact`;

      const editingContact = !!formValues?._id;

      if (editingContact) {
        // This means this method will update the contact info not add to it
        url = `${getUrl('trips')}/${tripId}/emergencyContact/${
          formValues?._id
        }`;
      }
      const res = await putWithAuth(url, formValues);
      const myUpdatedTrip = res.data;
      await props.updateTrip(tripId, myUpdatedTrip);
      setFormValues({});
      setLoading(false);
      let succesMessage = 'Emergency Info added';

      if (editingContact) {
        // close address input modal
        setOpenModal(false);
        succesMessage = 'Emergency Info updated';
      }

      RNToasty.Normal({
        title: succesMessage,
      });
    } catch (e) {
      setLoading(false);
      handleError(e);
    }
  }
  async function deleteContent(contentId) {
    try {
      const tripId = props.trip._id;
      const url = `${getUrl('trips')}/${tripId}/emergencyContact/${contentId}`;
      const res = await removeWithAuth(url, formValues);
      const myUpdatedTrip = res.data;
      await props.updateTrip(tripId, myUpdatedTrip);
    } catch (e) {
      handleError(e);
    }
  }
  async function handleTextBoxSubmit() {
    try {
      setErrors([]);
      const errs = validateTextBoxInput(textBoxValues);

      if (errs.length > 0) {
        setErrors(errs);
        return;
      }
      setLoading(true);

      const tripId = props.trip._id;

      const editingTextBoxInfo = !!textBoxValues?._id;

      let url = `${getUrl('trips')}/${tripId}/emergencyContact`;

      if (editingTextBoxInfo) {
        url = `${getUrl('trips')}/${tripId}/emergencyContact/${
          textBoxValues?._id
        }`;
      }
      const res = await putWithAuth(url, textBoxValues);
      const myUpdatedTrip = res.data;
      await props.updateTrip(tripId, myUpdatedTrip);
      setTextBoxValues({});
      setLoading(false);

      setErrors([]);
      let succesMessage = 'Emergency Info added';
      if (editingTextBoxInfo) {
        setOpenTextModal(false);
        succesMessage = 'Emergency Info updated';
      }

      RNToasty.Normal({
        title: succesMessage,
      });
    } catch (e) {
      setLoading(false);
      handleError(e);
    }
  }

  function onChangeText(name, value) {
    setFormValues({...formValues, [name]: value});
  }
  function onChangeTextInputBox(name, value) {
    setTextBoxValues({...textBoxValues, [name]: value});
  }

  function hasErrors(key) {
    return errors.find(el => el.key === key) ? styles.hasErrors : null;
  }
  function showErr(key) {
    const err = errors.find(el => el.key === key);
    return err ? err?.errMessage : '';
  }

  function handleEdit(item) {
    if (item?.address || item?.phoneNo) {
      setOpenModal(true);
      setFormValues(item);
    } else {
      setOpenTextModal(true);
      setTextBoxValues(item);
    }
  }

  function handleConfirmDelete(item) {
    Alert.alert(
      'Are you sure',
      'Are you sure you want to delete this emergency info',
      [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'OK', onPress: () => deleteContent(item)},
      ],
    );
  }

  const emergencyContacts = props?.trip?.emergencyContacts || [];

  function renderNoContent() {
    return (
      <>
        <View style={styles.noContentContainer}>
          <Text h1 semibold>
            Emergency Info
          </Text>
          <Image
            style={styles.imageStyle2}
            source={require('../../assets/icons/emergency-call1.png')}
          />
          <Text center gray>
            Add important contact numbers, addresses and messages for everyone
            to see here
          </Text>
        </View>
      </>
    );
  }

  function renderNotPremium() {
    return (
      <View style={styles.noContentContainer}>
        <Text h3 center bold>
          Emergency Contacts are a Premium Feature
        </Text>
        <Image
          style={styles.imageStyle}
          source={require('../../assets/icon_set/icon_n_text_500px.jpg')}
        />
        <Text center size={16}>
          Other premium features include:{' '}
          <Text size={16} semibold>
            Group Messaging between chaperones and
          </Text>{' '}
          <Text size={16} semibold>
            Picture Messaging.
          </Text>
          <Text
            semibold
            primary
            size={16}
            onPress={() =>
              Linking.openURL('https://www.gochapperone.com/pricing')
            }>
            {' '}
            Click here{' '}
          </Text>
          to learn more.
        </Text>
        <View style={styles.padlockContainer}>
          <MaterialIcons color={theme.colors.primary} name="lock" size={80} />
        </View>
      </View>
    );
  }

  if (noContractOrExpiredContract()) {
    return renderNotPremium();
  }

  function noContractOrExpiredContract() {
    let noValidContract = true;

    try {
      if (Number(user?.contractExpiry) > +new Date()) {
        noValidContract = false;
      }
    } catch (e) {}

    return noValidContract;
  }

  function renderEmergencyItems({item, index, drag, isActive}) {
    const containerStyle = {
      height: 120,
      backgroundColor: isActive ? '#eee' : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      marginTop: 20,
      width: '100%',
    };
    // ONLY CHAPPERONES CAN RE-ORDER
    const onLongPress =
      editMode && user?.role === 'teacher' ? drag : () => null;
    return (
      <TouchableOpacity
        key={item._id}
        style={containerStyle}
        activeOpacity={0.8}
        onLongPress={onLongPress}>
        <Item
          user={user}
          item={item}
          editMode={editMode}
          handleEdit={handleEdit}
          deleteContent={handleConfirmDelete}
        />
      </TouchableOpacity>
    );
  }

  function toggleSwitch() {
    setEditMode(!editMode);
  }

  return (
    <View style={styles.container}>
      {/* <Header text="Emergency" /> */}
      {emergencyContacts.length !== 0 && (
        <Header editMode={editMode} toggleSwitch={toggleSwitch} />
      )}
      {emergencyContacts.length === 0 && renderNoContent()}
      <DraggableFlatList
        data={emergencyContacts}
        renderItem={renderEmergencyItems}
        keyExtractor={(item, index) => `draggable-item-${item._id}`}
        onDragEnd={({data}) => handleListReorder(data)}
      />
      <TextboxInputForm
        openTextModal={openTextModal}
        setOpenTextModal={setOpenTextModal}
        onChangeTextInputBox={onChangeTextInputBox}
        hasErrors={hasErrors}
        loading={loading}
        handleTextBoxSubmit={handleTextBoxSubmit}
        textBoxValues={textBoxValues}
        showErr={showErr}
      />
      <AddressFormModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        onChangeText={onChangeText}
        hasErrors={hasErrors}
        loading={loading}
        handleSubmit={handleSubmit}
        formValues={formValues}
        showErr={showErr}
      />
      {user?.role === 'teacher' && (
        <FloatingAction
          color={theme.colors.primary}
          actions={actions}
          onPressItem={handleOnPressItem}
        />
      )}
    </View>
  );
}

function mapStateToProps(state) {
  return {
    trip: state.TripReducer.trip,
  };
}

export default connect(
  mapStateToProps,
  {updateTrip, updateTripEmergencyContacts},
)(Emergency);

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: theme.sizes.margin / 4,
    paddingVertical: theme.sizes.margin / 2,
  },
  container: {
    position: 'relative',
    height: '100%',
    padding: 20,
  },
  hasErrors: {
    borderColor: theme.colors.accent,
  },
  mT: {
    marginTop: 30,
  },
  noContentContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    // justifyContent: 'center',
    height: '100%',
    alignSelf: 'center',
    padding: 20,
  },
  imageStyle: {
    width: 256,
    height: 256,
    marginVertical: 50,
  },
  imageStyle2: {
    width: 128,
    height: 128,
    marginVertical: 50,
  },
  emailFormatting: {
    color: theme.colors.primary,
  },
  padlockContainer: {
    // position: 'absolute',
    // bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 60,
  },
});

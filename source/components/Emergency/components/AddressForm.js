import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Text, Input, Button, Block} from '../../../UI';
import {theme} from '../../../constants';

function AddressFormModal(props) {
  const {
    openModal,
    setOpenModal,
    onChangeText,
    hasErrors,
    loading,
    handleSubmit,
    formValues,
    showErr,
  } = props;
  return (
    <Modal
      animationType="slide"
      visible={openModal}
      // onRequestClose={() => {
      //   Alert.alert('Modal has been closed.');
      //   setModalVisible(!modalVisible);
      // }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.centeredView}>
          <MaterialIcons
            name="clear"
            onPress={() => setOpenModal(false)}
            size={30}
          />
          <Text h2 center>
            Add Emergency Info
          </Text>
          <ScrollView>
            <View style={[styles.formItem, styles.formTop]}>
              <Text gray>Name</Text>
              <Input
                onChangeText={text => onChangeText('name', text)}
                style={[styles.input, hasErrors('name')]}
                name="name"
                value={formValues.name}
                autoFocus
                autoCapitalize="words"
                maxLength={30}
              />
              <Text style={styles.errorText}>{showErr('name')}</Text>
            </View>
            <View style={styles.formItem}>
              <Text gray>Title(Optional)</Text>
              <Input
                onChangeText={text => onChangeText('title', text)}
                style={[styles.input, hasErrors('title')]}
                name="title"
                value={formValues.title}
                autoCapitalize="words"
                maxLength={40}
              />
              <Text style={styles.errorText}>{showErr('title')}</Text>
            </View>
            <View style={styles.formItem}>
              <Text gray>Address(Optional)</Text>
              <Input
                onChangeText={text => onChangeText('address', text)}
                multiline
                textContentType="fullStreetAddress"
                style={[styles.textArea, hasErrors('address')]}
                name="address"
                value={formValues.address}
              />
              <Text style={styles.errorText}>{showErr('address')}</Text>
            </View>
            <View style={styles.formItem}>
              <Text gray>Phone Number(Optional)</Text>
              <Input
                onChangeText={text => onChangeText('phoneNo', text)}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                style={[styles.input, hasErrors('phoneNo')]}
                name="phoneNo"
                value={formValues.phoneNo}
              />
              <Text style={styles.errorText}>{showErr('phoneNo')}</Text>
            </View>
            <View style={styles.formItem}>
              <Text gray>Other(Optional)</Text>
              <Input
                onChangeText={text => onChangeText('other', text)}
                error={hasErrors('other')}
                style={[styles.textArea]}
                name="other"
                value={formValues.other}
                autoComplete
                multiline
              />
            </View>
            <Block style={styles.bottomFixed}>
              <Button gradient onPress={handleSubmit}>
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text bold white center>
                    Submit
                  </Text>
                )}
              </Button>
            </Block>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default AddressFormModal;

const styles = StyleSheet.create({
  formItem: {
    marginBottom: 15,
    // borderWidth: 1,
    // height: 100,
  },
  modText: {
    paddingBottom: 10,
    marginBottom: 20,
    borderWidth: 1,
  },
  flexCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mlAdjust: {
    marginLeft: 20,
  },
  errorText: {
    position: 'absolute',
    color: theme.colors.accent,
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignSelf: 'center',
    marginTop: 10,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.gray,
    fontSize: theme.sizes.font,
    width: '100%',
    paddingLeft: 5,
  },
  contentContainer: {
    marginHorizontal: theme.sizes.margin / 4,
    marginVertical: theme.sizes.margin / 2,
  },
  textArea: {
    height: 100,
    paddingLeft: 5,
    borderColor: theme.colors.gray,
  },
  textAreaMod: {
    height: 200,
    paddingLeft: 5,
    borderColor: theme.colors.gray,
  },
  hasErrors: {
    borderColor: theme.colors.accent,
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
    marginTop: 50,
    margin: 20,
  },
  formTop: {
    marginTop: 20,
  },

  fBtnStyle: {
    position: 'absolute',
    bottom: 10,
    left: 20,
  },
  container: {
    position: 'relative',
    height: '100%',
  },
});

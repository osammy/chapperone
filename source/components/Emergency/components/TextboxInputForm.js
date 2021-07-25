import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Text, Input, Button, Block} from '../../../UI';
import {theme} from '../../../constants';

function TextboxInputForm(props) {
  const {
    openTextModal,
    setOpenTextModal,
    onChangeTextInputBox,
    hasErrors,
    loading,
    handleTextBoxSubmit,
    textBoxValues,
    showErr,
  } = props;
  return (
    <Modal
      animationType="slide"
      visible={openTextModal}
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
            onPress={() => setOpenTextModal(false)}
            size={30}
          />
          <Text h2 center>
            Add Emergency Info
          </Text>
          <View style={[styles.formItem, styles.formTop]}>
            <Text gray>Title</Text>
            <Input
              onChangeText={text => onChangeTextInputBox('title', text)}
              style={[styles.input, hasErrors('title')]}
              name="title"
              value={textBoxValues.title}
              autoFocus
              autoCapitalize="words"
              maxLength={40}
            />
            <Text style={styles.errorText}>{showErr('title')}</Text>
          </View>
          <View style={styles.formItem}>
            <Text gray>Content</Text>
            <Input
              onChangeText={text => onChangeTextInputBox('content', text)}
              style={[styles.textAreaMod, hasErrors('content')]}
              name="content"
              value={textBoxValues.content}
              multiline
              autoComplete
              maxLength={250}
            />
            <Text style={styles.errorText}>{showErr('content')}</Text>
          </View>
          <Block style={styles.bottomFixed}>
            <Button gradient onPress={handleTextBoxSubmit}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text bold white center>
                  Submit
                </Text>
              )}
            </Button>
          </Block>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default TextboxInputForm;

const styles = StyleSheet.create({
  formItem: {
    marginBottom: 15,
    // borderWidth: 1,
    // height: 100,
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

  textAreaMod: {
    height: 200,
    paddingLeft: 5,
    borderColor: theme.colors.gray,
  },
  hasErrors: {
    borderColor: theme.colors.accent,
  },

  centeredView: {
    marginTop: 50,
    margin: 20,
  },
  formTop: {
    marginTop: 20,
  },

  container: {
    position: 'relative',
    height: '100%',
  },
  header: {
    marginTop: 30,
    textAlign: 'center',
  },
});

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Input} from '../../UI';
import {theme} from '../../constants';

function UploadDisplay(props) {
  const {
    handleTextChange,
    uploadingImage,
    onUpload,
    showImageModal,
    imageToUploadUri,
    inputPosition,
    handleCloseModal,
  } = props;
  return (
    <Modal
      animationType="fade"
      visible={showImageModal}
      onRequestClose={handleCloseModal}>
      <View style={styles.imagePreviewContainer}>
        <Image source={{uri: imageToUploadUri}} style={styles.imagePreview} />
        <View style={styles.backBtnContainer}>
          <MaterialIcons
            onPress={handleCloseModal}
            style={styles.backBtn}
            name={Platform.OS ? 'keyboard-arrow-left' : 'keyboard-backspace'}
            color="white"
            size={Platform.OS ? theme.sizes.font * 2.5 : theme.sizes.font * 1.7}
          />
        </View>
        <View style={[styles.texInputContainer, {bottom: inputPosition}]}>
          <Input
            style={styles.inputField}
            onChangeText={handleTextChange}
            placeholder="Add a caption"
            placeholderTextColor="#ccc"
            multiline
            autoCapitalize="sentences"
          />
          <TouchableOpacity
            onPress={onUpload}
            style={styles.imageSendBtnContainer}>
            <MaterialIcons name="send" color="white" size={30} />
          </TouchableOpacity>
        </View>
        {uploadingImage && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      </View>
    </Modal>
  );
}

export default UploadDisplay;

const styles = StyleSheet.create({
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePreviewContainer: {
    // marginTop: 100,
    // backgroundColor: 'black',
    height: '100%',
    // flexDirection: 'column'
  },
  inputField: {
    // marginTop: 100,

    width: '100%',
    borderRadius: 0,
    margin: 0,
    color: 'white',
    borderWidth: 0,
    paddingLeft: 20,
    // fontSize: 18,
  },
  texInputContainer: {
    // backgroundColor: 'rgba(0, 0, 0, 0.6)',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    // flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
    // height: 50,
    width: '100%',
  },
  imageSendBtnContainer: {
    position: 'absolute',
    top: -30,
    right: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnContainer: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'center',
    // alignItems: 'center',
    top: 0,
    // top: getStatusBarHeight(),
    backgroundColor: 'black',

    height: 80,
    width: '100%',
  },
  backBtn: {
    width: 100,
    height: 40,
    paddingLeft: 10,
    paddingRight: 30,
    marginTop: 30,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
  },
});

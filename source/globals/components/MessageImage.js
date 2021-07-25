import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Icon} from 'native-base';
import * as RNFS from 'react-native-fs';

import {Text} from '../../UI';
import {theme} from '../../constants';
import {getStatusBarHeight} from 'react-native-status-bar-height';

function MessageImage(props) {
  const {imageProps, onDownloadPress} = props;

  const [checking, setChecking] = useState(true);
  const [imageActive, setImageActive] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [uri, setUri] = useState(imageProps?.currentMessage?.image);
  const localPath = imageProps?.currentMessage?.imageLocalPath;
  const remotePath = imageProps?.currentMessage?.image;

  useEffect(() => {
    async function doCheck() {
      try {
        if (localPath) {
          const existOnMyDevice = await RNFS.exists(localPath);
          setUri(existOnMyDevice ? localPath : remotePath);
        }
        setChecking(false);
      } catch (e) {
        setChecking(false);
      }
    }

    doCheck();
  }, [localPath, remotePath]);

  if (checking) {
    return null;
  }

  const isRemotePath = uri === remotePath;

  const toDownload = isRemotePath && !downloaded;

  async function downloadToDisk() {
    try {
      setDownloadingImage(true);
      await onDownloadPress(imageProps?.currentMessage);
      setDownloadingImage(false);
      setDownloaded(true);
    } catch (e) {
      console.log(e);
      setDownloadingImage(false);
    }
  }

  return (
    <View>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.imageContainer}
        onPress={() => setImageActive(true)}>
        <Image
          style={styles.imageThumb}
          source={{uri}}
          blurRadius={toDownload ? 5 : 0}
        />
      </TouchableOpacity>
      {!!toDownload && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={downloadToDisk}
          style={styles.download}>
          {downloadingImage ? (
            <ActivityIndicator size="large" color={theme.colors.white} />
          ) : (
            <MaterialIcons name="file-download" color="white" size={50} />
          )}
        </TouchableOpacity>
      )}
      <Modal
        animationType="fade"
        visible={imageActive}
        onRequestClose={() => setImageActive(false)}>
        <View style={styles.modalStyleContainer}>
          <View style={styles.modalStyle}>
            <Image
              style={styles.activeImage}
              source={{uri}}
              blurRadius={toDownload ? 5 : 0}
            />
          </View>
        </View>
        <View style={styles.iconContainer}>
          <Text onPress={() => setImageActive(false)} style={styles.iconStyle}>
            <Icon name="arrow-back" style={styles.iconStyle} />
          </Text>
        </View>
      </Modal>
    </View>
  );
}

export default MessageImage;

const styles = StyleSheet.create({
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageThumb: {
    width: '100%',
    height: 250,
    maxHeight: 300,
    minHeight: 100,
    minWidth: 150,
    maxWidth: 337,
    borderRadius: 13,
    marginTop: 5,
    resizeMode: 'cover',
  },
  imageActive: {
    flex: 1,
    resizeMode: 'contain',
  },
  download: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0, 0.2)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 13,
    height: '100%',
  },
  activeImage: {
    width: '100%',
    // width: 300,
    height: 400,
    maxHeight: '100%',
    // minHeight: 100,
    // minWidth: 150,
    // maxWidth: 337,
    // flex: 1,
    // maxHeight: 500,

    // resizeMode: 'contain',
  },
  modalStyle: {
    width: '100%',
    height: 500,
    maxHeight: 500,
  },
  iconStyle: {
    width: 100,
    padding: 20,
    color: 'white',
  },
  modalStyleContainer: {
    backgroundColor: 'black',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    position: 'absolute',
    top: getStatusBarHeight(),
  },
});

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as RNFS from 'react-native-fs';
import {theme} from '../../../constants';

function MessageImage(props) {
  const {imageProps, onDownloadPress} = props;

  const [checking, setChecking] = useState(true);
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
      setDownloadingImage(false);
    }
  }

  return (
    <View>
      <TouchableOpacity>
        <Image
          style={styles.imageThumb}
          source={{uri}}
          blurRadius={toDownload ? 5 : 0}
        />
      </TouchableOpacity>
      {toDownload && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={downloadToDisk}
          style={styles.download}>
          {downloadingImage ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <FontAwesome name="download" color="white" size={20} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

export default MessageImage;

const styles = StyleSheet.create({
  imageThumb: {
    width: 150,
    height: 100,
    borderRadius: 13,
    margin: 3,
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
});

import React from 'react';
import {
  View,
  Image,
  Platform,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {Icon} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Block, Text, Button} from '../../../UI';
import {theme} from '../../../constants';
// import {TouchableOpacity} from 'react-native-gesture-handler';

function ImageView(props) {
  const {
    prevImageCount,
    images,
    removeImage,
    editMode,
    pickMultiple,
    loadingImagePicker,
  } = props;

  function uploadImages() {
    if (loadingImagePicker) {
      return;
    }
    pickMultiple();
  }
  return (
    <View>
      <View style={[styles.cameraStyle, styles.marginTop]}>
        <Text gray2 semibold>
          Select Images
        </Text>
        {/* <Button style={styles.buttonStyles} onPress={pickMultiple}>
          {loadingImagePicker ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Icon name="camera" style={styles.iconStyle} />
          )}
        </Button> */}
      </View>
      <View style={styles.mainContainer}>
        {editMode && (
          <Text h3 primary>
            {prevImageCount} Prev Image(s)
          </Text>
        )}
        {images.length === 0 && (
          <TouchableOpacity
            onPress={uploadImages}
            style={styles.imagePreviewContainer}>
            {loadingImagePicker ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.imagePreviewText}>
                Click to Upload Image(s)
              </Text>
            )}
          </TouchableOpacity>
        )}
        <View style={styles.imageGridContainer}>
          {images.map(image => {
            return (
              <View key={image.uri} style={styles.gridViewBlockStyle}>
                <Image style={styles.imgView} source={image} />

                <View style={styles.overlayImage}>
                  <Button
                    style={styles.cancelStyle}
                    onPress={() => removeImage(image.uri)}>
                    <MaterialIcons
                      name="clear"
                      color="white"
                      size={theme.sizes.font * 1.5}
                    />
                  </Button>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default ImageView;

const styles = StyleSheet.create({
  imagePreviewContainer: {
    // backgroundColor: '#eee',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // height: '100%',
    // height: 400,
    minHeight: 110,
    //
    marginTop: 20,
    borderWidth: 2,
    borderRadius: 5,
    borderStyle: 'dashed',
    borderColor: theme.colors.gray2,
  },
  imagePreviewText: {
    color: theme.colors.gray,
    fontSize: 20,
    fontVariant: ['tabular-nums'],
  },
  // new
  mainContainer: {
    justifyContent: 'center',
    flex: 1,
    // paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },

  listStyle: {marginTop: 30},
  cameraStyle: {
    ...Platform.select({
      android: {
        marginTop: 120,
      },
    }),
  },
  marginTop: {
    paddingTop: 20,
    position: 'relative',
  },
  iconStyle: {
    fontSize: 50,
    color: theme.colors.gray,
  },
  gridViewBlockStyle: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    height: 100,
    width: '50%',
    margin: 5,
    backgroundColor: '#00BCD4',
    position: 'relative',
    flexBasis: '25%',
  },
  imgView: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    // resizeMode: 'contain',
  },
  cancelStyle: {
    position: 'absolute',
    top: -9,
    right: 0,
    backgroundColor: 'transparent',
    width: 30,
    height: 30,
    borderRadius: 15,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  overlayImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    width: '100%',
    height: '100%',
  },
});

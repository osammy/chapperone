import React from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';

function FloatingBtn({openSearchArea}) {
  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={openSearchArea}
        style={styles.touchableOpacityStyle}>
        <Image
          source={require('../../../images/ic_chats_contacts.png')}
          style={styles.floatingButtonStyle}
        />
      </TouchableOpacity>
    </View>
  );
}

export default FloatingBtn;

const styles = StyleSheet.create({
  touchableOpacityStyle: {
    position: 'absolute',
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
  },
  floatingButtonStyle: {
    resizeMode: 'contain',
    width: 55,
    height: 55,
  },
});

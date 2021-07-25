import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Actions} from 'react-native-router-flux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import TripMenu from './../../TripMenu';
import {theme} from '../../../constants';

function TripHeader({showEdit}) {
  return (
    <View style={styles.abs}>
      <TouchableOpacity onPress={Actions.pop}>
        <MaterialIcons
          name="keyboard-arrow-left"
          color={theme.colors.white}
          size={30}
        />
      </TouchableOpacity>
      {showEdit && <TripMenu openTripEdit={Actions.EditTrip} />}
    </View>
  );
}

export default TripHeader;

const styles = StyleSheet.create({
  abs: {
    position: 'absolute',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
    top: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.08)',
    height: 60,
    zIndex: 10,
  },
});

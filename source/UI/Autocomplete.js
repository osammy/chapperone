import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, Platform, View} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';

import Text from './Text';
import {theme} from '../constants';

function AutoComplete(props) {
  return (
    <View style={styles.autocompleteContainer}>
      <Autocomplete
        placeholder="Enter School"
        inputContainerStyle={styles.onlyBottomBorder}
        autoCorrect={false}
        data={props.data}
        defaultValue={props.query}
        onChangeText={props.handleTextChange}
        renderItem={({item, i}) => (
          <TouchableOpacity
            key={String(i)}
            onPress={() => props.handleItemSelect(item)}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export default AutoComplete;

const styles = StyleSheet.create({
  ...Platform.select({
    android: {
      autocompleteContainer: {
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1,
      },
    },
  }),
  onlyBottomBorder: {
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
});

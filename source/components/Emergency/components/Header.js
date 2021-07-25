import React from 'react';
import {View, StyleSheet} from 'react-native';

import {Switch, Text} from '../../../UI';
import {theme} from '../../../constants';

function Header({toggleSwitch, editMode}) {
  return (
    <View>
      <Text padding={[0, 0, 20, 0]} h1 bold center primary>
        Emergency Info
      </Text>
      <View style={styles.editToggle}>
        <View style={styles.editToggleTextContainer}>
          <Text gray>Toggle to edit and reorder</Text>
        </View>
        <Switch
          trackColor={{false: '#767577', true: theme.colors.primary}}
          // thumbColor={editMode ? '#f5dd4b' : '#f4f3f4'}
          // ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={editMode}
        />
      </View>
    </View>
  );
}

export default Header;

const styles = StyleSheet.create({
  editToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // width: 150,
  },
  editToggleTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
});

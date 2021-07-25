import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {StyleSheet, View} from 'react-native';

import {Text} from '../../../UI';
import {formatDate} from '../../../resources/utils';
import {theme} from '../../../constants';

function TripDates({start_date, end_date, iconSize, textColor, iconColor}) {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <MaterialIcons
          name="event"
          color={iconColor || theme.colors.gray}
          size={iconSize || 25}
        />
        <Text color={textColor || 'black'}>{formatDate(start_date)}</Text>
      </View>
      <View style={styles.item}>
        <MaterialIcons
          name="event"
          color={iconColor || theme.colors.gray}
          size={iconSize || 25}
        />
        <Text color={textColor || 'black'}>{formatDate(end_date)}</Text>
      </View>
    </View>
  );
}

export default TripDates;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';

import {Text} from '../../../UI';
import {theme} from '../../../constants';
import {capitalize} from 'lodash';

const {width} = Dimensions.get('window');

function ListItem(props) {
  const {mainText, subText, leftIcon, subText2} = props;
  return (
    <View style={styles.container}>
      <View style={[styles.content, styles.icon]}>{leftIcon}</View>
      <View style={styles.content}>
        <Text style={styles.mainText} numberOfLines={2} size={18} semibold>
          {mainText}
        </Text>
        {!!subText && (
          <Text style={styles.mainText} numberOfLines={1} gray>
            {subText}
          </Text>
        )}
        {!!subText2 && <Text primary>{capitalize(subText2)}</Text>}
      </View>
    </View>
  );
}
capitalize;
const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 90,
    borderColor: theme.colors.gray,
  },
  content: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  },
  icon: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainText: {
    width: width - 90,
  },
});

export default ListItem;

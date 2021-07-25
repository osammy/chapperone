import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {Actions} from 'react-native-router-flux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Icon, Button} from 'native-base';

import {theme} from '../../../constants';
import {Block, Text, Badge} from '../../../UI';
import MoreMenu from '../../MoreMenu';

function Header(props) {
  return (
    <View style={[styles.headerContainer, styles.shadow]}>
      <Block row space="between">
        <Button
          style={{paddingHorizontal: 20}}
          onPress={Actions.pop}
          transparent>
          <Text>
            <Icon name="arrow-back" style={{color: theme.colors.primary}} />
          </Text>
        </Button>

        <TouchableOpacity
          onPress={() => {}}
          style={{
            height: 50,
            justifyContent: 'center',
            // paddingLeft: 20,
            flex: 1,
          }}>
          <Badge color={theme.colors.secondary} size={55}>
            <FontAwesome name="bullhorn" size={62 / 2.5} color="white" />
          </Badge>
        </TouchableOpacity>
        <Text
          style={{flex: 5, fontSize: 16, marginTop: 10, paddingLeft: 10}}
          color={theme.colors.primary}
          semibold>
          {/* {name} */}
          Broadcast
        </Text>
      </Block>

      <View style={{flexDirection: 'row', marginRight: 10}}>
        <View style={{justifyContent: 'center'}}>
          <MoreMenu color={theme.colors.primary} />
        </View>
      </View>
    </View>
  );
}

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 0.5,
    borderColor: theme.colors.gray,
    margin: 0,
    shadowColor: theme.colors.black,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 13,
  },
});

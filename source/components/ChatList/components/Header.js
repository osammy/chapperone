import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Icon} from 'native-base';

import {theme} from '../../../constants';
import {Block, Text} from '../../../UI';

function Header(props) {
  const {
    searchList,
    handleLeftBtn,
    handleSearch,
    searchText,
    inputRef,
    openSearchArea,
  } = props;

  return (
    <View style={styles.headerContainer}>
      <Block row space="between">
        <TouchableOpacity onPress={handleLeftBtn} style={styles.backArrow}>
          <Icon name="arrow-back" style={styles.backIconStyle} />
        </TouchableOpacity>
      </Block>
      <Block style={styles.textContainer}>
        <TextInput
          style={styles.input}
          placeholder={searchList ? 'Search Chat List' : ''}
          editable={searchList}
          value={searchText}
          onChangeText={handleSearch}
          ref={inputRef}
          autoBlur
        />
      </Block>

      {searchList && (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={{justifyContent: 'center', paddingHorizontal: 10}}
            onPress={openSearchArea}>
            <MaterialIcons
              // name={searchList ? 'clear' : 'search'}
              name="clear"
              color={theme.colors.primary}
              style={styles.backIconStyle}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default Header;

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
  listItem: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
  },
  avatar: {width: 60, height: 60, borderRadius: 30},
  chatTop: {width: '100%', margin: 0, padding: 0},
  chatName: {fontSize: 15, fontWeight: 'bold'},
  content: {
    marginLeft: 15,
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: theme.colors.gray2,
  },
  adminContent: {
    marginLeft: 15,
    flex: 1,
    borderColor: theme.colors.gray2,
  },
  lastMessage: {fontSize: 13, width: '93%'},
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderWidth: 0.2,
    borderColor: theme.colors.gray2,
    margin: 0,
    paddingVertical: 5,
    paddingHorizontal: theme.sizes.horizontal,
  },
  numSelected: {
    flex: 1,
    marginTop: 11,
    marginLeft: 25,
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    // borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.black,
    // borderRadius: theme.sizes.radius,
    fontSize: theme.sizes.font,
    // fontWeight: '500',
    color: theme.colors.black,
    width: '100%',
    // height: theme.sizes.base * 3,
  },
  backArrow: {
    height: 50,
    justifyContent: 'center',
    marginLeft: 0,
    paddingRight: 15,
  },
  backIconStyle: {
    color: theme.colors.primary,
    fontSize: 24,
  },
  spaceBetween: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 6,
    ...Platform.select({
      ios: {
        marginTop: 16,
      },
    }),
  },
});

import React, {useState, useRef} from 'react';
import {TextInput, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {Icon} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Block} from '../../../UI';
import {theme} from '../../../constants';
import {View} from 'native-base';

function Header(props) {
  const {handleSearch, user} = props;
  const [searchText, setSearchText] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  // const {searchList, user} = this.state;

  let showAddContactBtn = false;
  if (user.role === 'teacher') {
    showAddContactBtn = true;
  }

  function handleTextChange(text) {
    setSearchText(text);
    handleSearch(text);
  }

  const handleRightBtn = () => {
    if (searchMode) {
      setSearchText('');
      handleSearch('');
    } else {
      setSearchMode(true);
      //textInputRef.current.focus();
    }
  };

  const handleLeftBtn = () => {
    if (searchMode) {
      setSearchMode(false);
      setSearchText('');
    } else {
      Actions.pop();
    }
  };

  return (
    <View style={styles.headerContainer}>
      <Block row space="between">
        <TouchableOpacity onPress={handleLeftBtn} style={styles.backArrow}>
          <Icon name="arrow-back" style={styles.backIconStyle} />
        </TouchableOpacity>
      </Block>
      <Block style={styles.flex}>
        {searchMode && (
          <TextInput
            style={styles.input}
            placeholder={searchMode ? 'Search Participants' : ''}
            editable={searchMode}
            value={searchText}
            onChangeText={handleTextChange}
            // ref={textInputRef}
            autoBlur
            autoFocus
          />
        )}
      </Block>

      <View style={styles.search}>
        {!searchMode && showAddContactBtn && (
          <TouchableOpacity
            onPress={Actions.SearchContacts}
            style={styles.addPeople}>
            <Icon name="person-add" style={styles.backIconStyle} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.searchPeople} onPress={handleRightBtn}>
          <MaterialIcons
            name={searchMode ? 'clear' : 'search'}
            color={theme.colors.primary}
            style={styles.backIconStyle}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 0.2,
    borderColor: theme.colors.gray2,
    margin: 0,
    paddingVertical: 5,
    paddingHorizontal: theme.sizes.horizontal,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
  flex: {
    flex: 6,
  },
  backArrow: {
    height: 50,
    justifyContent: 'center',
    marginLeft: 0,
    paddingRight: 10,
  },
  search: {
    flexDirection: 'row',
  },
  searchPeople: {
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 10,
  },
  backIconStyle: {
    color: theme.colors.primary,
    fontSize: 24,
  },
  addPeople: {
    color: theme.colors.primary,
    fontSize: 24,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  input: {
    ...Platform.select({
      ios: {
        marginTop: 15,
      },
    }),
    // borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.black,
    // borderRadius: theme.sizes.radius,
    fontSize: theme.sizes.font,
    // fontWeight: '500',
    color: theme.colors.black,
    width: '100%',
    // height: theme.sizes.base * 3,
  },
});

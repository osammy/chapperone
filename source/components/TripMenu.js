/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-shadow */
import React, {useState} from 'react';
import {
  View,
  AsyncStorage,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import Popover from 'react-native-popover-view';
import {Popover, PopoverController} from 'react-native-modal-popover';

import {theme, keys} from '../constants';
import {Button} from '../UI';
import {connect} from 'react-redux';
import {RNToasty} from 'react-native-toasty';

function TripMenu(props) {
  const handleTripEdit = closePopover => {
    closePopover();

    if (props.openTripEdit) {
      props.openTripEdit();
    }
  };

  return (
    <View>
      <PopoverController>
        {({
          openPopover,
          closePopover,
          popoverVisible,
          setPopoverAnchor,
          popoverAnchorRect,
        }) => (
          <React.Fragment>
            <TouchableOpacity
              style={{paddingLeft: 10}}
              title="Trip Options!"
              ref={setPopoverAnchor}
              onPress={openPopover}>
              <MaterialIcons
                name="more-horiz"
                color={props.color ? props.color : theme.colors.white}
                size={theme.sizes.font * 2}
                // style={{paddingRight: 10}}
              />
            </TouchableOpacity>

            <Popover
              contentStyle={[styles.content, styles.shadow]}
              placement="bottom"
              arrowStyle={styles.arrow}
              backgroundStyle={styles.background}
              visible={popoverVisible}
              onClose={closePopover}
              fromRect={popoverAnchorRect}
              supportedOrientations={['portrait', 'landscape']}>
              <Button
                style={styles.popoverItem}
                onPress={() => handleTripEdit(closePopover)}
                title="Edit Trip">
                <Text style={styles.popoverItemText}>Edit Trip</Text>
              </Button>
            </Popover>
          </React.Fragment>
        )}
      </PopoverController>
    </View>
  );
}

export default connect(
  null,
  {},
)(TripMenu);

const styles = StyleSheet.create({
  popoverItem: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    marginVertical: 0,
    color: 'black',
  },
  content: {
    paddingVertical: 0,
    paddingLeft: 15,
    paddingRight: 86,
    top: -44,
    // backgroundColor: 'pink',
    borderRadius: 3,
  },
  arrow: {
    borderTopColor: 'pink',
    height: 0,
    opacity: 0,
  },
  background: {
    // backgroundColor: 'rgba(0, 0, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  popoverItemText: {
    // fontSize: 16,
    marginVertical: 0,
  },
  shadow: {
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: theme.sizes.margin / 4,
    marginVertical: theme.sizes.margin / 6,
    height: 450,
  },
  spaceBetween: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

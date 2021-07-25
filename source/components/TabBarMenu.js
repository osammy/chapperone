/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  StatusBar,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {TabBar} from 'react-native-tab-view';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {theme} from '../constants';

import {enableInclusionContact} from '../actions/AppActions';

// const SCREEN_WIDTH = Dimensions.get('window').width;
// const TAB_BAR_WIDTH = (90 * SCREEN_WIDTH) / 100; //90% of screen
// const TAB_AND_INDICATOR_WIDTH = TAB_BAR_WIDTH / 3;
// const CAMERA_WIDTH = (10 * SCREEN_WIDTH) / 100; //10% of screen

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_BAR_WIDTH = Dimensions.get('window').width;
const TAB_AND_INDICATOR_WIDTH = TAB_BAR_WIDTH / 3;


class TabBarMenu extends Component {
  render() {
    return (
      <View style={{backgroundColor: '#ddd', elevation: 3}}>
        {/* <StatusBar backgroundColor={theme.colors.statusbar} /> */}
        <View style={{flexDirection: 'row'}}>
          {/* <View
            style={{
              width: CAMERA_WIDTH,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity onPress={() => alert('this is a camera!')}>
              <Image
                source={require('../images/ic_photo_camera.png')}
                style={{height: 20, width: 20}}
              />
            </TouchableOpacity>
          </View> */}

          <View style={{alignItems: 'flex-end'}}>
            <TabBar
              {...this.props}
              style={{
                width: TAB_BAR_WIDTH,
                // elevation: 0,
                backgroundColor: 'white',
                // borderWidth: 1,
                shadowColor: theme.colors.black,
                shadowOffset: {
                  width: 0,
                  height: 6,
                },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 5,
              }}
              indicatorStyle={{width: TAB_AND_INDICATOR_WIDTH}}
              tabStyle={{width: TAB_AND_INDICATOR_WIDTH}}
              // renderIcon={({ route, focused, color }) => (
              //   <MaterialIcons
              //     name={focused ? 'person-add' : 'library-add'}
              //     color={theme.colors.white}
              //   />
              // )}
              activeColor={theme.colors.primary}
              inactiveColor={theme.colors.gray}
            />
          </View>
        </View>
      </View>
    );
  }
}

export default connect(null, {enableInclusionContact})(TabBarMenu);

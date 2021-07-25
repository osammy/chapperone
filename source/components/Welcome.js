/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  FlatList,
  Modal,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  View,
  AsyncStorage,
} from 'react-native';

import {Button, Block, Text} from '../UI';
import {theme, keys} from '../constants';
import {Actions} from 'react-native-router-flux';
import TermsOfService from './Terms';

const {width, height} = Dimensions.get('window');

class Welcome extends Component {
  static navigationOptions = {
    header: null,
  };

  scrollX = new Animated.Value(0);

  state = {
    showTerms: false,
  };

  renderTermsService() {
    return (
      <Modal
        animationType="slide"
        visible={this.state.showTerms}
        onRequestClose={() => this.setState({showTerms: false})}>
        <TermsOfService
          isDisplayedInModal
          closeModal={() => this.setState({showTerms: false})}
        />
      </Modal>
    );
  }

  renderIllustrations() {
    const {illustrations} = this.props;

    return (
      <FlatList
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        snapToAlignment="center"
        data={illustrations}
        // extraData={this.state}
        keyExtractor={(item, index) => `${item.id}`}
        renderItem={({item}) => (
          <Image
            source={item.source}
            resizeMode="contain"
            style={styles.imageStyle}
          />
        )}
        onScroll={Animated.event([
          {
            nativeEvent: {contentOffset: {x: this.scrollX}},
          },
        ])}
      />
    );
  }

  renderSteps() {
    const {illustrations} = this.props;
    const stepPosition = Animated.divide(this.scrollX, width);
    return (
      <Block row center middle style={styles.stepsContainer}>
        {illustrations.map((item, index) => {
          const opacity = stepPosition.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Block
              animated
              flex={false}
              key={`step-${index}`}
              color="gray"
              style={[styles.steps, {opacity}]}
            />
          );
        })}
      </Block>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.viewContainer}>
        <StatusBar
          backgroundColor={theme.colors.white}
          barStyle="dark-content"
        />
        <View style={styles.topContent}>
          <Text h1 center>
            <Text h1 primary>
              Easier
            </Text>
            and
            <Text h1 primary>
              Safer
            </Text>
            group travel.
          </Text>
          <Text h3 center gray2 style={{marginTop: theme.sizes.padding / 2}}>
            Enjoy the experience.
          </Text>
        </View>
        <Block center middle>
          {this.renderIllustrations()}
          {this.renderSteps()}
        </Block>
        <Block middle flex={0.5} margin={[0, theme.sizes.padding * 2]}>
          <Button style={styles.card} onPress={Actions.LoginScreen}>
            <Text size={18} color={theme.colors.primary} center semibold>
              PROCEED
            </Text>
          </Button>
          <Button onPress={() => this.setState({showTerms: true})}>
            <Text center caption gray>
              Terms of service
            </Text>
          </Button>
        </Block>
        {this.renderTermsService()}
      </SafeAreaView>
    );
  }
}

// Welcome.defaultProps = {
//   illustrations: [
//     {id: 1, source: require('../assets/images/user-student.png')},
//     {id: 2, source: require('../assets/images/user-hp.png')},
//     {id: 3, source: require('../assets/images/user-cool.png')},
//   ],
// };

Welcome.defaultProps = {
  illustrations: [
    {id: 1, source: require('../assets/icon_set/icon_n_text_500px.jpg')},
  ],
};
// {id: 1, source: require('../assets/icon_set/icon_only_small.jpg')},

export default Welcome;

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },
  stepsContainer: {
    position: 'absolute',
    // bottom: height / 2,
    bottom: theme.sizes.base * 6,
    right: 0,
    left: 0,
  },
  steps: {
    width: 5,
    height: 5,
    borderRadius: 5,
    marginHorizontal: 2.5,
  },
  card: {
    shadowColor: theme.colors.gray2,
    backgroundColor: 'snow',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  topContent: {
    marginTop: 10,
    textAlign: 'center',
  },
  imageStyle: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    width,
    height: height / 2,
    maxWidth: 600,
    maxHeight: 600,
    overflow: 'visible',
  },
});

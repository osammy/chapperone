/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Animated,
  View,
  FlatList,
  TouchableHighlight,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {theme} from '../constants';
import {Text, Badge, Block} from '../UI';
import {Actions} from 'react-native-router-flux';

const {width} = Dimensions.get('window');

export default class ScrollSwagger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollY: new Animated.Value(0),
      dataSource: [
        {
          email: 'o@g.com',
          name: 'Juliana Freitas',
          profileImage: 'https://bootdey.com/img/Content/avatar/avatar5.png',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          message: 'I love theophilus sunday',
          lastMessage:
            'How are you, i heard you are not feeling too well, I was told by',
        },
        {
          email: 'juliana@example.com',
          name: 'Joshua King',
          profileImage: 'https://bootdey.com/img/Content/avatar/avatar5.png',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          message: 'I love theophilus sunday',
          lastMessage: 'I forgot to tell you i love you',
        },
        {
          email: 'juliana@example.com',
          name: 'Alison Ludick',
          profileImage: 'https://bootdey.com/img/Content/avatar/avatar5.png',
          avatar: 'https://randomuser.me/api/portraits/women/46.jpg',
          message: 'I love theophilus sunday',
          lastMessage: "You wouldn't believe what i see",
        },
        {
          email: 'juliana@example.com',
          name: 'Megan More',
          profileImage: 'https://bootdey.com/img/Content/avatar/avatar5.png',
          avatar: 'https://randomuser.me/api/portraits/women/47.jpg',
          message: 'I love theophilus sunday',
          lastMessage: "You wouldn't believe what i see",
        },
        {
          email: 'juliana@example.com',
          name: 'Dejan Lovren',
          profileImage: 'https://bootdey.com/img/Content/avatar/avatar5.png',
          avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
          message: 'I play for liverpool',
          lastMessage: "You wouldn't believe what i see",
        },
        {
          email: 'juliana@example.com',
          name: 'Marcus Rashford',
          profileImage: 'https://bootdey.com/img/Content/avatar/avatar5.png',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
          message: 'I love theophilus sunday',
          lastMessage: 'I play for the greatest club in the world',
        },
        {
          email: 'juliana@example.com',
          name: 'Joseph Imafidon',
          profileImage: 'https://bootdey.com/img/Content/avatar/avatar5.png',
          avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
          message: 'I love theophilus sunday',
          lastMessage: 'I am learnin Angular 2',
        },
        {
          email: 'juliana@example.com',
          name: 'Betty Olorunsogo',
          profileImage: 'https://bootdey.com/img/Content/avatar/avatar5.png',
          avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
          message: 'I love theophilus sunday',
          lastMessage: 'I love jesus',
        },
        {
          email: 'juliana@example.com',
          name: 'Ella Osunde',
          profileImage: 'https://bootdey.com/img/Content/avatar/avatar5.png',
          avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
          message: 'I love theophilus sunday',
          lastMessage: 'I love jesus as well',
        },
        {
          email: 'juliana@example.com',
          name: 'Mahogany Paige',
          profileImage: 'https://bootdey.com/img/Content/avatar/avatar5.png',
          avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
          message: 'I love theophilus sunday',
          lastMessage: 'Follow me on instagram @mahopage',
        },
        {
          email: 'juliana@example.com',
          name: 'Oluwafemi Anjorin',
          profileImage: 'https://bootdey.com/img/Content/avatar/avatar5.png',
          avatar: 'https://randomuser.me/api/portraits/men/30.jpg',
          message: 'I love theophilus sunday',
          lastMessage: 'I did not buy samuels chocolate',
        },
        {
          email: 'juliana@example.com',
          name: 'Kamoru Babajide',
          profileImage: 'https://bootdey.com/img/Content/avatar/avatar5.png',
          avatar: 'https://randomuser.me/api/portraits/men/40.jpg',
          message: 'I love theophilus sunday',
          lastMessage: 'Awesome God',
        },
      ],
    };
  }

  renderItem = ({item, index}) => {
    return (
      <TouchableHighlight
        key={index}
        onPress={() =>
          Actions.chat({
            title: item.name,
            contactName: item.name,
            contactEmail: item.email,
          })
        }>
        <View style={styles.listItem}>
          <Image source={{uri: item.avatar}} style={styles.avatar} />
          <View style={styles.content}>
            <Block style={styles.chatTop} row space="between">
              <Text style={styles.chatName}>{item.name}</Text>
              <Text color={theme.colors.primary}>15:20</Text>
            </Block>
            <Block row space="between">
              <Text
                numberOfLines={1}
                color={theme.colors.gray}
                style={styles.lastMessage}>
                {item.lastMessage}
              </Text>
              <Badge color={theme.colors.primary} size={20}>
                <Text color={theme.colors.white}>3</Text>
              </Badge>
            </Block>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  renderScroll = props => {
    return (
      <Animated.ScrollView
        {...props}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 180,
        }}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {contentOffset: {y: this.state.scrollY}},
            },
          ],
          {listener: () => console.log(this.state.scrollY)}, //Added listener
          {
            useNativeDriver: true,
          },
        )}
      />
    );
  };

  render() {
    var headMov = this.state.scrollY.interpolate({
      inputRange: [0, 180, 181],
      outputRange: [0, -180, -180],
    });
    var headColor = this.state.scrollY.interpolate({
      inputRange: [0, 180],
      outputRange: ['red', 'blue'],
    });
    return (
      <View style={{flex: 1}}>
        <FlatList
          data={this.state.dataSource}
          renderItem={this.renderItem}
          renderScrollComponent={this.renderScroll}
        />
        <Animated.View
          style={{
            position: 'absolute',
            height: 250,
            width: width,
            top: 0,
            backgroundColor: headColor,
            transform: [{translateY: headMov}],
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
    borderBottomWidth: 1,
    borderColor: theme.colors.gray2,
  },
  lastMessage: {fontSize: 13, width: '93%'},
});

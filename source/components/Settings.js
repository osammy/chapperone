import React, {Component} from 'react';
import {
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  SafeAreaView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Lightbox from 'react-native-lightbox';

import {Divider, Button, Block, Text, Switch, Header} from '../UI';
import {theme, mocks} from '../constants';
import {Actions} from 'react-native-router-flux';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {
  uploadFileToFirebase,
  getUserFromAsyncStorage,
  setUserToken,
  handleError,
} from '../resources/utils';
import {
  validateImages,
  pickSingleImage,
} from '../resources/utils/imageUploader';
import {connect} from 'react-redux';
import {putWithAuth, getWithAuth} from '../resources/controllers/data';
import {getUrl} from '../resources/controllers/url';
import {formatDate} from '../resources/utils';

class Settings extends Component {
  state = {
    notifications: true,
    newsletter: false,
    editing: null,
    profile: {dob: ''},
    imageUploadLoading: false,
  };

  leftItems = [
    {
      iconName: 'arrow-back',
      showCondition: true,
      onPress: Actions.pop,
      style: {color: theme.colors.primary},
    },
  ];

  async componentDidMount() {
    const user = await getUserFromAsyncStorage();
    this.setState({profile: user});
  }

  handleEdit(name, text) {
    const {profile} = this.state;
    profile[name] = text;

    this.setState({profile});
  }

  handleImageUpload = async () => {
    try {
      const imageObj = await pickSingleImage({multiple: false});

      const validOptions = {
        max_size_per_image: 10, //
        max_no_of_images: 1,
        total_images_size: 10,
      };

      const result = validateImages(imageObj, validOptions);
      if (result.error) {
        const customError = {
          title: 'Image Upload failed!',
          message: result.message,
        };
        handleError(null, 'toast', customError);
        return;
      }

      this.setState({imageUploadLoading: true});
      const refNode = `/user_assets/${imageObj.filename}`;

      const imageUrl = await uploadFileToFirebase(imageObj, refNode);
      const body = {avatar: imageUrl};
      const {_id} = await getUserFromAsyncStorage();
      await this.updateUser(_id, body);
      const new_token = await this.getNewUserAuthToken(_id);
      if (new_token) {
        await setUserToken(new_token);
        this.setState({
          profile: {...this.state.profile, avatar: imageUrl},
          imageUploadLoading: false,
        });
      } else {
        throw new Error('token is not defined!');
      }
    } catch (e) {
      this.setState({imageUploadLoading: false});
      handleError(e);
    }
  };

  updateUser = (id, updateObj) => {
    const baseUrl = getUrl('users');
    const url = `${baseUrl}/${id}`;
    return putWithAuth(url, updateObj);
  };

  getNewUserAuthToken = id => {
    return new Promise((resolve, reject) => {
      const baseUrl = getUrl('users');
      const url = `${baseUrl}/${id}/token`;
      getWithAuth(url)
        .then(resp => {
          const token = resp.data.data;
          resolve(token);
        })
        .catch(reject);
    });
  };

  toggleEdit(name) {
    const {editing} = this.state;
    this.setState({editing: !editing ? name : null});
  }

  renderImageLoading() {
    if (this.state.imageUploadLoading) {
      return (
        <View style={styles.imageLoader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
  }

  renderEdit(name) {
    const {profile, editing} = this.state;

    if (editing === name) {
      return (
        <TextInput
          defaultValue={profile[name]}
          onChangeText={text => this.handleEdit([name], text)}
        />
      );
    }

    return <Text bold>{profile[name]}</Text>;
  }

  render() {
    const {profile, editing, imageUploadLoading} = this.state;
    const showAvatar = profile.avatar && profile.avatar !== '';

    // return (
    //   <Lightbox
    //   style={{marginTop: 33.5}}
    //     underlayColor="black"
    //     renderHeader={close => (
    //       <TouchableOpacity onPress={close}>
    //         <Text style={styles.closeButton}>Close</Text>
    //       </TouchableOpacity>
    //     )}>
    //     <View style={styles.customHeaderBox}>
    //       <Text>I have a custom header</Text>
    //       <Image
    //         style={styles.contain}
    //         resizeMode="contain"
    //         source={{
    //           uri:
    //             'https://www.yayomg.com/wp-content/uploads/2014/04/yayomg-pig-wearing-party-hat.jpg',
    //         }}
    //       />
    //     </View>
    //   </Lightbox>
    // );

    return (
      <SafeAreaView>
        <Header
          leftItems={this.leftItems}
          //   rightItems={this.state.rightItems}
          // title="Notifications"
        />
        <Block flex={false} row center space="between" style={styles.header}>
          <Text h1 bold>
            Settings
          </Text>
          <Button
            disabled={imageUploadLoading}
            onPress={this.handleImageUpload}>
            {showAvatar ? (
              <Image source={{uri: profile.avatar}} style={styles.avatar} />
            ) : (
              <View style={styles.circleOver}>
                <MaterialIcon
                  name="person"
                  color={theme.colors.gray}
                  size={30}
                />
              </View>
            )}
            {this.renderImageLoading()}
          </Button>
        </Block>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Block style={styles.inputs}>
            <Block row space="between" margin={[10, 0]} style={styles.inputRow}>
              <Block>
                <Text gray2 style={{marginBottom: 10}}>
                  Username
                </Text>
                {this.renderEdit('username')}
              </Block>
              {/* <Text
                medium
                secondary
                onPress={() => this.toggleEdit('username')}>
                {editing === 'username' ? 'Save' : 'Edit'}
              </Text> */}
            </Block>
            <Block row space="between" margin={[10, 0]} style={styles.inputRow}>
              <Block>
                <Text gray2 style={{marginBottom: 10}}>
                  D.O.B
                </Text>
                <Text>{formatDate(this.state.profile.dob, '-')}</Text>
              </Block>
              {/* <Text
                medium
                secondary
                onPress={() => this.toggleEdit('location')}>
                {editing === 'location' ? 'Save' : 'Edit'}
              </Text> */}
            </Block>
            <Block row space="between" margin={[10, 0]} style={styles.inputRow}>
              <Block>
                <Text gray2 style={{marginBottom: 10}}>
                  E-mail
                </Text>
                <Text bold>{profile.email}</Text>
              </Block>
            </Block>
          </Block>

          <Divider margin={[theme.sizes.base, theme.sizes.base * 2]} />

          <Divider />

          {/* <Block style={styles.toggles}>
            <Block
              row
              center
              space="between"
              style={{marginBottom: theme.sizes.base * 2}}>
              <Text gray2>Notifications</Text>
              <Switch
                value={this.state.notifications}
                onValueChange={value => this.setState({notifications: value})}
              />
            </Block>

            <Block
              row
              center
              space="between"
              style={{marginBottom: theme.sizes.base * 2}}>
              <Text gray2>Direct Message</Text>
              <Switch
                value={this.state.newsletter}
                onValueChange={value => this.setState({newsletter: value})}
              />
            </Block>
          </Block> */}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

Settings.defaultProps = {
  profile: mocks.profile,
};

const mapStateToProps = state => {
  return {
    user: state.AuthReducer.user,
  };
};

export default connect(mapStateToProps)(Settings);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.sizes.base * 2,
  },
  avatar: {
    height: theme.sizes.base * 2.2,
    width: theme.sizes.base * 2.2,
    borderRadius: theme.sizes.base * 1.1,
  },
  inputs: {
    marginTop: theme.sizes.base * 0.7,
    paddingHorizontal: theme.sizes.base * 2,
  },
  inputRow: {
    alignItems: 'flex-end',
  },
  sliders: {
    marginTop: theme.sizes.base * 0.7,
    paddingHorizontal: theme.sizes.base * 2,
  },
  thumb: {
    width: theme.sizes.base,
    height: theme.sizes.base,
    borderRadius: theme.sizes.base,
    borderColor: 'white',
    borderWidth: 3,
    backgroundColor: theme.colors.secondary,
  },
  toggles: {
    paddingHorizontal: theme.sizes.base * 2,
  },
  circleOver: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
    alignItems: 'center',
  },
  imageLoader: {
    // width: 50,
    // height: 50,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

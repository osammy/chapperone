/* eslint-disable handle-callback-err */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Alert,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Image,
  Dimensions,
  View,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {DatePicker} from 'native-base';
import ImagePicker from 'react-native-image-crop-picker';
import {Icon} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import storage from '@react-native-firebase/storage';
import {getStatusBarHeight} from 'react-native-status-bar-height';
// import DateTimePicker from '@react-native-community/datetimepicker';

import {Button, Block, Input, Text, DateTimePicker} from '../../UI';
import {theme} from '../../constants';
import {Actions} from 'react-native-router-flux';
import {getUrl} from '../../resources/controllers/url';
import {post, postWithAuth} from '../../resources/controllers/data/index';
import {
  getUserFromAsyncStorage,
  handleError,
  formatDate,
} from '../../resources/utils';
import {RNToasty} from 'react-native-toasty';
import {ImageView, DateSelect} from './components';

const StatusBarHeight = getStatusBarHeight();

const FireBaseStorage = storage();
const {width} = Dimensions.get('window');

export default class CreateTrip extends Component {
  constructor(props) {
    super(props);

    this.defaultDate = new Date();
    this.defaultStartDate = new Date();
    this.defaultEndDate = new Date();

    let name = '';
    let description = '';
    let startDate = this.defaultDate;
    let endDate = this.defaultDate;
    let prevImageCount = 0;
    let copyOfTrip = {};

    if (this.props.editMode) {
      const trip = this.props.trip;
      name = trip.name;
      description = trip.description;
      prevImageCount = trip.images.length;
      startDate = trip.start_date;
      endDate = trip.end_date;
      copyOfTrip = {...trip};
    }

    this.state = {
      name,
      copyOfTrip,
      prevImageCount,
      location: null,
      destination: null,
      description,
      image: null,
      images: [],
      startDate,
      endDate,
      errors: [],
      loading: false,
      loadingImagePicker: false,
      chosenDate: new Date(),
      showStartDateModal: false,
      showEndDateModal: false,
    };
  }

  openImagePicker = () => {
    ImagePicker.openPicker({
      multiple: true,
      mediaType: 'photo',
    })
      .then(images => {})
      .catch(err => {
        // console.log('User cancelled image uplaod!');
      });
  };

  createTrip = async () => {
    const {
      name,
      description,
      startDate: start_date,
      endDate: end_date,
      loading,
    } = this.state;
    const {isDisplayedInModal, closeModal, addToTrips} = this.props;
    // return if loading
    if (loading) {
      return;
    }

    function generateCode() {
      let text = '';
      const alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      for (let i = 0; i < 11; i++) {
        text += alphaNumeric.charAt(Math.floor(Math.random() * 11));
      }

      return text;
    }
    const errors = [];

    Keyboard.dismiss();
    this.setState({loading: true});

    // check with backend API or with some static data
    if (name === '') {
      errors.push('name');
    }
    if (description === '') {
      errors.push('description');
    }

    if (start_date.getTime() < this.defaultStartDate.getTime()) {
      errors.push('start_date');
    }

    if (end_date.getTime() < this.defaultEndDate.getTime()) {
      errors.push('end_date');
    }

    if (end_date.getTime() < start_date.getTime()) {
      errors.push('start_date');
      errors.push('end_date');
      Alert.alert(
        'Error',
        '"End date" must be later than "Start Date" and they both must be in the future!',
      );
    }

    if (errors.length > 0) {
      this.setState({errors, loading: false});
      return;
    }
    try {
      const {_id: trip_leader} = await getUserFromAsyncStorage();
      if (!trip_leader) {
        Alert.alert('Failed', 'Could not get credentials');
        return;
      }
      const join_code = generateCode();
      // Leave trip_itinerary empth for now, it will be added in the trip page
      const trip_itinerary = [];

      const result = this.validImages(this.state.images);

      if (result.error) {
        RNToasty.Normal({title: result.message});
        this.setState({loading: false});
        return;
      }

      const imagesPromise = [];
      result.images.forEach(image =>
        imagesPromise.push(this.uploadFileToFireBase(image)),
      );
      const images = await Promise.all(imagesPromise);

      const data = {
        name,
        description,
        start_date,
        end_date,
        join_code,
        trip_leader,
        images,
        trip_itinerary,
      };

      const url = getUrl('trips');
      const {data: trip} = await postWithAuth(url, data);

      if (isDisplayedInModal && closeModal && addToTrips) {
        // close modal
        closeModal();
        // Add to list of trips
        addToTrips(trip.data);
        //Actions.TripsScreen({trip});
      } else {
        // Necessary when we need to display this component as a fullpage rather modal
        Actions.TripsScreen({trip});
      }
      // Clean up images in the temp file on device
      this.cleanupImages();
    } catch (e) {
      this.setState({loading: false});
      handleError(e);
    }
  };

  editTrip = async () => {
    const {startDate, endDate} = this.state;
    const start_date = new Date(startDate);
    const end_date = new Date(endDate);
    const {name, description, loading} = this.state;
    const {isDisplayedInModal, closeModal, updateTrip, trip} = this.props;
    // return if loading
    if (loading) {
      return;
    }

    const errors = [];

    Keyboard.dismiss();
    this.setState({loading: true});

    // check with backend API or with some static data
    if (name === '') {
      errors.push('name');
    }
    if (description === '') {
      errors.push('description');
    }

    // if (start_date.getTime() < this.defaultStartDate.getTime()) {
    //   alert('he');

    //   errors.push('start_date');
    // }

    // if (end_date.getTime() < this.defaultEndDate.getTime()) {
    //   alert('her');

    //   errors.push('end_date');
    // }

    if (end_date.getTime() < start_date.getTime()) {
      errors.push('start_date');
      errors.push('end_date');
      Alert.alert(
        'Error',
        '"End date" must be later than "Start Date" and they both must be in the future!',
      );
    }

    if (errors.length > 0) {
      this.setState({errors, loading: false});
      return;
    }
    try {
      const _id = trip._id; //current trip id
      const data = {
        name,
        description,
        start_date,
        end_date,
      };

      if (!data.images) {
        if (this.state.images.length > 0) {
          const result = this.validImages(this.state.images);

          if (result.error) {
            RNToasty.Normal({title: result.message});
            this.setState({loading: false});
            return;
          }

          const imagesPromise = [];
          result.images.forEach(image =>
            imagesPromise.push(this.uploadFileToFireBase(image)),
          );
          const images = await Promise.all(imagesPromise);
          //Upload new images
          data.images = images;
        }
      }

      await updateTrip(_id, data);
      await this.cleanupImages();
      closeModal();
      // Clean up images in the temp file on device
      this.setState({loading: false});
    } catch (e) {
      this.setState({loading: false});
      handleError(e);
    }
  };

  handleCreateTrip = async () => {
    if (this.props.editMode) {
      this.editTrip();
    } else {
      this.createTrip();
    }
  };

  checkIosPhotoLibPermissions = () => {
    check(PERMISSIONS.IOS.PHOTO_LIBRARY)
      .then(result => {})
      .catch(error => {
        // …
      });
  };

  validImages(images) {
    const max_size_per_image = 6 * 1024 * 1024; // 6mb is max iage size per image
    const max_no_of_images = 6;
    const total_images_size = 10 * 1024 * 1024; // max sum of all the sizes of images to be uploaded
    const copyOfImages = [...images];
    let total = 0;

    if (images.length > max_no_of_images) {
      return {
        error: true,
        images: [],
        message: `Images must not exceed ${max_no_of_images} in number.`,
      };
    }
    for (let i = 0; i < copyOfImages.length; i++) {
      if (copyOfImages[i].size > max_size_per_image) {
        return {
          error: true,
          images: [],
          message: `Each image size must not exceed ${max_size_per_image}mb`,
        };
      }

      total += 1;
    }

    if (total > total_images_size) {
      return {
        error: true,
        images: [],
        message: `Total sum of all images size must not exceed ${total_images_size}mb`,
      };
    }

    return {
      error: false,
      images: copyOfImages,
      message: 'Success',
    };
  }

  setStartDate = newDate => {
    this.setState({startDate: newDate});
  };
  setEndDate = newDate => {
    this.setState({endDate: newDate});
  };
  //upload code

  uploadFileToFireBase = async image => {
    const ref = FireBaseStorage.ref(`/trip_assets/${image.filename}`);
    await ref.putFile(image.uri);
    return ref.getDownloadURL();
  };

  cleanupImages() {
    ImagePicker.clean()
      .then(() => {
        //Alert.alert('Cleared', 'Temporary images history cleared');
      })
      .catch(e => {
        //Alert.alert('Error', e.message);
      });
  }

  AsyncAlert = () =>
    new Promise(resolve => {
      Alert.alert(
        'Grant Access',
        'To use this app to the full, you will need to enable access to your photolibrary, you can do that from settings',
        [
          {
            text: 'Settings',
            onPress: () => {
              Linking.openSettings();
              resolve(false);
            },
          },
          {
            text: 'Proceed',
            onPress: () => resolve(false),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    });

  pickMultiple = async () => {
    const isIos = Platform.OS === 'ios';

    ImagePicker.openPicker({
      multiple: true,
      waitAnimationEnd: false,
      // includeExif: true,
      forceJpg: true,
      mediaType: 'photo',
    })
      .then(async images => {
        this.setState({
          image: null,
          images: images.map(i => {
            const uri = i.path;
            const filename = isIos ? i.filename : uri.replace(/^.*[\\\/]/, '');

            return {
              uri,
              width: i.width,
              height: i.height,
              mime: i.mime,
              size: i.size,
              filename,
            };
          }),
        });
      })
      .catch(e => {
        // Alert.alert('Error', e.message);
        RNToasty.Normal({title: e.message});
      });
  };

  renderImage = image => {
    return (
      <View style={styles.GridViewBlockStyle}>
        <Image style={styles.imgView} source={image} />
        <Button
          style={styles.cancelStyle}
          onPress={() => this.removeImage(image.uri)}>
          <MaterialIcons
            name="clear"
            color={theme.colors.gray2}
            size={theme.sizes.font * 1.5}
          />
        </Button>
      </View>
    );
  };

  removeImage = imageUri => {
    const new_images = this.state.images.filter(el => el.uri !== imageUri);
    this.setState({images: new_images});
  };

  renderAsset(image) {
    if (image.mime && image.mime.toLowerCase().indexOf('video/') !== -1) {
      return this.renderVideo(image);
    }

    return this.renderImage(image);
  }

  formatChosenDate = date => {
    if (this.props.editMode) {
      date = new Date(date);
    }
    return [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('/');
  };

  handleDateChange = (key, date) => {
    console.log(date);
    // const selectedDate = typeof date === 'string' ? new Date(date) : date;
    const selectedDate = new Date(date);
    this.setState({[key]: this.formatChosenDate(selectedDate)});
  };
  handleStartDateChange = (_, date) => {
    // const selectedDate = typeof date === 'string' ? new Date(date) : date;
    const selectedDate = new Date(date);
    this.setState({startDate: this.formatChosenDate(selectedDate)});
    // set end date to start date by default once selected start date is selected just a user experience thing nothing more
    this.handleEndDateChange(_, date);
  };
  handleEndDateChange = (_, date) => {
    // const selectedDate = typeof date === 'string' ? new Date(date) : date;
    const selectedDate = new Date(date);
    this.setState({endDate: this.formatChosenDate(selectedDate)});
  };

  closeStartDatePicker = () => {
    this.setState({showStartDateModal: false});
  };
  closeEndDatePicker = () => {
    this.setState({showEndDateModal: false});
  };

  render() {
    const {loading, errors} = this.state;
    const hasErrors = key => (errors.includes(key) ? styles.hasErrors : null);

    return (
      <ScrollView style={styles.topContainer}>
        {/* <ScrollView keyboardShouldPersistTaps="always"> */}
        {/* // begin header */}
        {this.props.isDisplayedInModal && (
          <Block style={{flex: 0, paddingHorizontal: 15}} row space="between">
            <Button onPress={this.props.closeModal}>
              <MaterialIcons
                name="clear"
                color={theme.colors.primary}
                size={theme.sizes.font * 2.5}
              />
            </Button>
            <Button style={styles.createBtn} onPress={this.handleCreateTrip}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text color={theme.colors.white} bold>
                  Submit
                </Text>
              )}
            </Button>
          </Block>
        )}
        {/* //end header */}
        <Block padding={[0, theme.sizes.base * 2]}>
          <Block>
            {!this.props.editMode && (
              <Text center size={25} color={theme.colors.primary}>
                Create Trip
              </Text>
            )}
            <Input
              label="Name of trip"
              autoCapitalize="sentences"
              error={hasErrors('name')}
              style={[styles.input, hasErrors('name')]}
              defaultValue={this.state.name}
              onChangeText={text => this.setState({name: text})}
            />
            <Input
              label="Description"
              autoCapitalize="sentences"
              error={hasErrors('description')}
              style={[styles.input, styles.textArea, hasErrors('description')]}
              defaultValue={this.state.description}
              onChangeText={text => this.setState({description: text})}
              multiline={true}
            />
            <Block margin={[20, 0]} row space="between">
              <DateSelect
                title="Start Date"
                hasErrors={hasErrors('start_date')}
                showDate={this.state.showStartDateModal}
                handleShowDate={() => this.setState({showStartDateModal: true})}
                value={new Date(this.state.startDate)}
                handleDateChange={this.handleStartDateChange}
                closeDatePicker={this.closeStartDatePicker}
                formatChosenDate={this.formatChosenDate}
                editMode={this.props.editMode}
              />
              <DateSelect
                title="End Date"
                hasErrors={hasErrors('end_date')}
                showDate={this.state.showEndDateModal}
                handleShowDate={() => this.setState({showEndDateModal: true})}
                value={new Date(this.state.endDate)}
                handleDateChange={this.handleEndDateChange}
                closeDatePicker={this.closeEndDatePicker}
                formatChosenDate={this.formatChosenDate}
                editMode={this.props.editMode}
              />
            </Block>
          </Block>
          <View />

          <ImageView
            removeImage={this.removeImage}
            pickMultiple={this.pickMultiple}
            loadingImagePicker={this.state.loadingImagePicker}
            editMode={this.props.editMode}
            renderImage={this.renderImage}
            images={this.state.images}
            prevImageCount={this.state.prevImageCount}
          />
        </Block>
        {!this.props.isDisplayedInModal && (
          <Block style={styles.bottomFixed}>
            <Button gradient onPress={this.handleCreateTrip}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text bold white center>
                  Create Trip
                </Text>
              )}
            </Button>
          </Block>
        )}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  signup: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hasErrors: {
    borderBottomColor: theme.colors.accent,
    color: theme.colors.accent,
  },
  buttonStyles: {
    backgroundColor: 'transparent',
  },
  prevImage: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    // flexWrap: 'wrap',
  },
  imgContainer: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // width: 170,
    // height: 120,
    // borderWidth: 1,
    // borderColor: theme.colors.gray2,
  },

  bottomFixed: {
    position: 'absolute',
    bottom: 20,
    width: 350,
    left: (width - 350) * 0.5,
  },
  createBtn: {
    flex: 0.3,
    backgroundColor: theme.colors.primary,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  placeHolderTextStyle: {
    color: theme.colors.gray2,
    paddingLeft: 0,
  },
  imagePreviewContainer: {
    backgroundColor: '#ccc',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  imagePreviewText: {
    color: theme.colors.gray,
    fontSize: 25,
    fontVariant: ['tabular-nums'],
    // fontFamily: "Cochin",
  },
  // new
  MainContainer: {
    justifyContent: 'center',
    flex: 1,
    // margin: 10,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    // height: 900,
    // borderWidth: 1,
  },
  topContainer: {
    ...Platform.select({
      ios: {
        marginTop: StatusBarHeight,
      },
      android: {
        marginTop: 0,
      },
    }),
  },

  dateStyle: {
    ...Platform.select({
      android: {
        marginTop: 50,
      },
    }),
  },

  textArea: {
    height: 100,
  },
});

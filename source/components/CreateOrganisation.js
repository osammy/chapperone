import React, {useState} from 'react';
import {
  StyleSheet,
  Dimensions,
  Alert,
  View,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {Icon, Picker} from 'native-base';
import CountryPicker from 'react-native-country-picker-modal';

import {Input, Text, Header, Block, Button} from '../UI';
import {theme} from '../constants';
import {getUrl} from '../resources/controllers/url';
import {post} from '../resources/controllers/data';
import {ScrollView} from 'react-native-gesture-handler';
import {RNToasty} from 'react-native-toasty';
import {handleError} from '../resources/utils';

const {width} = Dimensions.get('window');

function CreateOrganisation() {
  const [countryCode, setCountryCode] = useState('US');
  const [country, setCountry] = useState('United States');
  const [loading, setLoading] = useState(false);
  const [organisation, setOrganisation] = useState({
    name: '',
    street_address: '',
    state: '',
    country,
    user_created: true,
    validated: false,
    type: '',
  });
  const [type, setType] = useState('');

  const leftItems = [
    {
      iconName: 'arrow-back',
      showCondition: true,
      onPress: Actions.pop,
      style: {color: theme.colors.primary},
    },
  ];

  function onSelect(selectedCountry) {
    setCountryCode(selectedCountry.cca2);
    setCountry(selectedCountry);
    handleFormValueChange('country', selectedCountry.name);
  }

  function handleFormValueChange(key, value) {
    setOrganisation({...organisation, [key]: value});
    if ((key = 'type')) {
      setType(value);
    }
  }

  function validInputs() {
    if (organisation.name === '') {
      return {
        valid: false,
        message: 'School name is invalid',
      };
    }
    if (organisation.type === '') {
      return {
        valid: false,
        message: 'School name is invalid',
      };
    }
    if (organisation.state === '') {
      return {
        valid: false,
        message: 'State  is invalid',
      };
    }
    if (organisation.street_address === '') {
      return {
        valid: false,
        message: 'Street Address is invalid',
      };
    }

    return {
      valid: true,
    };
  }
  async function handleSubmit() {
    const result = validInputs();
    if (!result.valid) {
      Alert.alert('Invalid input', result.message);
      return;
    }
    try {
      setLoading(true);
      const uri = getUrl('organisations');
      await post(uri, organisation);
      setLoading(false);
      const toast = Platform.OS === 'ios' ? RNToasty.Normal : RNToasty.Success;
      toast({title: 'Added Succesfully!'});
      Actions.pop();
    } catch (e) {
      setLoading(false);
      handleError(e);
    }
  }

  return (
    <ScrollView>
      <Header leftItems={leftItems} title="Add School" />

      <View style={styles.container}>
        <Input
          onChangeText={text => handleFormValueChange('name', text)}
          style={styles.input}
          label="Enter Name"
        />
        <Text gray2>Select Category</Text>
        <Picker
          mode="dropdown"
          iosIcon={
            <Icon style={{color: theme.colors.gray}} name="arrow-down" />
          }
          iosHeader="School or Organisation"
          placeholder="Select Type"
          style={styles.pickerStyle}
          textStyle={{color: theme.colors.gray}}
          selectedValue={type}
          onValueChange={value => handleFormValueChange('type', value)}>
          <Picker.Item key="2" label="Select type" value="" />
          <Picker.Item key="1" label="School" value="school" />
          <Picker.Item key="2" label="Organization" value="organisation" />
        </Picker>
        <Text gray2>Select Country</Text>
        <CountryPicker
          containerButtonStyle={styles.containerButtonStyle}
          withCountryNameButton
          withFlag
          withEmoji
          countryCode={countryCode}
          onSelect={onSelect}
        />
        <Input
          onChangeText={text => handleFormValueChange('state', text)}
          style={styles.input}
          label="State"
        />

        <Input
          onChangeText={text => handleFormValueChange('street_address', text)}
          style={styles.input}
          label="Street Address"
        />
        <Input
          onChangeText={text => handleFormValueChange('zip', text)}
          style={styles.input}
          label="Zip(optional)"
        />
        <Block center>
          <Button style={styles.button} onPress={handleSubmit}>
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text h3 white bold center>
                Submit
              </Text>
            )}
          </Button>
        </Block>
      </View>
    </ScrollView>
  );
}

export default CreateOrganisation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
  input: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  containerButtonStyle: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.gray2,
    paddingVertical: 10,
  },
  button: {
    // paddingHorizontal: 20,
    color: 'white',
    backgroundColor: theme.colors.primary,
    width: 150,
  },
  pickerStyle: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.gray2,
    marginBottom: 20,
    marginTop: 10,
  },
  //
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.gray2,
    margin: 0,
    paddingHorizontal: theme.sizes.horizontal,
    // ...Platform.select({
    //   ios: {
    //     marginTop: statusBarHeight,
    //   },
    // }),
    width: width,
  },
  backArrow: {
    height: 50,
    justifyContent: 'center',
    marginLeft: 0,
  },
  backIconStyle: {
    color: theme.colors.primary,
    fontSize: 30,
    paddingRight: 15,
  },
  textStyle: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 15,
  },
});

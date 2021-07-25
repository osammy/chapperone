/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import InputCode from 'react-native-input-code';
import {Actions} from 'react-native-router-flux';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import {Header, Text, Badge, Loading} from '../UI';
import {theme} from '../constants';
import {SafeAreaView} from 'react-navigation';
import {TextInput} from 'react-native-gesture-handler';
import { get } from '../resources/controllers/data';
import {getUrl} from '../resources/controllers/url';
import {handleError} from '../resources/utils';


const {width, height} = Dimensions.get('window');
const statusBarHeight = getStatusBarHeight();

function PasswordReset(props) {
  const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   if (firstTextInput) {
  //     firstTextInput.focus();
  //     console.log('yes forst imputs');
  //   }
  // }, []);

  const leftItems = [
    {
      iconName: 'arrow-back',
      showCondition: true,
      onPress: Actions.pop,
      style: {color: theme.colors.primary},
    },
  ];


  onFullFill = async code => {
    // setTimeout(() => {
    //   inputCode.reset();
    //   inputCode.focus();
    // }, 100);
    setLoading(true);
    try {
      const url =  getUrl('users');
      const params = {
        resetCode: code,
        email: props.reset.email
      }

      await get(`${url}/resetCode/validate`, params);
      setLoading(false);
      inputCode.reset();
      setTimeout(() => {
        Actions.SetNewPassword({reset:{...params}});
      })
    } catch(e) {
      handleError(e);
      setLoading(false);
      inputCode.reset();
      inputCode.focus();
    }
  };

  onChangeCode = code => {
    console.log(code);
  };

  const renderCodeInput = () => {
    return (
      <View style={styles.inputContainer}>
        <Loading noOverlay show={loading} loadingText='Verifying Code...' />
        <InputCode
          ref={ref => (inputCode = ref)}
          length={6}
          onChangeCode={onChangeCode}
          onFullFill={onFullFill}
          passcode
          passcodeChar="*"
          codeContainerStyle={{
            borderWidth: 0,
            borderBottomWidth: 2,
          }}
          codeContainerCaretStyle={{
            borderWidth: 0,
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary,
          }}
          autoFocus
        />
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <Loading show={loading} loadingText="Checking code" />
      <Header leftItems={leftItems} title="Password Reset" />
      <View style={styles.content}>
        <View style={{marginVertical: 30}}>
          <Text h3 center middle color={theme.colors.gray}>
            ENTER RESET CODE
          </Text>
        </View>
        {renderCodeInput()}
        <View style={styles.infoBox}>
          <Text color={theme.colors.primary}>
            Your password reset code is the{' '}
            <Text color={theme.colors.primary} style={{fontWeight: 'bold'}}>
              6-digit
            </Text>{' '}
            number that is sent was sent to Your registered mail
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default PasswordReset;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 30,
  },
  infoBox: {
    padding: 30,
    backgroundColor: theme.colors.lightPrimary,
    marginTop: 100,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
    marginBottom: 10,
  },
});

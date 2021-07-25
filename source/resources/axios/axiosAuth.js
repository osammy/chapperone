/* eslint-disable handle-callback-err */
import axios from 'axios';
import {AsyncStorage, Alert} from 'react-native';
import {keys} from '../../constants';

export default function axiosAuth(options) {
  AsyncStorage.getItem(keys.TOKEN_KEY)
    .then(userToken => {
      if (!userToken) {
        throw new Error('No credentials found');
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': userToken,
      };
      const optionsWithAuthHeader = {...options, headers: headers};

      return axios(optionsWithAuthHeader);
    })
    .catch(Promise.reject);
}

/* eslint-disable handle-callback-err */
import {AsyncStorage} from 'react-native';

import axios from 'axios';

import axiosAuth from '../../axios/axiosAuth';
import {keys} from '../../../constants';

function getUserToken() {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(keys.TOKEN_KEY)
      .then(token => {
        if (!token) {
          reject(new Error('Credentials not found'));
        } else {
          resolve(token);
        }
      })
      .catch(reject);
  });
}

export const getWithAuth = async (url, params) => {
  const token = await getUserToken();
  let options = {
    method: 'GET',
    url,
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token,
    },
  };

  if (params) {
    options.params = params;
  }

  return axios(options);
};

export const postWithAuth = async (url, data) => {
  const token = await getUserToken();
  let options = {
    method: 'POST',
    url,
    data,
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token,
    },
  };

  return axios(options);
};

export const putWithAuth = async (url, data) => {
  const token = await getUserToken();

  let options = {
    method: 'PUT',
    url,
    data,
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token,
    },
  };

  return axios(options);
};

export const removeWithAuth = async url => {
  const token = await getUserToken();

  let options = {
    method: 'DELETE',
    url,
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token,
    },
  };

  return axios(options);
};
//
export const get = (url, params) => {
  let options = {
    method: 'GET',
    url,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (params) {
    options.params = params;
  }

  return axios(options);
};

export const post = (url, data) => {
  let options = {
    method: 'POST',
    url,
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  return axios(options);
};

export const put = (url, data) => {
  let options = {
    method: 'PUT',
    url,
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return axiosAuth(options);
};

export const remove = url => {
  let options = {
    method: 'DELETE',
    url,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return axiosAuth(options);
};

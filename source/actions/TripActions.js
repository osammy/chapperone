/* eslint-disable curly */
import jwt_decode from 'jwt-decode';
import {RNToasty} from 'react-native-toasty';

import {getUrl} from '../resources/controllers/url';
import {getWithAuth, putWithAuth} from '../resources/controllers/data/index';

import {
  ADD_TRIP,
  ADD_TRIPS,
  TRIPS_LOADING,
  TRIP_LOADING,
  LOADING_TRIP_ITINERARY_BTN,
  UPDATE_TRIP,
  SHOW_MODIFY_ITINERARY_MODAL,
  ADD_COPY_OF_TRIP_ITINERARY,
  FAIL_LOAD_TRIP,
  FAILED_TO_LOAD_TRIPS,
  RESET_TRIPS,
  PREPEND_TRIP_TO_TRIPS,
  USER_TRIP_PERMISSIONS,
  USER_TRIP_SUB_PERMISSIONS,
  UPDATE_TRIP_EMERGENCY_CONTACTS,
} from '../resources/types';
import {getUserToken} from '../resources/utils';

/*
ActionCreator to manipulate InputText on (SignUpScreen)
*/
export const tripsLoading = loading => {
  return {
    type: TRIPS_LOADING,
    payload: loading,
  };
};

export const addCpyOfTripItinerary = tripItinerary => {
  return {
    type: ADD_COPY_OF_TRIP_ITINERARY,
    payload: tripItinerary,
  };
};

export const tripItineraryBtnLoading = loading => {
  return {
    type: LOADING_TRIP_ITINERARY_BTN,
    payload: loading,
  };
};

export const showModifyItineraryModal = loading => {
  return {
    type: SHOW_MODIFY_ITINERARY_MODAL,
    payload: loading,
  };
};

export const tripLoading = loading => {
  return {
    type: TRIP_LOADING,
    payload: loading,
  };
};
export const addTrips = trips => {
  return {
    type: ADD_TRIPS,
    payload: trips,
  };
};

export const addTrip = trip => {
  return {
    type: ADD_TRIP,
    payload: trip,
  };
};

export const prependTrip = trip => {
  return {
    type: PREPEND_TRIP_TO_TRIPS,
    payload: trip,
  };
};

export const failedLoadTrip = trueOrFalse => {
  return {
    type: FAIL_LOAD_TRIP,
    payload: trueOrFalse,
  };
};
// Users' Trip permissions
export const addPermssions = permissions => {
  return {
    type: USER_TRIP_PERMISSIONS,
    payload: permissions,
  };
};

export const addSubPermssions = subPermissions => {
  return {
    type: USER_TRIP_SUB_PERMISSIONS,
    payload: subPermissions,
  };
};

export const updateTrip = (id, body) => {
  return async dispatch => {
    const url = getUrl('trips');
    const tripUrl = `${url}/${id}`;

    try {
      const {data: tripData} = await putWithAuth(tripUrl, body);
      const trip = tripData.data;
      if (!trip) return;

      dispatch({type: UPDATE_TRIP, payload: trip});
      // return a promise
      return true;
    } catch (e) {
      console.log(e);
      throw e;
    }
  };
};
export const updateTripEmergencyContacts = payload => {
  // console.log(payload);
  return {
    type: UPDATE_TRIP_EMERGENCY_CONTACTS,
    payload,
  };
};

export const getTrip = id => {
  return async dispatch => {
    //Indicate that the trip is loading.
    dispatch(tripLoading(true));
    /*Indicate that the trip_leader portion of the Trip view should display a loader
    This is necessary in case getTrip from the main screen page fails, all other parts of the trip
    will be available except the trip leader, so we will make a call to this.props.getTrip() again in the trip page to see
    If it can be gotten*/
    // dispatch(tripLeaderLoading(true));

    const url = getUrl('trips');
    const tripUrl = `${url}/${id}`;

    try {
      const {data: tripData} = await getWithAuth(tripUrl);
      const trip = tripData.data;

      dispatch(tripLoading(false));
      dispatch(addTrip(trip));
      // store the fact that the get trip didi not fail
      dispatch(failedLoadTrip(false));
    } catch (e) {
      dispatch(tripLoading(false));
      // store the fact that a failure to load trip occured
      dispatch(failedLoadTrip(true));
      RNToasty.Normal({
        title: e.message || "Couldn't fetch trip, Please check your connection",
      });
    }
  };
};
export const resetTripsReducer = () => {
  return {
    type: RESET_TRIPS,
  };
};
export const getMyTrips = () => {
  return async dispatch => {
    dispatch(tripsLoading(true));
    dispatch({
      type: FAILED_TO_LOAD_TRIPS,
      payload: false,
    });

    const url = getUrl('trips');
    const token = await getUserToken();
    const {_id: userId} = jwt_decode(token);
    const myTripsUrl = `${url}/user/${userId}`;

    try {
      const {data: tripData} = await getWithAuth(myTripsUrl);
      const trips = tripData.data;
      dispatch(tripsLoading(false));
      dispatch(addTrips(trips));
    } catch (e) {
      dispatch(tripsLoading(false));
      dispatch({
        type: FAILED_TO_LOAD_TRIPS,
        payload: true,
      });
      RNToasty.Normal({
        title: e.message || "Couldn't fetch trip, Please check your connection",
      });
    }
  };
};
/*
ActionCreator to create new user registration
*/
// export const registerUser = ({name, email, password}) => {
//   return dispatch => {
//     dispatch({type: SIGN_UP_LOADING});

//     firebase
//       .auth()
//       .createUserWithEmailAndPassword(email, password)
//       .then(response => {
//         let EmailEncode = base64.encode(email);
//         firebase
//           .database()
//           .ref(`/users/${EmailEncode}`)
//           .push({name})
//           .then(response => registerSuccess(dispatch));
//       })
//       .catch(error => registerUnsuccess(error, dispatch));
//   };
// };

// const authSuccess = dispatch => {
//   dispatch({
//     type: AUTH_SUCCESS,
//   });
//   Actions.mainScreen();
// };

// const authUnsuccess = (error, dispatch) => {
//   dispatch({
//     type: AUTH_FAILURE,
//     payload: error.code,
//   });
// };

// const registerSuccess = dispatch => {
//   dispatch({type: SUCCESS_REGISTER});
//   Actions.welcomeScreen();
// };

// const registerUnsuccess = (error, dispatch) => {
//   dispatch({
//     type: FAILURE_REGISTER,
//     payload: error.code,
//   });
// };

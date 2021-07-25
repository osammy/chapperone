import * as type from '../resources/types';

const INITIAL_STATE = {
  trip: {
    _id: '',
    trip_leader: {
      name: '',
      avatar: '',
    },
    trip_itinerary: [],
    name: '',
    description: '',
    images: [],
  },

  trips: [],
  loadingTripItineraryBtn: false,
  loadingTrips: true,
  failedToLoadTrips: false,
  loadingTrip: false,
  failedToLoadTrip: false,
  showModifyItinerary: false,
  copyOfTripItinerary: [],
  userPermissions: [], //This refers to the logged in user's trip permsisions
  userSubPermissions: [], //This refers to the logged in users trip sub permissions

  // Loading the trip leader portion of the trip
  trip_leader_loading: false,
  trip_leader_loading_failed: false,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case type.ADD_TRIP:
      return {...state, trip: action.payload};
    case type.UPDATE_TRIP:
      const trips = [...state.trips];
      const trip = action.payload;
      const tripId = trip._id;
      const indexOfTrip = trips.findIndex(eachTrip => eachTrip._id === tripId);
      if (indexOfTrip !== -1) {
        trips[indexOfTrip] = trip;
      }
      return {...state, trips, trip};
    case type.ADD_TRIPS:
      return {...state, trips: action.payload};
    case type.PREPEND_TRIP_TO_TRIPS:
      return {...state, trips: [action.payload, ...state.trips]};
    case type.TRIPS_LOADING:
      return {...state, loadingTrips: action.payload};
    case type.TRIP_LOADING:
      return {...state, loadingTrip: action.payload};
    case type.LOADING_TRIP_ITINERARY_BTN:
      return {...state, loadingTripItineraryBtn: action.payload};
    case type.SHOW_MODIFY_ITINERARY_MODAL:
      return {...state, showModifyItinerary: action.payload};
    case type.ADD_COPY_OF_TRIP_ITINERARY:
      return {...state, copyOfTripItinerary: action.payload};
    case type.FAIL_LOAD_TRIP:
      return {...state, failedToLoadTrip: action.payload};
    case type.FAILED_TO_LOAD_TRIPS:
      return {...state, failedToLoadTrips: action.payload};
    case type.USER_TRIP_PERMISSIONS:
      return {...state, userPermissions: action.payload};
    case type.USER_TRIP_SUB_PERMISSIONS:
      return {...state, userSubPermissions: action.payload};
    case type.UPDATE_TRIP_EMERGENCY_CONTACTS:
      const updatedTrip = {...state.trip, emergencyContacts: action.payload};
      return {...state, trip: updatedTrip};
    case type.RESET_TRIPS:
      return INITIAL_STATE;
    default:
      return state;
  }
};

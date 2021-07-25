import React from 'react';
import {connect} from 'react-redux';
import {Actions} from 'react-native-router-flux';

import CreateTrip from './CreateTrip/CreateTrip';
import {updateTrip} from '../actions/TripActions';

function EditTrip(props) {
  //If component is dispayed in a modal then close modal
  //else hadnle proceed

  return (
    <CreateTrip
      closeModal={Actions.pop}
      isDisplayedInModal
      trip={props.trip}
      editMode
      updateTrip={props.updateTrip}
    />
  );
}
const mapStateToProps = state => {
  return {
    trip: state.TripReducer.trip,
  };
};

export default connect(
  mapStateToProps,
  {updateTrip},
)(EditTrip);

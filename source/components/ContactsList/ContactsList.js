import React, {useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {RNToasty} from 'react-native-toasty';
import {connect} from 'react-redux';

import {fetchParticipants} from '../../actions/AppActions';
import {Text} from '../../UI';
import {theme} from '../../constants';
import {getUserFromAsyncStorage} from '../../resources/utils';
import {closeChatsRealm} from '../../db/controllers/ChatsController';
import {
  Header,
  ParticipantModalView,
  ParticipantsList,
  RetryParticipants,
} from './components';

const cache = {};

function ContactsList(props) {
  const [user, setUser] = useState({});
  const [participant, setParticipant] = useState({});

  const [participants, setParticipants] = useState(props.participants);
  const [showParticipantPermissions, setShowParticipantPermissions] = useState(
    false,
  );

  useEffect(() => {
    async function getUser() {
      setUser(await getUserFromAsyncStorage());
    }
    getUser();
  }, []);

  useEffect(() => {
    setParticipants(props.participants);
    () => closeChatsRealm();
  }, [props.participants]);

  function handleParticipantSelect(selectedParticipant) {
    const cpyOfParticipants = [...props.participants];
    const index = cpyOfParticipants.findIndex(
      el => el._id === selectedParticipant._id,
    );
    if (index === -1) {
      RNToasty.Normal({
        title: "Couldn't fetch trip, Please check your connection",
      });
      return;
    }

    props.participantSelected(index);
  }

  function handleShowModal(selectedParticipant) {
    setShowParticipantPermissions(true);
    setParticipant(selectedParticipant);
  }

  const handleSearch = useCallback(
    text => {
      const searchText = text.toLowerCase();
      let result = cache[searchText];

      if (!result) {
        result = props.participants.filter(el => {
          const usersname = `${el.user_id.first_name} ${
            el.user_id.last_name
          }`.toLowerCase();

          return usersname.includes(searchText);
        });
        // Use memoization to improve performance
        cache[searchText] = result;
      }

      setParticipants(result);
    },
    [props.participants],
  );

  function handleCloseModal() {
    setShowParticipantPermissions(false);
    setParticipant({avatar: ''});
  }

  function retryFetch() {
    const {_id} = props.trip;
    //Get trip contacts
    const params = {populateUserId: true};
    props.fetchParticipants(_id, params);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header user={user} handleSearch={handleSearch} />
      <View style={styles.headerText}>
        <Text center primary bold size={16}>
          PARTICIPANTS
        </Text>
      </View>
      {props.failedToLoadParticipants && (
        <RetryParticipants handleRetry={retryFetch} />
      )}
      <ParticipantsList
        participants={participants}
        loadingParticipants={props.loadingParticipants}
        buffParticipants={props.participants}
        participantsFrom
        handleShowModal={handleShowModal}
        handleCloseModal={handleCloseModal}
        user={user}
        handleParticipantSelect={handleParticipantSelect}
      />
      <ParticipantModalView
        user={user}
        trip={props.trip}
        participant={participant}
        handleCloseModal={handleCloseModal}
        showParticipantPermissions={showParticipantPermissions}
      />
    </SafeAreaView>
  );
}

const mapStateToProps = state => {
  return {
    participants: state.ListContactsReducer.participants,
    loadingParticipants: state.ListContactsReducer.loadingParticipants,
    trip: state.TripReducer.trip,
    failedToLoadParticipants:
      state.ListContactsReducer.failedToLoadParticipants,
    highlight_mode: state.ListContactsReducer.highlight_mode,
  };
};

export default connect(
  mapStateToProps,
  {fetchParticipants},
)(ContactsList);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    // justifyContent: 'center',
  },
  headerText: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
});

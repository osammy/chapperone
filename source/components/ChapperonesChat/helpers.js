import firebase from 'firebase';

export const getInputProp = role => {
  let editable = false;
  let textInputPlaceholder = 'You must be a chaperone to message here';
  if (role === 'teacher') {
    editable = true;
    textInputPlaceholder = 'Message Chaperones...';
  }
  return {
    textInputProps: {editable},
    textInputPlaceholder,
  };
};

export const getFirebaseRef = url => {
  return firebase.database().ref(url);
};

export const getDataFromParticipants = participants => {
  const data = [];

  participants.forEach(eachParticipant => {
    const name = `${eachParticipant?.user_id?.first_name} ${
      eachParticipant?.user_id?.last_name
    }`;
    data.push({
      _id: eachParticipant?._id,
      name,
      avatar: eachParticipant?.user_id?.avatar,
      reader_id: eachParticipant?.user_id?._id,
    });
  });

  return data;
};

export const checkIfUserAlreadyRead = (userId, tripId, messageId) => {
  return new Promise((resolve, reject) => {
    const chapperones_read_receipts_node = `/chapperones_read_receipts/${tripId}/${messageId}`;
    const ref = firebase.database().ref(chapperones_read_receipts_node);
    ref
      .orderByChild('reader_id')
      .equalTo(userId)
      .once('value', snapShot => {
        if (!snapShot.exists()) {
          resolve(false);
        }

        resolve(true);
      })
      .catch(reject);
  });
};

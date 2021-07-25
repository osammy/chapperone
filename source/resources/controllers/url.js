// export const BASE_URL = 'https://a5172dd40b8e.ngrok.io/api/v1';

export const BASE_URL = 'https://chapperone.us-3.evennode.com/api/v1';
// export const BASE_URL = 'http://localhost:8000/api/v1';
// export const BASE_URL = 'http://68dd0505e7ae.ngrok.io/api/v1';

const trips = `${BASE_URL}/trips`;
const participants = `${BASE_URL}/participants`;
const users = `${BASE_URL}/users`;
const organisations = `${BASE_URL}/organisations`;
const devices = `${BASE_URL}/devices`;
const organisation_submissions = `${BASE_URL}/organisation_submissions`;
// JBKCDJHKDDG

//JCHBFBFICJC
export const getUrl = key => {
  switch (key) {
    case 'users':
      return users;

    case 'trips':
      return trips;

    case 'participants':
      return participants;

    case 'organisations':
      return organisations;

    case 'devices':
      return devices;

    case 'organisation_submissions':
      return organisation_submissions;
  }
};

/* eslint-disable react-native/no-inline-styles */

// Got these methods from here
/* https://github.com/date-fns/date-fns/tree/master/src*/
import React, {useState, useEffect} from 'react';
import _ from 'lodash';
import {Actions} from 'react-native-router-flux';
import {View, FlatList, StyleSheet, SafeAreaView} from 'react-native';

import {getUrl} from '../resources/controllers/url';
import {
  getWithAuth,
  putWithAuth,
  removeWithAuth,
} from '../resources/controllers/data';

import {Block, Header, Text, Button, Loading} from '../UI';
import {theme} from '../constants';
import {handleError} from '../resources/utils';

function Submissions(props) {
  const [submissions, setSubmissions] = useState([]);
  const [loadingText, setLoadingText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getSubmissions() {
      try {
        setLoadingText(true);
        setLoadingText('Getting Submissions');
        const url = `${getUrl('organisations')}/unverified`;
        const org_submissions = await getWithAuth(url);
        setSubmissions(org_submissions.data);
        setLoadingText(false);
        setLoadingText('');
      } catch (e) {
        setLoadingText(false);
        setLoadingText('');
        handleError(e);
      }
    }

    getSubmissions();
  }, []);

  const leftItems = [
    {
      iconName: 'arrow-back',
      showCondition: true,
      onPress: Actions.pop,
      style: {color: theme.colors.primary},
    },
  ];

  async function verifyOrg(id) {
    try {
      setLoadingText(true);
      setLoadingText('Verifying...');
      const baseUrl = getUrl('organisations');
      const url = `${baseUrl}/${id}/verify`;
      await putWithAuth(url);
      setLoadingText(false);
      setLoadingText('');
      setSubmissions(submissions.filter(el => el._id !== id));
    } catch (e) {
      setLoadingText(false);
      setLoadingText('');
      handleError(e);
    }
  }
  async function deleteOrg(id) {
    console.log('called');
    try {
      setLoading(true);
      setLoadingText('Deleting...');
      const baseUrl = getUrl('organisations');
      const url = `${baseUrl}/${id}`;
      await removeWithAuth(url);
      setLoading(false);
      setLoadingText('');
      setSubmissions(submissions.filter(el => el._id !== id));
    } catch (e) {
      setLoading(false);
      setLoadingText('');
      console.log(e);
      handleError(e);
    }
  }

  function renderItem({item, index}) {
    return (
      <View style={styles.content}>
        <Block padding={[0, 0, 5, 0]} row space="between">
          <Text semibold>Name:</Text>
          <Text semibold>{item.name}</Text>
        </Block>
        <Block padding={[5, 0]} row space="between">
          <Text semibold>Country:</Text>
          <Text semibold>{item.country}</Text>
        </Block>
        <Block padding={[5, 0]} row space="between">
          <Text semibold>State</Text>
          <Text semibold>{item.state}</Text>
        </Block>
        <Block padding={[5, 0]} row space="between">
          <Text semibold>Zip</Text>
          <Text semibold>{item.zip}</Text>
        </Block>
        <Block padding={[5, 0]} row space="between">
          <Text semibold>Street Address</Text>
          <Text style={styles.elongatedText} semibold>
            {item.street_address}
          </Text>
        </Block>

        <Block padding={[5, 0]} row space="between">
          <Button
            onPress={() => verifyOrg(item._id)}
            style={styles.btn}
            primary
            semibold>
            <Text>Verify</Text>
          </Button>
          <Button
            onPress={() => deleteOrg(item._id)}
            style={styles.activeButton}
            white
            semibold>
            <Text white>Delete</Text>
          </Button>
        </Block>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Loading show={loading} loadingText={loadingText} />
      <Header leftItems={leftItems} title="Verify School" />
      {submissions.length === 0 && (
        <Block middle>
          <Text gray center>
            NO NEW SUBMISSIONS
          </Text>
        </Block>
      )}
      <FlatList
        data={submissions}
        renderItem={renderItem}
        keyExtractor={item => `${item._id}`}
      />
    </SafeAreaView>
  );
}

export default Submissions;

const styles = StyleSheet.create({
  content: {
    padding: theme.sizes.padding,
  },
  container: {
    flex: 1,
  },
  activeButton: {
    backgroundColor: theme.colors.accent,
    color: theme.colors.white,
    paddingHorizontal: 20,
    paddingVertical: 5,
    height: 35,
    shadowColor: theme.colors.black,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 13,
  },
  btn: {
    backgroundColor: '#eee',
    paddingHorizontal: 20,
    shadowColor: theme.colors.black,
    shadowOpacity: 0.5,
    shadowOffset: {width: 10, height: 2},
    shadowRadius: 13,
    height: 35,
  },
  elongatedText: {
    textAlign: 'right',
    width: 200,
  },
});

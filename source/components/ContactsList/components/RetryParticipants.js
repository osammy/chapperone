import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';

import {Button, Text} from '../../../UI';
import {theme} from '../../../constants';
import {View} from 'native-base';

function RetryParticipants({handleRetry}) {
  return (
    <View style={styles.headerContainer}>
      <View>
        <Text h3 center>
          Couldnt fetch participants list
        </Text>
        <Button style={styles.retryBtn} onPress={handleRetry}>
          <Text h3 semibold white>
            Retry
          </Text>
        </Button>
      </View>
    </View>
  );
}

export default RetryParticipants;

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
});

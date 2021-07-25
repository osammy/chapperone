import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade,
} from 'rn-placeholder';

import {capitalize} from '../../../resources/utils';
import {Text, Block} from '../../../UI';
import {theme} from '../../../constants';
import AlertButton from './AlertButton';

const statusBarHeight = getStatusBarHeight();

function TripLeader({
  trip,
  loadingTrip,
  failedToLoadTrip,
  showBroadcastPrompt,
  role,
  getTrip,
}) {
  const {_id: tripId} = trip;

  const isIOS = Platform.OS === 'ios';

  let name = '';
  let avatar = '';

  try {
    name = `${capitalize(trip.trip_leader.first_name)} ${capitalize(
      trip.trip_leader.last_name,
    )}`;
    avatar = trip?.trip_leader?.avatar;
  } catch (e) {}

  if (loadingTrip) {
    return (
      <Placeholder
        Animation={Fade}
        isRound
        Left={props => <PlaceholderMedia isRound={true} style={props.style} />}>
        <PlaceholderLine width={50} />
        <PlaceholderLine width={80} />
      </Placeholder>
    );
  }

  if (failedToLoadTrip || typeof trip?.trip_leader === 'string') {
    return (
      <Block>
        <Text>
          <Text>Failed To Load Trip Leader details...</Text>
          <Text color={theme.colors.primary} onPress={() => getTrip(tripId)}>
            Retry
          </Text>
        </Text>
      </Block>
    );
  }

  return (
    <View row style={styles.spaceBetween}>
      <TouchableOpacity>
        <Block style={styles.tripLeader} row space="between">
          <View>
            <Image
              style={[styles.avatarNorm, styles.shadow]}
              source={{
                uri: avatar,
              }}
            />
          </View>
          <Block margin={[8, 0, 0, 8]}>
            <Text color={theme.colors.gray} bold>
              Trip Leader
            </Text>
            <Text>{name}</Text>
          </Block>
        </Block>
      </TouchableOpacity>
      <View>
        {isIOS ? (
          <AlertButton showBroadcastPrompt={showBroadcastPrompt} role={role} />
        ) : (
          <TouchableOpacity activeOpacity={0.8} onPress={() => {}}>
            <FontAwesome
              style={StyleSheet.mv}
              name="chevron-right"
              size={theme.sizes.font}
              color={theme.colors.caption}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default TripLeader;

const styles = StyleSheet.create({
  placeholderContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.gray2,
    marginBottom: 30,
  },
  datepickerModal: {
    flex: 1,
    marginTop: statusBarHeight,
  },
  mv: {marginVertical: 20},
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatarNorm: {
    width: theme.sizes.padding * 2,
    height: theme.sizes.padding * 2,
    borderRadius: theme.sizes.padding,
  },
  shadow: {
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  tripLeader: {
    width: 300,
    maxWidth: 350,
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

import React from 'react';
import {
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';
import {formatDate} from '../../../resources/utils';
import {Block, Text, Card, Badge} from '../../../UI';
import {theme} from '../../../constants';
import TripDates from './TripDates';

const {width} = Dimensions.get('window');

function TripCard(props) {
  const {handleTripClick, item, source} = props;
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.container}
      onPress={() => handleTripClick(item)}>
      <Card shadow>
        <Block>
          <Image
            style={[styles.destination]}
            imageStyle={{borderRadius: theme.sizes.radius}}
            source={source}
          />
          {/* <Block
            margin={[10, 0, 0, 0]}
            padding={[0, 5, 0, 5]}
            row
            space="between">
            <Text size={13} gray2>
              <Badge color={theme.colors.primary} size={5} />
              {formatDate(item.start_date)}
            </Text>
            <Text gray2>
              <Badge color={theme.colors.accent} size={5} />{' '}
              {formatDate(item.end_date)}
            </Text>
          </Block> */}
          <View style={[styles.destination, styles.overlay]}>
            <View style={styles.bottomContent}>
              <TripDates
                textColor="white"
                iconColor="white"
                start_date={item.start_date}
                end_date={item.end_date}
              />
            </View>
          </View>
          <Block margin={[theme.sizes.margin / 4, theme.sizes.margin / 4]}>
            <Text
              style={styles.marginVertical}
              h2
              semibold
              colors={theme.colors.gray}>
              {item.name}
            </Text>
            <Text numberOfLines={3} color={theme.colors.gray}>
              {item.description}
            </Text>
          </Block>
        </Block>
      </Card>
    </TouchableOpacity>
  );
}

export default TripCard;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.gray2,
  },
  marginVertical: {
    marginVertical: theme.sizes.margin / 2,
  },
  destination: {
    height: width * 0.6,
    paddingHorizontal: theme.sizes.padding,
    paddingVertical: theme.sizes.padding * 0.66,
    borderRadius: theme.sizes.radius,
  },
  overlay: {
    top: 0,
    position: 'absolute',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bottomContent: {
    marginHorizontal: 20,
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
});

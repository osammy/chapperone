import React, {useState} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Icon} from 'native-base';

import {Block, Text, Button} from '../../../UI';
import {theme} from '../../../constants';
import {handleShare} from '../helpers';

function Description(props) {
  const {trip, isChaperone} = props;
  const [charLimit, setCharLimit] = useState(180);
  const description = trip?.description?.replace('<br/>', '\n');

  return (
    <Block margin={[20, 0]}>
      <Text style={styles.title}>{trip.name}</Text>
      {isChaperone && isChaperone() && (
        <View style={styles.spaceBetween}>
          <View style={styles.tripCode}>
            <Text style={[styles.code]}>Trip Code: {trip.join_code || ''}</Text>
          </View>
          <Button style={styles.shareIcon} onPress={() => handleShare(trip)}>
            <Icon name="share" style={{color: theme.colors.gray}} />
          </Button>
        </View>
      )}
      <View style={styles.row} />
      <TouchableOpacity onPress={() => setCharLimit(charLimit + 1000)}>
        <Text style={styles.description}>
          {description.split('').slice(0, charLimit)}
          {description.length > charLimit && (
            <Text style={{color: theme.colors.active}}> ...Read more</Text>
          )}
        </Text>
      </TouchableOpacity>
    </Block>
  );
}

export default Description;

const styles = StyleSheet.create({
  description: {
    fontSize: theme.sizes.font * 1.2,
    lineHeight: theme.sizes.font * 2,
    color: theme.colors.gray,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.sizes.margin / 4,
  },
  spaceBetween: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    padding: 0,
    height: 40,
  },
  code: {
    fontSize: 20,
    color: theme.colors.gray,
    paddingTop: 10,
  },
  title: {
    fontSize: theme.sizes.font * 2,
    fontWeight: 'bold',
  },
  shareIcon: {
    flexDirection: 'column',
    justifyContent: 'center',
    height: 30,
  },
  tripCode: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
});

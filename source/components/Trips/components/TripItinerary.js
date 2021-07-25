/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';

import {Icon} from 'native-base';

import {colorStack} from '../../../resources/utils';
import {Text, Block, Badge} from '../../../UI';
import {theme} from '../../../constants';

function TripItinerary(props) {
  const {trip, openItineraryModal, role} = props;

  return (
    <Block margin={[20, 0]} shadow key={`trip-${trip.id}`}>
      <Block margin={[0, 0, 20, 0]} row space="between">
        <Text color={theme.colors.primary} bold h3>
          ITINERARY
        </Text>
        {role === 'teacher' && (
          <TouchableOpacity
            style={{paddingHorizontal: 20}}
            onPress={openItineraryModal}>
            <Text color={theme.colors.primary} bold h3>
              <Icon name="create" style={{color: theme.colors.primary}} />
            </Text>
          </TouchableOpacity>
        )}
      </Block>
      {trip &&
        trip?.trip_itinerary.map((detail, index) => {
          const Separator = (
            <View style={[styles.itineraryContent, {marginVertical: 5}]}>
              <Text style={{flex: 3}} color={theme.colors.white} />
              <View style={{flex: 9, marginLeft: 8}}>
                <Badge color="gray2" size={6} />
              </View>
            </View>
          );
          let innerColor;
          let outerRgba;
          if (index < colorStack.length) {
            innerColor = theme.colors[colorStack[index].inner];
            outerRgba = colorStack[index].outerRgba;
          } else {
            innerColor = theme.colors[colorStack[0].inner];
            outerRgba = colorStack[0].outerRgba;
          }
          return (
            <View key={`trip-${detail._id}`}>
              <View style={styles.itineraryContent}>
                <View style={{flex: 3}}>
                  <Text color="gray">{detail.date || 'n/a'} </Text>
                  <Text color="gray">{detail.time} </Text>
                </View>
                <View style={{flex: 9}}>
                  <View style={styles.itineraryContent}>
                    <View style={{flex: 1}}>
                      <Badge color={outerRgba} size={20}>
                        <Badge color={innerColor} size={10} />
                      </Badge>
                    </View>
                    <Text
                      style={{flexShrink: 1, flex: 9}}
                      spacing={0.5}
                      color="gray">
                      {detail.info}
                    </Text>
                  </View>
                </View>
              </View>
              {index !== trip?.trip_itinerary.length - 1 && Separator}
            </View>
          );
        })}

      {(!trip || trip?.trip_itinerary.length === 0) && (
        <Text color="gray" h3>
          No Trip Itinerary
        </Text>
      )}
    </Block>
  );
}

export default TripItinerary;

const styles = StyleSheet.create({
  itineraryContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

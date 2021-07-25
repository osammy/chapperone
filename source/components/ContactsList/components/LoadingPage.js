import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade,
} from 'rn-placeholder';

import {theme} from '../../../constants';
import {View} from 'native-base';

function LoadingPage() {
  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{padding: theme.sizes.padding}}>
        {[1, 2, 3, 4, 6, 7, 8, 9].map((el, index) => (
          <Placeholder
            isRound
            key={`${index}`}
            Animation={Fade}
            Left={() => <PlaceholderMedia isRound />}
            style={styles.mb}
            // Right={PlaceholderMedia}
          >
            <View style={styles.placeholderLine}>
              <PlaceholderLine width={60} />
              <PlaceholderLine width={20} />
            </View>
          </Placeholder>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default LoadingPage;

const styles = StyleSheet.create({
  placeholderLine: {
    marginLeft: 10,
  },
  mb: {marginBottom: 20},
});

import React from 'react';
import {StatusBar, SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {theme} from '../../../constants';
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade,
} from 'rn-placeholder';
import Header from './Header';

function LoadingTrips(props) {
  const {
    activeNotification,
    handleAddBtnClick,
    superAdmin,
    indicateBroadcastUnread,
  } = props;
  return (
    <SafeAreaView style={styles.flex}>
      <StatusBar
        backgroundColor={theme.colors.transparent}
        barStyle="dark-content"
      />
      <Header
        activeNotification={activeNotification}
        handleAddBtnClick={handleAddBtnClick}
        superAdmin={superAdmin}
        indicateBroadcastUnread={indicateBroadcastUnread}
      />
      <ScrollView contentContainerStyle={{padding: theme.sizes.padding}}>
        {[1, 2, 3, 4].map((el, index) => (
          <Placeholder
            style={[styles.container, styles.addMargin]}
            key={`${index}`}
            Animation={Fade}>
            <PlaceholderMedia
              width={100}
              height={160}
              style={{width: '100%', height: 200}}
            />
            <PlaceholderLine width={60} style={styles.addMargin} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} style={styles.addMargin} />
            <PlaceholderLine width={30} style={styles.addMargin} />
          </Placeholder>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default LoadingTrips;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.gray2,
  },
  addMargin: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.gray2,
  },
});

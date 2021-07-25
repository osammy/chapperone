import React, {useState, useEffect} from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {theme} from '../../../constants';
import {Text} from '../../../UI';
import {
  setHasSeenReadReceiptMessage,
  hasSeenReadReceiptsMessage,
} from '../../../resources/utils';

function Alert() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    async function determineSeenStatus() {
      const hasSeen = await hasSeenReadReceiptsMessage();
      if (!hasSeen) {
        setShow(true);
      }
    }
    determineSeenStatus();
  }, []);

  async function close() {
    await setHasSeenReadReceiptMessage();
    setShow(false);
  }

  if (!show) {
    return null;
  }

  return (
    <View style={styles.headerContainer}>
      <View style={styles.messageContainer}>
        <Text primary semibold>
          Long press the chat bubble to view read receipts
        </Text>
      </View>
      <TouchableOpacity onPress={close} style={styles.iconContainer}>
        <MaterialIcons
          name="clear"
          color={theme.colors.primary}
          size={theme.sizes.font * 1.3}
        />
      </TouchableOpacity>
    </View>
  );
}

export default Alert;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.lightPrimary,
    width: '100%',
  },

  messageContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  iconContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 10,
  },
});

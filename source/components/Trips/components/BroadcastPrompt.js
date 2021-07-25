import React from 'react';
import {StyleSheet, View} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {Input, Badge, Prompt, Text} from '../../../UI';
import {theme} from '../../../constants';

function BroadcastPrompt({
  showBroadcastPrompt,
  handleSendBroadcast,
  shouldShowInput,
  cancelBtn,
  broadcastMessage,
  handleChange,
}) {
  if (!showBroadcastPrompt) {
    return null;
  }

  const BroadcastContent = shouldShowInput ? (
    <>
      <View style={styles.listItem}>
        <View style={styles.flex}>
          <Badge color={theme.colors.secondary} size={60}>
            <FontAwesome name="bullhorn" size={62 / 2.5} color="white" />
          </Badge>
        </View>
      </View>

      <Text gray h3>
        Broadcasts
      </Text>
      <Input
        style={styles.broadcastInput}
        multiline
        onChangeText={handleChange}
        value={broadcastMessage}
        autoCapitalize="sentences"
        autoFocus
      />
    </>
  ) : (
    <Text>You are not authorised to send Broadcasts</Text>
  );

  return (
    <Prompt
      middle
      okBtn={handleSendBroadcast}
      cancelBtn={cancelBtn}
      //   cancelBtn={() => this.setState({showBroadcastPrompt: false})}
      okBtnText="Send"
      hideActionBtns={!shouldShowInput}
      showPrompt={showBroadcastPrompt}>
      {BroadcastContent}
    </Prompt>
  );
}

export default BroadcastPrompt;

const styles = StyleSheet.create({
  flex: {flex: 0.5},
  listItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // padding: 15,
  },
  broadcastInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    height: 100,
    fontWeight: '300',
    paddingLeft: 5,
  },
});

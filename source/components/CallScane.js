/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import base64 from 'base-64';
import _ from 'lodash';
import {Actions} from 'react-native-router-flux';
import {View, Text, FlatList, Image, TouchableHighlight} from 'react-native';

import {connect} from 'react-redux';
import {fetchContacts} from '../actions/AppActions';

class CallScane extends Component {
  state = {
    contacts: this.props.contacts,
  };

  componentDidMount() {
    this.props.fetchContacts(base64.encode(this.props.email_logged_in));
    // this.createDataSource(this.props.contacts);
  }

  // componentWillReceiveProps(nextProps) {
  //   this.createDataSource(nextProps.contacts);
  // }

  // createDataSource(contacts) {
  //   const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })
  //   this.dataSource = ds.cloneWithRows(contacts)
  //   // (this.dataSource) CallScane.prototype.dataSource (example)
  // }

  renderItem({item, index}) {
    return (
      <TouchableHighlight
        onPress={() =>
          Actions.chat({
            title: item.name,
            contactName: item.name,
            contactEmail: item.email,
          })
        }>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            padding: 15,
            borderBottomWidth: 1,
            borderColor: '#b7b7b7',
          }}>
          <Image
            source={{uri: item.profileImage}}
            style={{width: 50, height: 50, borderRadius: 50}}
          />
          <View style={{marginLeft: 15}}>
            <Text style={{fontSize: 23, fontWeight: 'bold'}}>{item.name}</Text>
            <Text style={{fontSize: 13}}>{item.email}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    return <FlatList data={[]} renderItem={this.renderItem} />;
  }
}

mapStateToProps = state => {
  const contacts = _.map(state.ListContactsReducer, (value, uid) => {
    return {...value, uid};
  });

  return {
    email_logged_in: state.AppReducer.email_logged_in,
    contacts: contacts,
  };
};

export default connect(
  mapStateToProps,
  {fetchContacts},
)(CallScane);

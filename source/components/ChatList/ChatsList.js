import React, {Component} from 'react';
import _ from 'lodash';
import {Actions} from 'react-native-router-flux';
import {SafeAreaView, StyleSheet} from 'react-native';

import {connect} from 'react-redux';
import {
  fetchChatList,
  resetListChatReducer,
  getBroadCastMsgs,
} from '../../actions/AppActions';
import {
  getUserFromAsyncStorage,
  removeAllFirebaseListeners,
  noContractOrExpiredContract,
} from '../../resources/utils';
import {closeChatsRealm} from '../../db/controllers/ChatsController';
import RNBackgroundTask from 'react-native-bg-thread';
import {
  ChapperonesGroup,
  BroadcastGroup,
  Messages,
  Header,
  FloatingButton,
} from './components';

class ChatsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {},
      chatsList: {},
      searchList: false,
      searchText: '',
    };
    this.user = {};
    this.inputRef = React.createRef();

    this.firebaseRefs = [];
    this.cache = {};
    this.count = 1;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Return null to prevent updating state with props when user is searching
    if (prevState.searchText === '') {
      if (nextProps.chatsList !== prevState.chatsList) {
        return {chatsList: nextProps.chatsList};
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  async componentDidMount() {
    this.user = await getUserFromAsyncStorage();
    this.setState({user: this.user});

    RNBackgroundTask.runInBackground(async () => {
      // Your Javascript code here
      // Javascript executed here runs on the default thread priority which is maximum.
      try {
        const {
          trip: {_id: tripId},
        } = this.props;

        const {_id: userId} = this.user;
        this.key = `${tripId}-${userId}`;
        await this.props.fetchChatList(tripId, userId, this.storeRefs);
        this.setState({chatsList: this.props.chatsList});
      } catch (e) {}
    });
  }

  openSearchArea = () => {
    const {searchList} = this.state;
    if (searchList) {
      this.setState({searchText: ''});
    } else {
      this.setState({searchList: true}, this.inputRef.current.focus);
    }
  };

  handleLeftBtn = () => {
    if (this.state.searchList) {
      this.setState({searchList: false, searchText: ''});
    } else {
      Actions.pop();
    }
  };

  handleSearch = text => {
    const chatsList = {...this.state.chatsList};
    let copyOfChatsArr = chatsList[this.key];
    const searchText = text.toLowerCase();
    let result = this.cache[searchText];

    if (!result) {
      if (!copyOfChatsArr || !Array.isArray(copyOfChatsArr)) {
        copyOfChatsArr = [];
      }
      result = copyOfChatsArr.filter(el => {
        const usersname = `${el.first_name} ${el.last_name}`.toLowerCase();
        return usersname.includes(searchText);
      });

      // Use memoization to improve performance
      this.cache[searchText] = result;
    }

    chatsList[this.key] = result;

    this.setState({chatsList, searchText: text});
  };

  componentWillUnMount() {
    closeChatsRealm();
    removeAllFirebaseListeners();
  }

  storeRefs = ref => {
    this.firebaseRefs.push(ref);
  };

  handleBroadcast = () => {
    Actions.BroadcastMessages({user: this.user});
  };

  handleChapperoneMsgPress = () => {
    Actions.ChapperoneGroupChat({user: this.user});
  };

  handleItemClick = async item => {
    if (!this.user) {
      this.user = await getUserFromAsyncStorage();
    }
    const data = {
      participant: item,
      user: this.user,
    };
    Actions.chat({...data});
  };

  render() {
    const isTeacher = this.state.user?.role === 'teacher';

    return (
      <SafeAreaView style={styles.flex}>
        <Header
          searchList={this.state.searchList}
          handleLeftBtn={this.handleLeftBtn}
          handleSearch={this.handleSearch}
          searchText={this.state.searchText}
          inputRef={this.inputRef}
          openSearchArea={this.openSearchArea}
        />
        <BroadcastGroup
          handleBroadcast={this.handleBroadcast}
          tripId={this.props?.trip?._id}
          lastBroadcastMessage={this.props.lastBroadcastMessage}
        />
        {!noContractOrExpiredContract(this.state.user) && isTeacher && (
          <ChapperonesGroup
            handleChapperoneMsgPress={this.handleChapperoneMsgPress}
            tripId={this.props?.trip?._id}
            lastChapperoneGroupMessage={this.props.lastChapperoneGroupMessage}
          />
        )}
        <Messages
          handleItemClick={this.handleItemClick}
          data={this.state?.chatsList[this.key] || []}
        />
        <FloatingButton openSearchArea={this.openSearchArea} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  flex: {flex: 1},
});

const mapStateToProps = state => {
  return {
    trip: state.TripReducer.trip,
    chatsList: state.ListChatsReducer,
    lastBroadcastMessage: state.ListBroadcastReducer.lastMessage,
    lastChapperoneGroupMessage: state.ChapperonesReducer.lastGroupMessage,
  };
};

export default connect(
  mapStateToProps,
  {fetchChatList, resetListChatReducer, getBroadCastMsgs},
)(ChatsList);

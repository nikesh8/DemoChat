/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, Dimensions, StyleSheet, TextInput, View, Image, Text, ActivityIndicator, FlatList, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Send } from 'react-native-gifted-chat';
import Modal from 'react-native-modal';
import userList from './userList.json';

import MessageBubble from './component/MessageBubble'
import { Images } from '@utils/images'

type Props = {};
export default class App extends Component<Props> {

  constructor() {
    super()
    this.reqTimer = 0
    this.scrollViewRef = React.createRef()
    this.state = {
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        {
          _id: 2,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        }
      ],
      messageText: '',
      modalVisible: false,
      isLoading: false,
      scrollOffset: null,
      userData: userList,
      userName: ''
    }
  }

  setModalVisible = (value) => {
    this.setState({
      modalVisible: value
    })
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  getUserSuggestions = (keyword) => {
    this.setState({
      isLoading: true
    }, () => {
      if (Array.isArray(userList)) {
        if (keyword.slice(1) === '') {
          this.setState({
            userData: [...userList],
            userName: keyword,
            isLoading: false
          })
        } else {
          const userDataList = userList.filter(obj => obj.name.indexOf(keyword.slice(1)) !== -1)
          this.setState({
            userData: [...userDataList],
            userName: keyword,
            isLoading: false
          })
        }
      }
    })
  }

  onTextChange = (value, props) => {
    const lastChar = this.state.messageText.substr(this.state.messageText.length - 1)
    const currentChar = value.substr(value.length - 1)
    const spaceCheck = /[^@A-Za-z_]/g
    props.onTextChanged(value)
    this.setState({
      messageText: value
    })
    if (value.length === 0) {
      this.setModalVisible(false)
    } else {
      if (spaceCheck.test(lastChar) && currentChar != '@') {
        this.setModalVisible(false)
      } else {
        const checkSpecialChar = currentChar.match(/[^@A-Za-z_]/)
        if (checkSpecialChar === null || currentChar === '@') {
          const pattern = new RegExp(`\\B@[a-z0-9_-]+|\\B@`, `gi`);
          const matches = value.match(pattern) || []
          if (matches.length > 0) {
            this.getUserSuggestions(matches[matches.length - 1])
            this.setModalVisible(true)
          } else {
            this.setModalVisible(false)
          }
        } else if (checkSpecialChar != null) {
          this.setModalVisible(false)
        }
      }
    }
  }

  renderComposer = (props) => {
    return (
      <View style={styles.composerContainer}>
        <View style={styles.inputContainer}>
          <TextInput {...props}
            placeholder={'Type something...'}
            ref={(input) => { this.msgInput = input; }}
            onChangeText={(value) => this.onTextChange(value, props)}
            style={styles.textInput}
            value={props.text}
            multiline={true}
          />
        </View>
        <Send {...props} containerStyle={styles.sendWrapperStyle} >
          <View style={styles.sendContainer}>
            <Image source={require('./images/Send.png')} style={styles.sendIconStyle} />
          </View>
        </Send>
      </View>
    )
  }

  renderSend = (props) => {
    return null
  }

  handleOnScroll = event => {
    this.setState({
      scrollOffset: event.nativeEvent.contentOffset.y,
    });
  };

  handleScrollTo = point => {
    if (this.scrollViewRef.current) {
      this.scrollViewRef.current.scrollTo(point);
    }
  };

  renderSuggestionsRow = ({ item }) => {
    const dataObj = item
    const profileImage = (dataObj.image === null) ? Images.userLogo : { uri: dataObj.image }
    return (
      <TouchableOpacity style={styles.suggestionClickStyle} onPress={() => this.onSuggestionTap(dataObj)}>
        <View style={styles.suggestionRowContainer}>
          <Image style={styles.userImage} source={profileImage} />
          <Text style={styles.userNameText}>{dataObj.name}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  onSuggestionTap(dataObj) {
    this.setModalVisible(false)
    const sliceText = this.state.messageText.slice(0, - this.state.userName.length)
    this.setState({
      messageText: sliceText + '@' + dataObj.name + ' '
    })
  }


  render() {
    return (
      <View style={styles.container}>
        <Modal isVisible={this.state.modalVisible}
          coverScreen={false}
          deviceHeight={400}
          onBackdropPress={() => this.setModalVisible(false)}
          backdropColor={'transparent'}
          scrollTo={this.handleScrollTo}
          scrollOffset={this.state.scrollOffset}
          scrollOffsetMax={300 - 200}
          animationIn='fadeIn'
          animationInTiming={100}
          animationOut='fadeOut'
          onModalShow={() => { this.msgInput.focus() }}
          style={styles.modalContainer}>
          <View style={styles.suggestionContainer}>
            {(this.state.isLoading) ? <ActivityIndicator /> :
              <FlatList
                contentContainerStyle={styles.suggestionListStyle}
                data={this.state.userData}
                renderItem={(item, index) => this.renderSuggestionsRow(item, index)}
                keyExtractor={(item) => `${item.id}`}
                keyboardShouldPersistTaps='always'
              />
            }
          </View>
        </Modal>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          renderComposer={this.renderComposer}
          listViewProps={{
            style: styles.listContainer,
            contentContainerStyle: styles.msgListContainer,
          }}
          user={{
            _id: 1,
          }}
          renderMessage={(props) => {
            return <MessageBubble messageObj={props.currentMessage} position={props.position} />
          }}
          renderAvatar={null}
          renderSend={this.renderSend}
          text={this.state.messageText}
          alwaysShowSend={true}
          minComposerHeight={55}
          maxComposerHeight={55}
          bottomOffset={Platform.select({
            ios: 200,
            android: 0
          })}
        />
        <KeyboardAvoidingView behavior={'padding'} enabled
          keyboardVerticalOffset={Platform.select({
            ios: 15,
            android: 0
          })} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    width: '100%',
    backgroundColor: 'rgb(245, 245, 245)',
  },
  msgListContainer: {
    width: '100%',
  },
  listContainer: {
    width: '100%',
  },
  sendIconStyle: {
    height: 30,
    width: 30,
  },
  composerContainer: {
    width: '100%',
    height: 55,
    flexDirection: 'row',
    paddingTop: 5
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    width: '85%'
  },
  textInput: {
    fontSize: 14,
    letterSpacing: 1,
    height: 50,
    minWidth: 250,
    maxWidth: 250,
    borderWidth: 0,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10
  },
  sendWrapperStyle: {
    width: '15%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  suggestionClickStyle: {
    alignItems: 'center',
    height: 60,
    backgroundColor: 'white',
    marginTop: 5,
    marginBottom: 10,
    padding: 10
  },
  suggestionRowContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    height: 40,
    width: 40,
    borderRadius: 5
  },
  userNameText: {
    fontSize: 13,
    letterSpacing: 1,
    width: '80%',
    marginLeft: 10
  },
  modalContainer: {
    position: 'absolute',
    bottom: Dimensions.get('window').width / 2 + 120, // Give bottom as per your requirement here I have given with keyboard height and composer input height
    justifyContent: 'flex-end',
    alignSelf: 'center',
    margin: 0,
    ...Platform.select({
      android: {
        marginBottom: 70
      },
      ios: {
        marginBottom: 95
      }
    })
  },
  suggestionContainer: {
    maxHeight: 190,
    backgroundColor: 'rgba(0,0,0,0.08)',
    width: '100%'
  },
  suggestionListStyle: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});

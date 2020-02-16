import React, { Component } from 'react'
import { View, Text } from 'react-native'

import { getFormatedTime } from '@utils/helper'
import styles from './style'

export default class MessageBubble extends Component {

  render() {
    const { messageObj, position } = this.props
    const timeStr = getFormatedTime(messageObj.created_at)
    if (position === 'left') {
      let messageText = messageObj.text
      messageObj && messageObj.assignees && messageObj.assignees.forEach(element => {
        messageText = messageText.replace(new RegExp(`@${element.id}`, 'g'), `@${element.name.replace(/\s/g, '')}`)
      })
      return (
        <View style={styles.messageContainer}>
          <View style={styles.leftBubble}>
            <View style={styles.leftBubbleContainer} >
              <View style={styles.textContainer}>
              <Text style={styles.msgText}>{messageText}</Text>
                {/* <ParseText textStyle={styles.msgText} text={messageText} /> */}
                  <View style={styles.timeContainer}>
                    <Text style={styles.byText} numberOfLines={1}>{messageObj.user.name}</Text>
                    <Text style={styles.badgeIcon}>{'\u2B24'}</Text>
                    <Text style={styles.timeText}>{timeStr.replace('at ', '')}</Text>
                  </View>
              </View>
              <View style={styles.leftTriangle} />
            </View>
          </View>
        </View>
      )
    } else {
      let messageText = messageObj.text
      messageObj && messageObj.assignees && messageObj.assignees.forEach(element => {
        messageText = messageText.replace(new RegExp(`@${element.id}`, 'g'), `@${element.name.replace(/\s/g, '')}`)
      })
      return (
        <View style={styles.messageContainer}>
          <View style={styles.rightBubble}>
            <View style={styles.rightBubbleContainer} >
              <View style={styles.textContainer}>
                <Text style={styles.userMsgText}>{messageText}</Text>
                {/* <ParseText textStyle={styles.userMsgText} text={messageText} /> */}
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeText, { color: 'white', textAlign: 'right' }]}>{timeStr.replace('at ', '')}</Text>
                </View>
              </View>
              <View style={styles.rightTriangle} />
            </View>
          </View>
        </View>
      )
    }
  }
}
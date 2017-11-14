import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    ToolbarAndroid,
} from 'react-native';

import socket_io from 'socket.io-client';

import path from '../urlProperties';
import {GiftedChat} from 'react-native-gifted-chat';

let socket = null;

let i = 1;

export default class textChat extends Component {

    constructor(props){
        super(props);
        this.state = {
            infos: '',
            messages: [],
            message: {
                basic: {
                    userId: props.userId,
                    groupId: props.groupId,
                    type: 'groupChat',
                    companyId: null,
                },
                content: {
                    text: '',
                    file: []
                },
                atMembers: [],
            }
        }
        console.log(props);
        console.log(props.groupId);
        socket = socket_io.connect(path.baseUrl + '/groupConnect', {forceNew: true,transports: ['websocket']});
        console.log(socket);
        socket.on('welcome', function () {
            console.log('connect to socket');
            socket.emit('init', {groupId: props.groupId, userId: props.userId});//
        });
        socket.on('receiveMessage',(message) => {
            console.log(message);
            this.setState({
                messages: GiftedChat.append(message, this.state.messages)
            })
        });
    }

    // componentWillMount() {
    //     // this.setState({
    //     //     messages: [
    //     //         {
    //     //             _id: 1,
    //     //             text: 'Hello developer',
    //     //             createdAt: new Date(),
    //     //             user: {
    //     //                 _id: 2,
    //     //                 name: 'React Native',
    //     //                 avatar: 'https://facebook.github.io/react/img/logo_og.png',
    //     //             },
    //     //         },
    //     //     ],
    //     // });
    // }

    // componentDidMount(){
    //     const socket = socket_io.connect(path.baseUrl + '/groupConnect', {forceNew: true,transports: ['websocket']});
    //     socket.on('welcome', function () {
    //         console.log('connect to socket');
    //         console.log(this.state);
    //         socket.emit('init', {groupId: this.state.message.basic.groupId, userId: this.state.message.basic.userId});//
    //     });
    // }

    onSend(messages = []) {
        console.log(messages[0]);
        var tempText = messages[0].text;
        console.log(tempText);
        this.setState((previousState) => {
            console.log(messages);
            console.log(tempText);
            console.log(previousState);
            var tempMessage = previousState.message;
            tempMessage.content.text = tempText;
            return {
                // messages: GiftedChat.append(previousState.messages, messages),
                message: tempMessage,
            }
            // return tempMessage;
        },() => {
            console.log(this.state.message);
            socket.emit('distributeMessage', this.state.message);
        });
    }

    render() {
        return (
            <View style={styles.body}>
                <ToolbarAndroid
                    title={'易沟通'}
                    titleColor={'#fff'}
                    style={styles.headStyle}
                />
                <GiftedChat
                    messages={this.state.messages}
                    onSend={(messages) => this.onSend(messages)}
                    user={{
                        _id: this.state.message.basic.userId,
                    }}
                />
            </View>
        );
    }

}

const styles = StyleSheet.create({
    body: {
      flex:1,
    },
    headStyle: {
        height: 45,
        backgroundColor: '#4991e2'
    },
})
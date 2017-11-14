import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
} from 'react-native';

export default class textChat extends Component {

    send(info) {
        console.log(info);
        if(!info == ''){
            let content={
                _id: 1,
                text: info,
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'React Native',
                    avatar: 'https://facebook.github.io/react/img/logo_og.png',
                },
            }
            this.setState({
                message:GiftedChat.append(content, messages),
                infos:''
            })
        }
    }
    render(){
        return(

            <View style={styles.inputBottom}>
                <View style={styles.sendText}>
                    <TextInput
                        onChangeText ={(text) => this.setState({infos:text})}
                        value={this.state.infos}
                        caretHidden={this.state.mark}
                    />
                </View>
                <TouchableOpacity onPress={() => this.send(this.state.infos)} style={styles.sendBtn}>
                    <Text style={styles.sendBtnText} >
                        {'发送'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    inputBottom: {
        flex:1,
        flexDirection:'row',
        alignItems:'stretch',
    },
    sendText: {
        flex:1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderBottomLeftRadius: 15,
        borderTopLeftRadius: 15,
    },
    sendBtn: {
        alignItems:'center',
        justifyContent:'center',
        width:50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderBottomRightRadius: 15,
        borderTopRightRadius: 15,
        backgroundColor: '#33a2ff',
    },
    sendBtnText: {
        width:30,
        color: '#ffffff',
        fontWeight: 'bold',
    }
})
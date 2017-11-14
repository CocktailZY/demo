/**
 * 登录
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    Button,
    ToastAndroid,
    AsyncStorage,
    Keyboard,
    KeyboardAvoidingView
} from 'react-native';

import path from './urlProperties';
import FetchUtil from './util/fetchUtil';
import cookie from './util/cookie';
import socket_io from 'socket.io-client';

import LoginBtn from './components/loginBtn';

export default class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            username:'15735929085',
            password:'123456',
            show: true,
        }
    }
    render() {
        return (
            <View style={styles.container}>
            <KeyboardAvoidingView style={{paddingBottom:30}} behavior="position">
                <View style={styles.imageView}>
                    <Image source={require('./image/drawable-hdpi-icon.png')} />
                </View>
                <View style={styles.imageText}>
                    <Text>易沟通，沟通易</Text>
                </View>
                <View style={styles.mt80}>
                    <View style={styles.TextInputView}>
                        <TextInput
                            placeholder="用户名"
                            underlineColorAndroid='transparent'
                            enablesReturnKeyAutomatically={true}
                            onChangeText={(text) => this.setState({username:text})}
                            value={this.state.username}
                        />
                    </View>
                    <View style={styles.TextInputView}>
                        <TextInput
                            placeholder="密码"
                            underlineColorAndroid='transparent'
                            secureTextEntry={this.state.show}
                            enablesReturnKeyAutomatically={true}
                            onChangeText={(text) => this.setState({password:text})}
                            value={this.state.password}
                        />
                    </View>

                    <LoginBtn name='登录' onPressCallback={this._onPressCallback}/>
                </View>
            </KeyboardAvoidingView>
            </View>
        );
    }

    /**
     * 点击登录按钮
     */
    _onPressCallback = () => {
        let user= {
            userName: this.state.username,
            password: this.state.password
        }
        // let user = 'userName='+this.state.username+'&password='+this.state.password;
        let url = path.appLogin;
        FetchUtil.netUtil(url,user,'POST',(responseText) => {
            if(responseText.status == 'success'){
                let getUserInfo = path.getUserInfo +"?contactValue=" + responseText.id + '&type=id';
                FetchUtil.netUtil(getUserInfo,{},'GET',(msg) => {
                    if (msg != "null") {
                        var userInfo = {
                            basic: msg.basic,
                            id: responseText.id,
                            contactValue: user.userName
                        };
                        cookie.save('loginUser',userInfo);
                        ToastAndroid.show('登录成功', ToastAndroid.SHORT);
                        this._onLoginSuccess(userInfo);
                    }
                })
            }else{
                ToastAndroid.show('用户名或密码错误', ToastAndroid.SHORT);
            }

        })

    };
    //跳转到第二个页面去
    _onLoginSuccess(userInfo){
        const { navigate } = this.props.navigation;
        if (navigate) {
            navigate('Home',{tabTitle:'消息',userObj:userInfo});
        }
    }
}


const styles = StyleSheet.create({
    outContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        paddingTop:80,
        paddingLeft: 30,
        paddingRight: 30,
        paddingBottom: 30,
    },
    imageView: {
        flexDirection: 'row',
        height:100,
        marginTop:1,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    imageText: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    mt80: {
        marginTop:80
    },
    TextInputView: {
        marginTop: 10,
        height: 45,
        backgroundColor: '#ffffff',
        borderRadius: 5,
        borderWidth: 0.3,
        borderColor: '#000',
    },

    TextInput: {
        backgroundColor: '#ffffff',
        height: 35,
        margin: 18,
    },
});

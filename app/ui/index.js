/**
 * 主页
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
} from 'react-native';

import Head from './head';
import Foot from './foot';

export default class index extends Component{
    render(){
        return(
            <View style={styles.container}>
                {/*<Head navigator={this.props.navigator}/>*/}
                <Foot navigation={this.props.navigation}/>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
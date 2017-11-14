import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    StyleSheet,
} from 'react-native';

import SearchBox from '../components/search';

import Icons from 'react-native-vector-icons/Ionicons';

export default class AddFriend extends Component{
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: `${navigation.state.params.tabTitle}`,
            headerBackTitle: '返回',  // 左上角返回键文字
            headerStyle: {backgroundColor: '#333333',height:44},
            headerTitleStyle: {color: '#fff',alignSelf : 'center'},
            headerLeft:(<Text style={{paddingLeft:10,width:30}} onPress={() => {navigation.goBack();}}>
                <Icons name="ios-arrow-back-outline" size={30} color="#fff"/>
            </Text>),
            headerTintColor : '#fff',
        }
    }

    constructor(props){
        super(props);
    }

    _onSearch(){

    }

    render(){
        return(
            <SearchBox _onPressSearchButton={this._onSearch} />
        )
    }
}
/**
 * 底部导航器
 * 导入原生组件
 */
import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    StyleSheet,
    SectionList,
    ToastAndroid
} from 'react-native';

import path from '../urlProperties';
import FetchUtil from '../util/fetchUtil';
import cookie from '../util/cookie';

const capTail = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

export default class AddressBook extends Component{
    constructor(props) {
        super(props);
        this.state = {
            sections:[],
        }
    }

    componentDidMount() {
        cookie.get('loginUser').then((data) => {
            let cookieUserInfo = data;
            this._fetchAddress(cookieUserInfo);
        });
    };

    _keyExtractor = (item, index) => index;

    _fetchAddress(cookieUserInfo){
        let condition = {
            userId:cookieUserInfo.id,
            spell:''
        };
        for(var i =0 ; i < capTail.length; i++){
            condition.spell = capTail[i];
            let url = path.getMyFriends + '?conditions=' + JSON.stringify(condition) + '&page=' + JSON.stringify({pageSize:5,pageNo:1});
            let tempObj = {key:capTail[i],data:[]};
            FetchUtil.netUtil(url, {}, 'GET', (data) => {
                if(data.status == 'success'){
                    if(data.list.length > 0){
                        tempObj.data = data.list;
                        this.setState((preState) => {
                            var tempThis = preState;
                            tempThis.sections.push(tempObj);
                            return tempThis;
                        },()=>{
                            if(this.state.sections.length == 0){
                                ToastAndroid.show('您还没有联系人', ToastAndroid.SHORT);
                            }
                        });
                    }
                }

            });
        }
    }

    _renderItem = (info) => {
        var txt = '  ' + info.item.userName;
        return <Text
            style={{ height: 60, textAlignVertical: 'center', backgroundColor: "#ffffff", color: '#5C5C5C', fontSize: 15 }}>{txt}</Text>
    }

    _sectionComp = (info) => {
        var txt = info.section.key;
        return <Text
            style={{ height: 50, textAlign: 'center', textAlignVertical: 'center', backgroundColor: '#9CEBBC', color: 'white', fontSize: 30 }}>{txt}</Text>
    }

    render() {
        // var sections = [
        //     { key: "A", data: [{ title: "阿童木" }, { title: "阿玛尼" }, { title: "爱多多" }] },
        //     { key: "B", data: [{ title: "表哥" }, { title: "贝贝" }, { title: "表弟" }, { title: "表姐" }, { title: "表叔" }] },
        //     { key: "C", data: [{ title: "成吉思汗" }, { title: "超市快递" }] },
        //     { key: "W", data: [{ title: "王磊" }, { title: "王者荣耀" }, { title: "往事不能回味" },{ title: "王小磊" }, { title: "王中磊" }, { title: "王大磊" }] },
        // ];

        return (
            <View style={{ flex: 1 }}>
                <SectionList
                    ref='list'
                    keyExtractor={this._keyExtractor}
                    renderSectionHeader={this._sectionComp}
                    renderItem={this._renderItem}
                    sections={this.state.sections}
                    ItemSeparatorComponent={() => <View><Text></Text></View>}
                    // ListHeaderComponent={() => <View style={{ backgroundColor: '#25B960', alignItems: 'center', height: 30 }}><Text style={{ fontSize: 18, color: '#ffffff' }}>通讯录</Text></View>}
                />
            </View>
        );
    }
}
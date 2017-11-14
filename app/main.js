import React, { Component } from 'react';
// import { Navigator } from 'react-native-deprecated-custom-components';
import { StackNavigator } from 'react-navigation';
import login from './login';
import Home from './ui/foot';
import Search from './components/search';
import MsgList from './ui/MessageList';
import GroupList from './ui/GroupList';
import ChatBox from './ui/CommunicationRegion';
import CreateGroup from './ui/CreateGroup';
import AddFriend from './ui/AddFriend';
import Mine from './ui/Mine';
import MineInfo from './ui/MineInfo';


const main =StackNavigator({
    Login: {
        screen: login,
        navigationOptions: {
            header:false
        }
    },
    Home: {
        screen: Home,  // 必须, 其他都是非必须
    },
    Search: {
        screen: Search,
    },
    MsgList: {
        screen: MsgList,
    },
    GroupList: {
        screen: GroupList,
    },
    ChatBox: {
        screen: ChatBox,
    },
    CreateGroup: {
        screen: CreateGroup,
    },
    AddFriend: {
        screen: AddFriend,
    },
    Mine: {
        screen: Mine,
    },
    MineInfo: {
        screen: MineInfo,
    }
    // ChatBox: { screen: HomeThree },
    // HomeFour: { screen: HomeFour }
}, {
    initialRouteName: 'Login', // 默认显示界面
    navigationOptions: {  // 屏幕导航的默认选项, 也可以在组件内用 static navigationOptions 设置(会覆盖此处的设置)
        // title:'消息',
        headerStyle: {backgroundColor: '#333333'},
        headerTitleStyle: {color: '#fff',justifyContent:'center'},
        cardStack: {gesturesEnabled: true }
    },
    mode: 'card',  // 页面切换模式, 左右是card(相当于iOS中的push效果), 上下是modal(相当于iOS中的modal效果)
    headerMode: 'screen', // 导航栏的显示模式, screen: 有渐变透明效果, float: 无透明效果, none: 隐藏导航栏
    onTransitionStart: ()=>{ console.log('导航栏切换开始'); },  // 回调
    onTransitionEnd: ()=>{ console.log('导航栏切换结束'); }  // 回调
});
export default main;

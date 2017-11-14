/**
 * 头部ToolBar
 */
import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    StyleSheet,
    ToolbarAndroid
} from 'react-native';

import toCreateGroup from './CreateGroup';

export default class head extends Component {
    constructor(props){
        super(props);
        console.log(this.props);
    }
    render() {
        return (
            <ToolbarAndroid
                title={'易沟通'}
                titleColor={'#fff'}
                style={styles.toolbarStyle}
                actions={[
                    {title: '添加好友', icon: require('../image/add-person.png'), show: 'never', showWithText: true},
                    {title: '创建群组', icon: require('../image/add.png'), show: 'never', showWithText: true}
                ]}
                onActionSelected={this.onActionSelected.bind(this)}
                onIconClicked={this._onPressButton}
            />
        );
    }

    onActionSelected(position) {
        console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
        if (position === 1) { // index of 'Settings'
            this.props.navigator.push({
                component:toCreateGroup,
                passProps: {//任何你想传到详情页组件的属性值
                },
                type: 'Top'
            });
        }
    }

    _onPressButton() {
        console.log('跳转按钮');
    }


}
const styles = StyleSheet.create({
    toolbarStyle: {
        height: 45,
        backgroundColor: '#4991e2'
    },
});

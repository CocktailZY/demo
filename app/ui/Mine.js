import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import path from '../urlProperties';
import FetchUtil from '../util/fetchUtil';
import cookie from '../util/cookie';

let cookieUserInfo = {};
export default class Mine extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log(this.props);
        let cookieUser = this.props.navigation.state.params.userObj;

        return (
            <View style={{flex: 1}}>
                <TouchableOpacity onPress={()=>{alert('success')}}>
                    <View style={styles.selfInfo}>
                        <View style={{paddingLeft:5}}>
                            <Image source={{uri: cookieUser.basic.head}} style={{width:60,height:60,borderRadius: 6}} />
                        </View>
                        <View style={styles.middleText}>
                            <Text style={styles.nameText}>{cookieUser.basic.userName}</Text>
                            <Text>帐号:{cookieUser.contactValue}</Text>
                        </View>
                        <View style={styles.qrCode}>
                            <Image source={require('../image/qr-code.png')}/>
                        </View>
                        <View style={styles.rightIcon}>
                            <Image source={require('../image/click-right.png')}/>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={{height:20}}><Text/></View>

                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('MineInfo',{tabTitle:'通知',userId:cookieUser.id})}}>
                    <View style={styles.msgBox}>
                        <Image source={require('../image/info.png')}/>
                        <Text style={{paddingLeft:5}}>通知</Text>
                        <View style={styles.rightBottomIcon}>
                            <Image source={require('../image/click-right.png')}/>
                        </View>
                    </View>
                </TouchableOpacity>

                <View><Text/></View>

                <TouchableOpacity onPress={()=>{alert('my-info')}}>
                    <View style={styles.mineBox}>
                        <Image source={require('../image/my-info.png')}/>
                        <Text style={{paddingLeft:5}}>提到我的</Text>
                        <View style={styles.rightBottomIcon}>
                            <Image source={require('../image/click-right.png')}/>
                        </View>
                    </View>
                </TouchableOpacity>

                <View><Text/></View>

                <TouchableOpacity onPress={()=>{alert('setting')}}>
                    <View style={styles.setBox}>
                        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                            <Image source={require('../image/setting.png')}/>
                            <Text style={{paddingLeft:5}}>设置</Text>
                        </View>
                        <View style={styles.rightBottomIcon}>
                            <Image source={require('../image/click-right.png')}/>
                        </View>
                    </View>
                </TouchableOpacity>

            </View>
        )

    }
}

const styles = StyleSheet.create({
    selfInfo: {
        flexDirection: 'row',
        alignItems:'center',
        backgroundColor:'#fff',
        height:80,
    },
    middleText: {flex: 1,paddingLeft:10},
    nameText: {fontSize: 18},
    qrCode: {},
    rightIcon: {justifyContent: 'flex-end'},
    rightBottomIcon: {alignItems: 'flex-end',flex:1},
    msgBox: {
        flexDirection: 'row',
        alignItems:'center',
        backgroundColor:'#fff',
        paddingLeft:5,
        paddingTop:10,
        paddingBottom:10
    },
    mineBox: {
        flexDirection: 'row',
        alignItems:'center',
        backgroundColor:'#fff',
        paddingLeft:5,
        paddingTop:10,
        paddingBottom:10
    },
    setBox: {
        flexDirection: 'row',
        alignItems:'center',
        backgroundColor:'#fff',
        paddingLeft:5,
        paddingTop:10,
        paddingBottom:10
    }
})
import React, {Component} from 'react';
import {
    StyleSheet,
    Image,
    Text,
    TextInput,
    View,
    ListView,
    ToastAndroid,
    AsyncStorage,
    ToolbarAndroid,
    Switch,
    TouchableOpacity,
    BackHandler
} from 'react-native';

import Icons from 'react-native-vector-icons/Ionicons';

import path from '../urlProperties';
import FetchUtil from '../util/fetchUtil';
import cookie from '../util/cookie';

export default class CreateGroup extends Component {

    // 屏幕导航的默认选项, 也可以在组件内用 static navigationOptions 设置(会覆盖此处的设置)
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: `${navigation.state.params.tabTitle}`,
            headerBackTitle: '返回',  // 左上角返回键文字
            headerStyle: {backgroundColor: '#4991e2',height:44},
            headerTitleStyle: {color: '#fff',alignSelf : 'center'},
            headerLeft:(<Text style={{paddingLeft:10,width:30}} onPress={() => {navigation.goBack();}}>
                <Icons name="ios-arrow-back-outline" size={30} color="#fff"/>
            </Text>),
            headerTintColor : '#fff',
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            groupName:'',
            groupIntroduction:'',
            isAudit:false,
            btnEnable:false,
        }
        BackHandler.addEventListener('hardwareBackPress', ()=>{this.props.navigation.goBack('Home',{tabTitle:'消息'})});
    }


    render() {
        return (
            <View style={styles.container}>
                <View style={styles.inputs}>
                    <View style={styles.tops}>
                        <TextInput style={styles.input}
                                   placeholder="群组名称"
                                   underlineColorAndroid='transparent'
                                   onChangeText={(text) => this.setState({groupName: text})}
                        />
                        <TextInput style={styles.input1}
                                   placeholder="群组简介"
                                   underlineColorAndroid='transparent'
                                   onChangeText={(text) => this.setState({groupIntroduction: text})}
                        />
                    </View>
                    <View style={styles.bottoms}>
                        <View style={styles.bottomText}>
                            <Text style={{paddingLeft:5}}>是否审核</Text>
                        </View>
                        <Switch
                            style={styles.rightside}
                            onValueChange={(value) => this.setState({isAudit: value})}
                            value={this.state.isAudit}
                        />
                    </View>
                    <TouchableOpacity onPress={this.createGroup.bind(this)}
                                      style={styles.btnTextView}
                                      disabled={this.state.btnEnable}

                    >
                        <Text style={styles.btnText} >
                            创建
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    createGroup(){
        this.setState({
            BtnEnable:true
        },()=>{
            cookie.get('loginUser').then((data) => {
                let tmpObj = {
                    basic:{
                        name:this.state.groupName,
                        head:'/images/u9.png'
                    },
                    extend:{
                        permission:'D',
                        isAudit:this.state.isAudit?'Y':'N',
                        introduction:this.state.groupIntroduction
                    }
                }
                let url = path.createGroup + '?userId=' + data.id;
                FetchUtil.netUtil(url, tmpObj, 'POST', (data) => {
                    if(data.status == 'success'){
                        ToastAndroid.show('创建成功', ToastAndroid.SHORT);
                        this.props.navigation.goBack();
                    }else{
                        ToastAndroid.show('创建失败', ToastAndroid.SHORT);
                    }
                })
            });
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    headBar: {
        height: 45,
        backgroundColor: '#4991e2',
    },
    inputs: {
        flex: 1,
    },
    tops: {
        height:100,
        marginBottom: 20,
        backgroundColor:'#fff',
    },
    input: {
        flex: 1,
        borderBottomWidth:1,
        borderBottomColor:'#c3c3c3'
    },
    input1: {
        flex: 1,
    },
    bottoms: {
        height:30,
        flexDirection: 'row',
        backgroundColor:'#fff',
    },
    rightside: {
        flex:1,
        width:60,
        backgroundColor:'#fff',
    },
    bottomText: {
        alignContent:'center',
        justifyContent: 'center',
        width:200
    },
    btnText: {
        color: '#ffffff',
        fontWeight: 'bold',
        width:30,
    },
    btnTextView: {
        marginTop: 10,
        marginLeft:5,
        marginRight:5,
        height:45,
        backgroundColor: '#3281DD',
        borderRadius:5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems:'center',
    },

})
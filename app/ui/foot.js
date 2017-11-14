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
} from 'react-native';

/**
 * 导入第三方组件
 */
import TabNavigator from 'react-native-tab-navigator';
import Icons from 'react-native-vector-icons/Ionicons';

import Search from '../components/search';
import MsgList from './MessageList';
import GroupList from './GroupList';
import AddressList from './AddressBook';
import Mine from './Mine';


export default class foot extends Component{
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: `${navigation.state.params.tabTitle}`,
            headerStyle: {backgroundColor: '#333333',height:44},
            headerTitleStyle: {color: '#fff',alignSelf:'center'},
            headerLeft:null,
            headerRight:(navigation.state.params.rightBtn?(
                navigation.state.params.type == 'groups'?(
                    <Text style={{paddingRight:5}} onPress={()=>{navigation.navigate('CreateGroup',{tabTitle:'创建群组'})}}>
                        <Icons name="ios-add-outline" size={40} color="#fff"/>
                    </Text>
                ):(
                    <Text style={{paddingRight:5}} onPress={()=>{navigation.navigate('AddFriend',{tabTitle:'添加好友'})}}>
                        <Icons name="md-person-add" size={30} color="#fff"/>
                    </Text>
                )
            ):null),
        }
    }
    constructor(props) {
        super(props);
        this.state = {
            tabNames: ['消息', '群组', '通讯录', '我的'],
            tab: 'message',
        };
    }

    changeRouter(type){
        this.setState({
            tab:type
        },()=>{
            if(type == 'message'){
                this.props.navigation.setParams({tabTitle:'消息',rightBtn:false,type:'message'})
            }else if(type == 'groups'){
                this.props.navigation.setParams({tabTitle:'群组',rightBtn:true,type:'groups'});
            }else if(type == 'mine'){
                this.props.navigation.setParams({tabTitle:'我的',rightBtn:false,type:'mine'})
            }else{
                this.props.navigation.setParams({tabTitle:'通讯录',rightBtn:true,type:'addressBook'})
            }
        })
    }

    render(){
        return(
            <TabNavigator tabBarStyle={styles.container}>
                {/*注意:需包含一个子组件*/}
                <TabNavigator.Item
                    style={styles.itemBg}
                    title="消息"
                    selected={this.state.tab == 'message'}
                    onPress={this.changeRouter.bind(this,'message')}
                    renderIcon={() => <Image
                        style={styles.btBarIcon}
                        source={require('../image/message.png')}></Image>}
                >
                    <View>
                        {/*<Search />*/}
                        <MsgList navigation={this.props.navigation}/>
                    </View>
                </TabNavigator.Item>
                <TabNavigator.Item
                    title="群组"
                    style={styles.itemBg}
                    selected={this.state.tab == 'groups'}
                    onPress={this.changeRouter.bind(this,'groups')}
                    renderIcon={() => <Image
                        style={styles.btBarIcon}
                        source={require('../image/group.png')}></Image>}
                >
                    <View>
                        <GroupList navigation={this.props.navigation}/>
                    </View>
                </TabNavigator.Item>
                <TabNavigator.Item
                    title="通讯录"
                    style={styles.itemBg}
                    selected={this.state.tab == 'addressBook'}
                    onPress={this.changeRouter.bind(this,'addressBook')}
                    renderIcon={() => <Image
                        style={styles.btBarIcon}
                        source={require('../image/address-book.png')}></Image>}
                >
                    <AddressList navigation={this.props.navigation} />
                </TabNavigator.Item>
                <TabNavigator.Item
                    title="我的"
                    style={styles.itemBg}
                    selected={this.state.tab == 'mine'}
                    // onPress={() => this.setState({tab: 'mine'})}
                    onPress={this.changeRouter.bind(this,'mine')}
                    renderIcon={() => <Image
                        style={styles.btBarIcon}
                        source={require('../image/mine.png')}></Image>}
                >
                    <Mine navigation={this.props.navigation} />
                </TabNavigator.Item>
            </TabNavigator>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: 56,
        alignItems:'center',
        justifyContent:'center',
    },
    btBarIcon: {
        width: 24,
        height: 24,
    },
    itemBg: {
        paddingBottom:5
    }
})
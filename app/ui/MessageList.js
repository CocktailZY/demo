/**
 * 消息列表
 */
import React, {Component} from 'react';
import {
    StyleSheet,
    Image,
    Text,
    View,
    FlatList,
    ToastAndroid,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl
} from 'react-native';


import path from '../urlProperties';
import FetchUtil from '../util/fetchUtil';
import cookie from '../util/cookie';
import timeFormat from '../util/formatDate';
import * as actions from '../actions/actions';
import { connect } from 'react-redux';

import Communication from './CommunicationRegion';
// import ChatBox from '../testPage/testChat';


class MessageList extends Component {
    /**
     * 构造器(构造方法)
     * @param props
     * 如果要在构造方法中使用this.props则需要传props,即形参和super位置可传可不传props，已官方例子为准一般都会传入
     */
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            dataSource: [],
            isLoadingTail: false,
            animating: true,
            hasNewMessage: false,
        };
    };

    //组件渲染完毕时调用此方法
    componentDidMount() {
        this.fetchData(1);
    };

    componentWillReceiveProps(nextProps){
        if(!nextProps.flag){
            this.fetchData(1);
        }else{
            console.log('props没有改变');
        }
    }

    _keyExtractor = (item, index) => index;

    /**
     * 进入交流页
     * @param id ListItem数据的id
     * @param type 页面跳转类型，如不传则为Normal
     */
    toCommunicate(id, type) {
        let url = '';
        let myTitle = '';
        if (type == 'privateChat') {
            url = path.getUserInfo + "?contactValue=" + this.state.user.id + '&type=id';
        } else {
            url = path.getGroupInfo + '/' + id + '?userId=' + this.state.user.id;
        }
        this.props.dispatch(actions.removeMessage());
        FetchUtil.netUtil(url, {}, 'GET', (data) => {
            console.log('---------------------1111111111111');
            console.log(data);
            if (type == 'privateChat') {
                myTitle = data.basic.userName;
            } else {
                myTitle = data.basic.name;
            }
            this.props.navigation.navigate
            (
                'ChatBox',
                {
                    groupId: id,
                    userId: this.state.user.id,
                    tabTitle: `${myTitle}`,
                    // socket:socket_io
                    chatType: type,
                    parentProps:this.props,
                }
            )
        });
    };

    /**
     * 当数据还没有请求回来时执行该静态方法
     * @returns {XML}
     */
    renderLoadingView() {
        return (
            <ActivityIndicator
                animating={this.state.animating}
                style={[styles.centering, {height: 80}]}
                size="large"
            />
        );
    };

    /**
     * 数据成功请求回来后渲染页面
     * @param rowData 请求响应的data，即在fetchData方法中set给state的dataSource
     * @returns {XML}
     */
    callback(rowData) {
        let headimg = '';
        rowData = rowData.item;
        //如果是私聊
        if (rowData.message.basic.type == 'privateChat') {
            headimg = rowData.groupInformation.basic.head;
        } else {
            headimg = path.baseUrl + rowData.groupInformation.basic.head;
        }

        let pubTime = timeFormat.formatTimeStmp(rowData.message.basic.publishTime);

        function OtherType() {
            if (rowData.message.content.file.length !== 0) {
                if (rowData.message.content.file[0].classify == 'image') {
                    return <Text>{'[图片]'}</Text>
                } else if (rowData.message.content.file[0].classify == 'sound' || rowData.message.content.file[0].classify == 'audio') {
                    return <Text>{'[语音]'}</Text>
                } else {
                    return <Text>{'[文件]'}</Text>
                }
            } else {
                if(rowData.message.basic.undo == true){
                    return <Text>{'[撤回一条消息]'}</Text>
                }else{
                    return <Text numberOfLines={1}>{rowData.message.content.text}</Text>
                }

            }
        }

        function HeadRedPoint() {
            // if(nowThis.props.messages.id !== undefined){
            if(rowData.count > 0){
                return(<Text style={{position:'absolute',left:42,top:-5}}>
                    <Image source={require('../image/point.png')}/>
                </Text>)
            }else{
                return <View/>
            }
            // }else{
            //     return <View/>
            // }
        }
        return (
            <TouchableOpacity
                underlayColor='rgba(24,36,35,0.1)'
                onPress={() => {
                    if (rowData.message.basic.type == 'privateChat') {
                        this.toCommunicate(rowData.groupInformation.id, 'privateChat')
                    } else {
                        this.toCommunicate(rowData.groupInformation.id, 'groupChat')
                    }
                }}>
                <View style={styles.body}>
                    <View style={styles.leftSlide}>
                        <Image source={{uri: headimg}} style={{width: 50, height: 50, borderRadius: 5}}/>
                        <HeadRedPoint/>
                    </View>
                    <View style={styles.rightSlide}>
                        <View style={styles.topSlide}>
                            <View style={{flex: 1}}>
                                <Text numberOfLines={1}>{rowData.groupInformation.basic.name}</Text>
                            </View>
                            <View style={{width: 100}}>
                                <Text style={{textAlign: 'right'}}>{pubTime}</Text>
                            </View>
                        </View>

                        <View style={styles.bottomSlide}>
                            <OtherType/>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    };

    /**
     * 请求服务器获取list数据
     */
    fetchData(page) {
        cookie.get('loginUser').then((data) => {
            this.setState({
                user: data
            })
            let url = path.getMessages + '/' + this.state.user.id;
            this.setState({
                isLoadingTail: false,
            })
            FetchUtil.netUtil(url, {}, 'GET', (responseJson) => {
                this.setState({
                    dataSource: responseJson,
                    isLoadingTail: true,
                    animating: false,
                    hasNewMessage: false,
                });

            });
        });
    };


    /**
     * 渲染主组件
     * @returns {*}
     */
    render() {
        //判断数据是否渲染完成
        if (!this.state.isLoadingTail) {
            return this.renderLoadingView();
        }

        return (
            <FlatList
                data={this.state.dataSource}
                renderItem={this.callback.bind(this)}
                keyExtractor={this._keyExtractor}
                extraData={this.state}
                // ListFooterComponent={this._renderFooter.bind(this)}
                // onEndReached={this.fetchMoreData.bind(this)}
                // onEndReachedThreshold={0.1}
                refreshing={false}
                onRefresh={this.fetchData.bind(this, 1)}
            />
        )

    };

}

const styles = StyleSheet.create({
    centering: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    body: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#dbdbdb',
        flexDirection: 'row',
        padding: 5,
    },
    loadingMore: {
        marginVertical: 20
    },
    loadingText: {
        color: '#777',
        textAlign: 'center'
    },
    leftSlide: {
        width: 60,
        flexDirection:'row',

    },
    rightSlide: {
        flex: 1,
    },
    topSlide: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 5,
    },
    bottomSlide: {
        flex: 1,
        paddingLeft: 5,
    }

});

function mapStateToProps(state,ownProps) {
    return {
        flag: state.messages.flag,
        messages: state.messages.message,

    }
}
export default connect(mapStateToProps)(MessageList)
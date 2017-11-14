/**
 * 群组列表
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
    AsyncStorage,
    RefreshControl,
    Button
} from 'react-native';

import path from '../urlProperties';
import FetchUtil from '../util/fetchUtil';
import cookie from '../util/cookie';

// import ChatBox from '../testPage/testChat';
import Communication from './CommunicationRegion';

export default class GroupList extends Component {
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
            loaded: false,
            animating: true,

        };
    };

    //组件渲染完毕时调用此方法
    componentDidMount() {
        // AsyncStorage.getItem('loginUser').then((data) => {this.setState({user: JSON.parse(data)})}),
        this.fetchData();
    };

    _keyExtractor = (item, index) => index;

    /**
     * 渲染主组件
     * @returns {*}
     */
    render() {
        //判断数据是否渲染完成
        if (!this.state.loaded) {
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

    /**
     * 进入详情页
     * @param id ListItem数据的id
     * @param type 页面跳转类型，如不传则为Normal
     */
    toChat(groupid, type) {
        let url = path.getGroupInfo + '/' + groupid + '?userId=' + this.state.user.id;
        let myTitle = '';
        FetchUtil.netUtil(url,{},'GET',(data) => {
            myTitle = data.basic.name;
            this.props.navigation.navigate
            (
                'ChatBox',
                {
                    groupId: groupid,
                    userId: this.state.user.id,
                    tabTitle:`${myTitle}`,
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
     * @param rowData 请求响应的data，即在fetchData方法中set给state的lists
     * @returns {XML}
     */
    callback(rowData) {
        rowData = rowData.item;
        let headimg = path.baseUrl + rowData.groupInformation.basic.head;
        return (
            <TouchableOpacity
                underlayColor='rgba(24,36,35,0.1)'
                onPress={() => this.toChat(rowData.groupInformation.id, 'Right')}>
                <View style={styles.body}>
                    <View style={styles.leftSlide}>
                        <Image source={{uri: headimg}} style={{width: 50, height: 50, borderRadius: 5}}/>
                    </View>
                    <View style={styles.rightSlide}>
                        {/*<View style={styles.topSlide}>*/}
                        {/*<View style={{flex:1}}>*/}
                        <Text numberOfLines={1}>{rowData.groupInformation.basic.name}</Text>
                        {/*</View>*/}
                        {/*<View style={{width:100}}>*/}
                        {/*<Text style={{textAlign:'right'}}>{pubTime}</Text>*/}
                        {/*</View>*/}
                        {/*</View>*/}

                        {/*<View style={styles.bottomSlide}>*/}
                        {/*<Text>{rowData.message.content.text}</Text>*/}
                        {/*</View>*/}
                    </View>
                </View>
            </TouchableOpacity>
        )
    };

    /**
     * 请求服务器获取list数据
     */
    fetchData() {
        cookie.get('loginUser').then((data) => {
            this.setState({
                user: data
            })
            let url = path.getGroupLists + '/' + this.state.user.id;
            FetchUtil.netUtil(url, {}, 'GET', (responseJson) => {
                if (responseJson.status == 'success') {
                    this.setState({
                        dataSource: responseJson.list,
                        loaded: true,
                        animating: false,
                        pageTotal: responseJson.total
                    });
                }
            });
        });
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
    },
    rightSlide: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
    },
});
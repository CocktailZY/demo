import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    StyleSheet,
    FlatList
} from 'react-native';

import Icons from 'react-native-vector-icons/Ionicons';

import path from '../urlProperties';
import FetchUtil from '../util/fetchUtil';
import timeFormat from '../util/formatDate';

export default class MineInfo extends Component{

    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: `${navigation.state.params.tabTitle}`,
            headerBackTitle: '返回',  // 左上角返回键文字
            headerStyle: {backgroundColor: '#333333',height:44},
            headerTitleStyle: {color: '#fff',alignSelf:'center'},
            headerLeft:(<Text style={{paddingLeft:10,width:30}} onPress={() => {
                navigation.goBack();
            }}>
                <Icons name="ios-arrow-back-outline" size={30} color="#fff"/>
            </Text>),
            gesturesEnabled: true,
            headerTintColor : '#fff',
        }
    }

    constructor(props){
        super(props);
        this.state = {
            data:[],
        }

    }

    componentDidMount() {
        this._fetchMsgAndInfo();
    };

    _keyExtractor = (item, index) => index;

    _fetchMsgAndInfo() {
        let userId = this.props.navigation.state.params.userId;
        let url = path.getMineInfo + '?page=' +JSON.stringify({pageSize:10,pageNo:1,userId:'19251'});
        console.log(url);
        FetchUtil.netUtil(url, {}, 'GET', (data) => {
            if(data.status == 'success'){
                this.setState({
                    data: data.list,
                });
            }
        });
    }

    callback(rowData) {
        rowData = rowData.item;
        let pubTime = timeFormat.formatTimeStmp(rowData.basic.publishTime);
        return (
            <View style={styles.body}>
                <View style={styles.leftSlide}>
                    <Image source={{uri: rowData.basic.head}} style={{width: 50, height: 50, borderRadius:5}}/>
                </View>
                <View style={styles.rightSlide}>
                    <View style={styles.topSlide}>
                        <View style={{flex:1}}>
                            <Text numberOfLines={1}>{rowData.basic.userName}</Text>
                        </View>
                        <View style={{width:100}}>
                            <Text style={{textAlign:'right'}}>{pubTime}</Text>
                        </View>
                    </View>
                    <View style={styles.bottomSlide}>
                        <View style={{flex:1}}>
                            <Text numberOfLines={1}>{rowData.content.notice}</Text>
                        </View>
                    </View>
                </View>

            </View>
        )
    };

    render(){
        return(
            <FlatList
                data={this.state.data}
                renderItem={this.callback.bind(this)}
                keyExtractor={this._keyExtractor}
                extraData={this.state}
                // ListFooterComponent={this._renderFooter.bind(this)}
                // onEndReached={this.fetchMoreData.bind(this)}
                // onEndReachedThreshold={0.1}
                refreshing={false}
                onRefresh={this._fetchMsgAndInfo.bind(this)}
            />
        )
    }
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#dbdbdb',
        flexDirection: 'row',
        padding:5,
    },
    leftSlide: {
        width: 60,
    },
    rightSlide: {
        flex: 1,
    },
    topSlide: {
        flex: 1,
        flexDirection: 'row',
        alignItems:'center',
        paddingLeft:5,
    },
    bottomSlide: {
        flex: 1,
        paddingLeft:5,
    }
})
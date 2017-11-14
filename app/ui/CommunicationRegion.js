/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    Platform,
    PermissionsAndroid,
    StyleSheet,
    Text,
    TextInput,
    Image,
    FlatList,
    View,
    Dimensions,
    TouchableOpacity,
    ToastAndroid,
    BackHandler,
    DeviceEventEmitter,
    Alert,
    Modal,
    Keyboard,
    TouchableWithoutFeedback,

} from 'react-native';
//第三方
import socket_io from 'socket.io-client';
import ImagePicker from 'react-native-image-picker';
import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import FilePickerManager from 'react-native-file-picker';
import EmojiPicker from 'react-native-emoji-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
//const RNFS = require('react-native-fs');
import RNFS from 'react-native-fs';
//本地工具组件
import path from '../urlProperties';
import FetchUtil from '../util/fetchUtil';
import cookie from '../util/cookie';
import timeFormat from '../util/formatDate';
import DialogBox from '../components/DialogBottom';

import * as actions from '../actions/actions';
import {connect} from 'react-redux';

import ChangeTextInput from '../components/ChangeTextInput';

//全局变量
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
let preTime = new Date().getTime();
let nextTime = new Date().getTime();


let socket = null;
let cookieUserInfo = {};
let nextPage = 0;
let lastRow = null;
// 组内@全员，数据
let allValue = {'id': 'allId', 'basic': {'userName': '全员', 'spell': 'quanyuan'}, 'contactValue': 'all'};

let photoOptions = {
    //底部弹出框选项
    title: '请选择',
    cancelButtonTitle: '取消',
    takePhotoButtonTitle: null,
    chooseFromLibraryButtonTitle: '打开相册',
    cameraType: 'back',
    quality: 0.75,
    allowsEditing: true,
    noData: false,
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
}


class CommunicationRegion extends Component {

    // 屏幕导航的默认选项, 也可以在组件内用 static navigationOptions 设置(会覆盖此处的设置)
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: `${navigation.state.params.tabTitle}`,
            headerBackTitle: '返回',  // 左上角返回键文字
            headerTruncatedBackTitle: '返回',
            headerStyle: {backgroundColor: '#333333', height: 44},
            headerTitleStyle: {color: '#fff', alignSelf: 'center'},
            headerLeft: (<Text style={{paddingLeft: 10, width: 30}} onPress={() => {
                socket.disconnect();
                navigation.state.params.parentProps.dispatch(actions.refreshMessage());
                navigation.goBack();
            }}>
                <Icons name="ios-arrow-back-outline" size={30} color="#fff"/>
            </Text>),
            gesturesEnabled: true,
            headerTintColor: '#fff',
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            infos: '',
            mark: false,
            gifMark: false,
            message: {
                basic: {
                    userId: props.navigation.state.params.userId,
                    groupId: props.navigation.state.params.groupId,
                    type: '',
                    companyId: null,
                },
                content: {
                    text: '',
                    file: []
                },
                atMembers: [],
            },
            dataSource: [],
            msgType: 'text',
            atList: [],
            atSpan:'',
            msgImgList: [],

            currentTime: 0.0,                                                   //开始录音到现在的持续时间
            recording: false,                                                   //是否正在录音
            stoppedRecording: false,                                            //是否停止了录音
            finished: false,                                                    //是否完成录音
            playing: false,                                                     //是否正在播放
            // audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',          //路径下的文件名
            audioPath: '/storage/emulated/0/Android/data/com.egt_rn/test.mp3',
            hasPermission: undefined,
            modalVisible: false,//录音模态框标志
            imgModalVisible: false,//图片模态框标志
            showImageUrl: '',
            showTimeMark: false,//判断是否显示本条消息时间
            showConfirm: false,//判断是否显示下载框
            showKeyBorder: false,//监听键盘弹出
            longPressModalVisible: false,//长按消息弹出菜单
            chooseMessage: {},//选择的消息
            atListVisible: false,//atlist的显示
            idle: false,//图片悬浮框组件的显示
            chooseImg: [],//选择的图片
            cansle: false,
        }

        this.prepareRecordingPath = this.prepareRecordingPath.bind(this);     //执行录音的方法
        this.checkPermission = this.checkPermission.bind(this);               //检测是否授权
        this.record = this.record.bind(this);                                 //录音
        this.stop = this.stop.bind(this);                                     //停止
        this.play = this.play.bind(this);                                     //播放
        this.pause = this.pause.bind(this);                                   //暂停
        this.finishRecording = this.finishRecording.bind(this);
        this.inputOnFocus = this.inputOnFocus.bind(this);
        this.recall = this.recall.bind(this);

        socket = socket_io.connect(path.baseUrl + '/groupConnect', {forceNew: true, transports: ['websocket']});
        socket.on('welcome', function () {
            socket.emit('init', {
                groupId: props.navigation.state.params.groupId,
                userId: props.navigation.state.params.userId
            });
        });
        socket.on('receiveMessage', (message) => {
            this.props.dispatch(actions.addMessage(message));
            this.state.messages.push(message);
            preTime = nextTime;
            nextTime = new Date(message.basic.publishTime).getTime();
            let datas = JSON.parse(JSON.stringify(this.state.messages));
            // this.state.dataSource = this.state.dataSource.cloneWithRows(datas);
            this.setState((tmpThis) => {
                var tempThis = tmpThis;
                // tmpThis.dataSource = tmpThis.dataSource.cloneWithRows(datas);
                tempThis.dataSource = datas;
                return tmpThis;
            }, () => {
                setTimeout(() => {
                    this._flatList.scrollToEnd({animated: true});
                }, 0)
            });
        });
        // 撤回成功
        socket.on('undo', (message) => {
            let tempList = this.state.dataSource;
            for (var i = tempList.length; i > tempList.length - 40; i--) {
                if (tempList[i - 1].id == message.id) {
                    tempList[i - 1].basic.undo = true;
                    tempList[i - 1].content.text = "此条信息已删除";
                    tempList[i - 1].content.file = [];
                    tempList[i - 1].basic.type = "text";
                    break;
                }
            }
            this.setState({chooseMessage: {}}, () => {
                ToastAndroid.show('撤回成功', ToastAndroid.SHORT);
            });
        });

        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.goBack('Home', {tabTitle: '消息'});
            socket.disconnect();
        });
    }


    //录音配置
    prepareRecordingPath(audioPath) {
        AudioRecorder.prepareRecordingAtPath(audioPath, {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "Low",            //录音质量
            AudioEncoding: "mp3",           //录音格式
            AudioEncodingBitRate: 32000     //比特率
        });
    }

    checkPermission() {
        if (Platform.OS !== 'android') {
            return Promise.resolve(true);
        }

        const rationale = {
            'title': '获取录音权限',
            'message': 'egt正请求获取麦克风权限用于录音,是否准许'
        };
        return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
            .then((result) => {
                // alert(result);     //结果: granted ,    PermissionsAndroid.RESULTS.GRANTED 也等于 granted
                return (result === true || PermissionsAndroid.RESULTS.GRANTED)
            })
    }

    //开始
    async record() {
        // 如果正在录音
        if (this.state.recording) {
            alert('正在录音中!');
            return;
        }

        //如果没有获取权限
        if (!this.state.hasPermission) {
            alert('没有获取录音权限!');
            return;
        }

        //如果暂停获取停止了录音
        if (this.state.stoppedRecording) {
            this.prepareRecordingPath(this.state.audioPath);
        }

        this.setState({recording: true, modalVisible: true});

        // if(this.state.currentTime > 3){
        //     this.stop();
        // }

        try {
            const filePath = await AudioRecorder.startRecording();
        } catch (error) {
            console.error(error);
        }
    }

    //停止
    async stop() {
        // 如果没有在录音
        if (!this.state.recording) {
            alert('没有录音, 无需停止!');
            return;
        }

        this.setState({stoppedRecording: true, recording: false, modalVisible: false});

        try {
            const filePath = await AudioRecorder.stopRecording();

            // if (Platform.OS === 'android') {
            //     this.finishRecording(true, filePath);
            // }
            return filePath;
        } catch (error) {
            console.error(error);
        }

    }

    //播放
    async play() {
        // 如果在录音 , 执行停止按钮
        if (this.state.recording) {
            await this.stop();
        }
        // 使用 setTimeout 是因为, 为避免发生一些问题 react-native-sound中
        setTimeout(() => {
            var sound = new Sound(this.state.audioPath, '', (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                }
            });
            if(this.state.playing){
                setTimeout(() => {
                    sound.stop((success) => {
                        if (success) {
                            this.setState({playing: false});
                            console.log('successfully stoped');
                        } else {
                            console.log('playback failed due to audio decoding errors');
                        }
                    });
                }, 100);
            }else{
                setTimeout(() => {
                    sound.play((success) => {
                        if (success) {
                            this.setState({playing: true});
                            console.log('successfully finished playing');
                        } else {
                            console.log('playback failed due to audio decoding errors');
                        }
                    });
                }, 100);
            }

        }, 100);
    }

    //暂停
    async pause() {
        if (!this.state.recording) {
            alert('没有录音, 无需停止!');
            return;
        }

        this.setState({stoppedRecording: true, recording: false});

        try {
            const filePath = await AudioRecorder.pauseRecording();

            // 在安卓中, 暂停就等于停止
            if (Platform.OS === 'android') {
                this.finishRecording(true, filePath);
            }
        } catch (error) {
            console.error(error);
        }
    }

    //录音结束
    finishRecording(didSucceed, filePath) {
        this.setState({finished: didSucceed});

        let formData = new FormData();
        let file = {uri: filePath, type: 'multipart/form-data', name: new Date().getTime() + '.mp3'};

        formData.append("files", file);
        let url = path.uploadFilePath + '?groupId=' + this.props.navigation.state.params.groupId;
        uploadAudio = async (filePath) => {
            const path = 'file://' + filePath;
            const formData = new FormData()
            formData.append('images', {
                uri: path,
                name: new Date().getTime() + '.mp3',
                type: 'audio/mp3',
            })
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData,
                })
                let json = await res.json();
                json["duration"] = this.state.currentTime;
                this.setState((preState) => {
                    var tempMessage = preState.message;
                    tempMessage.content.file.push(json);
                    return {
                        // messages: GiftedChat.append(previousState.messages, messages),
                        message: tempMessage,
                    }
                }, () => {
                    socket.emit('appDistributeAudioMessage', this.state.message);
                    this.state.message.content.file = [];
                    this.state.currentTime = 0.0;
                })


            } catch (err) {
                alert(err)
            }
        }
        uploadAudio(filePath);

    }

    //组件渲染完毕时调用此方法
    componentDidMount() {
        this.fetchHistoryMessage();
        cookie.get('loginUser').then((data) => {
            cookieUserInfo = data;
        });

        // 页面加载完成后获取权限
        this.checkPermission().then((hasPermission) => {
            this.setState({hasPermission});

            //如果未授权, 则执行下面的代码
            if (!hasPermission) return;
            this.prepareRecordingPath(this.state.audioPath);

            AudioRecorder.onProgress = (data) => {
                this.setState({currentTime: Math.floor(data.currentTime)});
            };

            AudioRecorder.onFinished = (data) => {
                if (Platform.OS === 'ios') {
                    this.finishRecording(data.status === "OK", data.audioFileURL);
                }
            };

        })
        // console.log(this.props.navigator)
        // console.log(audioPath)

        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }

    //组件render更新后调用
    componentDidUpdate(){
        this._flatList.scrollToEnd({animated:true});

        if(this.state.mark){
            setTimeout(()=>{
                this._flatList.scrollToEnd({animated:true});
            },0)
        }

    }

    //键盘弹出
    _keyboardDidShow(e) {
        this.setState({showKeyBorder: true}, () => {
            this._flatList.scrollToEnd({animated: true});
        });

    }

    //键盘收回
    _keyboardDidHide(e) {
        this.setState({showKeyBorder: false}, () => {
            this._flatList.scrollToEnd({animated: true});
        });
    }

    //组件卸载时调用此方法
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress');
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    /**
     * 给Item生成唯一key
     * @param item
     * @param index
     * @private
     */
    _keyExtractor = (item, index) => index;

    /**
     * 加载历史消息
     */
    fetchHistoryMessage() {
        let chatType = this.props.navigation.state.params.chatType;
        let userId = this.props.navigation.state.params.userId;
        let toId = this.props.navigation.state.params.groupId;
        let url = '';
        if (chatType == 'privateChat') {
            url = path.getPrivateChatLists + '?fromId=' + userId + '&toId=' + toId + '&startNO=0&number=10';
        } else {
            url = path.getGroupHistoryLists + '?groupId=' + this.state.message.basic.groupId + '&startNO=0&number=10';
        }
        FetchUtil.netUtil(url, {}, 'GET', (responseJson) => {
            this.setState((preState) => {
                var tempThis = preState;
                tempThis.messages = responseJson.reverse();

                //整理数据
                for (var i = 0; i < tempThis.messages.length; i++) {
                    var postData = tempThis.messages[i];
                    if (postData.basic.undo == true) {
                        postData.content.text = "此条信息已删除";
                        postData.basic.type = "text";
                        postData.content.file = [];
                    }
                    if (postData.content.file.length > 0) {
                        this.state.msgImgList.push({url: path.baseUrl + postData.content.file[0].url});
                    }
                }

                tempThis.dataSource = tempThis.messages;
                // tempThis.dataSource = tempThis.dataSource.cloneWithRows(tempThis.messages);
                return tempThis;
            }, () => {
                setTimeout(() => {
                    this._flatList.scrollToEnd({animated: true});
                }, 0)
            });

        });

    };

    /**
     * 分页
     */
    fetchMoreHistory() {
        nextPage = nextPage + 10;
        let url = path.getGroupHistoryLists + '?groupId=' + this.state.message.basic.groupId + '&startNO=' + nextPage + '&number=10';
        FetchUtil.netUtil(url, {}, 'GET', (responseJson) => {
            this.setState((preState) => {
                var tempThis = preState;
                tempThis.messages = (tempThis.messages.reverse().concat(responseJson)).reverse();
                tempThis.msgImgList = [];
                //整理数据
                for (var i = 0; i < tempThis.messages.length; i++) {
                    var postData = tempThis.messages[i];
                    if (postData.basic.undo == true) {
                        postData.content.text = "此条信息已删除";
                        postData.basic.type = "text";
                        postData.content.file = [];
                    }
                    if (postData.content.file.length > 0) {
                        this.state.msgImgList.push({url: path.baseUrl + postData.content.file[0].url});
                    }
                }
                tempThis.dataSource = tempThis.messages;
                // tempThis.dataSource = tempThis.dataSource.cloneWithRows(tempThis.messages);
                return tempThis;
            });
        });
    }

    /**
     * 获取组成员
     */
    fetchAtList() {
        let url = path.getAtList + '?groupId=' + this.props.navigation.state.params.groupId;
        FetchUtil.netUtil(url, {}, 'GET', (datas) => {
            var members = datas;
            var _users = [allValue];
            members.forEach(function (item) {
                item.contactInformation.forEach(function (it) {
                    if (it.registerTag == 'true') {
                        item.contactValue = it.contactValue;
                    }
                })
                if (item.id != cookieUserInfo.id) {
                    _users.push(item);
                }
            });
            this.setState({atList: _users, atListVisible: true});

        });
    }

    //确认下载弹框
    showAlert(file) {
        Alert.alert('确认下载', file.name,
            [
                {
                    text: "取消", onPress: () => {
                    this.setState({showConfirm: false})
                }
                },
                {text: "确认", onPress: this.downloadFile(file)},
            ]
        );
    }

    //撤回消息
    recall() {
        let infoTime = new Date(this.state.chooseMessage.basic.publishTime).getTime();
        if (new Date().getTime() - infoTime > 120000) {
            this.setState({longPressModalVisible: false}, () => {
                ToastAndroid.show('只能撤回2分钟以内的消息', ToastAndroid.SHORT);
            })
        } else {
            //--------------------------------------撤回逻辑
            this.setState({longPressModalVisible: false}, () => {
                socket.emit('askForUndo', this.state.chooseMessage.id);
            })
        }
    }

    /**
     * RenderItem
     * @param rowData
     * @returns {XML}
     * @private
     */
    _callback(rowData) {
        let that = this;
        rowData = rowData.item;
        let userinfo = rowData.basic;
        let content = rowData.content;

        /**
         * 根据消息类型更改消息样式
         * @returns {XML}
         * @constructor
         */
        function NoticeType() {
            if (userinfo.type == 'vote') {
                if (!(cookieUserInfo.id == rowData.basic.userId)) {
                    return (
                        <View style={styles.otherTopic}>
                            <View style={{width: 60, height: 60}}>
                                <Image source={require('../image/icon-vote.png')} style={{width: 60, height: 60}}/>
                            </View>
                            <View style={{justifyContent: 'center', paddingLeft: 5}}>
                                <Text>{content.title}</Text>{/*style={styles.otherBubble}*/}
                            </View>
                        </View>
                    )
                } else {
                    return (
                        <View style={styles.myTopic}>
                            <View style={{width: 60, height: 60}}>
                                <Image source={require('../image/icon-vote.png')} style={{width: 60, height: 60}}/>
                            </View>
                            <View style={{justifyContent: 'center', paddingLeft: 5}}>
                                <Text>{content.title}</Text>{/*style={styles.myBubble}*/}
                            </View>
                        </View>
                    )
                }
            } else {
                if (userinfo.type == 'topic') {
                    if (!(cookieUserInfo.id == rowData.basic.userId)) {
                        return (
                            <View style={styles.otherTopic}>
                                <View style={{width: 60, height: 60}}>
                                    <Image source={require('../image/icon-topic.png')} style={{width: 60, height: 60}}/>
                                </View>
                                <View style={{justifyContent: 'center', paddingLeft: 5}}>
                                    <Text>{content.title}</Text>{/*style={styles.otherBubble}*/}
                                </View>
                            </View>
                        )
                    } else {
                        return (
                            <View style={styles.myTopic}>
                                <View style={{width: 60, height: 60}}>
                                    <Image source={require('../image/icon-topic.png')} style={{width: 60, height: 60}}/>
                                </View>
                                <View style={{justifyContent: 'center', paddingLeft: 5}}>
                                    <Text>{content.title}</Text>{/*style={styles.myBubble}*/}
                                </View>
                            </View>
                        )
                    }
                } else {
                    if (userinfo.type == 'activity') {
                        if (!(cookieUserInfo.id == rowData.basic.userId)) {
                            return (
                                <View style={styles.otherTopic}>
                                    <View style={{width: 60, height: 60}}>
                                        <Image source={require('../image/icon-activity.png')}
                                               style={{width: 60, height: 60}}/>
                                    </View>
                                    <View style={{justifyContent: 'center', paddingLeft: 5}}>
                                        <Text>{content.title}</Text>{/*style={styles.otherBubble}*/}
                                    </View>
                                </View>
                            )
                        } else {
                            return (
                                <View style={styles.myTopic}>
                                    <View style={{width: 60, height: 60}}>
                                        <Image source={require('../image/icon-activity.png')}
                                               style={{width: 60, height: 60}}/>
                                    </View>
                                    <View style={{justifyContent: 'center', paddingLeft: 5}}>
                                        <Text>{content.title}</Text>{/*style={styles.myBubble}*/}
                                    </View>
                                </View>
                            )
                        }
                    } else {
                        if (content.file.length !== 0) {
                            if (content.file[0].classify == 'image') {
                                if (!(cookieUserInfo.id == rowData.basic.userId)) {
                                    return (
                                        <View style={styles.otherImageView}>
                                            <TouchableOpacity onPress={() => {
                                                that.setState({
                                                    showImageUrl: path.baseUrl + content.file[0].url,
                                                    imgModalVisible: true,
                                                    chooseImg: content.file
                                                })
                                            }}>
                                                <Image source={{uri: path.baseUrl + content.file[0].imageUrl}}
                                                       style={{width: 100, height: 130, borderRadius: 6,}}/>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                } else {
                                    return (
                                        <View style={styles.myImageView}>
                                            <TouchableOpacity onPress={() => {
                                                that.setState({
                                                    showImageUrl: path.baseUrl + content.file[0].url,
                                                    imgModalVisible: true,
                                                    chooseImg: content.file
                                                })
                                            }}>
                                                <Image source={{uri: path.baseUrl + content.file[0].imageUrl}}
                                                       style={{width: 100, height: 130, borderRadius: 6,}}/>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }
                            } else if (content.file[0].classify == 'sound' || content.file[0].classify == 'audio') {
                                if (!(cookieUserInfo.id == rowData.basic.userId)) {
                                    return (
                                        <View style={styles.soundView}>
                                            <View style={{
                                                borderWidth: 1,
                                                borderRadius: 6,
                                                borderColor: '#ffd72a',
                                                backgroundColor: '#4991e2',
                                                width: 13.33 * content.file[0].duration,
                                                marginLeft: 5,
                                            }}>
                                                <TouchableOpacity onPress={() => {
                                                    that.play()
                                                }} style={styles.add_Image}>
                                                    <Image source={require('../image/sound-right.png')}
                                                           style={{width: 32, height: 32}}/>
                                                </TouchableOpacity>
                                            </View>
                                            <Text style={{marginLeft: 5}}>{content.file[0].duration}{'"'}</Text>
                                        </View>
                                    )
                                } else {
                                    return (
                                        <View style={styles.soundView}>
                                            <Text style={{marginRight: 5}}>{content.file[0].duration}{'"'}</Text>
                                            <View style={{
                                                borderWidth: 1,
                                                borderRadius: 6,
                                                borderColor: '#4991e2',
                                                backgroundColor: '#ffd72a',
                                                width: 13.33 * content.file[0].duration,
                                                marginLeft: 5,
                                            }}>
                                                <TouchableOpacity onPress={() => {
                                                    that.play()
                                                }} style={styles.add_Image}>
                                                    <Image source={require('../image/sound-left.png')}
                                                           style={{width: 32, height: 32, alignSelf: 'flex-end'}}/>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )
                                }
                            } else {
                                //附件类型文件
                                if (!(cookieUserInfo.id == rowData.basic.userId)) {
                                    return (
                                        <View style={styles.otherFileView}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    that.showAlert(content.file[0])
                                                }}>
                                                <Image source={{uri: path.baseUrl + content.file[0].imageUrl}}
                                                       style={{width: 100, height: 130, borderRadius: 6,}}/>
                                                <Text numberOfLines={1}>{content.file[0].name}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                } else {
                                    return (
                                        <View style={styles.myFileView}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    that.showAlert(content.file[0])
                                                }}>
                                                <Image source={{uri: path.baseUrl + content.file[0].imageUrl}}
                                                       style={{width: 100, height: 130, borderRadius: 6,}}/>
                                                <Text numberOfLines={1}>{content.file[0].name}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }
                            }
                            //增加投票类型和活体类型的判断
                        } else {
                            if (!(cookieUserInfo.id == rowData.basic.userId)) {
                                return <Text style={styles.otherBubble}>{rowData.content.text}</Text>
                            } else {
                                return <Text style={styles.myBubble}>{rowData.content.text}</Text>
                            }
                        }
                    }
                }
            }
        }

        /**
         * 控制消息时间显示
         * @returns {XML}
         * @constructor
         */
        function ShowTimeText() {
            if (lastRow == null) {
                lastRow = rowData;
                return (
                    <Text style={styles.showTimeBox}>
                        {timeFormat.formatTimeStmpToFullTime(userinfo.publishTime)}
                    </Text>
                )
            } else {
                if (new Date(userinfo.publishTime).getTime() - new Date(lastRow.basic.publishTime).getTime() > 300000) {
                    lastRow = rowData;
                    return (
                        <Text style={styles.showTimeBox}>
                            {timeFormat.formatTimeStmpToFullTime(userinfo.publishTime)}
                        </Text>
                    )
                } else {
                    lastRow = rowData;
                    return <View></View>
                }
            }

        }

        //真实渲染自己与他人的消息体
        if (!(cookieUserInfo.id == rowData.basic.userId)) {
            if (rowData.basic.undo == true) {
                return <View><Text style={styles.showTimeBox}>"{rowData.basic.userName}"撤回了一条消息</Text></View>
            } else {
                return (
                    <View>
                        <ShowTimeText/>
                        <View style={styles.otherPeople}>
                            <View style={styles.leftSlide}>
                                <Image source={{uri: userinfo.head}} style={{width: 40, height: 40, borderRadius: 5}}/>
                            </View>
                            < View style={styles.rightSlide}>
                                <View style={styles.topSlide}>
                                    <View style={{flex: 1}}>
                                        <Text numberOfLines={1}>{userinfo.userName}</Text>
                                    </View>
                                </View>

                                <View style={styles.bottomSlide}>
                                    <NoticeType/>
                                </View>
                            </View>
                        </View>
                    </View>
                )
            }
        } else {

            if (rowData.basic.undo == true) {
                return <View><Text style={styles.showTimeBox}>{'您撤回了一条消息'}</Text></View>
            } else {
                return (
                    <View>
                        <ShowTimeText/>
                        <View style={styles.mySelf}>
                            < View style={styles.leftSlide}>
                                <View style={styles.topSlide}>
                                    <View style={{flex: 1}}>
                                        <Text style={{textAlign: 'right'}} numberOfLines={1}>{userinfo.userName}</Text>
                                    </View>
                                </View>
                                <View style={styles.bottomSlide}>

                                    <TouchableOpacity
                                        onLongPress={() => {
                                            that.setState({longPressModalVisible: true, chooseMessage: rowData})
                                        }}
                                    >
                                        <NoticeType/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.rightSlide}>
                                <Image source={{uri: userinfo.head}} style={{width: 40, height: 40, borderRadius: 5}}/>
                            </View>
                        </View>
                    </View>
                )
            }
        }
    };

    _renderAtList(dataItem) {
        let temThis = this;
        dataItem = dataItem.item;

        function CheckHead() {
            if (dataItem.id == 'allId') {
                return (
                    <Image source={require('../image/profile.png')} style={{width: 50, height: 50, borderRadius: 5}}/>
                )
            } else {
                return (
                    <Image source={{uri: dataItem.basic.head}} style={{width: 50, height: 50, borderRadius: 5}}/>
                )
            }
        }

        return (
            <TouchableOpacity
                underlayColor='rgba(24,36,35,0.1)'
                onPress={() => {
                    if (temThis.state.message.atMembers.length > 0) {
                        for (var i = 0; i < temThis.state.message.atMembers.length; i++) {
                            if (dataItem.id !== temThis.state.message.atMembers[i].userId) {
                                temThis.state.message.atMembers.push({'userId': dataItem.id});
                            }
                        }
                    } else {
                        temThis.state.message.atMembers.push({'userId': dataItem.id});
                    }
                    temThis.setState({
                        infos: temThis.state.infos + dataItem.basic.userName + ' ',
                        atListVisible: false,
                    }, () => {
                        //let span = this.state.infos.substr(this.state.infos.indexOf('@'),dataItem.basic.userName.length);
                        console.log(temThis.state.infos);
                        let span = temThis.state.infos.match(/\@\w+([-.]\w+)*\s/g);
                        console.log(span);
                        this.refs.textInputBox.onFocusText();
                    });
                }}>
                <View style={styles.atListBody}>
                    <View style={styles.leftSlide}>
                        <CheckHead/>
                    </View>
                    <View style={{flex: 1, justifyContent: 'center', paddingLeft: 5}}>
                        <Text numberOfLines={1}>{dataItem.basic.userName}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }


    /**
     * 发送文本消息
     * @param info
     */
    send(info) {
        if (!info == '') {
            this.setState((preState) => {
                var tempMessage = preState.message;
                tempMessage.content.text = info;
                preState.gifMark = false;
                preState.infos = '';
                return {
                    // messages: GiftedChat.append(previousState.messages, messages),
                    message: tempMessage,
                }
            }, () => {
                socket.emit('distributeMessage', this.state.message);
                this.state.message.atMembers = [];
            })
        } else {
            ToastAndroid.show('发送内容不能为空', ToastAndroid.SHORT);
        }
    }

    /**
     * 图片选择器
     */
    imagePicker() {
        ImagePicker.showImagePicker(photoOptions, (response) => {
            console.log(response);
            if (response.didCancel) {
                return
            }

            let formData = new FormData();
            let file = {uri: response.uri, type: 'multipart/form-data', name: response.fileName};
            formData.append("images", file);
            let url = path.uploadFilePath + '?groupId=' + this.props.navigation.state.params.groupId;
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            })
                .then((response) => response.json())
                .then((responseData) => {
                    this.setState((preState) => {
                        var tempMessage = preState.message;
                        tempMessage.content.file.push(responseData);
                        return {
                            // messages: GiftedChat.append(previousState.messages, messages),
                            message: tempMessage,
                        }
                    }, () => {
                        socket.emit('distributeMessage', this.state.message);
                        this.state.message.content.file = [];
                        this.state.mark = false;
                    })
                })
                .catch((error) => {
                    console.error('error', error)
                });

        })

        // ImagePicker.launchCamera(photoOptions, (response) => {
        //
        // })
    }

    /**
     * 文件选择器
     */
    filePicker() {
        FilePickerManager.showFilePicker(null, (response) => {

            if (response.didCancel) {
                console.log('User cancelled file picker');
            }
            else if (response.error) {
                console.log('FilePickerManager Error: ', response.error);
            }
            else {
                // this.setState({
                //     file: response
                // });
                console.log(response);
                let formData = new FormData();
                let fileName = response.path.substring(response.uri.lastIndexOf('/') + 1);
                let file = {uri: 'file://' + response.path, type: 'multipart/form-data', name: fileName};
                formData.append("images", file);
                let url = path.uploadFilePath + '?groupId=' + this.props.navigation.state.params.groupId;
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData,
                }).then((response) => response.json())
                    .then((responseData) => {
                        this.setState((preState) => {
                            var tempMessage = preState.message;
                            tempMessage.content.file.push(responseData);
                            return {
                                // messages: GiftedChat.append(previousState.messages, messages),
                                message: tempMessage,
                            }
                        }, () => {
                            socket.emit('distributeMessage', this.state.message);
                            this.state.message.content.file = [];
                            this.state.mark = false;
                        })
                    })
                    .catch((error) => {
                        console.error('error', error)
                    });
            }
        });
    }

    /**
     * 保存到相册，目前保存到本地文件目录下
     */
    saveToCamra() {
        let file = this.state.chooseImg[0];
        console.log(file);
        let downloadDest = '/storage/emulated/0/DCIM/Camera/' + file.name;
        let url = path.baseUrl + '/file-download?fileName=' + file.name + '&filePath=' + file.url;
        const options = {
            fromUrl: url,
            toFile: downloadDest,
            background: true,
        };
        try {
            const ret = RNFS.downloadFile(options);
            ret.then(res => {
                console.log(res);
                if (res.statusCode == 200) {
                    // new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE,Uri.fromFile(downloadDest));
                    RNFS.scanFile(downloadDest);
                    ToastAndroid.show('保存成功', ToastAndroid.SHORT);
                }
            }).catch(err => {
                console.log('err', err);
            });
        }
        catch (e) {
            console.log(e);
        }
    }

    /**
     * 下载附件方法
     */
    downloadFile(file) {
        let url = '';
        let downloadDest = '/storage/emulated/0/Android/data/com.egt_rn/files/' + file.name;
        if (file.type != 'D') {
            url = path.baseUrl + '/file-download?fileName=' + file.name + '&filePath=' + file.url;
        } else {
            url = path.downloadFilePath + '?id=' + file.id + '&mainId=' + file.mainId;
        }
        const options = {
            fromUrl: url,
            toFile: downloadDest,
            background: true,
            // begin: (res) => {
            //     console.log('begin', res);
            //     console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
            // },
            // progress: (res) => {
            //
            //     let pro = res.bytesWritten / res.contentLength;
            //
            //     this.setState({
            //         progressNum: pro,
            //     });
            // }
        };
        try {
            const ret = RNFS.downloadFile(options);
            ret.promise.then(res => {
                if (res.statusCode == 200) {
                    ToastAndroid.show('保存成功', ToastAndroid.SHORT);
                }
            }).catch(err => {
                console.log('err', err);
            });
        }
        catch (e) {
            console.log(error);
        }
    }


    //当输入框获得焦点的时候隐藏底部面板
    inputOnFocus() {
        this.setState({mark: false, gifMark: false});
    }

    render() {
        let tempThis = this;

        /**
         * 控制右侧图标变换
         * @returns {XML}
         * @constructor
         */
        function IconImage() {
            if (tempThis.state.infos) {
                return (
                    <TouchableOpacity onPress={() => tempThis.send(tempThis.state.infos)} style={styles.sendBtn}>
                        <Text style={styles.sendBtnText}>
                            {'发送'}
                        </Text>
                    </TouchableOpacity>
                )
            } else {
                if (tempThis.state.mark) {
                    //return (<Image source={require('../image/down.png')}/>)
                    return (
                        <View style={{marginRight: 5}}>
                            <Icons name="ios-arrow-dropdown-outline" size={32} color="#999999"/>
                        </View>
                    )
                } else {
                    return (
                        <View style={{marginRight: 5}}>
                            <Icons name="ios-add-circle-outline" size={32} color="#999999"/>
                        </View>
                    )
                }
            }

        }

        /**
         * 右侧表情图标变换
         * @returns {XML}
         * @constructor
         */
        function GifIconImage() {
            if (tempThis.state.gifMark) {
                return (<Icons name="ios-arrow-dropdown-outline" size={32} color="#999999"/>)
            } else {
                //return (<Image source={require('../image/emoj.png')}/>)
                return (<Icons name="ios-happy-outline" size={32} color="#999999"/>)
            }
        }

        /**
         * 控制底部功能面板弹出
         * @returns {XML}
         * @constructor
         */
        function BottomPanel() {
            if (tempThis.state.mark == true) {
                //tempThis._flatList.scrollToEnd({animated:true});
                return (
                    <View style={{
                        flexDirection: 'row',
                        backgroundColor: '#fff',
                        justifyContent: 'space-around',
                        paddingTop: 10,
                        paddingBottom: 10
                    }}>
                        <TouchableOpacity
                            onPress={() => tempThis.imagePicker()}
                        >
                            <View style={{alignItems: 'center', justifyContent: 'center', padding: 5}}>
                                <Icons name="md-images" size={50}/>
                                <Text style={{color: '#a8a8a8', fontSize: 10}}>{'图片'}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => tempThis.filePicker()}
                        >
                            <View style={{alignItems: 'center', justifyContent: 'center', padding: 5}}>
                                <Icons name="ios-folder-outline" size={50}/>
                                <Text style={{color: '#a8a8a8', fontSize: 10}}>{'文件'}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )
            } else {
                return (<View></View>)
            }
        }

        //表情面板弹出
        function GifPanel() {
            // const gifs = require('../arclist');
            if (tempThis.state.gifMark == true) {
                // tempThis._flatList.scrollToEnd({animated:true});
                return (
                    <View style={{height: 300,}}>
                        <EmojiPicker
                            style={{height: 300}}
                            onEmojiSelected={(emoji) => {
                                tempThis.setState({infos: tempThis.state.infos + emoji})
                            }}/>
                    </View>
                )
            } else {
                return (<View></View>)
            }
        }

        /**
         * 切换底部左侧图标
         * @returns {XML}
         * @constructor
         */
        function IconLeft() {
            if (tempThis.state.msgType == 'text') {
                return (<Icons name="ios-mic-outline" size={40} color="#999999"/>)
            } else {
                return (<FontAwesome name="keyboard-o" size={28} color="#999999"/>)
            }
        }

        function CansleRecord(){
            if(tempThis.state.cansle){
                return(
                    <View style={{
                        backgroundColor: '#ccc',
                        width: 200,
                        height: 200,
                        borderRadius: 5,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <View style={{width:72,height:72,alignItems:'center'}}>
                            <Icons name="md-return-left" size={72} color="#ffffff"/>
                        </View>
                        <View>
                            <Text style={{fontSize: 30,color:'#ff3317'}}>
                                松开手指，取消发送
                            </Text>
                        </View>
                    </View>
                )
            }else{
                return(
                    <View style={{
                        backgroundColor: '#ccc',
                        width: 200,
                        height: 200,
                        borderRadius: 5,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <View style={{width:72,height:72,alignItems:'center'}}>
                            <Icons name="md-mic" size={72} color="#ffffff"/>
                        </View>
                        <View>
                            <Text style={{fontSize: 30,}}>
                                {tempThis.state.currentTime}s
                            </Text>
                        </View>
                    </View>
                )
            }
        }

        return (
            <View style={styles.container}>
                {/*计时模态框*/}
                <Modal
                    visible={this.state.modalVisible}/*this.state.modalVisible*/
                    //显示是的动画默认none
                    //从下面向上滑动slide
                    //慢慢显示fade
                    animationType={'slide'}
                    //是否透明默认是不透明 false
                    transparent={true}
                    //关闭时调用
                    onRequestClose={() => {
                        this.setState({modalVisible: false})
                    }}
                >
                    <View style={{flex: 1,alignItems:'center',justifyContent:'center'}}>
                        <CansleRecord/>
                    </View>
                </Modal>
                {/*图片查看模态框*/}
                <Modal
                    visible={this.state.imgModalVisible}
                    //显示是的动画默认none
                    //从下面向上滑动slide
                    //慢慢显示fade
                    animationType={'slide'}
                    //是否透明默认是不透明 false
                    transparent={true}
                    //关闭时调用
                    onRequestClose={() => {
                        this.setState({imgModalVisible: false})
                    }}
                >
                    <View style={{flex: 1}}>
                        <ImageViewer
                            style={{width: width, height: height}}
                            imageUrls={this.state.msgImgList} // 照片路径this.state.msgImgList
                            enableImageZoom={true} // 是否开启手势缩放
                            index={this.state.msgImgList.length-1} // 初始显示第几张this.state.msgImgList.length
                            //failImageSource={ToastAndroid.show('加载失败',ToastAndroid.SHORT)} // 加载失败图片
                            //onChange={(index) => {}} // 图片切换时触发
                            flipThreshold={10}
                            onClick={() => { // 图片单击事件
                                this.setState({imgModalVisible: false})
                            }}
                            saveToLocalByLongPress={false}
                            onLongPress={() => {
                                this.refs.box.show('请选择', '保存到相册', this);
                            }}
                        />
                        <DialogBox ref={'box'}/>
                    </View>
                </Modal>
                {/*长按消息菜单*/}
                <Modal
                    visible={this.state.longPressModalVisible}
                    //显示是的动画默认none
                    //从下面向上滑动slide
                    //慢慢显示fade
                    animationType={'slide'}
                    //是否透明默认是不透明 false
                    transparent={true}
                    //关闭时调用
                    onRequestClose={() => {
                        this.setState({longPressModalVisible: false})
                    }}
                >
                    <TouchableWithoutFeedback
                        onPress={() => {
                            this.setState({longPressModalVisible: false})
                        }}>
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            <Text
                                onPress={() => {
                                    this.recall()
                                }}
                                style={{
                                    width: 300,
                                    color: '#000',
                                    backgroundColor: '#fff',
                                    textAlign: 'center',
                                    padding: 5,
                                }}>撤回</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
                {/*@成员列表*/}
                <Modal
                    visible={this.state.atListVisible}
                    //显示是的动画默认none
                    //从下面向上滑动slide
                    //慢慢显示fade
                    animationType={'slide'}
                    //是否透明默认是不透明 false
                    transparent={false}
                    //关闭时调用
                    onRequestClose={() => {
                        this.state.message.atMembers = [];
                        this.setState({atListVisible: false})
                    }}
                >
                    <View style={{flexDirection: 'row', backgroundColor: '#4991e2', height: 44, alignItems: 'center',}}>
                        <View>
                            <Text style={{color: '#fff', paddingLeft: 5}}
                                  onPress={() => {
                                      this.state.message.atMembers = [];
                                      this.setState({atListVisible: false});
                                  }}>
                                取消
                            </Text>
                        </View>
                        <View style={{flex: 1, alignItems: 'center'}}>
                            <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>
                                选择提醒的人
                            </Text>
                        </View>

                    </View>
                    <View style={{flex: 1}}>
                        <FlatList
                            data={this.state.atList}
                            renderItem={this._renderAtList.bind(this)}
                            keyExtractor={this._keyExtractor}
                        />
                    </View>

                </Modal>

                <View style={styles.middle}>
                    <FlatList
                        ref={(flatList) => this._flatList = flatList}
                        keyExtractor={this._keyExtractor}
                        data={this.state.dataSource}
                        renderItem={this._callback.bind(this)}
                        getItemLayout={(data, index) => ( {length: 200, offset: 200 * index, index} )}
                        refreshing={false}
                        extraData={this.state}
                        onRefresh={this.fetchMoreHistory.bind(this)}
                    />
                </View>
                <View style={styles.inputBottom}>
                    <TouchableOpacity onPress={() => {
                        // if (this.state.showKeyBorder) {
                        //     this.refs.textInputBox.onBlurText();
                        // }
                        if (this.state.msgType == 'text') {
                            this.setState({msgType: 'audio', showKeyBorder: false, mark: false, gifMark: false})
                        } else {
                            this.setState({msgType: 'text', showKeyBorder: false, mark: false, gifMark: false})
                        }
                    }} style={styles.add_Image}>
                        <IconLeft/>
                    </TouchableOpacity>
                    <ChangeTextInput pThis={this} ref={'textInputBox'} onFocusText={this.inputOnFocus}
                                     fetchAtList={this.fetchAtList.bind(this)}/>

                    <TouchableOpacity onPress={() => {
                        if (this.state.showKeyBorder) {
                            this.refs.textInputBox.onBlurText();
                        }
                        this.setState({gifMark: !this.state.gifMark, showKeyBorder: false, mark: false})
                    }} style={styles.add_Image}>
                        <GifIconImage/>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        if (this.state.showKeyBorder) {
                            this.refs.textInputBox.onBlurText();
                        }
                        this.setState({mark: !this.state.mark, showKeyBorder: false, gifMark: false})

                    }} style={styles.add_Image}>
                        <IconImage/>
                    </TouchableOpacity>
                </View>
                <BottomPanel/>
                <GifPanel/>
            </View>
        );
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
        backgroundColor: '#4991e2'
    },
    middle: {
        flex: 1,
        // alignItems:'flex-end',
        justifyContent: 'flex-end',
    },
    inputBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderTopWidth:0.5,
        borderTopColor:'#c3c3c3'
    },
    sendText: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderBottomLeftRadius: 5,
        borderTopLeftRadius: 5,
    },
    sendBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 30,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#33a2ff',
        marginRight: 5
    },
    sendBtnText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    add_Image: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },
    body: {
        flex: 1,
        flexDirection: 'row',
        padding: 5,
    },
    atListBody: {
        flex: 1,
        flexDirection: 'row',
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#dbdbdb',
    },
    topSlide: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 5,
        paddingRight: 5,
    },
    otherPeople: {
        flexDirection: 'row',
        padding: 5,
        justifyContent: 'flex-start',
    },
    mySelf: {
        flexDirection: 'row',
        padding: 5,
        justifyContent: 'flex-end',
    },
    myBubble: {
        backgroundColor: '#ffd72a',
        borderRadius: 6,
        borderColor: '#4991e2',
        borderWidth: 1,
        textAlign: 'center',
        padding: 8,
        maxWidth: 280,
    },
    myTopic: {
        flexDirection: 'row',
        backgroundColor: '#ffd72a',
        borderRadius: 6,
        borderColor: '#4991e2',
        borderWidth: 1,
        textAlign: 'center',
        padding: 8,
        maxWidth: 280,
    },
    otherBubble: {
        backgroundColor: '#4991e2',
        borderRadius: 6,
        borderColor: '#ffd72a',
        borderWidth: 1,
        textAlign: 'center',
        padding: 8,
        maxWidth: 280,
    },
    otherTopic: {
        flexDirection: 'row',
        backgroundColor: '#4991e2',
        borderRadius: 6,
        borderColor: '#ffd72a',
        borderWidth: 1,
        padding: 8,
        maxWidth: 280,
    },
    otherImageView: {
        width: 102,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#ffd72a',
        backgroundColor: '#4991e2',
    },
    myImageView: {
        width: 102,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#4991e2',
        backgroundColor: '#ffd72a',
    },
    soundView: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    otherFileView: {
        width: 102,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#ffd72a',
        backgroundColor: '#4991e2',
    },
    myFileView: {
        width: 102,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#4991e2',
        backgroundColor: '#ffd72a',
    },
    bottomSlide: {
        flex: 1,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },

    showTimeBox: {
        alignSelf: 'center',
        borderRadius: 3,
        fontSize: 12,
        padding: 2,
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginBottom: 5
    }

});

export default connect()(CommunicationRegion)
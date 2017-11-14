import React, {Component} from 'react';

import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Keyboard,
    PanResponder
} from 'react-native';

import KeyEvent from 'react-native-keyevent';

export default class ChangeTextInput extends Component{
    constructor(props){
        super();
    }

    componentDidMount() {
        // if you want to react to keyDown
        // KeyEvent.onKeyDownListener((keyCode) => {
        //     console.log(`Key code pressed: ${keyCode}`);
        // });

        // if you want to react to keyUp
        // KeyEvent.onKeyUpListener((keyCode) => {
        //     console.log(`Key code pressed: ${keyCode}`);
        // });

        this._gestureHandlers = {
            onMoveShouldSetResponder: ()=> true,  //对滑动进行响应
            onResponderGrant: ()=>{
                console.log("激活");
            }, //激活时做的动作
            onResponderMove: ()=>{
                console.log("移动");
            },  //移动时作出的动作
            onResponderRelease: ()=>{
                this.props.pThis.setState({
                    cansle: true
                },()=>{
                    this.props.pThis.stop();
                })
            }, //动作释放后做的动作
        }
    }

    componentWillUnmount() {
        // if you are listening to keyDown
        // KeyEvent.removeKeyDownListener();

        // if you are listening to keyUp
        // KeyEvent.removeKeyUpListener();
    }

    testFunc(text){
        // console.log('----------------');
        // console.log(text);
        // console.log('----------------');
    }

    onBlurText(){
        this._inputBox.blur()
    }

    onFocusText(){
        this._inputBox.focus();
    }

    render(){
        let tempThis = this.props.pThis;
        const {onFocusText} = this.props;
        const {fetchAtList} = this.props;
        //this.testFunc(onFocusText);

        if(tempThis.state.msgType == 'text'){
            return(
                <View style={{flex:1,flexDirection:'row'}}>
                    <View style={styles.sendText}>
                        <TextInput
                            ref={(TextInput) => this._inputBox = TextInput}
                            style={{left: 0, right: 0, height: 50}}
                            multiline={true}
                            underlineColorAndroid={'#999999'}
                            onChangeText={(text) => {
                                tempThis.setState({infos: text},()=>{
                                    let str = tempThis.state.infos;
                                    if(str.substr(str.length-1,1) == '@'){
                                        fetchAtList();
                                    }
                                });
                            }}
                            onSelectionChange={(event) => {
                                let step = event.nativeEvent.selection.start;
                                console.log(tempThis.state.infos.substring(step-1,step));
                                let preCode = tempThis.state.infos.substring(step-1,step);
                                if(preCode == 'a'){//监听到空格
                                    // let preCodeInclude = ;//循环监听@符号
                                    console.log('succeess');
                                }
                            }}
                            //value={tempThis.state.infos}
                            onFocus={()=>{
                                onFocusText()
                            }}
                            // underlineColorAndroid='transparent'
                        >
                            {/*<Text style={{color:'#000'}}>*/}
                                {/*{tempThis.state.infos}<Text style={{color:'#ffff00'}}>{tempThis.state.atSpan}</Text>*/}
                                {/*/!*<Text style={{color:'#ffff00'}}>{tempThis.state.atSpan}</Text>*!/*/}
                            {/*</Text>*/}
                        </TextInput>
                    </View>
                </View>
            )
        }else{
            return(
                <TouchableOpacity
                    onPressIn={() => {
                        tempThis.setState({cansle:false});
                        return tempThis.record()
                    }}
                    onPressOut={() => {
                        return tempThis.stop()
                    }}
                    style={styles.longPressBtn}
                >
                    <Text style={styles.sendBtnText}  {...this._gestureHandlers}>
                        {'按住说话'}
                    </Text>
                </TouchableOpacity>
            )
        }
    }
}

const styles = StyleSheet.create({
    sendText: {
        flex:1,
        // borderWidth: 1,
        // borderColor: '#ccc',
        // borderBottomLeftRadius: 5,
        // borderTopLeftRadius: 5,
    },
    sendBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#33a2ff',
    },
    sendBtnText: {
        color: '#000',
        //fontWeight: 'bold',
    },
    longPressBtn: {
        flex:1,
        //backgroundColor:'#33a2ff',
        borderWidth:1,
        borderColor:"#c3c3c3",
        borderRadius:5,
        alignItems:'center',
        justifyContent:'center',
        height:40,
        marginLeft:5
    }
})
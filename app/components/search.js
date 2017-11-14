/**
 * 顶部SearchBar
 */
import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    TextInput,
    StyleSheet,
} from 'react-native';


export default class search extends Component {
    constructor(props){
        super(props);
        this.state = {
            searchText: '',
        }
    }
    render(){
        return(
            <View style={styles.flexDirection}>
                <TextInput
                    style={styles.input}
                    returnKeyType="search"
                    underlineColorAndroid='transparent'
                    placeholder="请输入关键字"
                    onChangeText={(text) => this.setState({searchText:text})}/>
                <Text style={styles.search} onPress={this.props._onPressSearchButton}>搜索</Text>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    flexDirection:{
        height:45,
        flexDirection:'row',
    },
    input:{
        flex:1,
        height:35,
        borderWidth:1,
        margin: 5,
        padding:5,
        borderColor: '#ccc',
        borderRadius: 4
    },
    search:{
        fontSize:15,
        fontWeight:'bold'
    },
})
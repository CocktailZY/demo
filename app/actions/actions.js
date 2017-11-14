/**
 * Created by coder_yang on 2017/8/17.
 */
import * as types from '../constants/ActionTypes';
export function addMessage(message) {
    return {
        type: types.ADD_MESSAGE,
        message
    };
}

export function removeMessage(){
    return {
        type:types.REMOVE_MESSAGE,
    }
}

export function refreshMessage(){
    return {
        type: types.REFRESH_MESSAGE,
    }
}
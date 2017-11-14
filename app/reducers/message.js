/**
 * Created by coder_yang on 2017/8/17.
 */
import { ADD_MESSAGE,REMOVE_MESSAGE,REFRESH_MESSAGE} from '../constants/ActionTypes';

const initialState = {
    flag: true,
    message:{},
}

export default function messages(state = initialState, action) {
    switch (action.type){
        case ADD_MESSAGE:
            return{
                flag: false,
                message:action.message
            }
        case REMOVE_MESSAGE:
            return{
                flag: true,
                message:{}
            }
        case REFRESH_MESSAGE:
            return{
                flag:false,
            }
        default:
            return state;
    }
}
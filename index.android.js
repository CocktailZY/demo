/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {AppRegistry} from 'react-native';
import { createStore} from 'redux';
import {Provider} from 'react-redux';
import reducers from './app/reducers';

import Main from './app/main';

let store = createStore(reducers);
export default class egt_rn extends Component {
  render() {
    return (
        <Provider store={ store }>
            <Main />
        </Provider>
    );
  }
}
AppRegistry.registerComponent('egt_rn', () => egt_rn);

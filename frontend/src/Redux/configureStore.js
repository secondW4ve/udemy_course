import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import logger from 'redux-logger';
import authReducer from "./authReducer";
import * as apiCalls from '../api/apiCalls';

const configureStore = (addLogged = true) =>{
    let localStorageData = localStorage.getItem('wave-auth');
    let persistedState = {
        id: 0,
        username: '',
        displayName: '',
        image: '',
        password: '',
        isLoggedIn: false,
    }
    if (localStorageData){
        try{
            persistedState = JSON.parse(localStorageData);
            apiCalls.setAuthorizationHeader(persistedState);
        } catch(error) {}
    }

    const middleware = addLogged
        ? applyMiddleware(thunk, logger)
        : applyMiddleware(thunk);
    const store = createStore(authReducer, persistedState, middleware);

    store.subscribe(() => {
        localStorage.setItem('wave-auth', JSON.stringify(store.getState()));
        apiCalls.setAuthorizationHeader(store.getState());
    });
    return store;
}

export default configureStore;
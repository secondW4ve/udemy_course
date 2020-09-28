/* eslint-disable no-use-before-define */
import React from 'react';
import { connect } from 'react-redux';

import Input from '../Components/Input';
import ButtonWithProgress from '../Components/ButtonWithProgress';
import * as authAction from '../Redux/authActions';

export class UserSignupPage extends React.Component{

    state = {
        displayName: '',
        username: '',
        password: '',
        repeatedPassword: '',
        pendingApiCall: false,
        errors: {},
        passwordRepeatConfirmed: true
    }

    onChangeDisplayName = (event) => {
        const value = event.target.value;
        const errors = { ...this.state.errors};
        delete errors.displayName;
        this.setState({displayName: value, errors})
    }

    onChangeUsername = (event) => {
        const value = event.target.value;
        const errors = {...this.state.errors};
        delete errors.username;
        this.setState({username: value, errors});
    }

    onChangePassword = (event) => {
        const value = event.target.value;
        const passwordRepeatConfirmed = this.state.repeatedPassword === value;
        const errors = {...this.state.errors};
        delete errors.password;
        errors.repeatedPassword = passwordRepeatConfirmed ? '' : 'Doesnt match to password';
        this.setState({password: value, passwordRepeatConfirmed, errors});
    }

    onChangeRepeatPassword = (event) => {
        const value = event.target.value;
        const passwordRepeatConfirmed = this.state.password === value;
        const errors = {...this.state.errors};
        errors.repeatedPassword = passwordRepeatConfirmed ? '' : 'Doesnt match to password';
        this.setState({repeatedPassword: value, passwordRepeatConfirmed, errors});
    }

    onClickSignup = () => {
        const user = {
            username: this.state.username,
            displayName: this.state.displayName,
            password: this.state.password
        }
        this.setState({pendingApiCall: true});
        this.props.actions.postSignup(user)
            .then(response => {
                this.setState({pendingApiCall: false}, () => {
                    this.props.history.push('/')
                });
            })
            .catch(apiError => {
                let errors = { ...this.state.errors};
                if (apiError.response.data && apiError.response.data.validationErrors){
                    errors = {...apiError.response.data.validationErrors};
                }
                this.setState({ pendingApiCall: false, errors });
            });
    }

    render(){
        return(
            <div className = "container">
                <h1 className = "text-center">Sign Up</h1>
                <div className = "col-12 mb-3">
                    <Input 
                        label = "Display name"
                        placeholder = "Your display name" 
                        value = {this.state.displayName}
                        onChange = {this.onChangeDisplayName}
                        hasError = {this.state.errors.displayName && true}
                        error = {this.state.errors.displayName}
                    />
                </div>
                <div className = "col-12 mb-3">
                    <Input 
                        label = "User name"
                        placeholder = "Your user name" 
                        value = {this.state.username}
                        onChange = {this.onChangeUsername}
                        hasError = {this.state.errors.username && true}
                        error = {this.state.errors.username}
                    />
                </div>
                <div className = "col-12 mb-3">
                    <Input 
                        label = "Password"
                        placeholder = "Your password"
                        type = "password"
                        value = {this.state.password}
                        onChange = {this.onChangePassword}
                        hasError = {this.state.errors.password && true}
                        error = {this.state.errors.password}
                    />
                </div>
                <div className = "col-12 mb-3">
                    <Input 
                        label = "Repeat your password"
                        placeholder = "Repeat your password"
                        type = "password"
                        value = {this.state.repeatedPassword}
                        onChange = {this.onChangeRepeatPassword}
                        hasError = {this.state.errors.repeatedPassword && true}
                        error = {this.state.errors.repeatedPassword}
                    />
                </div>
                <div className = "text-center">
                    <ButtonWithProgress
                        onClick = {this.onClickSignup}
                        disabled = {this.state.pendingApiCall || !this.state.passwordRepeatConfirmed}
                        pendingApiCall = {this.state.pendingApiCall}
                        text = 'Sign up'
                    />
                </div>
            </div>
        );
    }
}

UserSignupPage.defaultProps = {
    actions: {
        postSignup: () => 
            new Promise((resolve, reject) => {
                resolve({});
        })
    },
    history: {
        push: () => {}
    }
};

const mapDispatchToProps = (dispatch) => {
    return{
        actions: {
            postSignup: (user) => dispatch(authAction.signupHandler(user))
        }
    }
};

export default connect(
    null,
    mapDispatchToProps
)(UserSignupPage);
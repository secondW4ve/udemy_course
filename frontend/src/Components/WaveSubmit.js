import React, { Component } from 'react';
import { connect } from 'react-redux';

import ProfileImage from './ProfileImage';
import * as apiCalls from '../api/apiCalls';
import ButtonWithProgress from './ButtonWithProgress';
import Input from './Input';

class WaveSubmit extends Component {

    state = {
        focused: false,
        content: undefined,
        pendingApiCall: false,
        errors: {},
        file: undefined,
        image: undefined,
        attachment: undefined,
    }

    onFocus = () => {
        this.setState({focused: true});
    }

    onChangeContent = (event) => {
        const value = event.target.value;
        this.setState({content: value, errors: {}});
    }

    resetState = () => {
        this.setState({
            pendingApiCall: false,
            focused: false,
            content: '',
            errors: {},
            image: undefined,
            file: undefined,
        })
    }

    onClickRunWave = () => {
        const body = {
            content: this.state.content,
            attachment: this.state.attachment,
        };
        this.setState({pendingApiCall: true});
        apiCalls.postWave(body)
            .then((response) => {
                this.resetState();
            })
            .catch((error) => {
                let errors = {}
                if (error.response.data && error.response.data.validationErrors){
                    errors = error.response.data.validationErrors;
                }
                this.setState({
                    pendingApiCall: false,
                    errors,
                });
            });
    }

    onFileSelect = (event) => {
        if (event.target.files.length === 0){
            return;
        }
        const errors = {...this.state.errors};
        errors.image = undefined;
        const file = event.target.files[0];
        let reader = new FileReader();
        reader.onloadend = () => {
            this.setState({
                image: reader.result,
                file
            }, () => {
                this.uploadFile()
            })
        }
        reader.readAsDataURL(file);
    }

    uploadFile = () => {
        const body = new FormData();
        body.append('file', this.state.file);
        apiCalls.postWaveFile(body)
            .then(response => {
                //сетаю атачмент але він нал
                this.setState({attachment: response.data});
                console.log(this.state.attachment);
            });
    }

    render() {
        let textAreaClassName = "form-control w-100";
        if (this.state.errors.content){
            textAreaClassName += " is-invalid"
        }
        return (
            <div className = "card d-flex flex-row p-1">
                <ProfileImage
                    className = "rounded-circle m-1"
                    width = "32"
                    height = "32"
                    image = {this.props.loggedInUser.image}
                />
                <div className = "flex-fill">
                    <textarea 
                        className = {textAreaClassName} 
                        rows = {this.state.focused ? 3 : 1}
                        onFocus = {this.onFocus}
                        value = {this.state.content}
                        onChange = {this.onChangeContent}
                    /> 
                    {this.state.errors.content && (<span className = "invalid-feedback">{this.state.errors.content}</span>)}
                    {this.state.focused && (
                        <div>
                            <div 
                                className="pt-1"
                            >
                                <Input
                                    type = "file"
                                    onChange={this.onFileSelect}
                                />
                                {this.state.image && 
                                <img 
                                    className="mt-1 img-thumbnail" 
                                    src = {this.state.image} 
                                    alt="upload" 
                                    width="128"
                                    height="64"
                                />}    
                            </div>
                            <div className = "text-right mt-1">
                                <ButtonWithProgress 
                                    className = "btn btn-success"
                                    onClick = {this.onClickRunWave}    
                                    disabled = {this.state.pendingApiCall}
                                    pendingApiCall = {this.state.pendingApiCall}
                                    text = "Run wave"
                                >
                                </ButtonWithProgress>  
                                <button 
                                    className = "btn btn-light ml-1" 
                                    onClick = {this.resetState}
                                    disabled = {this.state.pendingApiCall}
                                >
                                    Extinguish wave
                                </button>
                            </div>  
                        </div>
                    )}
                    
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loggedInUser: state
    }
}

export default connect(mapStateToProps)(WaveSubmit);
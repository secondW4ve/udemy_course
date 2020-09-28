import React from 'react';
import { connect } from 'react-redux';

import * as apiCalls from '../api/apiCalls';
import ProfileCard from '../Components/ProfileCard';
import WaveFeed from '../Components/WaveFeed';
import Spinner from '../Components/Spinner';

class UserPage extends React.Component {
    
    state = {
        user: undefined,
        userNotFound: false,
        isLoadingUser: false,
        inEditMode: false,
        originalDisplayName: undefined,
        pendingUpdateCall: false,
        image: undefined,
        errors: {}
    }

    componentDidMount = () => {
        this.loadUser();
    }

    loadUser = () =>{
        const username = this.props.match.params.username;
        if (!username){
            return;
        }
        this.setState({userNotFound: false, isLoadingUser: true})
        apiCalls.getUser(username)
            .then((response) => {
                this.setState({user: response.data, isLoadingUser: false})
            })
            .catch(error => {
                this.setState({userNotFound: true, isLoadingUser: false})
            });
    }
    componentDidUpdate = (prevProps) => {
        if(prevProps.match.params.username !== this.props.match.params.username){
            this.loadUser();
        }
    }

    onClickEdit = () => {
        this.setState({inEditMode:true});
    }

    onClickCancel = () => {
        const user = {...this.state.user};
        if (this.state.originalDisplayName !== undefined){
            user.displayName = this.state.originalDisplayName;
        }
        this.setState({
            inEditMode: false,
            originalDisplayName: undefined,
            user,
            errors:{},
            image: undefined,
        })
    }

    onClickSave = () => {
        const userId = this.props.loggedInUser.id;
        const userUpdate = {
            displayName: this.state.user.displayName,
            image: this.state.image && this.state.image.split(',')[1]
        };
        this.setState({pendingUpdateCall: true});
        apiCalls.updateUser(userId, userUpdate)
            .then(response => {
                const user = {...this.state.user};
                user.image = response.data.image;
                this.setState({
                    inEditMode: false,
                    originalDisplayName: undefined,
                    pendingUpdateCall: false,
                    user,
                    image: undefined,
                }, () => {
                    const action = {
                        type: 'update-success',
                        payload: user
                    };
                    this.props.dispatch(action);
                });
            })
            .catch(error => {
                let errors = {};
                if (error.response.data.validationErrors){
                    errors = error.response.data.validationErrors;
                }
                this.setState({
                    pendingUpdateCall: false,
                    errors
                })
            });
    }

    onChangeDisplayName = (event) => {
        const user = {...this.state.user};
        let originalDisplayName = this.state.originalDisplayName;
        if (originalDisplayName === undefined){
            originalDisplayName = user.displayName;
        }
        const errors = {...this.state.errors};
        errors.displayName = undefined;
        user.displayName = event.target.value;
        this.setState({user, originalDisplayName, errors});
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
                errors
            })
        }
        reader.readAsDataURL(file);
    }

    render(){
        let pageContent;

        if(this.state.isLoadingUser){
            pageContent = (
                <Spinner/>
            );
        } else if (this.state.userNotFound){
            pageContent = (
                <div className = "alert alert-danger text-center">
                    <h5>User not found</h5>
                </div>
            );
        } else {
            const isEditable = this.props.loggedInUser.username === this.props.match.params.username;
            pageContent = this.state.user && 
            <ProfileCard 
                user = {this.state.user} 
                isEditable = {isEditable} 
                inEditMode ={this.state.inEditMode}
                onClickEdit = {this.onClickEdit}
                onClickCancel = {this.onClickCancel}
                onClickSave = {this.onClickSave}
                onChangeDisplayName = {this.onChangeDisplayName}
                pendingUpdateCall = {this.state.pendingUpdateCall}
                loadedImage = {this.state.image}
                onFileSelect = {this.onFileSelect}
                errors = {this.state.errors}
            />;
        }
        return(
            <div data-testid = "userpage">
                <div className = "row">
                    <div className = "col">
                        {pageContent}
                    </div>
                    <div className = "col">
                        <WaveFeed user = {this.props.match.params.username}/>
                    </div>
                </div>
            </div>
        );
    };
}

UserPage.defaultProps = {
    match: {
        params: {}
    }
};

const mapStateToProps = (state) => {
    return {
        loggedInUser: state
    }
};

export default connect(mapStateToProps)(UserPage);
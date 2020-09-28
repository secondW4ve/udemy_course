import React from 'react';

import ProfileImage from './ProfileImage';
import Input from './Input';
import ButtonWithProgress from './ButtonWithProgress';


const ProfileCard = (props) => {
    const { username, displayName, image } = props.user;

    const showEditButton = props.isEditable && !props.inEditMode;

    return (
        <div className = 'card'>
            <div className = 'card-header text-center'>
                <ProfileImage 
                    image = {image}
                    width = {"200"} 
                    height = {"200"} 
                    class = {"rounded-circle shadow"}
                    src = {props.loadedImage}
                />
            </div>
            <div className = 'card-body text-center'>
                {!props.inEditMode && (
                    <h4>
                        {`${displayName}@${username}`}
                    </h4>
                )}
                {showEditButton && (
                    <button className = "btn btn-outline-success" onClick = {props.onClickEdit}>
                        Edit
                    </button>
                )}
                {props.inEditMode && (
                    <div className = "mb-2">
                        <Input
                            value = {displayName}
                            label={`Change Display Name for ${username}`}
                            onChange = {props.onChangeDisplayName}
                            hasError = {props.errors.displayName && true}
                            error = {props.errors.displayName}
                        />
                        <div className = "mt-2">
                            <Input
                                type = "file"
                                onChange = {props.onFileSelect}
                                hasError = {props.errors.image && true}
                                error = {props.errors.image}
                            />
                        </div>
                    </div>
                )}
                {
                    props.inEditMode && (
                    <div>
                        <ButtonWithProgress
                            className = "btn btn-primary" 
                            onClick = {props.onClickSave}
                            text = {<span>Save</span>}
                            pendingApiCall = {props.pendingUpdateCall}    
                            disabled = {props.pendingUpdateCall}
                        >
                        </ButtonWithProgress>
                        <button 
                            className = "btn btn-secondary ml-1" 
                            onClick = {props.onClickCancel} 
                            disabled = {props.pendingUpdateCall}
                        >
                            Cancel
                        </button>
                    </div>

                        
                    )
                }
            </div>
        </div>
    );
};

ProfileCard.defaultProps = {
    errors: {}
}

export default ProfileCard;
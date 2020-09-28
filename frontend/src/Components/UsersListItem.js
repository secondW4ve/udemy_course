import React from 'react';
import { Link } from 'react-router-dom';

import ProfileImage from './ProfileImage';


const UsersListItem = (props) => {

    return (
        <Link 
            to = {`/${props.user.username}`}
            className = 'list-group-item list-group-item-action'
        >
            <ProfileImage 
                image = {props.user.image} 
                width = {"32"} 
                height = {"32"} 
                class = {"rounded-circle"}
            />
            <span/>
            {`${props.user.displayName}@${props.user.username}`}
        </Link>
    )
}

export default UsersListItem;
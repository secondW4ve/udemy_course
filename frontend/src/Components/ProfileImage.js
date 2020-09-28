import React from 'react';

import defaultImage from '../Assets/profile.png';


const ProfileImage = (props) => {
    let imageSource = defaultImage;
    if(props.image && props.imageSource !== defaultImage){
        imageSource = '/images/profile/' + props.image;
    }

    if (props.src)
        imageSource = props.src

    return (
        <div>
            <img 
                alt = "profile" 
                width = {props.width}
                height = {props.height} 
                src = {imageSource}
                className = {props.className}
            />
        </div>
    )
}

export default ProfileImage;
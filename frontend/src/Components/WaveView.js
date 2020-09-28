import React, { Component } from 'react';
import { format } from 'timeago.js';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import ProfileImage from './ProfileImage';

class WaveView extends Component {
    render() {
        const { wave, onClickDelete } = this.props;
        const { user, date } = wave;
        const { username, displayName, image } = user;
        const relativeDate = format(date);
        const attachmentImageVisible = wave.attachment && wave.attachment.fileType.startsWith('image');
        const ownedByLoggedInUser = user.id === this.props.loggedInUser.id;
        return (
            <div className = "card p-1">
                <div className = "d-flex">
                    <ProfileImage
                        className = "rounded-circle m-1"
                        width = "32"
                        height = "32"
                        image = {image}
                    />
                    <div className = "flex-fill m-auto pl-2">
                        <Link to = {`/${username}`} className = "list-group-item-action">
                            <h5 className = "d-inline">{displayName}@{username}</h5>
                        </Link>
                        <span className = "text-black-50"> - </span>
                        <span className = "text-black-50">{relativeDate}</span>
                        {ownedByLoggedInUser && (
                            <button 
                                className = "btn btn-outline-danger btn-sm ml-1"
                                onClick = {onClickDelete}
                            >
                                Extinguish
                            </button>
                        )}
                    </div>
                </div>
                <div className = "pl-5">
                    {wave.content}
                </div>
                {attachmentImageVisible && (
                    <div className = "pl-5">
                        <img 
                            alt = "attachment" 
                            src={`/images/attachments/${wave.attachment.name}`} 
                            className = "img-fluid"
                        />
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loggedInUser: state
    }
}

export default connect(mapStateToProps)(WaveView);
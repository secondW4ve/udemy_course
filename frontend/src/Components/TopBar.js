import React from 'react';
import logo from '../Assets/Waver-testLogo.png';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import ProfileImage from './ProfileImage';

class TopBar extends React.Component{

    state = {
        dropDownVisible: false,
    }

    componentDidMount(){
        document.addEventListener('click', this.onClickTracker);
    }

    componentWillUnmount(){
        document.removeEventListener('click', this.onClickTracker);
    }

    onClickTracker = (event) => {
        if (this.actionArea && !this.actionArea.contains(event.target)){
            this.setState({dropDownVisible: false});
        }
    }

    onClickDisplayName = () => {
        this.setState({dropDownVisible: true});
    }

    onClickLogOut = () => {
        const action = {
            type: 'logout-success',
        };
        this.setState({
            dropDownVisible: false,
        });
        this.props.dispatch(action);
    };

    assignActionArea = (area) => {
        this.actionArea = area;
    }

    onClickMyProfile = () => {
        this.setState({
            dropDownVisible: false,
        });
    }

    render(){
        let links = (
            <ul className = "nav navbar-nav ml-auto">
                <li className = "nav-item">
                    <Link to = "/login" className = "nav-link">
                        Login
                    </Link>
                </li>
                <li className = "nav-item">
                    <Link to = "/signup" className = "nav-link">
                        Sign Up
                    </Link>
                </li>
            </ul>
        );
        if (this.props.user.isLoggedIn){
            let dropDownClass = 'p-0 shadow dropdown-menu';
            if (this.state.dropDownVisible){
                dropDownClass += ' show';
            }
            links = (
                <ul className = "nav navbar-nav ml-auto" ref = {this.assignActionArea}>
                    <li className = "nav-item dropdown">
                        <div   
                            className = "d-flex" 
                            style = {{cursor: "poiner"}}
                            onClick = {this.onClickDisplayName}
                        >
                            <ul className = "nav navbar-nav ml auto">
                                <li className = "nav-item">
                                <ProfileImage 
                                    image = {this.props.user.image}
                                    className = "rounded-circle m-auto"
                                    width = "32"
                                    height = "32"    
                                />
                                </li>
                                <li className = "nav-item nav-link"
                                    style = {{cursor: 'pointer'}}
                                >
                                    <span className = "dropdown-toggle">
                                        {this.props.user.displayName}
                                    </span>
                                </li>
                            </ul>
                        </div>
                        <div 
                            className = {dropDownClass}
                            data-testid = "drop-down-menu"
                        >
                                <Link 
                                    to = {`/${this.props.user.username}`} 
                                    className = "dropdown-item"
                                    onClick = {this.onClickMyProfile}
                                >
                                    My Profile
                                </Link>
                                <span className = "dropdown-item"
                                    onClick = {this.onClickLogOut}
                                    style = {{cursor: 'pointer'}}
                                >
                                    Logout
                                </span>
                        </div>
                    </li>
                </ul>
            )
        }
        return(
            <div className = "bg-white shadow-sm mb-2">
                <div className = "container">
                    <nav className = "navbar navbar-light navbar-expand-lg">
                        <Link to = "/" className = "navbar-brand">
                            <img src = {logo} width = "60" alt = "Waver"/> Waver
                        </Link>
                        {links}
                    </nav>
                </div>
            </div>
        );
    };
}

const mapStateToProps = (state) => {
    return {
        user: state,
    }
};

export default connect(mapStateToProps)(TopBar);
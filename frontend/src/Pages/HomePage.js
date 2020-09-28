import React from 'react';
import { connect } from 'react-redux';

import UsersList from '../Components/UsersList';
import WaveSubmit from '../Components/WaveSubmit';
import WaveFeed from '../Components/WaveFeed';

class HomePage extends React.Component {
    
    render(){
        return(
            <div data-testid = "homepage">
                <div className = "row">
                    <div className = "col-8">
                        {this.props.loggedInUser.isLoggedIn && <WaveSubmit/>}
                        <WaveFeed></WaveFeed>
                    </div>
                    <div className = "col-4">
                        <UsersList></UsersList>
                    </div>
                </div>
            </div>
        );
    };
}

const mapStateToProps = (state) => {
    return {
        loggedInUser: state
    };
};

export default connect(mapStateToProps)(HomePage);
import React from 'react';

import * as apiCalls from '../api/apiCalls';
import UsersListItem from './UsersListItem';


class UsersList extends React.Component {

    state = {
        page: {
            content: [],
            number: 0,
            size: 3,
        },
        errorMessage: '',
    }

    componentDidMount(){
        this.loadData();
    }

    loadData = (requestedPage = 0) => {
        apiCalls.listUsers({
            page: requestedPage,
            size: this.state.page.size,
        })
        .then((response) => {
            this.setState({
                page: response.data,
            });
        })
        .catch((error) => {
        })
    }

    onClickNext = () => {
        this.loadData(this.state.page.number + 1);
    }

    onClickPrevious = () => {
        this.loadData(this.state.page.number - 1);
    }

    render(){
        return (
            <div className = 'card'>
                <h3 className = 'card-title m-auto'>Users</h3>
                <div className = 'list-group list-group-flush' data-testid = 'usersGroup'>
                    {this.state.page.content.map((user) => {
                        return (
                            <UsersListItem key = {user.username} user = {user}/>
                        )
                    })}
                </div>
                <div className = "clearfix">
                    {!this.state.page.first && (<span 
                            className = "badge badge-light float-left"
                            onClick = {this.onClickPrevious}    
                            style = {{cursor: 'pointer'}}
                        >
                            {`< previous`}
                        </span>)
                    }
                    {!this.state.page.last && (<span 
                            className = "badge badge-light float-right"
                            onClick = {this.onClickNext}    
                            style = {{cursor: 'pointer'}}
                        >
                            next >
                        </span>)
                    }
                </div>
            </div>
        )
    }
}

export default UsersList;
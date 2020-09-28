import React from 'react';
import  { render, fireEvent, waitForElement } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import axios from 'axios';

import App from '../App';
import configureStore from '../../Redux/configureStore';
import * as apiCalls from '../../api/apiCalls';


apiCalls.listUsers = jest.fn().mockResolvedValue({
    data: {
        content: [],
        number: 0,
        size: 3,
    }
});

apiCalls.getUser = jest.fn().mockResolvedValue({
    data:{
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png',
    }
})


apiCalls.loadWaves = jest.fn().mockResolvedValue({
    data: {
        content: [],
        number: 0,
        size: 3,
    }
});

const mockSuccessGetUser1 = {
    data:{
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png',
    }
}

const mockSuccessGetUser2 = {
    data:{
        id: 2,
        username: 'user2',
        displayName: 'display2',
        image: 'profile2.png',
    }
}

const mockFailGetUser = {
    response:{
        data:{
            message: "User not found"
        }
    }
}

beforeEach(() => {
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
})

const setUserOneLoggedInStorage = () => {
    localStorage.setItem('wave-auth', JSON.stringify({
        id: 1,
        username: 'user1',
        displayName: 'display1',
        password: 'P4ssword',
        image: 'profile1.png',
        isLoggedIn: true
    }));
}

const setup = (path) => {
    const store = configureStore(false);
    return render(
        <Provider store = {store}>
            <MemoryRouter initialEntries = {[path]}>
                <App/>
            </MemoryRouter>
        </Provider>
    );
};

const changeEvent = (content) => {
    return {
        target: {
            value: content
        }
    };
};

describe('App', () => {

    
    it('displays HomePage when url is /', () => {
        const { queryByTestId } = setup('/');

        expect(queryByTestId('homepage')).toBeInTheDocument();
    });

    it('displays LoginPage when url is /login', () => {
        const { container } = setup('/login');

        const header = container.querySelector('h1');

        expect(header).toHaveTextContent('Login');
    });

    it('displays only LoginPage when url is /login', () => {
        const { queryByTestId } = setup('/login');

        expect(queryByTestId('homepage')).not.toBeInTheDocument();
    });

    it('displays UserSignupPage when url is /signup', () => {
        const { container } = setup('/signup');

        const header = container.querySelector('h1');

        expect(header).toHaveTextContent('Sign Up');
    });

    it('displays userpage when url is other than /, /login, /signup', () => {
        const { queryByTestId } = setup('/user1');

        expect(queryByTestId('userpage')).toBeInTheDocument();
    });

    it('displays TopBar when url is /', () => {
        const { container } = setup('/');

        const navigation = container.querySelector('nav');

        expect(navigation).toBeInTheDocument();
    });

    it('displays TopBar when url is /signup', () => {
        const { container } = setup('/signup');

        const navigation = container.querySelector('nav');

        expect(navigation).toBeInTheDocument();
    });

    it('displays TopBar when url is /login', () => {
        const { container } = setup('/login');

        const navigation = container.querySelector('nav');

        expect(navigation).toBeInTheDocument();
    });

    it('displays TopBar when url is /user1', () => {
        const { container } = setup('/user1');

        const navigation = container.querySelector('nav');

        expect(navigation).toBeInTheDocument();
    });

    it('shows the UserSignupPage when clicking Sign Up',() => {
        const { queryByText, container } = setup('/');

        const signupLink = queryByText('Sign Up');
        fireEvent.click(signupLink);
        const header = container.querySelector('h1');

        expect(header).toHaveTextContent('Sign Up');
    });

    it('shows the LoginPage when clicking Login',() => {
        const { queryByText, container } = setup('/');

        const loginLink = queryByText('Login');
        fireEvent.click(loginLink);
        const header = container.querySelector('h1');

        expect(header).toHaveTextContent('Login');
    });

    it('shows the HomePage when clicking logo',() => {
        const { queryByTestId, container } = setup('/login');

        const logo = container.querySelector('img');
        fireEvent.click(logo);
        
        expect(queryByTestId('homepage')).toBeInTheDocument();
    });

    it('displays My profile on TopBar after successful login', async () => {
        const { queryByPlaceholderText, container, queryByText} = setup('/login');

        const usernameInput = queryByPlaceholderText('Your username');
        fireEvent.change(usernameInput, changeEvent('user1'));
        const passwordInput = queryByPlaceholderText('Your password');
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValue({
            data:{
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile.png',
            }
        });
        fireEvent.click(button)
        const myProfileLink = await waitForElement(() => queryByText('My Profile'));

        expect(myProfileLink).toBeInTheDocument();
    });

    it('displays My Profile on TopBar after sign up success', async () => {
        const { queryByPlaceholderText, container, queryByText} = setup('/signup');

        const displayNameInput = queryByPlaceholderText('Your display name');
        const usernameInput = queryByPlaceholderText('Your user name');
        const passwordInput = queryByPlaceholderText('Your password');
        const repeatedPasswordInput = queryByPlaceholderText('Repeat your password');
        fireEvent.change(displayNameInput, changeEvent('display1'));
        fireEvent.change(usernameInput, changeEvent('user1'));
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        fireEvent.change(repeatedPasswordInput, changeEvent('P4ssword'));
        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValue({
            data:{
                message: 'User saved'
            }
        }).mockResolvedValue({
            data:{
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile.png',
            }
        });
        fireEvent.click(button)
        const myProfileLink = await waitForElement(() => queryByText('My Profile'));

        expect(myProfileLink).toBeInTheDocument();
    });

    it('saves logged in user data to localStorage after successful login', async () => {
        const { queryByPlaceholderText, container, queryByText} = setup('/login');

        const usernameInput = queryByPlaceholderText('Your username');
        fireEvent.change(usernameInput, changeEvent('user1'));
        const passwordInput = queryByPlaceholderText('Your password');
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValue({
            data:{
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile.png',
            }
        });
        fireEvent.click(button)
        await waitForElement(() => queryByText('My Profile'));
        const dataInStorage = JSON.parse(localStorage.getItem('wave-auth'));

        expect(dataInStorage).toEqual({
            id: 1,
            username: 'user1',
            displayName: 'display1',
            password: 'P4ssword',
            image: 'profile.png',
            isLoggedIn: true
        });
    });

    it('displays logged in TopBar when localStorage has logged in user data', () => {
        setUserOneLoggedInStorage();

        const { queryByText } = setup('/');
        const myProfileLink = queryByText('My Profile');
        
        expect(myProfileLink).toBeInTheDocument();
    });

    it('sets axios authorization with base64 encoded user credentials after successful login', async () => {
        const { queryByPlaceholderText, container, queryByText} = setup('/login');

        const usernameInput = queryByPlaceholderText('Your username');
        fireEvent.change(usernameInput, changeEvent('user1'));
        const passwordInput = queryByPlaceholderText('Your password');
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValue({
            data:{
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile.png',
            }
        });
        fireEvent.click(button)
        await waitForElement(() => queryByText('My Profile'));
        const axiosAuthorization = axios.defaults.headers.common['Authorization'];
        const encoded = btoa('user1:P4ssword');
        const expectedAuthorization = `Basic ${encoded}`;

        expect(axiosAuthorization).toBe(expectedAuthorization);  
    });

    it('sets axios authorization with base64 encoded user credentials when localStorage has logged in user data', () => {
        setUserOneLoggedInStorage();

        setup('/');
        const axiosAuthorization = axios.defaults.headers.common['Authorization'];
        const encoded = btoa('user1:P4ssword');
        const expectedAuthorization = `Basic ${encoded}`;
        
        expect(axiosAuthorization).toBe(expectedAuthorization); 
    });

    it('removes axios authorization header when user logout', () => {
        setUserOneLoggedInStorage();

        const { queryByText } = setup('/');
        fireEvent.click(queryByText('Logout'));
        const axiosAuthorization = axios.defaults.headers.common['Authorization'];
        
        expect(axiosAuthorization).toBeFalsy();
    });

    it('update UserPage after clicking my profile when another UserPage was open', async () => {
        apiCalls.getUser = jest.fn()
            .mockResolvedValueOnce(mockSuccessGetUser2)
            .mockResolvedValueOnce(mockSuccessGetUser1);
        setUserOneLoggedInStorage();
        const { queryByText } = setup('/user2');
        
        await waitForElement(() => queryByText('display2@user2'));
        const myProfileLink = queryByText('My Profile');
        fireEvent.click(myProfileLink);
        const user1Info = await waitForElement(() => queryByText('display1@user1'));

        expect(user1Info).toBeInTheDocument();
    });

    it('update UserPage after clicking my profile when another non existing UserPage was open', async () => {
        apiCalls.getUser = jest.fn()
            .mockRejectedValueOnce(mockFailGetUser)
            .mockResolvedValueOnce(mockSuccessGetUser1);
        setUserOneLoggedInStorage();
        const { queryByText } = setup('/user50');
        
        await waitForElement(() => queryByText('User not found'));
        const myProfileLink = queryByText('My Profile');
        fireEvent.click(myProfileLink);
        const user1Info = await waitForElement(() => queryByText('display1@user1'));

        expect(user1Info).toBeInTheDocument();
    });
});

console.error = () => {};
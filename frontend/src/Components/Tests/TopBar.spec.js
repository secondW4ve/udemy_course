import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import authReducer from '../../Redux/authReducer';
import TopBar from '../TopBar';
import * as authActions from '../../Redux/authActions';

const loggedInState = {
    id: 0,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png',
    password: 'P4ssword',
    isLoggedIn: true,
};

const defaultState = {
    id: 0,
    username: '',
    displayName: '',
    image: '',
    password: '',
    isLoggedIn: false,
};

let store;

const setup = (state = defaultState) => {
    store = createStore(authReducer, state);
    return render(
        <Provider store = {store}>
            <MemoryRouter>
                <TopBar></TopBar>
            </MemoryRouter>
        </Provider>
    )
};

describe('TopBar', () => {

    describe('Layout', () => {

        it('has app logo', () => {
            const { container } = setup();

            const img = container.querySelector('img');

            expect(img.src).toContain('Waver-testLogo.png');
        });

        it('logo has link to home', () => {
            const { container } = setup();

            const img = container.querySelector('img');

            expect(img.parentElement.getAttribute('href')).toBe('/');
        });

        it('has link to signup', () => {
            const { queryByText } = setup();

            const signUpLink = queryByText('Sign Up');

            expect(signUpLink.getAttribute('href')).toBe('/signup');
        });

        it('has link to login', () => {
            const { queryByText } = setup();

            const signUpLink = queryByText('Login');

            expect(signUpLink.getAttribute('href')).toBe('/login');
        });

        it('has link to logout when user logged in', () => {
            const { queryByText } = setup(loggedInState);

            const logOutLink = queryByText('Logout');

            expect(logOutLink).toBeInTheDocument();
        });

        it('has link to user profile when user logged in', () => {
            const { queryByText } = setup(loggedInState);

            const profileLink = queryByText('My Profile');

            expect(profileLink.getAttribute('href')).toBe('/user1');
        });

        it('displays the displayName when user loggedIn', () => {
            const { queryByText } = setup(loggedInState);

            const displayName = queryByText('display1');

            expect(displayName).toBeInTheDocument();
        });

        it('displays user image when user loggedIn', () => {
            const { container } = setup(loggedInState);

            const images = container.querySelectorAll('img');
            const userImage = images[1];

            expect(userImage.src).toContain("/images/profile/" + loggedInState.image);
        });
    });

    describe('Interactions', () => {

        it('displays the Login and Sign Up links when user clicks Logout', () => {
            const { queryByText } = setup(loggedInState);

            const logOutLink = queryByText('Logout');
            fireEvent.click(logOutLink);
            const loginLink = queryByText('Login');

            expect(loginLink).toBeInTheDocument();
        });

        it('add show class to dropdown menu when clicking displayName', () => {
            const { queryByText, queryByTestId } = setup(loggedInState);

            const displayName = queryByText('display1');
            fireEvent.click(displayName);
            const dropdownMenu = queryByTestId("drop-down-menu");
            expect(dropdownMenu).toHaveClass('show');
        });

        it('removes show class to dropdown menu when clicking app logo', () => {
            const { queryByText, queryByTestId, container } = setup(loggedInState);

            const displayName = queryByText('display1');
            fireEvent.click(displayName);

            const logo = container.querySelector('img');
            fireEvent.click(logo);

            const dropdownMenu = queryByTestId("drop-down-menu");
            expect(dropdownMenu).not.toHaveClass('show');
        });

        it('removes show class to dropdown menu when clicking logout', () => {
            const { queryByText, queryByTestId } = setup(loggedInState);

            const displayName = queryByText('display1');
            fireEvent.click(displayName);

            fireEvent.click(queryByText('Logout'));
            store.dispatch(authActions.loginSuccess(loggedInState));

            const dropdownMenu = queryByTestId("drop-down-menu");
            expect(dropdownMenu).not.toHaveClass('show');
        });

        it('removes show class to dropdown menu when clicking My Profile', () => {
            const { queryByText, queryByTestId } = setup(loggedInState);

            const displayName = queryByText('display1');
            fireEvent.click(displayName);

            fireEvent.click(queryByText('My Profile'));

            const dropdownMenu = queryByTestId("drop-down-menu");
            expect(dropdownMenu).not.toHaveClass('show');
        });
    });
});
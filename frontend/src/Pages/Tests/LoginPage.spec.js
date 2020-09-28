import React from 'react';
import {render, fireEvent, waitForElement, waitForDomChange} from '@testing-library/react';

import { LoginPage } from "../LoginPage";
import { } from '../../Redux/authActions';

describe ('LoginPage', () => {

    describe('Layout', () => {
        
        it ('has header of Login', () => {
            const { container } = render(<LoginPage />);

            const header = container.querySelector('h1');

            expect(header).toHaveTextContent('Login');
        });

        it ('has input field for username', () => {
            const { queryByPlaceholderText } = render(<LoginPage />);

            const usernameInput = queryByPlaceholderText('Your username');

            expect(usernameInput).toBeInTheDocument();
        });

        it ('has input field for password', () => {
            const { queryByPlaceholderText } = render(<LoginPage />);

            const passwordInput = queryByPlaceholderText('Your password');

            expect(passwordInput).toBeInTheDocument();
        });

        it ('has password type for password input', () => {
            const { queryByPlaceholderText } = render(<LoginPage />);

            const passwordInput = queryByPlaceholderText('Your password');

            expect(passwordInput.type).toBe('password');
        });

        it ('has Login button', () => {
            const { container } = render(<LoginPage />);

            const button = container.querySelector('button');

            expect(button).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {

        const changeEvent = (content) => {
            return {
                target: {
                    value: content
                }
            };
        };

        const mockAsyncDelayed = () => {
            return jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                    resolve()
                })
            })
        }

        let usernameInput, passwordInput, button;

        const setupForSubmit = (props) => {
            const rendered = render(<LoginPage {...props}/>);
            const { container, queryByPlaceholderText } = rendered;
            usernameInput = queryByPlaceholderText('Your username');
            fireEvent.change(usernameInput, changeEvent('my-user-name'));
            passwordInput = queryByPlaceholderText('Your password');
            fireEvent.change(passwordInput, changeEvent('P4ssword'));
            button = container.querySelector('button');
            fireEvent.click(button);
            return rendered;
        }

        it('sets the username into valid state', () => {
            const { queryByPlaceholderText } = render(<LoginPage />);

            const usernameInput = queryByPlaceholderText('Your username');
            fireEvent.change(usernameInput, changeEvent('my-user-name'));

            expect(usernameInput).toHaveValue('my-user-name');
        });

        it('sets the password into valid state', () => {
            const { queryByPlaceholderText } = render(<LoginPage />);

            const passwordInput = queryByPlaceholderText('Your password');
            fireEvent.change(passwordInput, changeEvent('P4ssword'));

            expect(passwordInput).toHaveValue('P4ssword');
        });

        it('calls postLogin when the actions are provided in props and input fields have value', () => {
            const actions = {
                postLogin: jest.fn().mockResolvedValue({})
            }

            setupForSubmit({actions});

            expect(actions.postLogin).toHaveBeenCalledTimes(1);
        });

        it('doesnt throw exception when clicking the button action dont provided in props', () => {
            setupForSubmit();

            expect(() => fireEvent.click(button)).not.toThrow();
        });

        it('calls postLogin with credentials in body', () => {
            const actions = {
                postLogin: jest.fn().mockResolvedValue({})
            }

            setupForSubmit({actions});
            const expectedUserObject = {
                username: 'my-user-name',
                password: 'P4ssword'
            };

            expect(actions.postLogin).toHaveBeenCalledWith(expectedUserObject);
        });

        /*it('enables the button when username and password fields is not empty', () => {
            setupForSubmit();

            expect(button).not.toBeDisabled();
        });*/

        it('disables the button when username field is empty', () => {
            setupForSubmit();

            fireEvent.change(usernameInput, changeEvent(''));

            expect(button).toBeDisabled();
        });

        it('disables the button when password field is empty', () => {
            setupForSubmit();

            fireEvent.change(passwordInput, changeEvent(''));

            expect(button).toBeDisabled();
        });

        it('displays alert when login fails', async () => {
            const actions = {
                postLogin: jest.fn().mockRejectedValue({
                    response:{
                        data: {
                            message: 'Login failed'
                        }
                    }
                })
            };

            const { queryByText } = setupForSubmit({actions});
            fireEvent.click(button);
            const alert = await waitForElement(() => queryByText('Login failed'));

            expect(alert).toBeInTheDocument(); 
        });

        it('clears alert when user changes login field', async () => {
            const actions = {
                postLogin: jest.fn().mockRejectedValue({
                    response:{
                        data: {
                            message: 'Login failed'
                        }
                    }
                })
            };

            const { queryByText } = setupForSubmit({actions});
            fireEvent.click(button);
            await waitForElement(() => queryByText('Login failed'));
            fireEvent.change(usernameInput, changeEvent('updated-username'));
            const alert = queryByText('Login failed');

            expect(alert).not.toBeInTheDocument(); 
        });

        it('displays alert when password fails', async () => {
            const actions = {
                postLogin: jest.fn().mockRejectedValue({
                    response:{
                        data: {
                            message: 'Password failed'
                        }
                    }
                })
            };

            const { queryByText } = setupForSubmit({actions});
            fireEvent.click(button);
            const alert = await waitForElement(() => queryByText('Password failed'));

            expect(alert).toBeInTheDocument(); 
        });

        it('clears alert when user changes login field', async () => {
            const actions = {
                postLogin: jest.fn().mockRejectedValue({
                    response:{
                        data: {
                            message: 'Password failed'
                        }
                    }
                })
            };

            const { queryByText } = setupForSubmit({actions});
            fireEvent.click(button);
            await waitForElement(() => queryByText('Password failed'));
            fireEvent.change(passwordInput, changeEvent('updated-password'));
            const alert = queryByText('Password failed');

            expect(alert).not.toBeInTheDocument(); 
        });

        it ('doesnt allow user to click on Login button while api call is ongoing',() => {
            const actions = {
                postLogin: mockAsyncDelayed()
            };

            setupForSubmit( {actions} );
            fireEvent.click(button);
            fireEvent.click(button);

            expect(actions.postLogin).toHaveBeenCalledTimes(1);
        });

        it ('displays spinner when there is an api call ongoing',() => {
            const actions = {
                postLogin: mockAsyncDelayed()
            };

            const { queryByText } = setupForSubmit( {actions} );
            fireEvent.click(button);
            const spinner = queryByText('Loading...');

            expect(spinner).toBeInTheDocument();
        });

        it ('hide spinner after api call have been finished', async () => {
            const actions = {
                postLogin: mockAsyncDelayed()
            };

            const {queryByText} = setupForSubmit( {actions} );
            fireEvent.click(button);
            await waitForDomChange();
            const spinner = queryByText('Loading...');

            expect(spinner).not.toBeInTheDocument();
        });

        it ('hide spinner after api call have been finished with error', async () => {
            const actions = {
                postLogin: jest.fn().mockImplementation(() => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            reject({
                                response: {
                                    data: {
                                        
                                    }
                                }
                            });
                        }, 300);
                        resolve()
                    });
                })
            };

            const {queryByText} = setupForSubmit( {actions} );
            fireEvent.click(button);
            await waitForDomChange();
            const spinner = queryByText('Loading...');
            
            expect(spinner).not.toBeInTheDocument();
        });

        it ('redirects to HomePage after successful login', async () => {
            const actions = {
                postLogin: jest.fn().mockResolvedValue({}),
            };
            const history = {
                push: jest.fn(),
            };

            setupForSubmit( {actions, history} );
            fireEvent.click(button);
            await waitForDomChange();
            
            expect(history.push).toHaveBeenCalledWith('/');
        });

    });
});

console.error = () => {};
import React from 'react';
import {render, fireEvent, waitForDomChange, waitForElement } from '@testing-library/react';
import { UserSignupPage } from '../UserSignupPage';

describe('UserSignupPage', () => {
    describe ('Layout', () => {
        it('has header of Sign Up', () => {
            const { container } = render (<UserSignupPage/>);

            const header = container.querySelector('h1');

            expect(header).toHaveTextContent('Sign Up');
        });

        it('has input for display name', () => {
            const { queryByPlaceholderText } = render (<UserSignupPage/>);

            const displayNameInput = queryByPlaceholderText('Your display name');

            expect(displayNameInput).toBeInTheDocument();
        });

        it('has input for user name', () => {
            const { queryByPlaceholderText } = render (<UserSignupPage/>);

            const usernameInput = queryByPlaceholderText('Your user name');

            expect(usernameInput).toBeInTheDocument();
        });

        it('has input for password', () => {
            const { queryByPlaceholderText } = render (<UserSignupPage/>);

            const passwordInput = queryByPlaceholderText('Your password');

            expect(passwordInput).toBeInTheDocument();
        });

        it('has password type for password input', () => {
            const { queryByPlaceholderText } = render (<UserSignupPage/>);

            const passwordInput = queryByPlaceholderText('Your password');

            expect(passwordInput.type).toBe('password');
        });

        it('has password repeat input', () => {
            const { queryByPlaceholderText } = render (<UserSignupPage/>);

            const passwordRepeatInput = queryByPlaceholderText('Your password');

            expect(passwordRepeatInput.type).toBe('password');
        });

        it('has password type for repeat password input', () => {
            const { queryByPlaceholderText } = render (<UserSignupPage/>);

            const passwordRepeatInput = queryByPlaceholderText('Your password');

            expect(passwordRepeatInput.type).toBe('password');
        });

        it('has submit button', () => {
            const { container } = render (<UserSignupPage/>);

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
            }
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

        let button, displayNameInput, usernameInput, passwordInput, repeatedPasswordInput;

        const setupForSubmit = (props) => {
            const rendered = render(<UserSignupPage {...props}/>)
            const { container, queryByPlaceholderText } = rendered;
            displayNameInput = queryByPlaceholderText('Your display name');
            usernameInput = queryByPlaceholderText('Your user name');
            passwordInput = queryByPlaceholderText('Your password');
            repeatedPasswordInput = queryByPlaceholderText('Repeat your password');

            fireEvent.change(displayNameInput, changeEvent('my-display-name'));
            fireEvent.change(usernameInput, changeEvent('my-user-name'));
            fireEvent.change(passwordInput, changeEvent('P4ssword'));
            fireEvent.change(repeatedPasswordInput, changeEvent('P4ssword'));

            button = container.querySelector('button');
            return rendered;
        }

        it ('sets the displayName value into state', () => {
            const { queryByPlaceholderText } = render (<UserSignupPage/>);

            const displayNameInput = queryByPlaceholderText('Your display name');
            fireEvent.change(displayNameInput, changeEvent('my-display-name'));

            expect(displayNameInput).toHaveValue('my-display-name');
        });

        it ('sets the username value into state', () => {
            const { queryByPlaceholderText } = render (<UserSignupPage/>);

            const usernameInput = queryByPlaceholderText('Your user name');
            fireEvent.change(usernameInput, changeEvent('my-user-name'));

            expect(usernameInput).toHaveValue('my-user-name');
        });

        it ('sets the password value into state', () => {
            const { queryByPlaceholderText } = render (<UserSignupPage/>);

            const passwordInput = queryByPlaceholderText('Your password');
            fireEvent.change(passwordInput, changeEvent('P4ssword'));

            expect(passwordInput).toHaveValue('P4ssword');
        });

        it ('sets the repeat password value into state', () => {
            const { queryByPlaceholderText } = render (<UserSignupPage/>);

            const repeatPasswordInput = queryByPlaceholderText('Repeat your password');
            fireEvent.change(repeatPasswordInput, changeEvent('P4ssword'));

            expect(repeatPasswordInput).toHaveValue('P4ssword');
        });

        it ('calls postSignup when the fields are valid and the actions are provided in props',() => {
            const actions = {
                postSignup: jest.fn().mockResolvedValueOnce({})
            };

            setupForSubmit( {actions} );
            fireEvent.click(button);

            expect(actions.postSignup).toHaveBeenCalledTimes(1);
        });

        it ('doesnt throw exception when clicking the button when actions not provided in props',() => {
            setupForSubmit();

            expect(() => fireEvent.click(button)).not.toThrow();
        });

        it ('calls post with user body when the fields are valid',() => {
            const actions = {
                postSignup: jest.fn().mockResolvedValueOnce({})
            };

            setupForSubmit( {actions} );
            fireEvent.click(button);
            const expectedUserObject = {
                username: 'my-user-name',
                displayName: 'my-display-name',
                password: 'P4ssword'
            };

            expect(actions.postSignup).toHaveBeenCalledWith(expectedUserObject);
        });

        it ('doesnt allow to click user on Sign Up button while api call is ongoing',() => {
            const actions = {
                postSignup: mockAsyncDelayed()
            };

            setupForSubmit( {actions} );
            fireEvent.click(button);
            fireEvent.click(button);

            expect(actions.postSignup).toHaveBeenCalledTimes(1);
        });

        it ('showing spinner when apicall ongoing',() => {
            const actions = {
                postSignup: mockAsyncDelayed()
            };

            const {queryByText} = setupForSubmit( {actions} );
            fireEvent.click(button);
            const spinner = queryByText('Loading...');

            expect(spinner).toBeInTheDocument();
        });

        it ('hide spinner after api call have been finished', async () => {
            const actions = {
                postSignup: mockAsyncDelayed()
            };

            const {queryByText} = setupForSubmit( {actions} );
            fireEvent.click(button);
            await waitForDomChange();
            const spinner = queryByText('Loading...');

            expect(spinner).not.toBeInTheDocument();
        });

        it ('hide spinner after api call have been finished with error', async () => {
            const actions = {
                postSignup: jest.fn().mockImplementation(() => {
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

        it ('enables Sign Up button when password and repeatedPassword have the same value', () => {
            setupForSubmit();

            expect(button).not.toBeDisabled();
        });

        it ('disables Sign Up button when password repeat doesnt match to password', () => {
            setupForSubmit();

            fireEvent.change(repeatedPasswordInput, changeEvent('new-value'));

            expect(button).toBeDisabled();
        });

        it ('disables Sign Up button when password doesnt match to password repeat', () => {
            setupForSubmit();

            fireEvent.change(passwordInput, changeEvent('new-value'));

            expect(button).toBeDisabled();
        });

        it ('displays error style for password repeat when password repeat mismatch', () => {
            
            const { queryByText } = setupForSubmit();
            fireEvent.change(repeatedPasswordInput, changeEvent('new-value'));
            const mismatchWarning = queryByText('Doesnt match to password');

            expect(mismatchWarning).toBeInTheDocument();
        });

        it ('displays error style for password when password mismatch', () => {
            
            const { queryByText } = setupForSubmit();
            fireEvent.change(passwordInput, changeEvent('new-value'));
            const mismatchWarning = queryByText('Doesnt match to password');

            expect(mismatchWarning).toBeInTheDocument();
        });

        it ('display validation error for displayName when error is received from the field', async () => {
            const actions = {
                postSignup: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            validationErrors: {
                                displayName: 'Can not be null'
                            }
                        }
                    }
                })
            };

            const { queryByText } = setupForSubmit({actions});
            fireEvent.click(button);
            const errorMessage = await waitForElement(() => queryByText('Can not be null'));

            expect(errorMessage).toBeInTheDocument();
        });

        it ('hides the validation error when user changes the content of displayName', async () => {
            const actions = {
                postSignup: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            validationErrors: {
                                displayName: 'Can not be null'
                            }
                        }
                    }
                })
            }

            const { queryByText, container } = setupForSubmit({actions});
            fireEvent.click(button);
            await waitForElement(() => queryByText('Can not be null'), { container });
            fireEvent.change(displayNameInput, changeEvent('display name updated'));
            const errorMessage = queryByText('Can not be null');

            expect(errorMessage).not.toBeInTheDocument();
        });

        it ('hides the validation error when user change the content of usernameInput', async () => {
            const actions = {
                postSignup: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            validationErrors: {
                                username: 'Username can not be null'
                            }
                        }
                    }
                })
            };

            const { queryByText, container } = setupForSubmit({actions});
            fireEvent.click(button);
            await waitForElement(() => 
                queryByText('Username can not be null'), { container }
            );
            fireEvent.change(usernameInput, changeEvent('username updated'));
            const errorMessage = queryByText('Username can not be null');

            expect(errorMessage).not.toBeInTheDocument();
        });

        it ('hides the validation error when user change the content of password', async () => {
            const actions = {
                postSignup: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            validationErrors: {
                                password: 'Password can not be null'
                            }
                        }
                    }
                })
            };

            const { queryByText, container } = setupForSubmit({actions});
            fireEvent.click(button);
            await waitForElement(() => 
                queryByText('Password can not be null'), { container }
            );
            fireEvent.change(passwordInput, changeEvent('password updated'));
            const errorMessage = queryByText('Password can not be null');
            
            expect(errorMessage).not.toBeInTheDocument();
        });
        
        it ('redirects to HomePage after successful signup', async () => {
            const actions = {
                postSignup: jest.fn().mockResolvedValue({}),
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
})
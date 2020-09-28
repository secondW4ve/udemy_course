import React from 'react';
import axios from 'axios';
import { render, waitForElement, fireEvent, waitForDomChange } from '@testing-library/react';
import { Provider } from 'react-redux';

import configureStore from '../../Redux/configureStore';
import UserPage from '../UserPage';
import * as apiCalls from '../../api/apiCalls';


apiCalls.loadWaves = jest.fn().mockResolvedValue({
    data: {
        content: [],
        number: 0,
        size: 3,
    }
});

const mockSuccessGetUser = {
    data: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png',

    }
}

const mockSuccessUpdateUser = {
    data: {
        id: 1,
        username: 'user1',
        displayName: 'display1-update',
        image: 'profile1-update.png',

    }
}

const mockFailGetUser = {
    response: {
        data: {
            message: 'User not found'
        }
    }
}

const mockFailUpdateUser = {
    response:{
        data: {
            validationErrors:{
                displayName: 'It must have minimum 4 and maximum 255 characters',
                image: 'Only PNG and JPG files are allowed',
            }
        }
    }
}

const match = {
    params:{
        username: 'user1',
    }
};

let store;

const setup = (props) => {
    store = configureStore(false);
    return render(
        <Provider store = {store}>
            <UserPage {...props} />
        </Provider>
    );
}

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

beforeEach(() => {
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
})

describe('UserPage', () => {

    describe('Layout', () => {

        it('has root page div', () => {
            const { queryByTestId } = setup();

            const userPageDiv = queryByTestId('userpage');
            
            expect(userPageDiv).toBeInTheDocument();
        });

        it('displays the displayName@username when user data loaded', async () => {
            apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
            const { queryByText } = setup({match});
            
            const text = await waitForElement(() => queryByText('display1@user1'));
            
            expect(text).toBeInTheDocument();
        });

        it('displays not found alert when user not found', async () => {
            apiCalls.getUser = jest.fn().mockRejectedValue(mockFailGetUser);
            const { queryByText } = setup({match});
            
            const alert = await waitForElement(() => queryByText('User not found'));
            
            expect(alert).toBeInTheDocument();
        });

        it('displays spinner while loading user data', () => {
            const mockDelayedResponse = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetUser)
                    }, 300);
                })
            });
            apiCalls.getUser = mockDelayedResponse;
            const { queryAllByText } = setup({match});
            
            const spinners = queryAllByText('Loading...');
            
            expect(spinners.length).not.toBe(0);
        });

        it('displays the Edit button when loggedInUser matches the user in URL', async () => {
            setUserOneLoggedInStorage();
            apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
            const { queryByText } = setup({match});
            
            await waitForElement(() => queryByText('display1@user1'));
            const editButton = queryByText('Edit');

            expect(editButton).toBeInTheDocument();
        });
    });

    describe('Lifecycle', () => {
        it('calls getUser when page is rendered', () => {
            apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
            setup({match});

            axios.get('user1');

            expect(apiCalls.getUser).toHaveBeenCalledWith('user1');
        });

        it('calls getUser for user1 when its is rendered with user1 in match', () => {
            apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
            setup({match});

            axios.get('user1');

            expect(apiCalls.getUser).toHaveBeenCalledWith('user1');
        });
    });

    describe('ProfileCard interactions', () => {
        const setupForEdit = async () => {
            setUserOneLoggedInStorage();
            apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
            const rendered = setup({match});
            
            const editButton = await waitForElement(() => rendered.queryByText('Edit'));
            fireEvent.click(editButton);

            return rendered;
        }

        const mockDelayedUpdateSuccess = () => {
            return jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessUpdateUser)
                    }, 300);
                });
            });
        }

        it('displays edit layout when clicking EditButton', async () => {
            const { queryByText } = await setupForEdit();

            expect(queryByText('Save')).toBeInTheDocument();
        });

        it('returns back when clicking CancelButton', async () => {
            const { queryByText } = await setupForEdit();
            const cancelButton = queryByText('Cancel');
            fireEvent.click(cancelButton);

            expect(queryByText('Edit')).toBeInTheDocument();
        });

        it('calls updateUser api when clicking save', async () => {
            const { queryByText } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);

            expect(apiCalls.updateUser).toHaveBeenCalledTimes(1);
        });

        it('calls updateUser api with user id', async () => {
            const { queryByText } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            const userId = apiCalls.updateUser.mock.calls[0][0];

            expect(userId).toBe(1);
        });

        it('calls updateUser api with request body having new displayName', async () => {
            const { queryByText, container } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

            const displayInput = container.querySelector('input');
            fireEvent.change(displayInput, {target: {value: 'display1-update'}});
            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            const requestBody = apiCalls.updateUser.mock.calls[0][1];

            expect(requestBody.displayName).toBe('display1-update');
        });

        it('returns to non-edit mode after successful updateUser api call', async () => {
            const { queryByText } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            const editButtonAfterClicking = await waitForElement(() => queryByText('Edit'));

            expect(editButtonAfterClicking).toBeInTheDocument();
        });

        it('return to original displayName after change was cancelled', async () => {
            const { queryByText, container } = await setupForEdit();

            const displayInput = container.querySelector('input');
            fireEvent.change(displayInput, {target: {value: 'display1-update'}});
            const cancelButton = queryByText('Cancel');
            fireEvent.click(cancelButton);
            const originalDisplayName = queryByText('display1@user1');

            expect(originalDisplayName).toBeInTheDocument();
        });

        it('return to last updated displayName when displayName is changed for another time but cancelled', async () => {
            const { queryByText, container } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);
           
            let displayInput = container.querySelector('input');
            fireEvent.change(displayInput, {target: {value: 'display1-update'}});
            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            const editButtonAfterSave = await waitForElement(() => queryByText('Edit'));
            fireEvent.click(editButtonAfterSave);
            displayInput = container.querySelector('input');
            fireEvent.change(displayInput, {target: {value: 'display1-update2'}});
            const cancelButton = queryByText('Cancel');
            fireEvent.click(cancelButton);
            const lastSavedData = container.querySelector('h4');

            expect(lastSavedData).toHaveTextContent('display1-update@user1');
        });

        it('displays spinner when there is user update api call', async () => {
            const { queryByText } = await setupForEdit();
            apiCalls.updateUser = mockDelayedUpdateSuccess();

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            const spinner = queryByText('Loading...');

            expect(spinner).toBeInTheDocument();
        });

        it('disables save button when there is update api call going', async () => {
            const { queryByText } = await setupForEdit();
            apiCalls.updateUser = mockDelayedUpdateSuccess();

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);

            expect(saveButton).toBeDisabled();
        });

        it('disables cancel button when there is update api call going', async () => {
            const { queryByText } = await setupForEdit();
            apiCalls.updateUser = mockDelayedUpdateSuccess();

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            const cancelButton = queryByText('Cancel');

            expect(cancelButton).toBeDisabled();
        });

        it('enables save button after updateUser api call success', async () => {
            const { queryByText, container } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);
           

            let displayInput = container.querySelector('input');
            fireEvent.change(displayInput, {target: {value: 'display1-update'}});

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);

            const editButtonAfterSave = await waitForElement(() => queryByText('Edit'));
            fireEvent.click(editButtonAfterSave);

            const saveButtonAfterSecondEdit = queryByText('Save');


            expect(saveButtonAfterSecondEdit).not.toBeDisabled();
        });

        it('enables save button after updateUser api call fails', async () => {
            const { queryByText, container } = await setupForEdit();
           
            
            let displayInput = container.querySelector('input');
            fireEvent.change(displayInput, {target: {value: 'display1-update'}});
            apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);

            await waitForDomChange();


            expect(saveButton).not.toBeDisabled();
        });

        it('displays the selected image inEditMode ', async () => {
            const { container } = await setupForEdit();
           
            const inputs = container.querySelectorAll('input');
            const uploadInput = inputs[1];

            const file = new File(['test content'], 'test.png', {type: 'image/png'});

            fireEvent.change(uploadInput, {target: {files: [file]}});

            await waitForDomChange();
            const image = container.querySelector('img');

            expect(image.src).toContain('data:image/png;base64');
        });

        it('doesnt change image if it was selected but cancel was clicked', async () => {
            const { queryByText, container } = await setupForEdit();
           
            const inputs = container.getElementsByTagName('input');
            const uploadInput = inputs[1];

            const file = new File(['test content'], 'test.png', {type: 'image/png'});
            fireEvent.change(uploadInput, {target: {files: [file]}});
            await waitForDomChange();

            const cancelButton = queryByText('Cancel');
            fireEvent.click(cancelButton);
            await waitForDomChange();

            const image = container.querySelector('img');

            expect(image.src).toContain('http://localhost/images/profile/profile1.png');
        });

        it ('doesnt throw error after file not selected', async () => {
            const { container } = await setupForEdit();
                
            const inputs = container.getElementsByTagName('input');
            const uploadInput = inputs[1];

            expect(() => fireEvent.change(uploadInput, {target:{ files:[]}})).not.toThrow();
        });

        it('calls updateUser api with request body having new image without data:image/png;base64', async () => {
            const { queryByText, container } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);


            const inputs = container.querySelectorAll('input');
            const uploadInput = inputs[1];
            const file = new File(['test content'], 'test.png', {type: 'image/png'});
            fireEvent.change(uploadInput, {target: {files: [file]}});
            await waitForDomChange();
            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            const requestBody = apiCalls.updateUser.mock.calls[0][1];

            expect(requestBody.image).not.toContain('data:image/png;base64');
        });

        it ('returns to last updated image when image is changed for another time but canceled', async () => {
            const { queryByText, container } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);


            const inputs = container.getElementsByTagName('input');
            const uploadInput = inputs[1];
            const file = new File(['test content'], 'test.png', {type: 'image/png'});
            fireEvent.change(uploadInput, {target: {files: [file]}});
            await waitForDomChange();
            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            const editButtonAfterSave = await waitForElement(() => queryByText('Edit'));
            fireEvent.click(editButtonAfterSave);
            const newFile = new File(['another test content'], 'test2.png', {type: 'image/png'});
            fireEvent.change(uploadInput, {target: {files: [newFile]}});
            const cancelButton = queryByText('Cancel');
            fireEvent.click(cancelButton);
            const image = container.querySelector('img');

            
            expect(image.src).toContain('http://localhost/images/profile/profile1-update.png')
        });

        it('displays validation error for displayName when update api fails', async () => {
            const { queryByText } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            await waitForDomChange();
            const errorMessage = queryByText('It must have minimum 4 and maximum 255 characters');

            expect(errorMessage).toBeInTheDocument();
        });
        
        it('shows validation error for file when update api fails', async () => {
            const { queryByText } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            await waitForDomChange();
            const errorMessage = queryByText('Only PNG and JPG files are allowed');

            expect(errorMessage).toBeInTheDocument();
        });

        it('hides validation error for displayName when user changes it', async () => {
            const { queryByText, container } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            await waitForDomChange();
            const displayNameInput = container.getElementsByTagName('input')[0];
            fireEvent.change(displayNameInput, {target: {value: 'new-display-name'}});

            const errorMessage = queryByText('It must have minimum 4 and maximum 255 characters');

            expect(errorMessage).not.toBeInTheDocument();
        });

        it('hides validation error for file when user changes it', async () => {
            const { queryByText, container } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            await waitForDomChange();
            const fileInput = container.getElementsByTagName('input')[1];
            const file = new File(['test content'], 'test.png', {type: 'image/png'});
            fireEvent.change(fileInput, {target: {files: [file]}});
            await waitForDomChange();

            const errorMessage = queryByText('Only PNG and JPG files are allowed');

            expect(errorMessage).not.toBeInTheDocument();
        });

        it('hides validation errors when user cancel editing', async () =>{
            const { queryByText } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            await waitForDomChange();
            fireEvent.click(queryByText('Cancel'));
            fireEvent.click(queryByText('Edit'));

            const errorMessage = queryByText('It must have minimum 4 and maximum 255 characters');

            expect(errorMessage).not.toBeInTheDocument();
        });

        it('updates redux state after updateUser api call success', async () => {
            const { queryByText, container } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);
           

            let displayInput = container.querySelector('input');
            fireEvent.change(displayInput, {target: {value: 'display1-update'}});

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            await waitForDomChange();
            const storedUserData = store.getState();

            expect(storedUserData.displayName).toBe(mockSuccessUpdateUser.data.displayName);
            expect(storedUserData.image).toBe(mockSuccessUpdateUser.data.image);
        });

        it('updates local storage after updateUser api call success', async () => {
            const { queryByText, container } = await setupForEdit();
            apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);
           

            let displayInput = container.querySelector('input');
            fireEvent.change(displayInput, {target: {value: 'display1-update'}});

            const saveButton = queryByText('Save');
            fireEvent.click(saveButton);
            await waitForDomChange();
            const storedUserData = JSON.parse(localStorage.getItem('wave-auth'));

            expect(storedUserData.displayName).toBe(mockSuccessUpdateUser.data.displayName);
            expect(storedUserData.image).toBe(mockSuccessUpdateUser.data.image);
        });

    });
});

console.error = () => {}
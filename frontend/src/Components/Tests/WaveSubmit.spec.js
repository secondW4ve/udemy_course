import React from 'react';
import { render, fireEvent, waitForDomChange } from '@testing-library/react';
import WaveSubmit from '../WaveSubmit';

import { Provider } from 'react-redux';
import { createStore } from 'redux';

import * as apiCalls from '../../api/apiCalls';
import authReducer from '../../Redux/authReducer';

const defaultState = {
    id: 0,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png',
    password: 'P4ssword',
    isLoggedIn: true,
};

let store;

const setup = (state = defaultState) => {
    store = createStore(authReducer, state);
    return render(
        <Provider store = {store}>
            <WaveSubmit/>
        </Provider>
    )
};

describe('WaveSubit', () => {

    describe('Layout', () => {

        it('has textArea', () => {
            const { container } = setup();

            const textArea = container.querySelector('textarea');

            expect(textArea).toBeInTheDocument();
        });

        it('has image', () => {
            const { container } = setup();

            const image = container.querySelector('img');

            expect(image).toBeInTheDocument();
        });

        it('displays textarea 1 line', () => {
            const { container } = setup();

            const textArea = container.querySelector('textarea');

            expect(textArea.rows).toBe(1);
        });

        it('displays user image', () => {
            const { container } = setup();

            const image = container.querySelector('img');

            expect(image.src).toContain('http://localhost/images/profile/profile1.png');
        });
    });

    describe('Interactions', () => {

        let textArea;
        const setupFocused = () => {
            const rendered = setup();
            textArea = rendered.container.querySelector('textarea');
            fireEvent.focus(textArea);
            return rendered;
        }

        it('displays 3 rows when textareat is selected', () => {
            setupFocused();

            expect(textArea.rows).toBe(3);
        });

        it('displays Run wave button when textareat is selected', () => {
            const { queryByText } = setupFocused();
            
            const generateWaveButton = queryByText('Run wave');

            expect(generateWaveButton).toBeInTheDocument();
        });

        it('displays Extinguish wave button when textareat is selected', () => {
            const { queryByText } = setupFocused();

            const cancelButton = queryByText('Extinguish wave');

            expect(cancelButton).toBeInTheDocument();
        });

        it('doesnt display Run wave button when textarea isnt focused', () => {
            const { queryByText } = setup();
            
            const runButton = queryByText('Run wave');

            expect(runButton).not.toBeInTheDocument();
        });

        it('doesnt display Extinguish wave button when textarea isnt focused', () => {
            const { queryByText } = setup();
            
            const extinguishButton = queryByText('Extinguish wave');

            expect(extinguishButton).not.toBeInTheDocument();
        });

        it('returns back to unfocused state when Extinguish wave button clicked', () => {
            const { queryByText } = setupFocused();

            const extinguishButton = queryByText('Extinguish wave');
            fireEvent.click(extinguishButton);

            expect(queryByText('Extinguish wave')).not.toBeInTheDocument();
        });

        it('calls postWave with wave request object when clicking Run wave', () => {
            const { queryByText } = setupFocused();
            fireEvent.change(textArea, {target: {value : 'Test wave content'}});
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = jest.fn().mockResolvedValue({});
            fireEvent.click(runWaveButton);

            expect(apiCalls.postWave).toHaveBeenCalledWith({
                content: 'Test wave content',
            });
        });

        it('returns back to unfocused state after successful postWave action', async () => {
            const { queryByText } = setupFocused();
            fireEvent.change(textArea, {target: {value : 'Test wave content'}});
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = jest.fn().mockResolvedValue({});
            fireEvent.click(runWaveButton);

            await waitForDomChange();

            expect(runWaveButton).not.toBeInTheDocument();
        });

        it('clear content in textarea after successful postWave action', async () => {
            const { queryByText } = setupFocused();

            fireEvent.change(textArea, {target: {value : 'Test wave content'}});
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = jest.fn().mockResolvedValue({});
            fireEvent.click(runWaveButton);

            await waitForDomChange();

            expect(queryByText('Test wave content')).not.toBeInTheDocument();
        });

        it('clear content in textarea after clicking Extinguish wave', () => {
            const { queryByText } = setupFocused();

            fireEvent.change(textArea, {target: {value : 'Test wave content'}});
            const extinguishWaveButton = queryByText('Extinguish wave');
            fireEvent.click(extinguishWaveButton);

            expect(queryByText('Test wave content')).not.toBeInTheDocument();
        });

        it('disables Run wave button when there is apiCall ongoing', async () => {
            const { queryByText } = setupFocused();

            fireEvent.change(textArea, {target: {value : 'Test wave content'}});

            const mockFunction = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({})
                    }, 300);
                });
            });
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = mockFunction
            fireEvent.click(runWaveButton);
            fireEvent.click(runWaveButton);

            expect(mockFunction).toHaveBeenCalledTimes(1);
        });

        it('disables Extinguish wave button when there is apiCall ongoing', async () => {
            const { queryByText } = setupFocused();

            fireEvent.change(textArea, {target: {value : 'Test wave content'}});

            const mockFunction = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({})
                    }, 300);
                });
            });
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = mockFunction
            fireEvent.click(runWaveButton);
            const extinguishButton = queryByText("Extinguish wave");

            expect(extinguishButton).toBeDisabled();
        });

        it('displays spinner while apiCall ongoing', async () => {
            const { queryByText } = setupFocused();

            fireEvent.change(textArea, {target: {value : 'Test wave content'}});

            const mockFunction = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({})
                    }, 300);
                });
            });
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = mockFunction
            fireEvent.click(runWaveButton);

            expect(queryByText('Loading...')).toBeInTheDocument();
        });

        it('enables Run wave button when apiCall fails', async () => {
            const { queryByText } = setupFocused();

            fireEvent.change(textArea, {target: {value : 'Test wave content'}});

            const mockFunction = jest.fn().mockRejectedValueOnce({
                response: {
                    data: {
                        validationErrors: {
                            content: "It must have minimum 10 and maximum 5000 characters"
                        }
                    }
                }
            })
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = mockFunction
            fireEvent.click(runWaveButton);

            await waitForDomChange();

            expect(queryByText('Run wave')).not.toBeDisabled();
        });

        it('enables Extinguish wave button when apiCall fails', async () => {
            const { queryByText } = setupFocused();

            fireEvent.change(textArea, {target: {value : 'Test wave content'}});

            const mockFunction = jest.fn().mockRejectedValueOnce({
                response: {
                    data: {
                        validationErrors: {
                            content: "It must have minimum 10 and maximum 5000 characters"
                        }
                    }
                }
            })
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = mockFunction
            fireEvent.click(runWaveButton);

            await waitForDomChange();

            expect(queryByText('Extinguish wave')).not.toBeDisabled();
        });

        it('enables Run wave button after successful postWave call', async () => {
            const { queryByText } = setupFocused();

            fireEvent.change(textArea, {target: {value : 'Test wave content'}});
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = jest.fn().mockResolvedValue({});
            fireEvent.click(runWaveButton);
            await waitForDomChange();
            fireEvent.focus(textArea);

            expect(queryByText('Run wave')).not.toBeDisabled();
        });

        it('it displays validation errors for content', async () => {
            const { queryByText } = setupFocused();

            fireEvent.change(textArea, {target: {value : 'Test wave content'}});

            const mockFunction = jest.fn().mockRejectedValueOnce({
                response: {
                    data: {
                        validationErrors: {
                            content: "It must have minimum 10 and maximum 5000 characters"
                        }
                    }
                }
            })
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = mockFunction
            fireEvent.click(runWaveButton);

            await waitForDomChange();

            expect(queryByText('It must have minimum 10 and maximum 5000 characters')).toBeInTheDocument();
        });

        it('clear validation error after click Extinguish wave', async () => {
            const { queryByText } = setupFocused();

            fireEvent.change(textArea, {target: {value : 'Test wave content'}});

            const mockFunction = jest.fn().mockRejectedValueOnce({
                response: {
                    data: {
                        validationErrors: {
                            content: "It must have minimum 10 and maximum 5000 characters"
                        }
                    }
                }
            })
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = mockFunction
            fireEvent.click(runWaveButton);

            await waitForDomChange();
            fireEvent.click(queryByText('Extinguish wave'));

            expect(queryByText('It must have minimum 10 and maximum 5000 characters')).not.toBeInTheDocument();
        });

        it('clear validation error after content changes', async () => {
            const { queryByText } = setupFocused();

            fireEvent.change(textArea, {target: {value : 'Test wave content'}});

            const mockFunction = jest.fn().mockRejectedValueOnce({
                response: {
                    data: {
                        validationErrors: {
                            content: "It must have minimum 10 and maximum 5000 characters"
                        }
                    }
                }
            })
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = mockFunction;
            fireEvent.click(runWaveButton);

            await waitForDomChange();
            fireEvent.change(textArea, {target: {value: "Test wave content updated"}});

            expect(queryByText('It must have minimum 10 and maximum 5000 characters')).not.toBeInTheDocument();
        });

        it('displays file attachment input when textarea is focused', () => {
            const { container } = setupFocused();
            
            const uploadInput = container.querySelector('input');

            expect(uploadInput.type).toBe('file');
        });

        it('displays image component when file is selected', async () => {
            apiCalls.postWaveFile = jest.fn().mockResolvedValue({
                data:{
                    id: 1,
                    name: 'random-name.png'
                }
            });
            const { container } = setupFocused();
            
            const uploadInput = container.querySelector('input');

            const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
            fireEvent.change(uploadInput, { target: { files: [file]}});
            await waitForDomChange();
            const images = container.querySelectorAll('img');
            const attachmentImage = images[1];

            expect(attachmentImage.src).toContain('data:image/png;base64');
        });

        it('removes selected image after cancel', async () => {
            apiCalls.postWaveFile = jest.fn().mockResolvedValue({
                data:{
                    id: 1,
                    name: 'random-name.png'
                }
            });
            const { queryByText, container } = setupFocused();
            
            const uploadInput = container.querySelector('input');

            const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
            fireEvent.change(uploadInput, { target: { files: [file]}});
            await waitForDomChange();
            fireEvent.click(queryByText('Extinguish wave'));
            fireEvent.focus(textArea);
            const images = container.querySelectorAll('img');

            expect(images.length).toBe(1);
        });

        it('calls postWaveFile when file selected', async () => {
            apiCalls.postWaveFile = jest.fn().mockResolvedValue({
                data:{
                    id: 1,
                    name: 'random-name.png'
                }
            });
            const { container } = setupFocused();
            
            const uploadInput = container.querySelector('input');

            const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
            fireEvent.change(uploadInput, { target: { files: [file]}});
            await waitForDomChange();
            
            expect(apiCalls.postWaveFile).toHaveBeenCalledTimes(1);
        });

        it('calls postWaveFile with selected file', async (done) => {
            apiCalls.postWaveFile = jest.fn().mockResolvedValue({
                data:{
                    id: 1,
                    name: 'random-name.png'
                }
            });
            const { container } = setupFocused();
            
            const uploadInput = container.querySelector('input');

            const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
            fireEvent.change(uploadInput, { target: { files: [file]}});
            await waitForDomChange();
            const body = apiCalls.postWaveFile.mock.calls[0][0];
            const reader = new FileReader();
            reader.onloadend = () => {
                expect(reader.result).toBe('dummy content');
                done();
            };
            reader.readAsText(body.get('file'));
        });

        it('calls postWave with wave with file attachment object when clicking Run wave', async () => {
            apiCalls.postWaveFile = jest.fn().mockResolvedValue({
                data:{
                    id: 1,
                    name: 'random-name.png'
                }
            });
            const { queryByText, container } = setupFocused();
            fireEvent.change(textArea, {target: {value : 'Test wave content'}});
            const uploadInput = container.querySelector('input');
            const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
            fireEvent.change(uploadInput, { target: { files: [file]}});
            await waitForDomChange();
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = jest.fn().mockResolvedValue({});
            fireEvent.click(runWaveButton);

            expect(apiCalls.postWave).toHaveBeenCalledWith({
                content: 'Test wave content',
                attachment: {
                    id: 1,
                    name: 'random-name.png'
                }
            });
        });

        it('clears image after post wave success', async () => {
            apiCalls.postWaveFile = jest.fn().mockResolvedValue({
                data:{
                    id: 1,
                    name: 'random-name.png'
                }
            });
            const { queryByText, container } = setupFocused();
            fireEvent.change(textArea, {target: {value : 'Test wave content'}});
            const uploadInput = container.querySelector('input');
            const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
            fireEvent.change(uploadInput, { target: { files: [file]}});
            await waitForDomChange();
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = jest.fn().mockResolvedValue({});
            fireEvent.click(runWaveButton);

            await waitForDomChange();
            fireEvent.focus(textArea);
            const images = container.querySelectorAll('img');

            expect(images.length).toBe(1);
        });

        it('calls postWave without file attachment after cancelling previous file selection', async () => {
            apiCalls.postWaveFile = jest.fn().mockResolvedValue({
                data:{
                    id: 1,
                    name: 'random-name.png'
                }
            });
            const { queryByText, container } = setupFocused();
            fireEvent.change(textArea, {target: {value : 'Test wave content'}});
            const uploadInput = container.querySelector('input');
            const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
            fireEvent.change(uploadInput, { target: { files: [file]}});
            await waitForDomChange();
            fireEvent.click(queryByText('Extinguish wave'));
            fireEvent.focus(textArea);
            const runWaveButton = queryByText('Run wave');
            apiCalls.postWave = jest.fn().mockResolvedValue({});
            fireEvent.change(textArea, {target: {value : 'Test wave content'}});
            fireEvent.click(runWaveButton);

            expect(apiCalls.postWave).toHaveBeenCalledWith({
                content: 'Test wave content'
            })
        });
    });
});

console.error = () => {}


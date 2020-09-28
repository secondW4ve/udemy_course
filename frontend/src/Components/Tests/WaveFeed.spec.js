import React from 'react';
import { render, waitForDomChange, waitForElement, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import authReducer from '../../Redux/authReducer';
import WaveFeed from '../WaveFeed';
import * as apiCalls from '../../api/apiCalls';



const loggedInStateUser1 = {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png',
    password: 'P4ssword',
    isLoggedIn: true,
};

const originalSetInterval = window.setInterval;
const originalClearInterval = window.clearInterval;

let timedFunction;

const useFakeIntervals = () => {
    window.setInterval = (callback, interval) => {
        timedFunction = callback;
    }
    window.clearInterval = () => {
        timedFunction = undefined;
    }
};

const useRealIntervals = () => {
    window.setInterval = originalSetInterval;
    window.clearInterval = originalClearInterval;
}

const runTimer = () => {
    timedFunction && timedFunction();
}

const setup = (props, state = loggedInStateUser1) => {
    const store = createStore(authReducer, state);
    return render(
        <Provider store = {store}>
            <MemoryRouter>
                <WaveFeed {...props}/>
            </MemoryRouter>
        </Provider>
        
    );
}

const mockEmptyResponse = {
    data: {
        content: []
    }
}

const mockSuccessGetWavesSinglePage = {
    data: {
        content: [
            {
                id: 10,
                content: 'This is the latest wave',
                date: 1561294668539,
                user: {
                    id: 1,
                    username: 'user1',
                    displayName: 'display1',
                    image: 'profile1.png'
                }
            }
        ],
        number: 0,
        first: true,
        last: true,
        size: 5,
        totalPages: 1
    }
}

const mockSuccessGetWavesFirstOfMultiPage = {
    data: {
        content: [
            {
                id: 10,
                content: 'This is the latest wave',
                date: 1561294668539,
                user: {
                    id: 1,
                    username: 'user1',
                    displayName: 'display1',
                    image: 'profile1.png'
                }
            },
            {
                id: 9,
                content: 'This is wave 9',
                date: 1561294668539,
                user: {
                    id: 1,
                    username: 'user1',
                    displayName: 'display1',
                    image: 'profile1.png'
                }
            }
        ],
        number: 0,
        first: true,
        last: false,
        size: 5,
        totalPages: 2
    }
}

const mockSuccessGetWavesLastOfMultiPage = {
    data: {
        content: [
            {
                id: 1,
                content: 'This is the oldest wave',
                date: 1561294668539,
                user: {
                    id: 1,
                    username: 'user1',
                    displayName: 'display1',
                    image: 'profile1.png'
                }
            }
        ],
        number: 0,
        first: true,
        last: true,
        size: 5,
        totalPages: 2
    }
}

const mockSuccessGetNewWaveList = {
    data: [
        {
            id: 21,
                content: 'This is the newest wave',
                date: 1561294668539,
                user: {
                    id: 1,
                    username: 'user1',
                    displayName: 'display1',
                    image: 'profile1.png'
                }
        }
    ]
}

const mockSuccessGetWavesMiddleOfMultipage = {
    data: {
        content: [
            {
                id: 5,
                content: 'This wave is in middle page',
                date: 1561294668539,
                user: {
                    id: 1,
                    username: 'user1',
                    displayName: 'display1',
                    image: 'profile1.png'
                }
            }
        ],
        number: 0,
        first: false,
        last: false,
        size: 5,
        totalPages: 2
    }
}

describe('WaveFeed', () => {

    describe('Lifecycle', () => {

        it('calls loadWaves when it is rendered', () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockEmptyResponse);

            setup();

            expect(apiCalls.loadWaves).toHaveBeenCalled();
        });

        it('calls loadWaves with user param when it is rendered with user property', () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockEmptyResponse);

            setup({user: 'user1'});

            expect(apiCalls.loadWaves).toHaveBeenCalledWith("user1");
        });

        it('calls loadWaves witout user param when it is rendered without user property', () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockEmptyResponse);

            setup();
            const parameter = apiCalls.loadWaves.mock.calls[0][0];

            expect(parameter).toBeUndefined();
        });

        it('calls loadNewWaveCount with topWave id', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: {
                    count: 1
                }
            });
            const { queryByText } = setup();
            await waitForDomChange();
            runTimer();
            await waitForElement(() => queryByText('There is 1 new wave'));
            const firstParam = apiCalls.loadNewWaveCount.mock.calls[0][0];

            expect(firstParam).toBe(10);
            useRealIntervals();
        });

        it('calls loadNewWaveCount with topWave id and username when rendered with user property', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: {
                    count: 1
                }
            });
            const { queryByText } = setup({ user: 'user1'});
            await waitForDomChange();
            runTimer();
            await waitForElement(() => queryByText('There is 1 new wave'));
            
            expect(apiCalls.loadNewWaveCount).toHaveBeenCalledWith(10, 'user1');
            useRealIntervals();
        });

        it('displays new wave count as 1 after loadNewWaveCount success', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: {
                    count: 1
                }
            });
            const { queryByText } = setup({ user: 'user1'});
            await waitForDomChange();
            runTimer();
            const newWaveCount = await waitForElement(() => queryByText('There is 1 new wave'));
            
            expect(newWaveCount).toBeInTheDocument();
            useRealIntervals();
        });

        it('displays new wave count constantly', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: {
                    count: 1
                }
            });
            const { queryByText } = setup({ user: 'user1'});
            await waitForDomChange();
            runTimer();
            await waitForElement(() => queryByText('There is 1 new wave'));
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: {
                    count: 2
                }
            });
            runTimer();
            const newWaveCount = await waitForElement(() => queryByText("There are 2 new waves"));

            expect(newWaveCount).toBeInTheDocument();
            useRealIntervals();
        });

        it('doesnt call loadNewWaveCount after component was unmounted', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: {
                    count: 1
                }
            });
            const { queryByText, unmount } = setup({ user: 'user1'});
            await waitForDomChange();
            runTimer();
            await waitForElement(() => queryByText('There is 1 new wave'));
            unmount();
            expect(apiCalls.loadNewWaveCount).toHaveBeenCalledTimes(1);
            useRealIntervals();
        });

        it('displays new wave count as 1 after loadNewWaveCount success when user doesnt have waves inititaly', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockEmptyResponse);
            
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: {
                    count: 1
                }
            });
            const { queryByText } = setup({ user: 'user1'});
            await waitForDomChange();
            runTimer();
            const newWaveCount = await waitForElement(() => queryByText('There is 1 new wave'));
            
            expect(newWaveCount).toBeInTheDocument();
            useRealIntervals();
        });
    });

    describe('Layout', () => {

        it('displays no wave message when the response has empty page', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockEmptyResponse);
            
            const { queryByText } = setup();
            const message = await waitForElement(() => queryByText('There are no waves'));
            
            expect(message).toBeInTheDocument();
        });

        it('doesnt displays no wave message when the response has page of waves', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesSinglePage);
            
            const { queryByText } = setup();
            await waitForDomChange();
            
            expect(queryByText("There are no waves")).not.toBeInTheDocument();
        });

        it('displays spinner when loading the waves', async () => {
            apiCalls.loadWaves = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetWavesSinglePage)
                    }, 300);
                })
            });
            
            const { queryByText } = setup();
            
            expect(queryByText("Loading...")).toBeInTheDocument();
        });

        it('displays wave content', async () => {
            apiCalls.loadWaves = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetWavesSinglePage)
                    }, 300);
                })
            });
            
            const { queryByText } = setup();
            const waveContent = await waitForElement(() => queryByText('This is the latest wave'));

            expect(waveContent).toBeInTheDocument();
        });

        it('displays load more if current page isnt last', async () => {
            apiCalls.loadWaves = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetWavesFirstOfMultiPage)
                    }, 300);
                })
            });
            
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));

            expect(loadMore).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {

        it('calls loadOldWaves with wave id when clicking Load More', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadOldWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesLastOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            const firstParam = apiCalls.loadOldWaves.mock.calls[0][0];

            expect(firstParam).toBe(9);
        });

        it('calls loadOldWaves with wave id and username when clicking Load More when rendered with user property', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadOldWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesLastOfMultiPage);
            const { queryByText } = setup({ user: 'user1'});
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            
            expect(apiCalls.loadOldWaves).toHaveBeenCalledWith(9, 'user1');
        });

        it('displays loaded old wave when loadOldWaves api success', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadOldWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesLastOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            const oldWave = await waitForElement(() => queryByText('This is the oldest wave'));

            expect(oldWave).toBeInTheDocument();
        });

        it('hides Load More when loadOldWaves api call returns last page', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadOldWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesLastOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            await waitForElement(() => queryByText('This is the oldest wave'));

            expect(queryByText('Load More')).not.toBeInTheDocument();
        });

        //load new waves

        it('calls loadNewWaves with wave id when clicking New Wave Count card', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });
            apiCalls.loadNewWaves = jest.fn().mockResolvedValue(mockSuccessGetNewWaveList);
            const { queryByText } = setup();
            await waitForDomChange();
            runTimer();
            const newWaveCount = await waitForElement(() => queryByText('There is 1 new wave'));
            fireEvent.click(newWaveCount);
            const firstParam = apiCalls.loadNewWaves.mock.calls[0][0];

            expect(firstParam).toBe(10);
            useRealIntervals();
        });

        it('calls loadNewWaves with wave id and username when clicking New Wave Count card', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });
            apiCalls.loadNewWaves = jest.fn().mockResolvedValue(mockSuccessGetNewWaveList);
            const { queryByText } = setup({ user: 'user1'});
            await waitForDomChange();
            runTimer();
            const newWaveCount = await waitForElement(() => queryByText('There is 1 new wave'));
            fireEvent.click(newWaveCount);
            
            expect(apiCalls.loadNewWaves).toHaveBeenCalledWith(10, 'user1');
            useRealIntervals();
        });

        it('displays loaded new wave when loadNewWaves api success', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });
            apiCalls.loadNewWaves = jest.fn().mockResolvedValue(mockSuccessGetNewWaveList);
            const { queryByText } = setup({ user: 'user1'});
            await waitForDomChange();
            runTimer();
            const newWaveCount = await waitForElement(() => queryByText('There is 1 new wave'));
            fireEvent.click(newWaveCount);
            const newWave = await waitForElement(() => queryByText('This is the newest wave'));

            expect(newWave).toBeInTheDocument();
            useRealIntervals();
        });

        it('hides new wave count when loadNewWaves api call success', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });
            apiCalls.loadNewWaves = jest.fn().mockResolvedValue(mockSuccessGetNewWaveList);
            const { queryByText } = setup({ user: 'user1'});
            await waitForDomChange();
            runTimer();
            const newWaveCount = await waitForElement(() => queryByText('There is 1 new wave'));
            fireEvent.click(newWaveCount);
            await waitForElement(() => queryByText('This is the newest wave'));

            expect(queryByText("There is 1 new wave")).not.toBeInTheDocument();
            useRealIntervals();
        });

        it('doesnt allow loadOldWaves to be called when api call about it is ongoing', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadOldWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesLastOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            fireEvent.click(loadMore);

            expect(apiCalls.loadOldWaves).toHaveBeenCalledTimes(1);
        });

        it('replaces Load More with spinner when there is an active api call about it', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadOldWaves = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetWavesLastOfMultiPage)
                    }, 300);
                })
            })
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            const spinner = await waitForElement(() => queryByText('Loading...'));

            expect(spinner).toBeInTheDocument();
            expect(queryByText('Load More')).not.toBeInTheDocument();
        });

        it('replaces Spinner to Load More after active api call about it finishes with middle page response', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadOldWaves = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetWavesMiddleOfMultipage)
                    }, 300);
                })
            })
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            await waitForElement(() => queryByText('This wave is in middle page'));

            expect(queryByText('Loading...')).not.toBeInTheDocument();
            expect(queryByText('Load More')).toBeInTheDocument();
        });

        it('replaces Spinner to Load More after active api call about it finishes with error', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            
            apiCalls.loadOldWaves = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject({response: {data:{}}})
                    }, 300);
                })
            })
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            await waitForElement(() => queryByText('Loading...'));
            await waitForDomChange();

            expect(queryByText('Loading...')).not.toBeInTheDocument();
            expect(queryByText('Load More')).toBeInTheDocument();
        });

        // load new waves

        it('doesnt allow loadNewWaves to be called when api call about it is ongoing', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });
            apiCalls.loadNewWaves = jest.fn().mockResolvedValue(mockSuccessGetNewWaveList);
            const { queryByText } = setup({ user: 'user1'});
            await waitForDomChange();
            runTimer();
            const newWaveCount = await waitForElement(() => queryByText('There is 1 new wave'));
            fireEvent.click(newWaveCount);
            fireEvent.click(newWaveCount);

            expect(apiCalls.loadNewWaves).toHaveBeenCalledTimes(1);
            useRealIntervals();
        });

        it('replaces There is 1 new wave with spinner when there is an active api call about it', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });
            
            apiCalls.loadNewWaves = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetNewWaveList)
                    }, 300);
                })
            })
            const { queryByText } = setup();
            await waitForDomChange();
            runTimer();
            const newWaveCount = await waitForElement(() => queryByText('There is 1 new wave'));
            fireEvent.click(newWaveCount);
            const spinner = await waitForElement(() => queryByText('Loading...'));

            expect(spinner).toBeInTheDocument();
            expect(queryByText('There is 1 new wave')).not.toBeInTheDocument();
            useRealIntervals();
        });

        it('removes Spinner and There is 1 new wave after active api call about it finishes with middle page response', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });
            apiCalls.loadNewWaves = jest.fn().mockResolvedValue(mockSuccessGetNewWaveList);
            const { queryByText } = setup({ user: 'user1'});
            await waitForDomChange();
            runTimer();
            const newWaveCount = await waitForElement(() => queryByText('There is 1 new wave'));
            fireEvent.click(newWaveCount);
            await waitForElement(() => queryByText('This is the newest wave'));

            expect(queryByText('Loading...')).not.toBeInTheDocument();
            expect(queryByText('There is 1 new wave')).not.toBeInTheDocument();
            useRealIntervals();
        });

        it('replaces Spinner with There is 1 new wave after active api call about it finishes with error', async () => {
            useFakeIntervals();
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });
            
            apiCalls.loadNewWaves = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject({response: {data:{}}});
                    }, 300);
                })
            })
            const { queryByText } = setup();
            await waitForDomChange();
            runTimer();
            const newWaveCount = await waitForElement(() => queryByText('There is 1 new wave'));
            fireEvent.click(newWaveCount);
            waitForElement(() => queryByText('Loading...'));
            await waitForDomChange();

            expect(queryByText('Loading...')).not.toBeInTheDocument();
            expect(queryByText('There is 1 new wave')).toBeInTheDocument();
            useRealIntervals();
        });

        it('displays modal when clicking delete on wave', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });

            const { queryByTestId, container } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const modalRootDiv = queryByTestId('modal-root');

            expect(modalRootDiv).toHaveClass("modal fade d-block show");
        });

        it('hides modal when clicking cancel in modal', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });

            const { queryByTestId, container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            fireEvent.click(queryByText('Cancel'));
            const modalRootDiv = queryByTestId('modal-root');

            expect(modalRootDiv).not.toHaveClass("d-block show");
        });

        it('displays modal with info about the action', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });

            const { container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const message = queryByText(`Are you sure you want to extinguish 'This is the latest wave'?`);
            
            expect(message).toBeInTheDocument();
        });

        it('calls deleteWave api with wave id when delete button is clicked on modal', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });

            apiCalls.deleteWave = jest.fn().mockResolvedValue({});
            const { queryByTestId, container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const deleteWaveButton = queryByText("Extinguish Wave");
            fireEvent.click(deleteWaveButton);
            
            expect(apiCalls.deleteWave).toHaveBeenCalledWith(10);
        });

        it('hides modal after successful deleteWave api call', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });

            apiCalls.deleteWave = jest.fn().mockResolvedValue({});
            const { queryByTestId, container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const deleteWaveButton = queryByText("Extinguish Wave");
            fireEvent.click(deleteWaveButton);
            await waitForDomChange();
            const modalRootDiv = queryByTestId('modal-root');
            
            expect(modalRootDiv).not.toHaveClass('d-block show');
        });

        it('removes the deleted wave from document after successful deleteWave api call', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });

            apiCalls.deleteWave = jest.fn().mockResolvedValue({});
            const { queryByTestId, container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const deleteWaveButton = queryByText("Extinguish Wave");
            fireEvent.click(deleteWaveButton);
            await waitForDomChange();
            const deletedWaveContent = queryByText('This is the latest wave');

            expect(deletedWaveContent).not.toBeInTheDocument();
        });

        it('disables Modal Button when api call in process', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });

            apiCalls.deleteWave = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve()
                    }, 300);
                })
            })
            const { queryByTestId, container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const deleteWaveButton = queryByText("Extinguish Wave");
            fireEvent.click(deleteWaveButton);

            expect(deleteWaveButton).toBeDisabled();
            expect(queryByText('Cancel')).toBeDisabled();
        });

        it('displays spinner in modal when api call in process', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });

            apiCalls.deleteWave = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve()
                    }, 300);
                })
            })
            const { queryByTestId, container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const deleteWaveButton = queryByText("Extinguish Wave");
            fireEvent.click(deleteWaveButton);
            const spinner = queryByText("Loading...");

            expect(spinner).toBeInTheDocument();
        });

        it('hide spinner when api call finishes', async () => {
            apiCalls.loadWaves = jest.fn().mockResolvedValue(mockSuccessGetWavesFirstOfMultiPage);
            apiCalls.loadNewWaveCount = jest.fn().mockResolvedValue({
                data: { count: 1 }
            });

            apiCalls.deleteWave = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve()
                    }, 300);
                })
            })
            const { queryByTestId, container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const deleteWaveButton = queryByText("Extinguish Wave");
            fireEvent.click(deleteWaveButton);
            await waitForDomChange();
            const spinner = queryByText("Loading...");

            expect(spinner).not.toBeInTheDocument();
        });
    })
});

console.error = () => {};
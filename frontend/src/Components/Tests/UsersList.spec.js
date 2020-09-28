import React from 'react';
import { render, waitForDomChange, waitForElement, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import * as apiCalls from '../../api/apiCalls';
import UsersList from '../UsersList';
import { 
    mockedEmptySuccessResponse, 
    mockSuccessGetSinglePage, 
    mockSuccessGetMultiPageFirst,
    mockSuccessGetMultiPageLast,
} 
from './mocksForUserListTests';


apiCalls.listUsers = jest.fn().mockResolvedValue({
    data: {
        content: [],
        number: 0,
        size: 3,
    }
});

const setup = () => {
    return render(
    <MemoryRouter>
        <UsersList />
    </MemoryRouter>);
};

describe('UsersList', () => {
    describe('Layout', () => {
        it('has header of users',() => {
            const { container } = setup();

            const header = container.querySelector('h3');

            expect(header).toHaveTextContent('Users');
        });

        it('displays 3 items when listUsers api response has 3 users', async () =>{
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetSinglePage);
            const { queryByTestId } = setup();

            await waitForDomChange();
            const usersGroup = queryByTestId('usersGroup');

            expect(usersGroup.childElementCount).toBe(3);
        });

        it('displays the displayName@username when listUsers api response has users', async () =>{
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetSinglePage);
            const { queryByText } = setup();

            const firstUser = await waitForElement(() => queryByText('display1@user1'));
            
            expect(firstUser).toBeInTheDocument();
        });

        it('displays the next button when response has last value as false', async () =>{
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetMultiPageFirst);
            const { queryByText } = setup();

            const nextLink = await waitForElement(() => queryByText('next >'));
            
            expect(nextLink).toBeInTheDocument();
        });

        it('hides the next button when response has last value as true', async () =>{
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetMultiPageLast);
            const { queryByText } = setup();

            const nextLink = await waitForElement(() => queryByText('next >'));
            
            expect(nextLink).not.toBeInTheDocument();
        });

        it('displays the previous button when response has first value as false', async () =>{
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetMultiPageLast);
            const { queryByText } = setup();

            const previousLink = await waitForElement(() => queryByText('< previous'));
            
            expect(previousLink).toBeInTheDocument();
        });

        it('hides the previous button when response has first value as true', async () =>{
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetMultiPageFirst);
            const { queryByText } = setup();

            const previousLink = await waitForElement(() => queryByText('< previous'));
            
            expect(previousLink).not.toBeInTheDocument();
        });

        it('has link to UserPage', async () =>{
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetSinglePage);
            const { queryByText, container } = setup();

            await waitForElement(() => queryByText('display1@user1'));
            const firstAnchor = container.querySelectorAll('a')[0];
            
            expect(firstAnchor.getAttribute('href')).toBe('/user1');
        });
    });

    describe('Lifecycle', () => {
        it('calls listUsers api when its rendered', () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockedEmptySuccessResponse);
            setup();

            expect(apiCalls.listUsers).toHaveBeenCalledTimes(1);
        });

        it('calls listUsers method with page = 0 and size = 3', () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockedEmptySuccessResponse);
            setup();

            expect(apiCalls.listUsers).toHaveBeenCalledWith({page: 0, size: 3});
        });
    });

    describe('Interactions', () => {
        it('loads next page when clicking on next button', async () =>{
            apiCalls.listUsers = jest.fn()
                .mockResolvedValueOnce(mockSuccessGetMultiPageFirst)
                .mockResolvedValueOnce(mockSuccessGetMultiPageLast);
            const { queryByText } = setup();

            const nextLink = await waitForElement(() => queryByText('next >'));
            fireEvent.click(nextLink);
            const secondPageWithUsers = await waitForElement(() => queryByText('display4@user4'));

            expect(secondPageWithUsers).toBeInTheDocument();
        });

        it('loads previous page when clicking on previous button', async () =>{
            apiCalls.listUsers = jest.fn()
                .mockResolvedValueOnce(mockSuccessGetMultiPageLast)
                .mockResolvedValueOnce(mockSuccessGetMultiPageFirst);
            const { queryByText } = setup();

            const previousLink = await waitForElement(() => queryByText('< previous'));
            fireEvent.click(previousLink);
            const firstPageWithUsers = await waitForElement(() => queryByText('display1@user1'));

            expect(firstPageWithUsers).toBeInTheDocument();
        });
    });
});

console.error = () => {};
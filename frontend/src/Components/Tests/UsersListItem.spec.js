import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import UsersListItem from '../UsersListItem';


const user = {
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png',
}

const setup = (propUser = user) => {
    return render(
        <MemoryRouter>
            <UsersListItem user = { propUser } />
        </MemoryRouter>
    )
}

describe('UsersListItem', () => {
    it('has image', () => {
        const { container } = setup();
        
        const image = container.querySelector('img');

        expect(image).toBeInTheDocument();
    });

    it('displays default image when user doesnt have any', () => {
        const userWithoutImage = {
            ...user,
            image: undefined,
        }
        const { container } = setup(userWithoutImage);
        
        const image = container.querySelector('img');

        expect(image.src).toContain('/profile.png');
    });

    it("displays user's image when user have image", () => {
        const { container } = setup();
        
        const image = container.querySelector('img');

        expect(image.src).toContain('http://localhost/images/profile/' + user.image);
    });
});
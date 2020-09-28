import React from 'react';
import { render } from '@testing-library/react';

import ProfileCard from '../ProfileCard';


const user = {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png',
};

describe('ProdileCard', () => {
    describe('Layount', () => {
        it('displays the displayName@username', () => {
            
            const { queryByText } = render(<ProfileCard user = {user}/>);
            const userInfo = queryByText('display1@user1');

            expect(userInfo).toBeInTheDocument();
        });

        it('Contains image', () => {
            const { container } = render(<ProfileCard user = {user}/>);

            const image = container.querySelector('img');

            expect(image).toBeInTheDocument();
        });

        it('displays default image when user dont have one', () => {
            const userWithoutImage = {
                ...user,
                image: undefined
            }
            const { container } = render(<ProfileCard user = {userWithoutImage}/>);

            const image = container.querySelector('img');

            expect(image.src).toContain('/profile.png');
        });

        it('displays default image when user have one', () => {
            const { container } = render(<ProfileCard user = {user}/>);

            const image = container.querySelector('img');

            expect(image.src).toContain('/images/profile/' + user.image);
        });

        it('displays the edit button when isEditable property set as true', () => {
            const { queryByText } = render(<ProfileCard user = {user} isEditable = {true}/>);
            
            const editButton = queryByText('Edit');

            expect(editButton).toBeInTheDocument();
        });

        it('doesnt displays the edit button when isEditable property isnt provided', () => {
            const { queryByText } = render(<ProfileCard user = {user}/>);
            
            const editButton = queryByText('Edit');

            expect(editButton).not.toBeInTheDocument();
        });

        
        it('displays the displayName input when inEditMode property set as true', () => {
            const { container } = render(<ProfileCard user = {user} inEditMode = {true}/>);
            
            const displayNameInput = container.querySelector('input');

            expect(displayNameInput).toBeInTheDocument();
        });

        it('displays the current displayName in displayName input when inEditMode property set as true', () => {
            const { container } = render(<ProfileCard user = {user} inEditMode = {true}/>);
            
            const displayNameInput = container.querySelector('input');

            expect(displayNameInput.value).toBe(user.displayName);
        });

        it('hide the displayName@username in EditMode', () => {
            const { queryByText } = render(<ProfileCard user = {user} inEditMode = {true}/>);

            const userInfo = queryByText('display1@user1');

            expect(userInfo).not.toBeInTheDocument();
        });

        it('displays label for displayName in EditMode', () => {
            const { container } = render(<ProfileCard user = {user} inEditMode = {true}/>);
            
            const label = container.querySelector('label');

            expect(label).toHaveTextContent("Change Display Name for user1");
        });

        it('hide the edit button in EditMode and isEditable provided as true', () => {
            const { queryByText } = render(<ProfileCard user = {user} inEditMode = {true} isEditable = {true}/>);

            const editButton = queryByText('Edit');

            expect(editButton).not.toBeInTheDocument();
        });

        it('displays SaveButton in EditMode', () => {
            const { queryByText } = render(<ProfileCard user = {user} inEditMode = {true} isEditable = {true}/>);

            const saveButton = queryByText('Save');

            expect(saveButton).toBeInTheDocument();
        });

        it('displays CancelButton in EditMode', () => {
            const { queryByText } = render(<ProfileCard user = {user} inEditMode = {true} isEditable = {true}/>);

            const cancelButton = queryByText('Cancel');

            expect(cancelButton).toBeInTheDocument();
        });

        it('displays file input when inEditMode set as true', () => {
            const { container } = render(<ProfileCard inEditMode = {true} user = {user}/>);
            const inputs = container.querySelectorAll('input');
            const uploadInput = inputs[1];
            expect(uploadInput.type).toBe('file');
        });
    });
});
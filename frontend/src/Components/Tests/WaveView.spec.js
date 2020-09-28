import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import authReducer from '../../Redux/authReducer';
import WaveView from '../WaveView';

const loggedInStateUser1 = {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png',
    password: 'P4ssword',
    isLoggedIn: true,
};

const loggedInStateUser2 = {
    id: 2,
    username: 'user2',
    displayName: 'display2',
    image: 'profile2.png',
    password: 'P4ssword',
    isLoggedIn: true,
};

const waveWithoutAttachment = {
    id: 10,
    content: 'This is the latest wave',
    user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
    }
};

const waveWithAttachment = {
    id: 10,
    content: 'This is the latest wave',
    user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
    },
    attachment: {
        fileType: 'image/png',
        name: 'attached-image.png'
    }
};


const waveWithPdfAttachment = {
    id: 10,
    content: 'This is the latest wave',
    user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
    },
    attachment: {
        fileType: 'application/pdf',
        name: 'attached.pdf'
    }
};


const setup = (wave = waveWithoutAttachment, state = loggedInStateUser1) => {
    const oneMinute = 60*1000;
    const date = new Date(new Date() - oneMinute);
    wave.date = date;
    const store = createStore(authReducer, state);
    return render(
        <Provider store = {store}>
            <MemoryRouter>
                <WaveView wave = {wave}/>
            </MemoryRouter>   
        </Provider>
    );
}

describe('WaveView', () => {

    describe('Layout', () => {

        it('displays wave content', () => {
            const { queryByText } = setup();
            
            expect(queryByText("This is the latest wave")).toBeInTheDocument();
        });

        it('displays user image', () => {
            const { container } = setup();

            const image = container.querySelector('img');
            
            expect(image.src).toContain('/images/profile/profile1.png');
        });

        it('displays displayName@username', () => {
            const { queryByText } = setup();
            
            expect(queryByText("display1@user1")).toBeInTheDocument();
        });

        it('displays relative time', () => {
            const { queryByText } = setup();
            
            expect(queryByText("1 minute ago")).toBeInTheDocument();
        });

        it('has link to UserPage', () => {
            const { container } = setup();
            
            const anchor = container.querySelector('a');

            expect(anchor.getAttribute('href')).toBe("/user1");
        });

        it('displays file attachment image', () => {
            const { container } = setup(waveWithAttachment);

            const images = container.querySelectorAll('img');
            
            expect(images.length).toBe(2);
        });

        it('doesnt display file attachment when attachmnet type isnt image', () => {
            const { container } = setup(waveWithPdfAttachment);

            const images = container.querySelectorAll('img');
            
            expect(images.length).toBe(1);
        });

        it('sets the attachment path as source for file attachment image', () => {
            const { container } = setup(waveWithAttachment);

            const images = container.querySelectorAll('img');
            const attachmentImage = images[1];
            
            expect(attachmentImage.src).toContain('http://localhost/images/attachments/' + waveWithAttachment.attachment.name);
        });

        it('displays delete button when wave owned by logged in user', () => {
            const { container } = setup();

            expect(container.querySelector('button')).toBeInTheDocument();
        });
        
        it('doesnt display delete button when logged in user doesnt own it', () => {
            const { container } = setup(waveWithoutAttachment, loggedInStateUser2);

            expect(container.querySelector('button')).not.toBeInTheDocument();
        })
    });
});
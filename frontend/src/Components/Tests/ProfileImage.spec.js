import React from 'react';
import { render } from '@testing-library/react';

import defaultImage from '../../Assets/profile.png';
import ProfileImage from '../ProfileImage';


describe('ProfileImage', () => {
   
    describe('Layout', () => {
        it('has image', () => {
            const { container } = render(<ProfileImage/>);

            const image = container.querySelector('img');

            expect(image).toBeInTheDocument();
        });

        it('displays default image when an image property isnt provided', () => {
            const { container } = render(<ProfileImage/>);

            const image = container.querySelector('img');

            expect(image.src).toContain('http://localhost/profile.png');
        });

        it('displays image when an image property is provided', () => {
            const providedImage = 'profile1.png';
            const { container } = render(<ProfileImage image = {providedImage}/>);

            const image = container.querySelector('img');

            expect(image.src).toContain('http://localhost/images/profile/' + providedImage);
        });
   }); 
});
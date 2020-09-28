import React from 'react';
import { render, queryByText, fireEvent } from '@testing-library/react';

import Modal from '../Modal';


describe('Modal', () => {

    describe('Layout', () => {

        it('will be visible when visible property set to true', () => {
            const { queryByTestId } = render(<Modal visible = {true}/>);

            const modalRootDiv = queryByTestId('modal-root');

            expect(modalRootDiv).toHaveClass('modal fade d-block show');
            expect(modalRootDiv).toHaveStyle(`background-color: #000000b0`);
        });

        it('displays title provided as prop', () => {
            const { queryByText } = render(<Modal title = "Test title"/>);

            expect(queryByText('Test title')).toBeInTheDocument();
        });

        it('displays body provided as prop', () => {
            const { queryByText } = render(<Modal body = "Test body"/>);

            expect(queryByText('Test body')).toBeInTheDocument();
        });

        it('displays OK button text provided as prop', () => {
            const { queryByText } = render(<Modal okButton = "OK"/>);

            expect(queryByText('OK')).toBeInTheDocument();
        });
        
        it('displays Cancel button text provided as prop', () => {
            const { queryByText } = render(<Modal cancelButton = "Cancel"/>);

            expect(queryByText('Cancel')).toBeInTheDocument();
        });

        it('display default text for buttons when it doesnt provided', () => {
            const { queryByText } = render(<Modal/>);

            expect(queryByText('Ok')).toBeInTheDocument();
            expect(queryByText('Cancel')).toBeInTheDocument();
        });

        it('calls callback fun provided as prop when clicking ok button', () => {
            const mockFunc = jest.fn();
            const { queryByText } = render(<Modal onClickOk = {mockFunc}/>);

            fireEvent.click(queryByText('Ok'));

            expect(mockFunc).toHaveBeenCalled();
        });

        it('calls callback fun provided as prop when clicking cancel button', () => {
            const mockFunc = jest.fn();
            const { queryByText } = render(<Modal onClickCancel = {mockFunc}/>);

            fireEvent.click(queryByText('Cancel'));

            expect(mockFunc).toHaveBeenCalled();
        });
    })
})
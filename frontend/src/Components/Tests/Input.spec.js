import React from 'react';
import {render, fireEvent} from '@testing-library/react';

import Input from '../Input';

describe('Layout', () => {

    it ('has input item', () => {
        const { container } = render(<Input />);
        const input = container.querySelector('input');
        expect(input).toBeInTheDocument();

    });

    it ('displays the label provided in props', () => {
        const { queryByText } = render(<Input label = "Test label" />);
        const label = queryByText('Test label');
        expect(label).toBeInTheDocument();
    });

    it ('doesnt displays the label when label is not provided in props', () => {
        const { container } = render(<Input/>);
        const label = container.querySelector('label');
        expect(label).not.toBeInTheDocument();
    });

    it ('has type text for input when type is not provided as prop', () => {
        const { container } = render(<Input/>);
        const input = container.querySelector('input');
        expect(input.type).toBe('text');
    });

    it ('has type password for input when type is provided as prop', () => {
        const { container } = render(<Input type = "password" />);
        const input = container.querySelector('input');
        expect(input.type).toBe('password');
    });
    
    it ('displays placeholer when its provided as prop', () => {
        const { container } = render(<Input placeholder = "Test placeholder" />);
        const input = container.querySelector('input');
        expect(input.placeholder).toBe('Test placeholder');
    });

    it ('has value for input when its provided as prop', () => {
        const { container } = render(<Input value = "Test value" />);
        const input = container.querySelector('input');
        expect(input.value).toBe('Test value');
    });

    it ('has onChange callback when its provided as prop', () => {
        const onChange = jest.fn();
        const { container } = render(<Input onChange = {onChange} />);
        const input = container.querySelector('input');
        fireEvent.change(input, {target:{value: 'new-input'}});
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it ('has default style when there is no validation error or success', () => {
        const { container } = render(<Input/>);
        const input = container.querySelector('input');
        expect(input.className).toBe('form-control');
    });

    it ('has success style when hasError property is false', () => {
        const { container } = render(<Input hasError = {false}/>);
        const input = container.querySelector('input');
        expect(input.className).toBe('form-control is-valid');
    });

    it ('has error style when field has error', () => {
        const { container } = render(<Input hasError = {true}/>);
        const input = container.querySelector('input');
        expect(input.className).toBe('form-control is-invalid');
    });

    it ('displays the error text when error is provided', () => {
        const { queryByText } = render(<Input hasError = {true} error = "Can not be null"/>);
        expect(queryByText('Can not be null')).toBeInTheDocument();
    });

    it ('doesnt displays the error text when hasError is not provided', () => {
        const { queryByText } = render(<Input error = "Can not be null"/>);
        expect(queryByText('Can not be null')).not.toBeInTheDocument();
    });

    it('has form-control-file class when type is file', () => {
        const { container } = render(<Input type = "file"/>);
        
        const input = container.querySelector('input');

        expect(input.className).toBe('form-control-file');
    });
})

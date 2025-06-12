import React from 'react';
import { Form } from 'react-bootstrap';
import './Input.css';

const Input = ({ label, ...props }) => {
    return (
        <Form.Group className="mb-3 custom-input">
            {label && <Form.Label>{label}</Form.Label>}
            <Form.Control
                className="custom-form-control"
                {...props}
            />
            <Form.Control.Feedback type="invalid">
                This field is required
            </Form.Control.Feedback>
        </Form.Group>
    );
};

export default Input;
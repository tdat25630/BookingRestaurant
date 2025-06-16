import React from 'react';
import './Input.css';

const Input = ({ label, className, ...props }) => {
    return (
        <div className={`mb-3 custom-input ${className || ''}`}>
            {label && <label className="custom-input-label">{label}</label>}
            <input
                className="custom-form-control"
                {...props}
            />
            <div className="invalid-feedback">
                This field is required
            </div>
        </div>
    );
};

export default Input;
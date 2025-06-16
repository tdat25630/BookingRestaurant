import React from 'react';
import './Button.css';

const Button = ({ children, variant = "primary", fullWidth, className, ...props }) => {
    const buttonClass = `custom-button ${fullWidth ? 'w-100' : ''} ${className || ''}`;

    return (
        <button
            type="button"
            className={buttonClass}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
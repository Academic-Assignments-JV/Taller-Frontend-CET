import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'secondary-danger'
    | 'add-cart'
    | 'submit'
    | 'reset'
    | 'raw'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    children: ReactNode
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    'secondary-danger': 'btn btn-secondary-danger',
    'add-cart': 'btn-add-cart',
    submit: 'btn-submit',
    reset: 'btn-reset',
    raw: ''
}

export default function Button({
    variant = 'primary',
    className = '',
    type = 'button',
    children,
    ...rest
}: ButtonProps) {
    const baseClass = VARIANT_CLASSES[variant]
    const combinedClassName = [baseClass, className].filter(Boolean).join(' ')

    return (
        <button type={type} className={combinedClassName} {...rest}>
            {children}
        </button>
    )
}

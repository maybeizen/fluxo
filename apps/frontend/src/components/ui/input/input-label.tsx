import { ReactNode } from 'react'

interface InputLabelProps {
    children: ReactNode
    htmlFor?: string
    required?: boolean
    className?: string
}

export default function InputLabel({
    children,
    htmlFor,
    required = false,
    className = '',
}: InputLabelProps) {
    return (
        <label
            htmlFor={htmlFor}
            className={`mb-2 block text-sm font-medium text-neutral-300 ${className}`}
        >
            {children}
            {required && <span className="ml-1 text-red-300">*</span>}
        </label>
    )
}

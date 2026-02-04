import { forwardRef, InputHTMLAttributes } from 'react'
import InputError from './input-error'

interface InputProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'className'
> {
    error?: string
    className?: string
    inputClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, className = '', inputClassName = '', ...props }, ref) => {
        return (
            <div className={className}>
                <input
                    ref={ref}
                    className={`w-full rounded-md border bg-neutral-900/50 px-3 py-2 text-white placeholder-neutral-400 transition-colors duration-200 focus:ring-2 focus:outline-none ${
                        error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'focus:border-primary-300 focus:ring-primary-300 border-zinc-800'
                    } ${inputClassName} `}
                    {...props}
                />
                <InputError message={error} />
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import InputError from './input-error'

interface CheckboxProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type'
> {
    label?: ReactNode
    error?: string
    className?: string
    checkboxClassName?: string
    labelClassName?: string
    containerClassName?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            label,
            error,
            className = '',
            checkboxClassName = '',
            labelClassName = '',
            containerClassName = '',
            ...props
        },
        ref
    ) => {
        const checked = Boolean(props.checked)

        return (
            <div className={containerClassName}>
                <label
                    className={`flex cursor-pointer items-center gap-3 select-none ${className}`}
                >
                    <span className="relative flex items-center">
                        <input
                            ref={ref}
                            type="checkbox"
                            className="peer checked:border-primary-400 checked:bg-primary-400 focus:ring-primary-300/40 h-5 w-5 appearance-none rounded-md border border-white/20 bg-white/5 transition-all duration-200 outline-none focus:ring-2"
                            {...props}
                        />
                        <span
                            className={`pointer-events-none absolute top-0 left-0 flex h-5 w-5 items-center justify-center ${error ? 'border-primary-400 ring-primary-300/40 ring-2' : ''} ${checkboxClassName} `}
                        >
                            {checked && (
                                <i className="fas fa-check text-sm text-white" />
                            )}
                        </span>
                    </span>
                    {label && (
                        <span
                            className={`text-sm text-nowrap text-white ${labelClassName}`}
                        >
                            {label}
                        </span>
                    )}
                </label>
                {error && <InputError message={error} />}
            </div>
        )
    }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox

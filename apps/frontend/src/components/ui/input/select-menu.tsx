import { forwardRef, SelectHTMLAttributes } from 'react'
import InputError from './input-error'

interface SelectOption {
    value: string
    label: string
    disabled?: boolean
}

interface SelectMenuProps extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'className'
> {
    options: SelectOption[]
    error?: string
    className?: string
    selectClassName?: string
    placeholder?: string
}

const SelectMenu = forwardRef<HTMLSelectElement, SelectMenuProps>(
    (
        {
            options,
            error,
            className = '',
            selectClassName = '',
            placeholder,
            ...props
        },
        ref
    ) => {
        return (
            <div className={className}>
                <select
                    ref={ref}
                    className={`w-full rounded-md border bg-neutral-900/50 px-3 py-2 text-white transition-colors duration-200 focus:ring-2 focus:outline-none ${
                        error
                            ? 'border-primary-400 focus:border-primary-400 focus:ring-primary-400'
                            : 'focus:border-primary-300 focus:ring-primary-300 border-zinc-800'
                    } ${selectClassName} `}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            className="bg-neutral-800 text-white"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <InputError message={error} />
            </div>
        )
    }
)

SelectMenu.displayName = 'SelectMenu'

export default SelectMenu

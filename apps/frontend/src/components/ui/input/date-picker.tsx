import { forwardRef, InputHTMLAttributes } from 'react'
import InputError from './input-error'

interface DatePickerProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'className'
> {
    error?: string
    className?: string
    inputClassName?: string
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
    ({ error, className = '', inputClassName = '', ...props }, ref) => {
        return (
            <div className={className}>
                <input
                    ref={ref}
                    type="date"
                    className={`w-full rounded-md border bg-neutral-900/50 px-3 py-2 text-white placeholder-neutral-400 [color-scheme:dark] transition-colors duration-200 focus:ring-2 focus:outline-none ${
                        error
                            ? 'border-primary-400 focus:border-primary-400 focus:ring-primary-400'
                            : 'focus:border-primary-300 focus:ring-primary-300 border-zinc-800'
                    } ${inputClassName} `}
                    {...props}
                />
                <InputError message={error} />
            </div>
        )
    }
)

DatePicker.displayName = 'DatePicker'

export default DatePicker

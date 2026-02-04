import { forwardRef, TextareaHTMLAttributes } from 'react'
import InputError from './input-error'

interface TextAreaProps extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'className'
> {
    error?: string
    className?: string
    textareaClassName?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ error, className = '', textareaClassName = '', ...props }, ref) => {
        return (
            <div className={className}>
                <textarea
                    ref={ref}
                    className={`focus:ring-none resize-vertical w-full rounded-md border bg-neutral-900/50 px-3 py-2 text-white placeholder-neutral-400 transition-colors duration-200 focus:outline-none ${
                        error
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                            : 'focus:border-primary-300 focus:ring-primary-300 border-zinc-800'
                    } ${textareaClassName} `}
                    {...props}
                />
                <InputError message={error} />
            </div>
        )
    }
)

TextArea.displayName = 'TextArea'

export default TextArea

import { useState, useCallback } from 'react'
import { z, ZodSchema } from 'zod'

type ValidationErrors<T> = Partial<Record<keyof T, string>>

export default function useFormValidation<T extends Record<string, unknown>>(
    schema: ZodSchema<T>
) {
    const [errors, setErrors] = useState<ValidationErrors<T>>({})

    const validateField = useCallback(
        (fieldName: keyof T, value: unknown) => {
            try {
                const fieldSchema = (
                    schema as { shape?: Record<string, ZodSchema> }
                ).shape?.[fieldName as string]
                if (fieldSchema) {
                    fieldSchema.parse(value)
                }

                setErrors((prev) => {
                    const newErrors = { ...prev }
                    delete newErrors[fieldName]
                    return newErrors
                })

                return true
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const firstError = error.issues[0]
                    setErrors((prev) => ({
                        ...prev,
                        [fieldName]: firstError.message,
                    }))
                }
                return false
            }
        },
        [schema]
    )

    const validateAllFields = useCallback(
        (values: T) => {
            try {
                schema.parse(values)
                setErrors({})
                return { isValid: true, errors: {} }
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const newErrors: ValidationErrors<T> = {}

                    const errorsByField = new Map<string, string>()
                    error.issues.forEach((issue) => {
                        const fieldKey = issue.path[0] as keyof T
                        if (
                            fieldKey &&
                            !errorsByField.has(fieldKey as string)
                        ) {
                            errorsByField.set(fieldKey as string, issue.message)
                        }
                    })

                    errorsByField.forEach((message, field) => {
                        newErrors[field as keyof T] = message
                    })

                    setErrors(newErrors)
                    return { isValid: false, errors: newErrors }
                }
            }
            return { isValid: false, errors: {} }
        },
        [schema]
    )

    const clearErrors = useCallback(() => {
        setErrors({})
    }, [])

    const clearFieldError = useCallback((fieldName: keyof T) => {
        setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[fieldName]
            return newErrors
        })
    }, [])

    return {
        errors,
        validateField,
        validateAllFields,
        clearErrors,
        clearFieldError,
    }
}

import type { ZodError } from 'zod'

export function formatZodErrors(error: ZodError) {
    return error.issues.map((err) => ({
        field: err.path.map(String).join('.'),
        message: err.message,
    }))
}

interface ApiError {
    message?: string
    errors?: Array<{ message?: string } | string>
}

function isApiError(response: unknown): response is ApiError {
    return (
        typeof response === 'object' &&
        response !== null &&
        ('message' in response || 'errors' in response)
    )
}

export const parseApiError = (response: unknown): string => {
    if (!response) return 'An unexpected error occurred.'

    if (!isApiError(response)) {
        return 'An unexpected error occurred.'
    }

    if (response.errors && Array.isArray(response.errors)) {
        return response.errors
            .map((err) => {
                if (
                    typeof err === 'object' &&
                    err !== null &&
                    'message' in err
                ) {
                    return err.message || String(err)
                }
                return String(err)
            })
            .join(', ')
    }

    if (response.message) return response.message

    return 'Request failed'
}

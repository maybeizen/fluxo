import axios, { AxiosError } from 'axios'
import { parseApiError } from './parse-api-error'

export const postWithErrors = async <T = unknown>(
    url: string,
    payload: unknown
): Promise<{ data?: T; error?: string }> => {
    try {
        const response = await axios.post(url, payload, {
            validateStatus: () => true,
            withCredentials: true,
        })

        if (
            (response.status === 200 || response.status === 201) &&
            response.data?.success
        ) {
            return { data: response.data }
        }

        return { error: parseApiError(response.data) }
    } catch (err: unknown) {
        if (err instanceof AxiosError && err.response?.data) {
            return { error: parseApiError(err.response.data) }
        }
        return { error: 'Unexpected error' }
    }
}

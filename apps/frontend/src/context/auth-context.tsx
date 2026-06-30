'use client'

import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useContext,
} from 'react'
import { type User } from '@fluxo/types'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    logout: () => Promise<void>
    refreshAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    logout: async () => {},
    refreshAuth: async () => {},
})

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<User | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const checkAuth = useCallback(async () => {
        try {
            const response = await apiClient.get('/auth/me')
            if (response.data.success && response.data.user) {
                setUser(response.data.user)
                setIsAuthenticated(true)
            } else {
                setUser(null)
                setIsAuthenticated(false)
            }
        } catch {
            setUser(null)
            setIsAuthenticated(false)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    const logout = async () => {
        try {
            await apiClient.post('/auth/logout')
            router.push('/auth/login')
        } catch (error) {
            console.error('Error during logout:', error)
        } finally {
            setUser(null)
            setIsAuthenticated(false)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                logout,
                refreshAuth: checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}

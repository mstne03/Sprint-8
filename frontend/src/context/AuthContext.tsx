import { createContext, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuth as useAuthHooks } from '@/features/auth/hooks'
import { supabase } from '@/config/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { authKeys } from '@/features/auth/hooks'

interface AuthContextType {
    user: any | null
    session: any | null
    signUp: (email: string, password: string, userData?: any) => Promise<any>
    signIn: (email: string, password: string) => Promise<any>
    signOut: () => Promise<void>
    loading: boolean
    isAuthenticated: boolean
    isSigningIn: boolean
    isSigningUp: boolean
    isSigningOut: boolean
    signInError: any
    signUpError: any
    signOutError: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const queryClient = useQueryClient()
    const auth = useAuthHooks()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event, session)
                
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    queryClient.setQueryData(authKeys.session(), {
                        data: { session },
                        error: null
                    })
                    if (session?.user) {
                        queryClient.setQueryData(authKeys.user(), {
                            data: { user: session.user },
                            error: null
                        })
                    }
                } else if (event === 'SIGNED_OUT') {
                    queryClient.removeQueries({ queryKey: authKeys.all })
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [queryClient])

    const signUpWrapper = async (email: string, password: string, userData?: any) => {
        try {
            const result = await auth.signUp({ email, password, userData })
            return result
        } catch (error) {
            throw error
        }
    }

    const signInWrapper = async (email: string, password: string) => {
        try {
            const result = await auth.signIn({ email, password })
            return result
        } catch (error) {
            throw error
        }
    }

    const signOutWrapper = async () => {
        try {
            await auth.signOut()
        } catch (error) {
            throw error
        }
    }

    const value: AuthContextType = {
        user: auth.user,
        session: auth.session,
        signUp: signUpWrapper,
        signIn: signInWrapper,
        signOut: signOutWrapper,
        loading: auth.isLoading || auth.isSigningIn || auth.isSigningUp || auth.isSigningOut,
        isAuthenticated: auth.isAuthenticated,
        isSigningIn: auth.isSigningIn,
        isSigningUp: auth.isSigningUp,
        isSigningOut: auth.isSigningOut,
        signInError: auth.signInError,
        signUpError: auth.signUpError,
        signOutError: auth.signOutError,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
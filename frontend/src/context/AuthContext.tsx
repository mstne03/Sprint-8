import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/config/supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    signUp: (email: string, password: string, userData?: any) => Promise<any>
    signIn: (email: string, password: string) => Promise<any>
    signOut: () => Promise<void>
    loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()
            
            if (error) {
                console.error('Error getting session:', error)
            } else {
                setSession(session)
                setUser(session?.user ?? null)
            }
            setLoading(false)
        }

        getInitialSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event, session)
                
                if (event === 'SIGNED_IN') {
                    setSession(session)
                    setUser(session?.user ?? null)
                } else if (event === 'SIGNED_OUT') {
                    setSession(null)
                    setUser(null)
                } else if (event === 'TOKEN_REFRESHED') {
                    setSession(session)
                    setUser(session?.user ?? null)
                }
                
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email: string, password: string, userData?: any) => {
        try {
            setLoading(true)
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData || {},
                    emailRedirectTo: `${window.location.origin}/auth/confirm`
                }
            })

            if (error) {
                throw error
            }

            return { data, error: null }
        } catch (error) {
            console.error('Error signing up:', error)
            return { data: null, error }
        } finally {
            setLoading(false)
        }
    }

    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true)
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            console.error('Error signing in:', error)
            return { data: null, error }
        } finally {
            setLoading(false)
        }
    }

    const signOut = async () => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (error) {
            console.error('Error signing out:', error)
        } finally {
            setLoading(false)
        }
    }

    const value = {
        user,
        session,
        signUp,
        signIn,
        signOut,
        loading
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
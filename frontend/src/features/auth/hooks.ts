import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/authService'

// Query Keys
export const authKeys = {
    all: ['auth'] as const,
    session: () => [...authKeys.all, 'session'] as const,
    user: () => [...authKeys.all, 'user'] as const,
}

// Hook para obtener la sesión actual
export const useSession = () => {
    return useQuery({
        queryKey: authKeys.session(),
        queryFn: authService.getSession,
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
        retry: 1,
        select: (data) => ({
            session: data.data.session,
            error: data.error
        })
    })
}

// Hook para obtener el usuario actual
export const useCurrentUser = () => {
    return useQuery({
        queryKey: authKeys.user(),
        queryFn: authService.getCurrentUser,
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
        retry: 1,
        select: (data) => ({
            user: data.data.user,
            error: data.error
        })
    })
}

// Hook para sign up
export const useSignUp = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async ({ email, password, userData }: {
            email: string;
            password: string;
            userData?: any;
        }) => {
            const result = await authService.signUp(email, password, userData)
            
            // Si hay un error de Supabase, lanzarlo para que React Query lo maneje
            if (result.error) {
                throw result.error
            }
            
            return result
        },
        onSuccess: (data) => {
            if (data.data && !data.error) {
                // Invalidar queries relacionadas con auth
                queryClient.invalidateQueries({ queryKey: authKeys.all })
            }
        },
        onError: (error) => {
            console.error('Sign up mutation error:', error)
        }
    })
}

// Hook para sign in
export const useSignIn = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async ({ email, password }: {
            email: string;
            password: string;
        }) => {
            const result = await authService.signIn(email, password)
            
            // Si hay un error de Supabase, lanzarlo para que React Query lo maneje
            if (result.error) {
                throw result.error
            }
            
            return result
        },
        onSuccess: (data) => {
            if (data.data && !data.error) {
                // Invalidar y refetch de todas las queries de auth
                queryClient.invalidateQueries({ queryKey: authKeys.all })
                queryClient.refetchQueries({ queryKey: authKeys.session() })
                queryClient.refetchQueries({ queryKey: authKeys.user() })
            }
        },
        onError: (error) => {
            console.error('Sign in mutation error:', error)
        }
    })
}

// Hook para sign out
export const useSignOut = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: authService.signOut,
        onSuccess: (data) => {
            if (!data.error) {
                // Limpiar todo el cache de auth
                queryClient.removeQueries({ queryKey: authKeys.all })
                queryClient.clear() // Opcional: limpiar todo el cache
            }
        },
        onError: (error) => {
            console.error('Sign out error:', error)
        }
    })
}

// Hook para refresh session
export const useRefreshSession = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: authService.refreshSession,
        onSuccess: (data) => {
            if (data.data.session && !data.error) {
                // Actualizar cache con nueva sesión
                queryClient.setQueryData(authKeys.session(), data)
                queryClient.invalidateQueries({ queryKey: authKeys.user() })
            }
        },
        onError: (error) => {
            console.error('Refresh session error:', error)
        }
    })
}

// Hook compuesto que combina session y user para facilitar el uso
export const useAuth = () => {
    const sessionQuery = useSession()
    const userQuery = useCurrentUser()
    const signInMutation = useSignIn()
    const signUpMutation = useSignUp()
    const signOutMutation = useSignOut()
    const refreshMutation = useRefreshSession()

    return {
        // Datos
        session: sessionQuery.data?.session || null,
        user: userQuery.data?.user || null,
        
        // Estados de loading
        isLoading: sessionQuery.isLoading || userQuery.isLoading,
        loading: signInMutation.isPending, // Para compatibilidad con componente Login
        isSigningIn: signInMutation.isPending,
        isSigningUp: signUpMutation.isPending,
        isSigningOut: signOutMutation.isPending,
        
        // Estados de error
        sessionError: sessionQuery.data?.error || null,
        userError: userQuery.data?.error || null,
        signInError: signInMutation.error,
        signUpError: signUpMutation.error,
        signOutError: signOutMutation.error,
        
        // Acciones
        signIn: signInMutation.mutateAsync,
        signUp: signUpMutation.mutateAsync,
        signOut: signOutMutation.mutateAsync,
        refreshSession: refreshMutation.mutateAsync,
        
        // Utilidades
        isAuthenticated: !!sessionQuery.data?.session && !!userQuery.data?.user,
        
        // Para refetch manual si es necesario
        refetchSession: sessionQuery.refetch,
        refetchUser: userQuery.refetch,
    }
}
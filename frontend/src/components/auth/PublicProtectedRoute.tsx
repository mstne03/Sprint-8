import { Navigate, useLocation } from 'react-router-dom'
import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { LoadingSpinner } from '@/components/ui'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <LoadingSpinner />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}

export const PublicRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <LoadingSpinner />
            </div>
        )
    }

    if (user) {
        return <Navigate to="/leagues" replace />
    }

    return <>{children}</>
}
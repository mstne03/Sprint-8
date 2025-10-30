import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { User, Session, OAuthResponse } from '@supabase/supabase-js'

vi.mock('@/core/services/env', () => ({
    ENV: {
        APP_URL: 'http://localhost:5173',
        SUPABASE_URL: 'http://localhost:54321',
        SUPABASE_ANON_KEY: 'mock-anon-key'
    }
}))

vi.mock('@/core/config/supabase', () => ({
    supabase: {
        auth: {
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
            signInWithOAuth: vi.fn(),
            signOut: vi.fn(),
            getSession: vi.fn(),
            getUser: vi.fn(),
            refreshSession: vi.fn(),
        },
    },
}))

import { authService } from '@/core/services'
import { supabase } from '@/core/config/supabase'
import { ENV } from '@/core/services/env'

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    }) //mocks son stateful
    
    const fakeUserName = 'testuser'
    const fakeFullName = 'Test User'
    const fakeEmail = 'test@example.com'
    const fakePassword = '123456'

    const mockUser = {
        id: '123e4567',
        email: fakeEmail,
        created_at: '2025-01-01T00:00:00.000Z',
        user_metadata: {
            username: fakeUserName,
            full_name: fakeFullName,
        },
        app_metadata: {},
        aud: 'authenticated',
        role: 'authenticated',
    } as User

    const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
    } as Session

    const mockOAuthResponse: OAuthResponse = {
        data: {
            provider: 'google',
            url: 'https://fake/redirect/url/oauth?authorize=123456'
        },
        error: null,
    }

    describe('signUp', () => {
        it('should return session on success', async () => {
            vi.mocked(supabase.auth.signUp).mockResolvedValue({
                data: { user: mockUser, session: mockSession },
                error: null
            })

            const result = await authService.signUp(
                fakeEmail,
                fakePassword,
                { username: fakeUserName }
            )

            expect(result.data.user).toEqual(mockUser)
            expect(result.data.session).toEqual(mockSession)
            expect(result.error).toBeNull()

            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: fakeEmail,
                password: fakePassword,
                options: {
                    data: { username: fakeUserName },
                    emailRedirectTo: `${ENV.APP_URL}/auth/confirm`
                }
            })
        })
    })

    describe('signInWithPassword', () => {
        it('should return logged in session and a user', async () => {
            vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
                data: { user: mockUser, session: mockSession },
                error: null,
            })

            const result = await authService.signIn(
                fakeEmail,
                fakePassword,
            )

            expect(result.data.user).toEqual(mockUser)
            expect(result.data.session).toEqual(mockSession)
            expect(result.error).toBeNull()

            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: fakeEmail,
                password: fakePassword,
            })
        })
    })

    describe('signInWithGoogle', () => {
        it('should initiate OAuth workFlow', async () => {
            vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue(mockOAuthResponse)

            const result = await authService.signInWithGoogle()

            expect(result.data.provider).toEqual('google')
            expect(result.data.url).toEqual(mockOAuthResponse.data.url)
            expect(result.error).toBe(null)
        })
    })

    describe('signOut', () => {
        it('should remove the logged in user from the browser session', async () => {
            vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
                data: { session: mockSession },
                error: null
            })
            
            vi.mocked(supabase.auth.signOut).mockResolvedValue({
                error: null
            })

            vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
                data: { session: null },
                error: null
            })

            const sessionBefore = await authService.getSession()
            expect(sessionBefore.data.session).not.toBeNull()

            const result = await authService.signOut()
            expect(result.error).toBe(null)

            const sessionAfter = await authService.getSession()
            expect(sessionAfter.data.session).toBeNull()

            expect(supabase.auth.signOut).toHaveBeenCalledWith()
        })
    })
})
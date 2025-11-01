import { Route, Routes } from "react-router-dom";
import { AuthProvider } from '@/core/contexts/AuthContext';
import { LeaguesProvider } from '@/core/contexts/LeaguesContext';
import { ProtectedRoute, PublicRoute } from '@/features/Auth/components';
import DataServiceProvider from '@/core/contexts/ServiceProvider'
import NotFound from '@/core/views/NotFound'
import Login from '@/features/Auth/views/Login'
import Register from '@/features/Auth/views/Register'
import EmailConfirmation from '@/features/Auth/views/EmailConfirmation'
import CheckEmail from '@/features/Auth/views/CheckEmail'
import { Header } from "@/layouts"
import Home from "@/core/views/Home";
import Leagues from "@/features/League/views/Leagues";
import LeagueDetail from "@/features/League/views/LeagueDetail";
import Market from "@/features/Market/views/Market";
import { MarketProvider } from "./core/contexts/MarketContext";

function AppRouter() {
  return (
    <AuthProvider>
      <LeaguesProvider>
          <DataServiceProvider>
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/check-email" element={<CheckEmail />} />
              <Route path="/auth/confirm" element={<EmailConfirmation />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <Header />
                  <Routes>
                    <Route path="/leagues/:leagueId/market" element={
                      <MarketProvider>
                        <Market/>
                      </MarketProvider>
                    }/>
                    <Route path="/leagues/:leagueId" element={<LeagueDetail/>}/>
                    <Route path="/leagues" element={<Leagues/>}/>
                    <Route path="*" element={<NotFound/>}/>
                  </Routes>
                </ProtectedRoute>
              }/>
            </Routes>
          </DataServiceProvider>
      </LeaguesProvider>
    </AuthProvider>
  )
}

export default AppRouter

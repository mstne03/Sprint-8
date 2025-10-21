import { Route, Routes } from "react-router-dom";
import { AuthProvider } from '@/context/AuthContext';
import { LeaguesProvider } from '@/context/LeaguesContext';
import { ProtectedRoute, PublicRoute } from '@/components/auth';
import DataServiceProvider from '@/context/ServiceProvider'
import Teams from '@/pages/Teams'
import Map from '@/pages/Map'
import NotFound from '@/pages/NotFound'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import EmailConfirmation from '@/pages/EmailConfirmation'
import CheckEmail from '@/pages/CheckEmail'
import { Header } from "@/components/layout"
import Home from "@/pages/Home";
import Leagues from "@/pages/Leagues";
import LeagueDetail from "@/pages/LeagueDetail";
import Market from "@/pages/Market";
import CalendarPage from "@/pages/CalendarPage";
import MarketNew from "@/pages/Market";

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
                    <Route path="/leagues/:leagueId/market" element={<Market/>}/>
                    <Route path="/leagues/:leagueId" element={<LeagueDetail/>}/>
                    <Route path="/leagues" element={<Leagues/>}/>
                    <Route path="/my-teams" element={<Teams/>}/>
                    <Route path="/map" element={<Map/>}/>
                    <Route path="/calendar" element={<CalendarPage/>}/>
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

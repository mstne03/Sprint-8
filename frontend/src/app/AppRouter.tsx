import { Route, Routes } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import { LeaguesProvider } from '@/contexts/LeaguesContext';
import { ProtectedRoute, PublicRoute } from '@/components/auth/PublicProtectedRoute';
import DataServiceProvider from '@/providers/ServiceProvider'
import DriversServiceProvider from '@/providers/TableProvider'
import Teams from '@/pages/Teams'
import Charts from '@/pages/ChartPage'
import Map from '@/pages/Map'
import NotFound from '@/pages/NotFound'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import EmailConfirmation from '@/pages/EmailConfirmation'
import CheckEmail from '@/pages/CheckEmail'
import Header from "@/components/layout/Header"
import Home from "@/pages/Home";
import Leagues from "@/pages/Leagues";
import LeagueDetail from "@/pages/LeagueDetail";
import TeamBuilder from "@/pages/TeamBuilder";
import CalendarPage from "@/pages/CalendarPage";

function AppRouter() {
  return (
    <AuthProvider>
      <LeaguesProvider>
        <DriversServiceProvider>
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
                    <Route path="/leagues/:leagueId/team-builder" element={<TeamBuilder/>}/>
                    <Route path="/leagues/:leagueId" element={<LeagueDetail/>}/>
                    <Route path="/leagues" element={<Leagues/>}/>
                    <Route path="/my-teams" element={<Teams/>}/>
                    <Route path="/charts" element={<Charts/>}/>
                    <Route path="/map" element={<Map/>}/>
                    <Route path="/calendar" element={<CalendarPage/>}/>
                    <Route path="*" element={<NotFound/>}/>
                  </Routes>
                </ProtectedRoute>
              }/>
            </Routes>
          </DataServiceProvider>
        </DriversServiceProvider>
      </LeaguesProvider>
    </AuthProvider>
  )
}

export default AppRouter

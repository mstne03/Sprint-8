import { Route, Routes } from "react-router-dom";
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import DataServiceProvider from '@/providers/ServiceProvider'
import DriversServiceProvider from '@/providers/TableProvider'
import { PicksProvider } from '@/context/PicksContext'
import Picks from '@/pages/Picks/Picks'
import Teams from '@/pages/Teams/Teams'
import Charts from '@/pages/ChartPage/ChartPage'
import Map from '@/pages/Map/Map'
import FullCalendar from '@/pages/FullCalendar/FullCalendar'
import NotFound from '@/pages/NotFound/NotFound'
import Login from '@/pages/Login/Login'
import Register from '@/pages/Register/Register'
import EmailConfirmation from '@/pages/EmailConfirmation/EmailConfirmation'
import CheckEmail from '@/pages/CheckEmail/CheckEmail'
import Header from "@/components/Header/Header"
import Home from "@/pages/Home/Home";

function AppRouter() {
  return (
    <AuthProvider>
      <PicksProvider>
        <DriversServiceProvider>
          <DataServiceProvider>
            <Routes>
              <Route path="/" element={
                <PublicRoute>
                  <Home/>
                </PublicRoute>
              }/>
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
              <Route path="/auth/confirm" element={<EmailConfirmation />} />
              <Route path="/check-email" element={<CheckEmail />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <Header />
                  <Routes>
                    <Route path="/picks" element={<Picks/>}/>
                    <Route path="/teams" element={<Teams/>}/>
                    <Route path="/charts" element={<Charts/>}/>
                    <Route path="/map" element={<Map/>}/>
                    <Route path="/calendar" element={<FullCalendar/>}/>
                    <Route path="*" element={<NotFound/>}/>
                  </Routes>
                </ProtectedRoute>
              }/>
            </Routes>
          </DataServiceProvider>
        </DriversServiceProvider>
      </PicksProvider>
    </AuthProvider>
  )
}

export default AppRouter

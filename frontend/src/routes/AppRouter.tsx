import { Route, Routes } from "react-router-dom";
import Home from '@/pages/Home/Home'
import Picks from '@/pages/Picks/Picks'
import Charts from '@/pages/ChartPage/ChartPage'
import Map from '@/pages/Map/Map'
import FullCalendar from '@/pages/FullCalendar/FullCalendar'
import NotFound from '@/pages/NotFound/NotFound'
import Header from "@/components/Header/Header"

function AppRouter() {

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/picks" element={<Picks/>}/>
        <Route path="/charts" element={<Charts/>}/>
        <Route path="/map" element={<Map/>}/>
        <Route path="/calendar" element={<FullCalendar/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </>
  )
}

export default AppRouter

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import Charts from './pages/Charts/Charts'
import Map from './pages/Map/Map'
import FullCalendar from './pages/FullCalendar/FullCalendar'
import NotFound from './pages/NotFound/NotFound'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {path:"/", element: <App/>},
  {path:"/map", element: <Map/>},
  {path:"/charts", element: <Charts/>},
  {path:"/calendar", element: <FullCalendar/>},
  {path:"*", element: <NotFound/>}
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)

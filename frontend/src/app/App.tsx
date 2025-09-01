import Home from '../pages/Home/Home'
import ThemeProvider from '../context/Theme/Theme'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Charts from '../pages/Charts/Charts'
import Map from '../pages/Map/Map'
import FullCalendar from '../pages/FullCalendar/FullCalendar'
import NotFound from '../pages/NotFound/NotFound'

const router = createBrowserRouter([
  {path:"/", element: <Home/>},
  {path:"/map", element: <Map/>},
  {path:"/charts", element: <Charts/>},
  {path:"/calendar", element: <FullCalendar/>},
  {path:"*", element: <NotFound/>}
]);

function App() {

  return (
    <ThemeProvider>
      <RouterProvider router={router}/>
    </ThemeProvider>
  )
}

export default App

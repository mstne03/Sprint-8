import { Link } from 'react-router-dom'
import F1Logo from '../../assets/Racing_Fan_Logo.png'

export default function Header () {
    return (
        <header className="py-5 px-20 flex justify-between items-center border-b-2 border-b-amber-50/10">
            <span className="hover:scale-120 transition-all ease-in-out duration-300 hover:cursor-pointer active:scale-90">
                <img 
                    className="max-w-15 rounded-2xl shadow-solid"
                    src={F1Logo} 
                    alt="page_logo"
                />
            </span>

            <nav>
                <ul className="flex gap-10">
                    <Link className="hover:text-red-600 active:backdrop-opacity-5 transition-all ease-in-out" to={`/`}>
                        <h2>Home</h2>
                    </Link>
                    <Link className="hover:text-red-600 active:backdrop-opacity-5 transition-all ease-in-out" to={`/map`}>
                        <h2>Map</h2>
                    </Link>
                    <Link className="hover:text-red-600 active:backdrop-opacity-5 transition-all ease-in-out" to={`/charts`}>
                        <h2>Charts</h2>
                    </Link>
                    <Link className="hover:text-red-600 active:backdrop-opacity-5 transition-all ease-in-out" to={`/calendar`}>
                        <h2>Calendar</h2>
                    </Link>
                </ul>
            </nav>
        </header>
    )
}

import { Link } from 'react-router-dom'
import F1Logo from '@/assets/gridfans_logo.svg'

export default function Header () {
    return (
        <header className="py-5 px-20 flex justify-between items-center border-b-2 border-white/45 text-white">
            <span className="hover:scale-120 transition-all ease-in-out duration-300 hover:cursor-pointer active:scale-90">
                <Link to="/">
                    <img 
                        className="max-w-30"
                        src={F1Logo}
                        alt="page_logo"
                    />
                </Link>
            </span>

            <nav>
                <ul className="flex gap-10">
                    <Link className="hover:text-red-400 active:backdrop-opacity-5 transition-all ease-in-out" to={`/picks`}>
                        <h2>Picks</h2>
                    </Link>
                    <Link className="hover:text-red-400 active:backdrop-opacity-5 transition-all ease-in-out" to={`/map`}>
                        <h2>Map</h2>
                    </Link>
                    <Link className="hover:text-red-400 active:backdrop-opacity-5 transition-all ease-in-out" to={`/charts`}>
                        <h2>Charts</h2>
                    </Link>
                    <Link className="hover:text-red-400 active:backdrop-opacity-5 transition-all ease-in-out" to={`/calendar`}>
                        <h2>Calendar</h2>
                    </Link>
                </ul>
            </nav>
        </header>
    )
}

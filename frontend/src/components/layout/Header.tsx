import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import F1Logo from '@/assets/gridfans_logo.svg'
import { CustomButton } from '@/components/ui'
import { useLocation } from 'react-router-dom'

export const Header = () => {
    const { user, signOut } = useAuth()
    const location = useLocation()

    const isActiveRoute = (path: string) => {
        return location.pathname === path;
    }

    const leaguesActive = isActiveRoute('/leagues') ? 'text-red-500' : ''
    const teamsActive = isActiveRoute('/my-teams') ? 'text-red-500' : ''
    const calendarActive = isActiveRoute('/calendar') ? 'text-red-500' : ''

    const handleLogout = async () => {
        try {
            await signOut()
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return (
        <header className="py-5 px-10 flex justify-between items-center text-white md:h-25">
            <span className="hover:scale-120 transition-all ease-in-out duration-300 hover:cursor-pointer active:scale-90">
                <Link to="/">
                    <img 
                        className="max-w-25"
                        src={F1Logo}
                        alt="page_logo"
                    />
                </Link>
            </span>
            <nav className="flex items-center text-[90%] gap-10">
                <ul className="flex gap-10">
                    <Link className={`
                        hover:text-red-600 active:backdrop-opacity-5 
                        transition-all ease-in-out
                        ${leaguesActive}
                        `
                    } to={`/leagues`}>
                        <h2>Leagues</h2>
                    </Link>
                    <Link className={`
                        hover:text-red-600 active:backdrop-opacity-5 
                        transition-all ease-in-out
                        ${teamsActive}
                        `
                    } to={`/my-teams`}>
                        <h2>Teams</h2>
                    </Link>
                    <Link className={`
                        hover:text-red-600 active:backdrop-opacity-5 
                        transition-all ease-in-out
                        ${calendarActive}
                        `
                    } to={`/calendar`}>
                        <h2>Calendar</h2>
                    </Link>
                </ul>
                <div className="flex text-[80%] items-center gap-4 ml-6 pl-6 border-l border-gray-600">
                    <span className="text-sm text-gray-300">
                        {user?.user_metadata?.username || user?.user_metadata?.full_name.split(" ")[0] || user?.email}
                    </span>
                    <CustomButton
                        onClick={handleLogout}
                    >
                        Logout
                    </CustomButton>
                </div>
            </nav>
        </header>
    )
}

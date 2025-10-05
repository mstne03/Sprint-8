
import { useTeamBuilderContext } from "@/contexts/TeamBuilderContext";

const BuilderSearch = () => {
    const { searchFilter, setSearchFilter } = useTeamBuilderContext();
    return (
        <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Drivers & Constructors
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search by driver name or team..."
                    className="w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
                <svg 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                </svg>
                {searchFilter && (
                    <button
                        onClick={() => setSearchFilter('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-600/50 transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
            {searchFilter && (
                <p className="text-sm text-gray-400 mt-2">
                    Showing results for "<span className="text-white">{searchFilter}</span>"
                </p>
            )}
        </div>
    )
}

export default BuilderSearch;
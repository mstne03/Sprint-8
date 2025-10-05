export const compareStatsTableProps = (
    prevProps: {
        season_results: {
            victories: number;
            poles: number;
            podiums: number;
        };
        fantasy_stats: {
            avg_finish: number;
            avg_grid_position: number;
            pole_win_conversion: number;
        };
    },
    nextProps: {
        season_results: {
            victories: number;
            poles: number;
            podiums: number;
        };
        fantasy_stats: {
            avg_finish: number;
            avg_grid_position: number;
            pole_win_conversion: number;
        };
    }
): boolean => {
    const seasonEqual = 
        prevProps.season_results.victories === nextProps.season_results.victories &&
        prevProps.season_results.poles === nextProps.season_results.poles &&
        prevProps.season_results.podiums === nextProps.season_results.podiums;
    
    const fantasyEqual = 
        prevProps.fantasy_stats.avg_finish === nextProps.fantasy_stats.avg_finish &&
        prevProps.fantasy_stats.avg_grid_position === nextProps.fantasy_stats.avg_grid_position &&
        prevProps.fantasy_stats.pole_win_conversion === nextProps.fantasy_stats.pole_win_conversion;
    
    return seasonEqual && fantasyEqual;
};

export const compareNumericObjects = <T extends Record<string, number>>(
    prevObj: T,
    nextObj: T
): boolean => {
    const prevKeys = Object.keys(prevObj);
    const nextKeys = Object.keys(nextObj);
    
    if (prevKeys.length !== nextKeys.length) {
        return false;
    }
    
    return prevKeys.every(key => 
        nextKeys.includes(key) && prevObj[key] === nextObj[key]
    );
};

export const compareNestedObjects = <T extends Record<string, Record<string, any>>>(
    prevObj: T,
    nextObj: T
): boolean => {
    const prevKeys = Object.keys(prevObj);
    const nextKeys = Object.keys(nextObj);
    
    if (prevKeys.length !== nextKeys.length) {
        return false;
    }
    
    return prevKeys.every(key => {
        if (!nextKeys.includes(key)) return false;
        
        const prevNested = prevObj[key];
        const nextNested = nextObj[key];
        
        const prevNestedKeys = Object.keys(prevNested);
        const nextNestedKeys = Object.keys(nextNested);
        
        if (prevNestedKeys.length !== nextNestedKeys.length) return false;
        
        return prevNestedKeys.every(nestedKey =>
            nextNestedKeys.includes(nestedKey) && 
            prevNested[nestedKey] === nextNested[nestedKey]
        );
    });
};
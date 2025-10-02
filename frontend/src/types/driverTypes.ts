export type Driver = {
  id: number;
  driver_number: number;
  full_name: string;
  acronym: string;
  team_name: string;
  driver_color: string;
  country_code: string;
  headshot_url: string;
  season_results: {
    points: number;
    poles: number;
    podiums: number;
    fastest_laps: number;
    victories: number;
    sprint_podiums: number;
    sprint_victories: number;
    sprint_poles: number;
  };
  fantasy_stats: {
    avg_finish: number; 
    avg_grid_position: number; 
    pole_win_conversion: number; 
    price: number;
    overtake_efficiency: number;
    available_points_percentatge: number;
  }
}

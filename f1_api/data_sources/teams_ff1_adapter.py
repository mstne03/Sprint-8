import fastf1 as ff1
from typing import List, Optional
import logging
from f1_api.data_sources.ff1_client import FastF1Client
from f1_api.models.f1_schemas import Teams

class TeamsDataSource:
    """FastF1 data source for teams information"""

    def __init__(self):
        self.client = FastF1Client()
    
    def get_team_data(schedule, session_map, session) -> List[Teams]:
        
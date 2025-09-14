import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine
from f1_api.models.f1_models import Drivers, Teams, Seasons, Sessions, Events, EventSessionLink, SessionDriverLink, SessionTeamLink, SessionResult

load_dotenv()

sqlite_url = f"mysql+mysqlconnector://root:{os.environ['DB_PASSWORD']}@localhost/{os.environ['DATABASE']}"

engine = create_engine(sqlite_url, echo=True)

def create_models():
    SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    create_models()

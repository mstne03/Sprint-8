import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel
from urllib.parse import quote_plus
from f1_api.models.f1_models import *
from f1_api.models.app_models import *

# Load environment variables first
load_dotenv(r'C:/Users/Marc/Documents/ITA/Sprint 8/f1_api/.env')

# Fetch variables
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

encoded_password = quote_plus(PASSWORD) if PASSWORD else ""
DATABASE_URL = f"postgresql+psycopg2://{USER}:{encoded_password}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

engine = create_engine(DATABASE_URL, poolclass=NullPool)

def recreate_league_tables():
    """
    Drop and recreate league-related tables to update schema
    """
    try:
        with engine.connect() as connection:
            # Drop tables in correct order (child tables first)
            drop_queries = [
                "DROP TABLE IF EXISTS userleaguelink CASCADE;",
                "DROP TABLE IF EXISTS userteams CASCADE;", 
                "DROP TABLE IF EXISTS leagues CASCADE;"
            ]
            
            for query in drop_queries:
                connection.execute(text(query))
                print(f"Executed: {query}")
            
            connection.commit()
            print("Old tables dropped successfully!")
            
        # Recreate tables with new schema
        SQLModel.metadata.create_all(engine)
        print("Tables recreated successfully with updated schema!")
        
    except Exception as e:
        print(f"Failed to recreate tables: {e}")
        raise

if __name__ == "__main__":
    recreate_league_tables()
import os
from dotenv import load_dotenv
import mysql.connector

load_dotenv()

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password=os.environ["DB_PASSWORD"]
)

mycursor = mydb.cursor()

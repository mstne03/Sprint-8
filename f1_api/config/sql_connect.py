import os
from dotenv import load_dotenv
import mysql.connector

load_dotenv(r'C:/Users/Marc/Documents/ITA/Sprint 7/f1_api/.env')

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password=os.environ.get("DB_PASSWORD", "MserrM76685")
)

mycursor = mydb.cursor()

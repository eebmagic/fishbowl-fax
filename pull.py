import pymongo
import json
import os
import dotenv
dotenv.load_dotenv()
mongo_uri = os.getenv('MONGO_URI')

# MongoDB setup (replace with your actual connection details)
client = pymongo.MongoClient(mongo_uri)
db = client['fishbowl-fax']
collection = db['messages']

# Query for documents where 'printed' is false
query = {"printed": False}
documents = collection.find(query).sort('date-recieved', pymongo.ASCENDING)

# Iterate over and print each document
print(f"Found {collection.count_documents(query)} total docs")
for doc in documents:
    # print(json.dumps(doc, indent=2))
    print(doc)

    # Format string to printer friendly version
    
    # Send message to printer

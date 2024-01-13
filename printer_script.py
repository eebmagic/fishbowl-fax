#!/usr/bin/python3
import pymongo
from bson import ObjectId
from datetime import datetime
import json
import os
import tempfile
import dotenv
dotenv.load_dotenv()
mongo_uri = os.getenv('MONGO_URI')

# MongoDB setup (replace with your actual connection details)
print(f"Connecting to mongo instance...")
client = pymongo.MongoClient(mongo_uri)
db = client['fishbowl-fax']
collection = db['messages']
UPDATE = True

class MongoEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)


def formatMsg(msg, WIDTH=32):
    message = msg['message']
    date = msg['date-received']

    if 4 <= date.day <= 20 or 24 <= date.day <= 30:
        suffix = "th"
    else:
        suffix = ["st", "nd", "rd"][date.day % 10 - 1]
    datestr = date.strftime(f'%b {date.day}{suffix}, %Y')

    timestr = date.strftime('%I : %M %p').lstrip("0").replace(" 0", " ")

    # Construct final result
    result = f'''{"#" * WIDTH}
    {datestr}
    {timestr}
{"-" * WIDTH}

  {message}



'''

    return result


# Query for documents where 'printed' is false
print(f"Pulling mongo docs")
query = {"printed": False}
documents = collection.find(query).sort('date-recieved', pymongo.ASCENDING)

# Iterate over and print each document
print(f"Found {collection.count_documents(query)} total docs")
for doc in documents:
    print(json.dumps(doc, indent=2, cls=MongoEncoder))

    # Format string to printer friendly version
    formatted = formatMsg(doc)
    print(formatted)
    
    try:
        # Send message to printer
        ## Write to temp file
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            f.write(formatted)

        ## Run command
        # command = f"cat {f.name}"
        command = f"lp -d POS58 0 -o page-left=0 {f.name}"
        result = os.system(command)
        print(f"Ran command with result: {result}")
        if result != 0:
            raise Exception(f"Failed to run command: {command}\n\tFor message: {doc}")

        # Update document to set 'printed' to true
        if UPDATE:
            collection.update_one(
                {"_id": doc['_id']},
                {
                    "$set": {
                        "printed": True,
                        "date-printed": datetime.now(),
                    },
                }
            )
        else:
            print(f"Skipping doc update because flag is set to: {UPDATE}")
    except Exception as e:
        # print(f"Failed to print message: {doc}")
        print(f"Exception is: {e}")

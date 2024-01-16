#!/usr/bin/python3
import pymongo
import math
from bson import ObjectId
from datetime import datetime
import json
import logging
import os
import tempfile
import dotenv
dotenv.load_dotenv()
mongo_uri = os.getenv('MONGO_URI')

logfilepath = "/home/ethanbolton/Desktop/fishbowl-fax/fishbowl-fax.log"
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    handlers=[logging.FileHandler(logfilepath),
                              logging.StreamHandler()])

# MongoDB setup (replace with your actual connection details)
logging.info("Connecting to mongo instance...")
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
    def wrapFormatMsg(msg):
        lines = msg.split('\n')
        final = []
        for line in lines:
            if len(line) > 32:
                for i in range(math.ceil(len(line) / 32)):
                    sub = line[i*32:(i+1)*32]
                    final.append(sub)
            else:
                final.append(line)

        return '\n'.join(final)

    message = wrapFormatMsg(msg['message'])
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
logging.info("Pulling mongo docs...")
query = {"printed": False}
documents = collection.find(query).sort('date-recieved', pymongo.ASCENDING)

# Iterate over and print each document
logging.info(f"Found {collection.count_documents(query)} total docs")
for doc in documents:
    logging.info(json.dumps(doc, indent=2, cls=MongoEncoder))

    # Format string to printer friendly version
    formatted = formatMsg(doc)
    logging.info(formatted)
    
    try:
        # Send message to printer
        ## Write to temp file
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            f.write(formatted)
            logging.info(f"Wrote temp file: {f.name}")

        ## Run command
        # command = f"cat {f.name}"
        command = f"lp -d POS58 -o page-left=0 {f.name}"
        result = os.system(command)
        logging.info(f"Ran command with result: {result}")
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
            logging.info(f"Skipping doc update because flag is set to: {UPDATE}")
    except Exception as e:
        logging.info(f"Exception is: {e}")

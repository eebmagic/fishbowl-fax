from flask import Flask, request, jsonify
from pymongo import MongoClient
import os
from datetime import datetime
import logging
logging.basicConfig(level=logging.INFO)
import dotenv
dotenv.load_dotenv()

iso_8601_string = "2024-01-10T15:23:01Z"

app = Flask(__name__)

# Replace with your MongoDB Atlas connection string
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)


# Connect to your database and collection
db = client['fishbowl-fax']
collection = db['messages']

@app.route('/addDocument', methods=['POST'])
def add_document():
    logging.info(f"GOT CALL TO /addDocument")
    logging.info(f"request: {request}")

    try:
        # Parse the JSON data from the request
        message = request.json['message']

        data = {
            'message': message,
            # 'date-received': datetime.now().isoformat(),
            'date-received': datetime.utcnow(),
            'printed': False,
            'date-printed': None
        }
        # Insert the document into the collection
        result = collection.insert_one(data)
        # Return the ID of the inserted document
        logging.info(f"Giving result: {result}")
        return jsonify(str(result.inserted_id)), 200
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.route('/heartbeat', methods=['GET'])
def heartbeat():
    return 'Server is alive!', 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Run the Flask app

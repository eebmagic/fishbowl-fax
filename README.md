# Fishbowl Fax
A fun little page that sends messages to a printer in our living room.

# Setup
1. Get a mongo URI string for your mongo cluster.
1. Run the `server.js` with node on the website host server.
2. Setup a webpage that will send messages to the server. This will add docs to cluster in mongo cloud.
3. Periodically run the `pull.py` script on the printer-connected machine. This will query for unprinted messages and should then print them.

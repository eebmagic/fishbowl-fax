import { useState } from 'react';
import './App.css';

import 'primereact/resources/themes/saga-blue/theme.css';  //theme
import 'primereact/resources/primereact.min.css';          //core css
import 'primeicons/primeicons.css';                        //icons
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

import styles from './styles.module.css';

function sendMessage(message) {
  // const url = "http://127.0.0.1:5000/addDocument";
  const url = "https://fishbowl.lol:5000/addDocument";
  const data = { message: message };

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  })
}


function App() {
  const [messageValue, setMessage] = useState("");

  return (
    <div className="App">
      <header className="App-header">
        <div className={styles.generalContainer}>
          <Card title="Welcome to Fishbowl Fax! 🖨️">
            <p>
              Send us your thoughts, prayers, hopes, dreams,
              song/movie recs, suggestions, criticisms, etc.

              <br />
              <br />

              <b>Just make sure to sign that it's from you!</b>

              <br />

              Or don't ¯\_(ツ)_/¯
            </p>
          </Card>
          <div className={styles.spacer} />
          <InputTextarea
            inputid="messageBox"
            name="messageBox"
            value={messageValue}
            placeholder="Type your message here..."
            rows={5}
            cols={30}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className={styles.spacer} />
          <Button
            label="Send"
            type="submit"
            icon="pi pi-file-export"
            severity='success'
            // onClick={() => console.log(messageValue)}
            onClick={() => {
              console.log(`SENDING MESSAGE: ${messageValue}`);
              sendMessage(messageValue);
            }}
          />
        </div>
      </header>
    </div>
  );
}

export default App;

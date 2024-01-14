import { useEffect, useRef, useState } from 'react';
import './App.css';

import 'primereact/resources/themes/saga-blue/theme.css';  //theme
import 'primereact/resources/primereact.min.css';          //core css
import 'primeicons/primeicons.css';                        //icons
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';

import styles from './styles.module.css';



function App() {
  function sendMessage(message) {

    try {
      // throw new Error("in test mode");
      if (message === "") {
        throw new Error("Message cannot be empty!");
      }
      if (message.trim() === lastMessage) {
        throw new Error("You've already sent that message!");
      }

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


      toast.current.show({
        severity: 'success',
        summary: 'Message Sent',
        detail: 'Your message has been sent!',
        life: 3000
      });

      setLastMessage(message.trim());
      setMessage('');

    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Message Failed to Send:',
        detail: error.message,
        life: 3000
      });
      return null;
    }
  }

  const [messageValue, setMessage] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const TRUNCATE_SIZE = 800;
  const TIME_BUFFER = 4000;
  const toast = useRef(null);

  useEffect(() => {
    if (isButtonDisabled) {
      const timeout = setTimeout(() => {
        setIsButtonDisabled(false);
      }, TIME_BUFFER);

      return () => clearTimeout(timeout);
    }
  })

  return (
    <div className="App">
      <Toast ref={toast} />
      <header className="App-header">
        <div className={styles.generalContainer}>
          <Card title="Welcome to Fishbowl Fax! 🖨️">
            <p>
              Send us your thoughts, prayers, hopes, dreams,
              song/movie recs, suggestions, criticisms, jokes, etc.

              <br />
              <br />

              <b>Just make sure to sign that it's from you!</b>

              <br />

              Or don't ¯\_(ツ)_/¯
            </p>
          </Card>
          <div className={styles.spacer} />
          <InputTextarea
            className={styles.inputTextareaFont}
            inputid="messageBox"
            name="messageBox"
            value={messageValue}
            placeholder="Type your message here..."
            rows={8}
            cols={31}
            onChange={(e) =>
              // eslint-disable-next-line no-control-regex
              setMessage(e.target.value.replace(/[^\x00-\x7F]/g, "").slice(0, TRUNCATE_SIZE))
            }
          />
          <div className={styles.spacer} />
          <Button
            label="Send"
            type="submit"
            icon="pi pi-file-export"
            severity='success'
            onClick={() => {
              console.log(`SENDING MESSAGE: ${messageValue}`);
              setIsButtonDisabled(true);
              sendMessage(messageValue);
            }}
            disabled={isButtonDisabled}
          />
        </div>
      </header>
    </div>
  );
}

export default App;

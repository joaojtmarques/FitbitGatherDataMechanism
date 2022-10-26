/*
 * Entry point for the companion app
 */

import * as messaging from "messaging";
import { outbox } from "file-transfer";
import { inbox } from "file-transfer";



function sendDataToServer(jsonData) {
  console.log("sending data to server: "+ JSON.stringify(jsonData))
  
  fetch('https://sensedataserver.hopto.org/', { //change this line with link
    method: 'post',
    body: JSON.stringify(jsonData)
  })//.then(res => res.json())
    .then(res => console.log(res));
}


messaging.peerSocket.addEventListener("message", (evt) => {
  
  //console.error(JSON.stringify(evt.data));
  /*
  
 */
  console.log("should be sending messages")
  console.log(evt.data);
  sendDataToServer(evt.data);
  
});

// Process the inbox queue for files, and read their contents as text
async function processAllFiles() {
  console.log("COMPANION: RECEIVED FILE!")
   let file = await inbox.pop()
   while (file != null) {
     console.log(file)
     console.log(file.name)
     const payload = await file.json();
     //console.log(`${payload}`)
     //sendDataToServer(payload)
     //file = await inbox.pop()
     console.log(payload.length)
     sendDataToServer(payload);
     
     
   }
}



// Process new files as they are received
inbox.addEventListener("newfile", processAllFiles);

// Also process any files that arrived when the companion wasn’t running
processAllFiles()



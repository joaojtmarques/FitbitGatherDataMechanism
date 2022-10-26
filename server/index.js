
var https = require('https')
var fs = require('fs');

const options = {
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem'),
};

var writing_to_file = false
var logger
var server = https.createServer(options, function (r, s) {
  if (r.url == '/') { //check the URL of the current request

    let body = '';
    r.on('data', (chunk) => {
        body += chunk;
    });
    r.on('end', () => {
        const obj = JSON.parse(body)
	console.log(body)
	console.log(body.length)
        if (body === '"Start"') {
          
          logger = fs.createWriteStream(Date.now()  + '.txt', {
            flags: 'a' // 'a' means appending (old data will be preserved)
          })
          writing_to_file = true
        }
        else if (body === '"Stop"') {
          
          writing_to_file = false
        }
        else {
          if (writing_to_file == true) {
    
            console.log(body + "\n");
	    logger.write(body + "\n");
        /*   
	 for (var el in obj) {
              console.log(el + " : " + obj[el])
              logger.write(el + " : " + obj[el])
            }
            console.log("\n")
         */
	 }
        }
        
        s.write('OK'); 
        s.end(); 
    });
    /*
    console.log("received a request!");
    console.log(req.headers)
    //console.log(req);
    var bmpString = "";
    res.on('data', function(data) { 
      console.log("data after")
      console.log(data)
      bmpString += data; });
    res.on('close', function() { 
      console.log(bmpString);
      // ...
    });
    */

    
  }
  //res.writeHead(200);
  //res.end("ended");
  
})

server.listen(9000, () => console.log("My server is listening on port 9000"));


/*

const wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws) {
  console.log("server up!");
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
  console.log("sent something")
});

*/

/*

const websocket = new WebSocket.Server({ server });
server.listen(8080, () => console.log("My server is listening on port 8080"));


//when a legit websocket request comes listen to it and get the connection .. once you get a connection thats it! 
websocket.on("request", request=> {
  console.log("received request");
  connection = request.accept(null, request.origin)
  connection.on("open", () => console.log("Opened!!!"))
  connection.on("close", () => console.log("CLOSED!!!"))
  connection.on("message", message => {

      console.log(`Received message ${message.utf8Data}`)
      connection.send(`got your message: ${message.utf8Data}`)
  })


  //use connection.send to send stuff to the client 
  sendevery5seconds();
  

})

function sendevery5seconds(){

  connection.send(`Message ${Math.random()}`);

  setTimeout(sendevery5seconds, 5000);


}


/*
const WebSocket = require('ws')
 const server = new WebSocket.Server({ port: '8080' })

server.on('connection', socket => { 
  console.log("server up!");

  socket.on('message', message => {

    socket.send(`Roger that! ${message}`);
    console.log("message ", message);

   });

 });
*/


 

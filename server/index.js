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

         }
        }

        s.write('OK');
        s.end();
    });
  }
})

server.listen(443, () => console.log("My server is listening on port 443"));



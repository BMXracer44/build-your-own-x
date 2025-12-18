const net = require('net');

function createWebServer(requestHandler) {
  const server = net.createServer();
  server.on('connection', handleConnection);

  function handleConnection(socket) {
    socket.once('readable', function() {
      let reqBuffer = Buffer.alloc(0); 
      let buf;
      
      while (true) {
        buf = socket.read();
        if (buf == null) break;

        reqBuffer = Buffer.concat([reqBuffer, buf]);

        let marker = reqBuffer.indexOf('\r\n\r\n');
        if (marker !== -1) {
          // Parse the header string from the buffer
          let reqHeaderStr = reqBuffer.slice(0, marker).toString();
          // Push remaining body data back to the socket stream
          let remaining = reqBuffer.slice(marker + 4);
          socket.unshift(remaining);

          /* Request Parsing */
          const reqHeaders = reqHeaderStr.split('\r\n');
          const reqLine = reqHeaders.shift().split(' ');
          
          const headers = reqHeaders.reduce((acc, currentHeader) => {
            const [key, ...val] = currentHeader.split(':');
            return {
              ...acc,
              [key.trim().toLowerCase()]: val.join(':').trim()
            };
          }, {});

          const request = {
            method: reqLine[0],
            url: reqLine[1],
            httpVersion: reqLine[2] ? reqLine[2].split('/')[1] : '1.1',
            headers,
            socket
          };

          /* Response Logic */
          let status = 200, statusText = 'OK', headersSent = false, isChunked = false;
          const responseHeaders = { server: 'my-custom-server' };

          function setHeader(key, value) {
            responseHeaders[key.toLowerCase()] = value;
          }

          function sendHeaders() {
            if (!headersSent) {
              headersSent = true;
              setHeader('date', new Date().toUTCString());
              socket.write(`HTTP/1.1 ${status} ${statusText}\r\n`);
              Object.keys(responseHeaders).forEach(key => {
                socket.write(`${key}: ${responseHeaders[key]}\r\n`);
              });
              socket.write('\r\n');
            }
          }

          const response = {
            setHeader,
            setStatus(s, t) { status = s; statusText = t; },
            write(chunk) {
              if (!headersSent) {
                if (!responseHeaders['content-length']) {
                  isChunked = true;
                  setHeader('transfer-encoding', 'chunked');
                }
                sendHeaders();
              }
              const chunkBuf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
              if (isChunked) {
                socket.write(`${chunkBuf.length.toString(16)}\r\n`);
                socket.write(chunkBuf);
                socket.write('\r\n');
              } else {
                socket.write(chunkBuf);
              }
            },
            end(chunk) {
              if (!headersSent) {
                if (!responseHeaders['content-length']) {
                  setHeader('content-length', chunk ? Buffer.byteLength(chunk) : 0);
                }
                sendHeaders();
              }
              socket.end(chunk);
            }
          };

          requestHandler(request, response);
          break;
        }
      }
    });
  }

  return server; // Return the server instance
}

// --- START THE SERVER HERE (Outside the function) ---

const webServer = createWebServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!');
});

webServer.listen(8080, () => {
  console.log('Server is running at http://localhost:8080');
});

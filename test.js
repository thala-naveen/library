const http = require ('http');

const server = http.createServer((req, res)=>{res.end ('Hello Server is running \n'); });
server.listen(4242,() => {console.log('server is running on port 4242');});


var fs = require('fs');
var index = fs.readFileSync('./index.html');
var script = fs.readFileSync('./script.js');
require('http').createServer(function(req, res) {
  console.log(req.url);
  if(req.url == '/script.js') {
    return res.end(script);
  }
  res.end(index);
}).listen(3000);

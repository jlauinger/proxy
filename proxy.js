var http = require('http'),
    https = require('https'),
    fs = require('fs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/*
 * proxy whitelisting. These must be resolved by /etc/hosts to and ONLY to their IPv6 addresses.
 */
var targets = [
  'code.lauinger-it.de',
  'infrastructure.lauinger-it.de'
];

var callback = function (connection, port, badge) {
  return function (req, res) {
    if (targets.indexOf(req.headers.host) === -1) {
      console.log('* Delivering proxy.lauinger-it.de information site.');
      if (port !== 443) {
        res.writeHead(302, { 'Location': 'https://proxy.lauinger-it.de' });
        res.end();
      } else {
        fs.readFile('/opt/proxy/proxy-information.html', function(error, content) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      }
    } else {
      console.log('[IPv4] ' + badge + ' ' + req.method + ' ' + req.headers.host + req.url);
      var proxyReq = connection.request({
        host: req.headers.host,
        port: port,
        path: req.url,
        method: req.method,
        headers: req.headers
      }, function(proxyRes) {
        proxyRes.headers["X-Proxy"] = 'This native IPv6 site is being served automagically by Lauinger IT Solutions\' IPv4-Proxy';
        proxyRes.headers["X-Served-By"] = 'proxy.lauinger-it.de';
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.on('data', function(chunk) {
          res.write(chunk);
        });
        proxyRes.on('end', function() {
          res.end();
        });
      }).on('error', function(e) {
        res.write('Proxying failed. Message: ' + e.message);
        res.end();
      });
      if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        proxyReq.end();
      } else {
        req.on('data', function(chunk) {
          proxyReq.write(chunk);
        });
        req.on('end', function() {
          proxyReq.end();
        });
      }
    }
  };
};

http.createServer(callback(http, 80, '[http] ')).listen(80);
https.createServer({
  key: fs.readFileSync('/etc/ssl/private/ssl-cert-snakeoil.key'),
  cert: fs.readFileSync('/etc/ssl/certs/ssl-cert-snakeoil.pem')
}, callback(https, 443, '[https]')).listen(443);

console.log('Listening on *:80 and *:443');
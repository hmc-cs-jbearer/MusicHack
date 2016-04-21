// Uses the Google Skyjam webclient to retrieve data from a google music account
// Assumes that the user is logged in to google in their browser, and that they
// have an All Access subsciption.
// Before using any of the endpoints, the client must send a GET request to
// /login so  that the server can recieve the cookies.

var https = require( "https" );
var express = require( "express" );
var app = express();

/*
 * Given a list of cookie strings with extraneous attributes (such as domain,
 * expires, etc.) retrieved from the set-cookie header of an http request result,
 * return a string which can be used as the Cookie header of a new http request.
 */
function parseSetCookie(cookies) {
  var cookiePattern = /([^=]+=[^;]+);/
  console.log(cookiePattern.exec(cookies[0])[1]);
  parsedCookies = cookies.map((cookie) => cookiePattern.exec(cookie)[1]);
  return parsedCookies.join("; ");
}

// Login endpoint
app.get("/", function( req, res ) {

  urlsOptions = {
    method: "GET",
    host: "play.google.com",
    port: 443,
    path: "/music/play?slt=rqsipz6b9vf1&sig=H3GTRLEifBNjU1OsIP6ZhUOHSFQ&mjck=Tksv4avkkk7dxoqgfw4nmgutsmm&u=0&pt=e",
    headers: {}
  }

  var options = {
    method: "HEAD",
    host: "play.google.com",
    port: 443,
    path: "/music/listen"
  }
  var req = https.request(options, (gres) => {
    console.log(`STATUS: ${gres.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(gres.headers)}`);

    console.log("Retrieved cookies: " + JSON.stringify(gres.headers['set-cookie']));

    var cookies = parseSetCookie(gres.headers['set-cookie']);

    console.log("Parsed cookies: " + cookies);

    urlsOptions.headers["cookie"] = cookies;

    console.log("Options: " + JSON.stringify(urlsOptions));

    var reqUrls = https.request(urlsOptions, (gres) => {
      console.log(`STATUS: ${gres.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(gres.headers)}`);
      gres.setEncoding('utf8');
      gres.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      gres.on('end', () => {
        console.log('No more data in response.')
      })
    });

    reqUrls.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
    });

    reqUrls.end();
  });

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });

  req.end();

  return res.end( "done" );
});

// Audio data endpoint
// app.get("/stream", function( req, res ) {

//   https.get('https://play.google.com/music/play?slt=rqsipz6b9vf1&sig=H3GTRLEifBNjU1OsIP6ZhUOHSFQ&mjck=Tksv4avkkk7dxoqgfw4nmgutsmm&u=0&pt=e', (gres) => {
//     console.log(`Got response: ${gres.statusCode}`);
//     // consume response body
//     gres.resume();
//   }).on('error', (e) => {
//     console.log(`Got error: ${e.message}`);

// });

//   res.writeHead(200);
//   return res.end( "a" );
// });

app.listen(8080);
 
//server = http.createServer( function( req, res ) {



//   var cookies = new Cookies( req, res, { "keys": keys } )
//     , unsigned, signed, tampered;
 
//   if ( req.url == "/set" ) {
//     cookies
//       // set a regular cookie 
//       .set( "unsigned", "foo", { httpOnly: false } )
 
//       // set a signed cookie 
//       .set( "signed", "bar", { signed: true } )
 
//       // mimic a signed cookie, but with a bogus signature 
//       .set( "tampered", "baz" )
//       .set( "tampered.sig", "bogus" );
 
//     res.writeHead( 302, { "Location": "/" } );
//     return res.end( "Now let's check." );
//   }
 
//   unsigned = cookies.get( "unsigned" );
//   signed = cookies.get( "signed", { signed: true } );
//   tampered = cookies.get( "tampered", { signed: true } );
 
//   assert.equal( unsigned, "foo" );
//   assert.equal( signed, "bar" );
//   assert.notEqual( tampered, "baz" );
//   assert.equal( tampered, undefined );
 
//   res.writeHead( 200, { "Content-Type": "text/plain" } );
//   res.end(
//     "unsigned expected: foo\n\n" +
//     "unsigned actual: " + unsigned + "\n\n" +
//     "signed expected: bar\n\n" +
//     "signed actual: " + signed + "\n\n" +
//     "tampered expected: undefined\n\n"+
//     "tampered: " + tampered + "\n\n"
//   );
// });

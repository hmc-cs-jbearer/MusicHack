// Gets all of the cookies in a browser

var express = require( "express" );
var Cookies = require( "cookies" );
var app = express();

// Cookie required to use the Google webclient
var xt;

// Login endpoint
app.get("/", function( req, res ) {

});

app.listen(8080);
 
server = http.createServer( function( req, res ) {



  var cookies = new Cookies( req, res, { "keys": keys } )
    , unsigned, signed, tampered;
 
  if ( req.url == "/set" ) {
    cookies
      // set a regular cookie 
      .set( "unsigned", "foo", { httpOnly: false } )
 
      // set a signed cookie 
      .set( "signed", "bar", { signed: true } )
 
      // mimic a signed cookie, but with a bogus signature 
      .set( "tampered", "baz" )
      .set( "tampered.sig", "bogus" );
 
    res.writeHead( 302, { "Location": "/" } );
    return res.end( "Now let's check." );
  }
 
  unsigned = cookies.get( "unsigned" );
  signed = cookies.get( "signed", { signed: true } );
  tampered = cookies.get( "tampered", { signed: true } );
 
  assert.equal( unsigned, "foo" );
  assert.equal( signed, "bar" );
  assert.notEqual( tampered, "baz" );
  assert.equal( tampered, undefined );
 
  res.writeHead( 200, { "Content-Type": "text/plain" } );
  res.end(
    "unsigned expected: foo\n\n" +
    "unsigned actual: " + unsigned + "\n\n" +
    "signed expected: bar\n\n" +
    "signed actual: " + signed + "\n\n" +
    "tampered expected: undefined\n\n"+
    "tampered: " + tampered + "\n\n"
  );
});

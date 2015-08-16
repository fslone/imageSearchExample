(function() {
  
  var server,
      restify = require("restify"),
      fs = require("fs"),
      request = require("request");
      
  function _init() {

    _start();
    _registerRestCalls();

  }

  function _start() {
    
    var port, 
        clientDir;
    
    //change the client directory based on port number 
    //as a way for restify to properly serve static assets in my dev 
    //environment and on heroku
    if(process.env.PORT) {
      port = process.env.PORT;
      clientDir = "client";
    } else {
      port = 3000;
      clientDir = "../client";
    }
    
    //start server
    _server = restify.createServer({
      name: "Search Server",
      version: "0.0.0"
    });

    _server.use(restify.acceptParser(_server.acceptable));
    _server.use(restify.gzipResponse());
    _server.use(restify.jsonBodyParser());
    _server.use(restify.queryParser());
    _server.use(restify.fullResponse());

    //start listening on specified port
    _server.listen(port);

    _registerRestCalls();

    _server.get(/\/?.*/, restify.serveStatic({
      directory: clientDir,
      default: "index.html"
    }));

  }

  function _registerRestCalls() {

    _server.get("/restapi/GetImage", __getGoogleImage);

    function __getGoogleImage() {
      var emailAddr;

      emailAddr = req.params.email;

      console.log(emailAddr);
    }

  }

  return _init();

}());
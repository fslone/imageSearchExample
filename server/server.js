(function() {
  
  var _server,
      restify = require("restify"),
      fs = require("fs"),
      request = require("request"),
      outputCache = require("output-cache"),
      googleImages = require("google-images"),
      OutputCache = require("output-cache"),
  
  outputCache = new OutputCache({ maxCacheSizePerRoute: 10, removeOldEntriesWhenFull: true}),
  
  cacheOptions = {
      location: outputCache.cacheLocation.SERVER,
      varyByParam: ["email"],
      durationSeconds: 3600,
      headersToCache: ["Content-Type", "content-length"]
  };
      
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

    outputCache.get(_server, "/restapi/GetImage", cacheOptions, function (req, res, next) {
      
      var emailAddr, responseObj;

      if (req.cachedResponse) {
        
        for (var prop in req.cachedResponse.headers) {
          
          if (req.cachedResponse.headers.hasOwnProperty(prop)) {
            res.setHeader(prop, req.cachedResponse.headers[prop]);
          }

        }

        res.send(req.cachedResponse.status, req.cachedResponse.responseBody);
      
      } else {
        
        googleImages.search(req.params.email, function (err, images) {
          responseObj = {
            "height": images[0].height,
            "width": images[0].width,
            "unescapedUrl": images[0].unescapedUrl
          };
          res.send(200, JSON.stringify(responseObj));
        });

      }

    });

  }

  return _init();

}());
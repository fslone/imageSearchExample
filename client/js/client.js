/**
* @namespace searchEngine
*/
var searchEngine = (function() {

  //setup some refrences that will be used 
  //across multiple functions
  var $form,
      $queryBox,
      $radius,
      $container,
      $results,
      $submitButton;

  /**
    * Initialize the search page
    *
    * @author Fleming Slone [fslone@gmail.com]
    * @memberof! searchEngine
   */
  function _init() {

    //cache some refrences that will be used 
    //across multiple functions
    $container = $("#search_container");
    $form = $container.find("#query_form");
    $queryBox = $form.find("#query_box");
    $submitButton = $form.find(".btn-primary");
    $radius = $form.find("#radius");
    $results = $container.find("#search_results");
    
    _bindUI();

    _bindRefresh();

  }

  /**
    * Binds UI elements for the page
    *
    * @author Fleming Slone [fslone@gmail.com]
    * @memberof! searchEngine
   */
  function _bindUI() {

    //bind the search button
    $form
      .find(".btn-primary")
      .click(function(event) {   
        _handleSubmit(event);
      });

    //bind the return key
    $queryBox
      .on("keypress", function(event) {
        if(event.which===13) _handleSubmit(event);
      });

    return true;
  
  }

  /**
    * Handle submission of the form
    *
    * @author Fleming Slone [fslone@gmail.com]
    * @memberof! searchEngine
   */
  function _handleSubmit(event) {
    
    var query;

    query = $queryBox.val();
    
    event.preventDefault();
    
    if(_validateForm(query)) {
      
      _showLoader($results);

      $.when(
        _getImageResults(query)
      ).then(function(res) {
        _hideLoader($results);
        _animateResults(query);
        _displayImage(res[0]);
      });        
    
    }

  }

  /**
    * Re-populate the search box with the last query if the page is refreshed.
    *
    * @author Fleming Slone [fslone@gmail.com]
    * @memberof! searchEngine
   */
  function _bindRefresh() {

    $(window)
      .unload(function(){
        _setFormState();
      })
      .load(function() {
        _loadFromFormState();
      });

  }

  /**
    * Animates the logo, query box, etc. after the form is submitted and results are returned
    *
    * @author Fleming Slone [fslone@gmail.com]
    * @memberof! searchEngine
   */
  function _animateResults(query) {
    
    $container
      .find("#logo")
      .animate({
        "margin-top":"0px",
        "margin-bottom":"0px",
        "width": "50px",
        "height": "0px",
        "opacity": "0"
      }, {duration: 500});

    $container
      .find("#logo_row")
      .animate({
        "height": "0px",
        "opacity": "0"
      }, {duration: 500});

    $container
      .find("#query_box, .btn-primary")
      .animate({
        "height": "0px",
        "opacity": "0"
      }, {duration: 500});    

    $("header span").text(query)
    $("header").fadeIn();

  }

  /**
    * Here I'm taking the image object and doing a few different things. 
    * First I'm determining if the width is greater than 300px. If it isn't 
    * I let it remain the width associated with object, otherwise I set it 
    * to 300px and then determine the new height based on the ratio of the original  
    * image size. 
    *
    * @param {object} imgObj The image details of the first image returned by the REST endpoint
    * @see _getImageResults
    * @author Fleming Slone [fslone@gmail.com]
    * @memberof! searchEngine
   */
  function _displayImage(imgObj) {
      
    var width, 
        height,
        ratio;

    width = parseInt(imgObj.width);
    height = parseInt(imgObj.height);
    ratio = width/height;

    //set a more reasonable height/width
    if(width > 300) {
      width = 300;
      height = width/ratio;
    }

    $("<img />", {
      "id": "image_result",
      "src": imgObj.unescapedUrl,
      "width": width,
      "height": height,
      "height": imgObj.unescapedUrl,
      "alt": "Image Search Result",
      // "style": "display:none"
    }).appendTo($("#search_results"));

  }

  /**
    * Set formState object in localStorage to save last page visit
    *
    * @author Fleming Slone [fslone@gmail.com]
    * @memberof! searchEngine
   */
  function _setFormState() {

    var time, 
        queryVal, 
        formState;

    time = new Date().getTime();
    queryVal = $queryBox.val();
    
    formState = {
      query: queryVal,
      unloadTime: time
    };

    localStorage.setItem("formState", JSON.stringify(formState));

  }

  /**
    * Populate the page based on a formState object from localStorage 
    * if the last visit was less than 3 seconds ago (indicating a refresh)
    *
    * @author Fleming Slone [fslone@gmail.com]
    * @memberof! searchEngine
   */
  function _loadFromFormState() {

    var curTime, 
        formState, 
        unloadTime;
    
    curTime = new Date().getTime();

    formState = $.parseJSON(localStorage.getItem("formState"));
    
    if(formState) {

      unloadTime = formState.unloadTime;

      if((curTime - unloadTime) < 3000) $queryBox.val(formState.query);

    } else {
      $queryBox.val("Search by e-mail address...")
    }

  }

  /**
    * Validate the search box for completeness and proper email address
    *
    * @author Fleming Slone [fslone@gmail.com]
    * @returns {bool} Indicates whether the form was validated successfully or not
    * @memberof! searchEngine
   */
  function _validateForm(query) {

    if(!query) {

      _displayError("Please enter an e-mail address.");
      return false;

    } else if (!_isEmail(query)){

      _displayError("Please enter a valid e-mail address.");
      return false;

    } else {

      _removeError();
      return true;

    }

  }

  /**
    * Display an error with associated styling
    *
    * @author Fleming Slone [fslone@gmail.com]
    * @param {string} message The error message to be displayed
    * @memberof! searchEngine
   */
  function _displayError(message) {
    
    var $errorSpan;
    
    $errorSpan = $form.find(".error-row span");

    $queryBox
      .closest(".input-group")
      .addClass("has-error");

    $errorSpan
      .text(message);

  }

  /**
    * Removes the error and associated styling
    *
    * @author Fleming Slone [fslone@gmail.com]
    * @memberof! searchEngine
   */
  function _removeError() {
    
    var $errorSpan;
    
    $errorSpan = $form.find(".error-row span");

    $queryBox
      .closest(".form-group")
      .removeClass("has-error");
      
    $errorSpan
      .text("");
  
  }

  /**
    * Make a REST call via AJAX to fetch results from the server
    *
    * @param {string} query A query string generated by $.serialize
    * @returns {object} A promise object
    * @author Fleming Slone [fslone@gmail.com]
    * @memberof! searchEngine
   */
  function _getImageResults(query) {
    
    var promise, 
        url,
        params;

    promise = $.Deferred();
    url = "/restapi/GetImage";
    params = "?email=" + query;

    $.ajax({
      cache: false,
      crossDomain: true,
      type: "GET",
      url: url + params,
      dataType: "text",
      success: function(res) {
        promise.resolve($.parseJSON(res));
      }, 
      error: function() {
        var errorRow;
        errorRow = _buildError();
        promise.resolve();
      }
    });

    return promise;

  }

  /**
    * Build an error 
    *
    * @param {string} errorCode The error code from the server.
    * @returns {string} A string of html to be appended to the page
    * @author Fleming Slone [fslone@gmail.com]
    * @memberof! searchEngine
   */
  function _buildError(errorCode) {
    
    var errorOpen, 
        errorClose, 
        cell1Open, 
        cell1Close, 
        cell2Open, 
        cell2Close, 
        error; 

    errorOpen = "<div class='row'>";
    cell1Open = "<div class='col-xs-12 alert alert-danger'><strong>";
    cell1Close = "</strong></div>";
    errorClose = "</div>";

    error = errorOpen;
    error += cell1Open;
    error += "We're sorry, but there was a problem. Error code: " + errorCode
    error += cell1Close;
    error += errorClose;

    return error;

  }

  /**
    * Validates an email based on a regular expression 
    *
    * @param {string} email A string to be evaluated to determine if it is a valid email address    * @returns {string} A string of html to be appended to the page
    * @author Fleming Slone [fslone@gmail.com]
    * @memberof! searchEngine
    * @returns {bool} Boolean indicating whether or not the email address passed the test against the regular expression
   */
  function _isEmail(email) {

    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  
  }

  /**
   * Shows the loading spinner.
   *
   */
  function _showLoader($container) {
    
    var htmlString;

    htmlString = "<div class='spinner'><img src='img/yak.png' alt='Loading' /></div>"; 

    $results
      .empty()
      .append(htmlString)
      .find(".spinner")
      .show();

    //disable the submit button and text input
    $submitButton.attr("disabled", true);
    $queryBox.attr("disabled", true);

  }

  /**
   * Hides the loading spinner.
   *
   */
  function _hideLoader($container) {
    
    if ($container === null) $container = $("body");

    $results
      .find(".spinner")
      .remove();

    //disable the submit button
    $submitButton.attr("disabled", false);
    $queryBox.attr("disabled", false);

  }

  return {
    init: _init,
    isEmail: _isEmail,
    bindUI: _bindUI,
    validateForm: _validateForm,
    getImageResults: _getImageResults
  }

}());

searchEngine.init();
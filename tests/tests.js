describe("Image Search Engine", function(){
  describe("isEmail", function(){
    it("should return true for a valid email address", function(){
      chai.assert.equal(searchEngine.isEmail("fslone@gmail.com"), true);
    });
    it("should return false for an invalid email address", function(){
      chai.assert.equal(searchEngine.isEmail("fslonegmail.com"), false);
    });
  });
  describe("bindUI", function(){
    it("should return true if function completes successfully", function(){
      chai.assert.equal(searchEngine.bindUI(), true);
    });
  });
  describe("validateForm", function(){
    it("should return false if the form is incomplete", function(){
      chai.assert.equal(searchEngine.validateForm(), false);
    });
    it("should return false if a the form contains invalid data", function(){
      chai.assert.equal(searchEngine.validateForm("asdf"), false);
    });
    it("should return true if the form is complete and contains valid data", function(){
      chai.assert.equal(searchEngine.validateForm("fslone@gmail.com"), true);
    });
  });
  describe("getImageResults", function(){
    it("should return a promise object", function(){
      chai.assert.equal(typeof(searchEngine.getImageResults()), "object");
    });
  });
});
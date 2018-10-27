xlsxj = require("xlsx-to-json");
  xlsxj({
    input: "test.xlsx", 
    output: "out.json",
    lowerCaseHeaders:true //converts excel header rows into lowercase as json keys
  }, function(err, result) {
    if(err) {
      console.error(err);
    }else {
      console.log(result);
    }
  });
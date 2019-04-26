var express = require("express");
var cors = require('cors');
var redis = require('redis');
var promise = require('bluebird');

var client = redis.createClient();

client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});


var app = express();
var testData = null;

app.use(cors());


app.get("/data", (req, res, next) => 
{
  var testData = [];
  for(var i=0;i<25000;i++)
  {

    var result = client.get(i, function (error, result) 
	{
		if (error) {
			console.log(error);
			throw error;
 	}
		

		var node = JSON.parse(result);
		
		testData.push(node);
		global.data = testData;
		
 
	});

  }
  
 
  res.json(testData);
  res.end();
    
});

app.get("/url", (req, res, next) => 
{
 res.json(data);
 res.end();
});

async function IntializeCache()
{
  for(var i=0;i<25000;i++)
  {
	var stockprice = 0;
	var node = { ProductId:i,ExpiryDate:"2019APR23",Symbol:"AAPL",StrikePrice:100,TickerSpotPrice: stockprice-50,PremiumPrice:stockprice+50};
	await client.set(node.ProductId, JSON.stringify(node), redis.print);
				
  }
  
}


app.listen(5000, () => 
{
 console.log("Server running on port 5000");
 IntializeCache(); 

});
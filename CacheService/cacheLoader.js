var express = require('express');
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


app.get("/clear", (req, res, next) => {
		client.flushdb( function (err, succeeded) {
		console.log('Status of cache clear job = ' + succeeded); // will be true if successfull
		res.json({status:succeeded});
	})
});

app.get("/count", (req, res, next) => {
	client.keys('*', function (err, keys) {
        if (err) return console.log(err);
        if(keys){
			console.log('Cache count = ' + count);
			res.json({count:keys.length});
        }
    })
});

app.get("/load", (req, res, next) => {
	loadCache();
});

var NumOfOptions = 150; //25000;
var DecimalPlaces = 3;
var MulFactor = Math.pow(10, DecimalPlaces);

function loadCache() {
	var undInfos = [{Symbol:'AAPL', Spot:205.80}, {Symbol:'MSFT', Spot:130.50}];
	var startIndex = 0;
	for (var i=0, count = undInfos.length; i < count; ++i)
	{
		startIndex = (i * NumOfOptions);
		loadOptionData(undInfos[i].Symbol, undInfos[i].Spot, 30, Date.now(), 5, startIndex);
	}
	
  // for(var i=0;i<25000;i++)
  // {
	// var stockprice = 0;
	// var node = { ProductId:i,ExpiryDate:"2019APR23",Symbol:"AAPL",StrikePrice:100,TickerSpotPrice: stockprice-50,PremiumPrice:stockprice+50};
	// await client.set(node.ProductId, JSON.stringify(node), redis.print);
				
  // }
}


function loadOptionData(symbol, baseSpotPrice, rangePercent, stDate, numOfMonths, startIndex){
	// Expiries
	var startDate = new Date(stDate);
	var endDate = new Date(startDate.getFullYear(), startDate.getMonth() + numOfMonths + 1, 1);
	var offset = (5 - startDate.getDay() + 7) % 7;
	var nextExpiry = startDate.addDays(offset); 
	
	var expiries = [];
	while (nextExpiry < endDate)
	{
		expiries.push(nextExpiry.toShortFormat()); 
		nextExpiry = nextExpiry.addDays(7);
	}
	
	// Strikes
	var index = 0;
	var numOfStrikes = Math.round((NumOfOptions / expiries.length)) + 1;
	var incFactor = (rangePercent * 2)/ numOfStrikes;
	var startSpot = (baseSpotPrice * (1-rangePercent/100));
	
	// Options Data
	var optionsData = []; //new List<OptionsData>();
	for (var i = 0, numOfExpiries = expiries.length; i < numOfExpiries && index < NumOfOptions; ++i)
	{
		for (var j = 0; j < numOfStrikes && index < NumOfOptions; ++j)
		{	
			var id = (i*numOfStrikes) + j + startIndex;
			var sp = (startSpot + (j * incFactor));
			
			var optionData = { ProductId:id, Symbol:symbol, ExpiryDate:expiries[i], StrikePrice:round(sp)};
			var jsonData = JSON.stringify(optionData);
			console.log(jsonData); 
			// Push to Redis.
			//await client.set(node.ProductId, JSON.stringify(node), redis.print);
			index++;
		}
	}
}

function round(number, places){
	return ((number * MulFactor)/MulFactor);
}

Date.prototype.addDays = function(days) {
    var result = new Date(this.valueOf());	
	var newDay = result.getDate() + days;
	result.setDate(newDay);
	return result;
}

Date.prototype.toShortFormat = function() {

    var month_names =["JAN","FEB","MAR", "APR","MAY","JUN",
                      "JUL","AUG","SEP", "OCT","NOV","DEC"];
    
    var day = this.getDate();
	var formattedDay = "" + ((day < 10) ? "0" + day : day);
    var month_index = this.getMonth();
    var year = this.getFullYear();
    
    return "" + year + month_names[month_index] + formattedDay;
}

app.listen(5500, () => 
{
	console.log("Server running on port 5500");
	loadCache();
});
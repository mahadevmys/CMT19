var http = require('http');
var fs = require('fs');

// Loading the index file . html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Loading socket.io
var io = require('socket.io').listen(server);
var increment = 0;
io.on('connection', function(socket) {
    console.log('A new WebSocket connection has been established');
	
	setInterval(function() 
{
			var testData = [];
			
			if(inc>50)
			{
				inc=1;
				start=0; 
				
			}
			console.log(start+"-->"+counter*inc);
			for(var i=start;i<counter*inc;i++)
			{
				var idValue = i;
				var stockprice = Math.floor(Math.random() * 350000);
				var node = {ProductId:i,PremiumPrice:stockprice+50};
				testData.push(node);
				
			}
			start = counter*inc-1;
			inc++;
			
			var pricerData = {Symbol:'AAPL', TickerSpotPrice:145, BatchMessages:testData}
			
  
  io.emit('message', pricerData);
}, 15);
});

var counter=500;
var inc=1;
var start=0;



server.listen(3000);
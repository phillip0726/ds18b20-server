const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var seq = 0;
app.get('/log', function(req, res){
	fs.appendFile('log.txt',JSON.stringify(req.query)+"\n", function(err){
		if(err) throw err
		console.log("%j",req.query)
        res.end("Got "+String(seq++) + " " + JSON.stringify(req.query))
    });
});

app.get('/push', function(req, res){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if(month < 10){
         month = "0" + month;
    }
    if(day < 10){
            day = "0" + day;
    }
    var today = year+""+month+""+day;
    var hour = date.getHours() + 9;
    var minutes = date.getMinutes();
    if(hour >= 24){
        hour = hour - 24;
    }
    if(hour < 10){
         hour = "0" + hour;
    }
    if(minutes < 10){
        minutes = "0" +minutes;
    }
    var time = hour+":"+minutes;
    var data = today+","+time+","+req.query.temp;

    fs.appendFile('temp_data.txt' ,data+"\n", function(err){
        if(err) throw err
            res.end("Got "+data);
    });
});
app.get('/dump', function(req, res){
    var count = req.query.count;

    fs.readFile('temp_data.txt', function(err, data){
        try{
			var result ="";
			var start;
			var total_data = data.toString().split("\n");
			var len = total_data.length;
			if(len < count){
			     start = 0;
			}
			else{
			   start = len - count;
			}
			for(var i = start; i<len; i++){
			    result = result + total_data[i]+"\n";
			}
			res.end(result);
		}
		catch(err){
			console.log(err);
			res.end('<html><body>Temperature data does not exist.</body></html>');
		}
    });
});
app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});

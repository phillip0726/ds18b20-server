const express = require('express');
const fs = require('fs');
const database = require('./database.js');
const mydb = require('./mydb.js');

const app = express();

app.get('/', function (req, res) {
	var html = fs.readFile('./static/index.html',function(err, html){
		html = ""+html;
		if(err) throw err;
		var top_menu = fs.readFile('./static/top_menu.html',function(err, top_menu){
			if(err) throw err;
			top_menu = ""+top_menu;
			html = html.replace("<%include%>", top_menu);
			res.writeHeader(200, {"Content-Type":"text/html"});
			res.write(html);
			res.end();
		});
	});
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

	var connection = mydb.connect();
	connection.connect();
	var r = database.add_table(connection, req.query.id, parseFloat(req.query.temp));

});
app.get('/dump', function(req, res){
    var count = req.query.count;
	var connection = mydb.connect();
	var data = database.read_table(connection, count, function(err,data){
		if(err) throw err;
		
		data = JSON.parse(JSON.stringify(data));

		var html = fs.readFile('./static/dump.html',function(err, html){
			html = ""+html;
			var top_menu = fs.readFile('./static/top_menu.html',function(err,top_menu){
				top_menu = ""+top_menu;
				var td_loop = "";
				for(var i =0; i<data.length; i++){
					var index = i + 1;
					var dt = new Date(data[i].time);
					var year = dt.getFullYear();
					var month = dt.getMonth() + 1;
					var day = dt.getDate();
					if(month < 10){
						month = "0" + month;
					}
					if(day < 10){
						day = "0" + day;
					}
					var today = year+""+month+""+day;
					var hour = dt.getHours();
					var minutes = dt.getMinutes();

					if(hour < 10){
						hour = "0" + hour;
					}
					if(minutes < 10){
						minutes = "0" +minutes;
					}
					var time = hour+":"+minutes;
					td_loop += "<tr calass='table-row'><td>"+index+"</td><td>"+today+"</td><td>"+time+"</td><td>"+data[i].temp+"</td></tr>";
				}
				html = html.replace("<%include%>", top_menu);
				html = html.replace("<%td_loop%>", td_loop);
				res.writeHeader(200, {"Content-Type":"text/html"});
				res.write(html);
				res.end();
			});
		});
	});
});
app.get('/graph',function(req, res){
	var connection = mydb.connect();
	var html = fs.readFile('./static/graph.html', function(err, html){
		html = ""+html;

		var rows = database.read_table(connection, 0, function(err,rows){

			if(err) throw err;

			var data = "";
			var comma = "";
			for(var i=0;i<rows.length;i++){
				r = rows[i];
				data +=comma + "[ new Date("+r.time.getFullYear()+","+r.time.getMonth()+","+r.time.getDate()+","+r.time.getHours()+","+
					r.time.getMinutes()+")"+","+r.temp+"]";
				comma = ",";
			}
			var header = "data.addColumn('date', 'Date/Time');";
			var id = rows[0].id;
			var start = rows[0].time;
			var end = rows[rows.length-1].time;
			header += "data.addColumn('number', 'Temp')";

			var top_menu = fs.readFile('./static/top_menu.html', function(err, top_menu){
				if(err) throw err;
				html = html.replace("<%include%>", top_menu);
				html = html.replace("<%HEADER%>", header);
				html = html.replace("<%DATA%>", data);	
				html = html.replace("<%id%>", id);
				html = html.replace("<%start%>", start);
				html = html.replace("<%end%>", end);
				res.writeHeader(200, {"Content-Type":"text/html"});
				res.write(html);
				res.end();

			});
		});
	});

});
app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});

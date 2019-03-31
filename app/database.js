const mysql = require('mysql');


var table = 'temp_sensors';

exports.add_table = function(connection, id, temp){
	var r = {};
	r.id = id;
	r.temp = temp;
	r.time = new Date();
	r.time.setHours(r.time.getHours()+9);
	var sql = 'insert into '+table+' set ?';
	var query = connection.query(sql, r, function(err, row, fields){
		if(err) throw err;
	});
	connection.end();
};

exports.read_table = function (connection, count, callback){
	var max_sql = 'select Max(idx) as max from ' + table;
	var max_query = connection.query(max_sql, function(err, max, fileds){
		if(err) throw err;
		var start = 1;
		var max_idx = JSON.parse(JSON.stringify(max))[0].max;

		if(count){
			if(max_idx >= count){
				start = max_idx - count + 1;
			}
		}
		var sql = 'select * from ' + table + ' where idx >= ' + start;

		var query = connection.query(sql, function(err, row, fields){
			if(err) throw err;

			connection.end();
			callback(null, row);
		});

	});
};

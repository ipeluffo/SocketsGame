var handler = function(req, res) {

    if (req.url.indexOf('.jpg') > -1 || req.url.indexOf('.png') > -1){
        fs.readFile(__dirname + req.url, function (err, data){
            
            if (err) console.log("Error loading IMG file: " + err);
            
            res.writeHead(200, { 'Content-Type' : 'image/jpg' });
            res.end(data, 'binary');
        });
    }

	if (req.url.indexOf('.css') > -1){
		fs.readFile(__dirname + req.url, function (err, data){
			
			if (err) console.log("Error loading CSS file: " + err);
			
			res.writeHead(200, { 'Content-Type': 'text/css' });
			res.end(data);
		});
	}

	if (req.url.indexOf('.js') > -1){
		fs.readFile(__dirname + req.url, function (err, data){
			
			if (err) console.log("Error loading JS file: " + err);
			
			res.writeHead(200, { 'Content-Type': 'text/javascript' });
			res.end(data);
		});
	}

	if (req.url.indexOf('.html') > -1){
		fs.readFile('./page.html', function (err, data) {
			console.log(data);
	        if(err) throw err;
	        res.writeHead(200);
	        res.end(data);
	    });
	}
    
};

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var Moniker = require('moniker');

var port = 3250;
app.listen(port);

/* ==================================================================== */

io.sockets.on('connection', function(socket){
    var user;

    socket.on('userEnters', function(data){
        user = addUser(data.username);
        socket.emit("userAccepted", user);
    });

    socket.on("click", function(){
        user.clicks += 4;
        if (user.clicks >= winCount){
            io.sockets.emit("win", { "user" : user });
        }

        updateUsers();
    });

    socket.on('disconnect', function() {
        removeUser(user);
    });

    socket.on('startRace', function() {
        if (!raceStarted){
            io.sockets.emit("raceStarted");
            raceStarted = true;
        }
    });

    socket.on('restartRace', function(){
        raceStarted = false;
        io.sockets.emit("raceRestarted");
        cleanUsers();
        updateUsers();
    });

});

var raceStarted = false;
var winCount = 200;
var users = [];
var globalId = 0;

var cleanUsers = function(){
    for (var i = 0; i < users.length; i++){
        users[i].clicks = 0;
    }
};

var addUser = function(username){
    var user = {
        id: globalId,
        name : username || Moniker.choose(),
        clicks: 0
    };
    globalId += 1;
    users.push(user);
    updateUsers();
    return user;
};

var removeUser = function(user){
    for (var i = 0; i < users.length; i++){
        if (user.name === users[i].name){
            users.splice(i, 1);

            if (users.length === 0){
                raceStarted = false;
            }

            io.sockets.emit("removeUser", user);
            return;
        }
    }
};

var updateUsers = function(){
    io.sockets.emit("updateUsers", { users : users });
};


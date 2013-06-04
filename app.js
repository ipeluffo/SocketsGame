var handler = function(req, res) {

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

//var app = require('http').createServer(handler);
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

    socket.on('disconnect', function() {
        removeUser(user);
    });

    socket.on("click", function(user){
        users[user.id].clicks += 1;
        if (user.clicks == winWidth){
            io.sockets.emit("win", { message: user.name + " rocks!" });
        }

        updateUsers();
    });
});

var winWidth = 150;
var users = [];

var addUser = function(username){
    var user = {
        id: users.length,
        name : username || Moniker.choose(),
        clicks: 0
    };

    users.push(user);
    updateUsers();
    return user;
};

var removeUser = function(user){
    for (var i = 0; i < users.length; i++){
        if (user.name === users[i].name){
            users.splice(i, 1);
            updateUsers();
            return;
        }
    }
};

var updateUsers = function(){
    io.sockets.emit("users", { users : users });
};


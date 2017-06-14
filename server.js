var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    convertExcel = require('excel-as-json').processFile,
    jsonFileName = '_data',
    _htmlFileURL = "http://localhost:9100/pages/leader-board.html",
    _xlsFileName = 'data.xlsx';



fs.watchFile(__dirname + '/' + _xlsFileName, function (curr, prev) {
    convertExcel(_xlsFileName, undefined, {omitEmtpyFields: false, isColOriented: false}, excelParseHandler);
});

function excelParseHandler(err, data) {
    console.log('File change....')
    fs.writeFile(__dirname + '/' + jsonFileName + '.json', JSON.stringify(data), function (err) {
        if (err) throw err;
    });
}


// creating the server ( localhost:8000 )
app.listen(8000);


// on server started we can load our client.html page
function handler(req, res) {
    fs.readFile(_htmlFileURL, function (err, data) {
        if (err) {
            console.log(err);
            res.writeHead(500);
            return res.end('Error loading client.html');
        }
        res.writeHead(200);
        res.end(data);
    });
}

io.sockets.on('connection', function (socket) {
    fs.watchFile(__dirname + '/' + jsonFileName + '.json', function (curr, prev) {
        fs.readFile(__dirname + '/' + jsonFileName + '.json', function (err, data) {
            if (err) throw err;
            // parsing the new json data and converting them into json file
            var json = JSON.parse(data);
            // send the new data to the client
            socket.volatile.emit('notification', json);
        });
    })
});

var http = require('http');
var fs = require('fs');
var os = require('os');

var GS = require('grooveshark-streaming');

var parts = 0;
var page;

console.log('Funkyshark Downloader started!')

function checkKey(e) {
	if (e.keyCode == 13) {
		extractInfo();
	}
}

function extractInfo(id) {
	var title = document.getElementById('title').value;
	
	if (title == 'Song title...') {
		title = '';
	}
	
	console.log(title);
	
	getHtml(title);
}

function downloadFile(e, p) {
	var properties = p.split('|-|');
	console.log(properties);
	console.log(e);
	http.get(e, function (res) {
		console.log('Got response : ' + res.statusCode + ". Downloading...");
		
		res.on('data', function (data) {
			if (fs.existsSync(getDownloadLocation() + properties[1] + ' - ' + properties[2] + '.mp3')) {
				fs.appendFile(getDownloadLocation() + properties[1] + ' - ' + properties[2] + '.mp3', data, function () {
					parts++
				});
			}
			else {
				console.log('Saving to file name ' + properties[1] + ' - ' + properties[2] + '.mp3');
				fs.writeFile(getDownloadLocation() + properties[1] + ' - ' + properties[2] + '.mp3', data, function () {
					console.log("Began downloading file.");
					console.log('File location : ' + getDownloadLocation() + properties[1] + ' - ' + properties[2] + '.mp3');
				});	
			}
		});
		res.on('end', function (data) {
			console.log(parts + ' parts');
		});
	}).on('error', function (err) {
		console.log('Got error : ' + err.message);
	});
}

function getDownloadLocation() {
	if (os.platform() == 'linux') {
		var loc = '/home/' + process.env['USER'] + '/Downloads/Funkshark/';
	}
	else if (os.platform() == 'win32') {
		var loc = 'C:\\Users\\' + process.env['USERNAME'] + '\\Downloads\\Funkshark\\';
	}
	/* Adding more platforms later */
	
	if (!(fs.existsSync(loc))) {
		fs.mkdirSync(loc);
	}
	
	return loc;
}

function makeList(list) {
	var listitems = document.getElementById('list').getElementsByTagName('li');
	var stringList = list;
	list = JSON.parse(list);
	document.getElementById('list').innerHTML = '';
	for (i = 0; i < list.length; i++) {
		document.getElementById('list').innerHTML = document.getElementById('list').innerHTML + '<li>' + list[i].ArtistName + ' - ' + list[i].SongName + '</li>';
		listitems[i].className = list[i].SongID + '|-|' + list[i].SongName + '|-|' + list[i].ArtistName;
		console.log(listitems[i]);
	}
	for (i = 0; i < listitems.length; i++) {
		listitems[i].onclick = function (e) {
			var properties = e.toElement.className.split('|-|');
			GS.Grooveshark.getStreamingUrl(properties[0], function(err, streamUrl) {
				console.log('Got streamUrl');
		    	downloadFile(streamUrl, e.toElement.className);
			});
		}
	}
}

function getHtml(search) {
	var request = http.get('http://tinysong.com/s/' + search + '?format=json&limit=3&key=0131065fac026c65c87e3658dfa66b88', function (res) {
		console.log('Got response : ' + res.statusCode);
		page = '';
		res.on('data', function (data) {
			page = page + data;
			//extract(data);
		});
		res.on('end', function (data) {
			makeList(page);
		})
	})
	
	request.on('error', function (err) {
		console.log('Got error : ' + err.message);
	});
	
	request.on('done', function (data) {
		console.log(data);
		console.log(page);
	});
}
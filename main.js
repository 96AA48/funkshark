var http = require('http');
var fs = require('fs');
var os = require('os');

var GS = require('grooveshark-streaming');

var parts = 0;

console.log('Funkyshark Downloader started!')

function checkKey(e) {
	if (e.keyCode == 13) {
		extractInfo();
	}
}

function extractInfo() {
	var title = document.getElementById('title').value;
	var artist = document.getElementById('artist').value;
	
	if (title == 'Song title...') {
		title = '';
	}
	else if (artist == 'Artist...') {
		artist = ''
	}
	
	console.log(title + " - " + artist);
	
	GS.Tinysong.getSongInfo(title, artist, function(err, songInfo) {
		console.log('Got songInfo');
		console.log(songInfo);
		GS.Grooveshark.getStreamingUrl(songInfo.SongID, function(err, streamUrl) {
			console.log('Got streamUrl');
	    	downloadFile(streamUrl, songInfo);
		});
	});	
}	

function downloadFile(e, i) {
	http.get(e, function (res) {
		console.log('Got response : ' + res.statusCode + ". Downloading...");
		
		res.on('data', function (data) {
			if (fs.existsSync(getDownloadLocation() + i.SongName + ' - ' + i.ArtistName + '.mp3')) {
				fs.appendFile(getDownloadLocation() + i.SongName + ' - ' + i.ArtistName + '.mp3', data, function () {
					parts++
				});
			}
			else {
				console.log('Saving to file name ' + i.SongName + ' - ' + i.ArtistName + '.mp3');
				fs.writeFile(getDownloadLocation() + i.SongName + ' - ' + i.ArtistName + '.mp3', data, function () {
					console.log("Began downloading file.");
					console.log('File location : ' + getDownloadLocation() + i.SongName + ' - ' + i.ArtistName + '.mp3');
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
		var loc = '/home/' + process.env['USER'] + '/Downloads/Funkyshark/';
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

/* New code for future use.
function getHtml(search) {
	http.get('http://tinysong.com/#/result/' + search, function (res) {
		console.log('Got response : ' + res.statusCode);
		
		res.on('data', function (data) {
			extract(data);
		});
	}).on('error', function (err) {
		console.log('Got error : ' + err.message);
	});	
}

function extract(e) {
	console.log("Gonna extract the html now.");
	$ = cheerio.load(e);
	
	console.log($('html').html());
	
	for (i = 0; i < $('ul.result').length; i++) {
		var songId = $($('ul.result div.play')[i]).attr('rel');
		var songName = $($('ul.result div.track ul li.song')[i]).html();
		var songArtist = $($('ul.result div.track ul li.artist	')[i]).html();
		
		var song = {
			'id' : songId,
			'name' : songName,
			'artist' : songArtist
		} 
		
		result.concat(song);
		console.log(result);
	}
}*/
//Node first-party libraries.
var http = require('http');
var fs = require('fs');
var os = require('os');

//Node third-party libraries.
var GS = require('grooveshark-streaming');
var request = require('request');

//Other variables.
var parts = 0;
var page;
var isDownloading = false;

//Log that Funkshark started.
console.log('Funkshark Downloader started!');

var funkshark = {
	extract : function (id) {
		var val = document.getElementById('title').value;
		
		if (val == 'Song title...') {
			val = '';
		}
		funkshark.file.search(val);		
	},
	file : {
		search : function (srch) {
				var request = http.get('http://tinysong.com/s/' + srch + '?format=json&limit=3&key=0131065fac026c65c87e3658dfa66b88', function (res) {
					page = '';
					res.on('data', function (data) {
						page = page + data;
					});
					res.on('end', function (data) {
						funkshark.file.list(page);
					});
				});
			
				request.on('error', function (err) {
					console.log('Got error while looking up song : ' + err.message);
				});
		},
		list : function (lst) {
				var listitems = document.getElementById('list').getElementsByTagName('li');
				lst = JSON.parse(lst);
				document.getElementById('list').innerHTML = '';
				for (i = 0; i < lst.length; i++) {
					document.getElementById('list').innerHTML = document.getElementById('list').innerHTML + '<li>' + lst[i].ArtistName + ' - ' + lst[i].SongName + '</li>';
					listitems[i].className = lst[i].SongID + '|-|' + lst[i].SongName + '|-|' + lst[i].ArtistName;
				}
				for (i = 0; i < listitems.length; i++) {
					listitems[i].onmouseup = function (e) {
						var properties = e.toElement.className.split('|-|');
						GS.Grooveshark.getStreamingUrl(properties[0], function(err, streamUrl) {
					    	funkshark.file.download(streamUrl, properties);
						});
					};
				}
		},
		download : function (e, p) {
			http.get(e, function (res) {
						
				res.on('data', function (data) {
					if (fs.existsSync(funkshark.file.location() + p[1] + ' - ' + p[2] + '.mp3')) {
						fs.appendFileSync(funkshark.file.location() + p[1] + ' - ' + p[2] + '.mp3', data);
						parts++;
					}
					else {
						fs.writeFile(funkshark.file.location() + p[1] + ' - ' + p[2] + '.mp3', data);	
					}
				});
			
				res.on('end', function (data) {
					/* End of file download */
				});
				res.on('error', function (err) {
					console.log('Got error : ' + err.message);
				});
					
			});
		},
		location : function () {
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
	},
	input : function (e) {
		if (e.keyCode == 13) {
			funkshark.extract();
		}
		
		if (e.ctrlKey == true) {
	        console.log("Got a control key.");
			if (e.keyCode == 4) {
	            console.log("Got CTRL + D");
				require('nw.gui').Window.get().showDevTools();
			}
		}
	},
	init  : function () {
		document.addEventListener('keypress', funkshark.input);
	}
};
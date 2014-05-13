//Node first-party libraries.
var http = require('http');
var fs = require('fs');
var os = require('os');

//Node third-party libraries.
var GS = require('grooveshark-streaming');

//Other variables.
var parts = 0;
var page;
var queue = 0;
var isDownloading = false;
var settings = {};
var lastSearch;

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
		search : function (srch, nresults) {
				if (!nresults) nresults = 3;
				lastSearch = srch;
				var request = http.get('http://tinysong.com/s/' + srch + '?format=json&limit=' + nresults + '&key=0131065fac026c65c87e3658dfa66b88', function (res) {
					page = '';
					res.on('data', function (data) {
						page = page + data;
					});
					res.on('end', function (data) {
						funkshark.file.list(page);
					});
				});
			
				request.on('error', function (err) {
					funkshark.feedback('Got error while looking up song : ' + err.message);
					$('div#more').css('display','none');
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
						queue += 1;
						var properties = e.toElement.className.split('|-|');
						properties[3] = e.toElement.className += ' downloading queue_' + queue;
						GS.Grooveshark.getStreamingUrl(properties[0], function(err, streamUrl) {
					    	funkshark.file.download(streamUrl, properties);
						});
						this.onmouseup = null;
					};
				}
				$('div#more').css('display','block');
		},
		download : function (e, p) {
			http.get(e, function (res) {
						
				res.on('data', function (data) {
					if (fs.existsSync(settings.download + p[1] + ' - ' + p[2] + '.mp3')) {
						fs.appendFileSync(settings.download + p[1] + ' - ' + p[2] + '.mp3', data);
						parts++;
					}
					else {
						fs.writeFileSync(settings.download + p[1] + ' - ' + p[2] + '.mp3', data);	
					}
				});
			
				res.on('end', function (data) {
					funkshark.file.done(p);
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
			else if (os.platform() == 'darwin') {
				var loc = "/Users/" + process.env['USER'] + "/Downloads/Funkshark/";
			}
			/* Adding more platforms later */
			
			if (!(fs.existsSync(loc))) {
				fs.mkdirSync(loc);
			}
			
			return loc;
		},
		done : function (p) {
			var attr = p[3].split(' ')[p[3].split(' ').length - 1];
			$('.' + attr).removeClass('downloading');
			$('.' + attr).addClass('downloaded');
			funkshark.feedback('Done downloading "' + p[1] + ' - ' + p[2] + '"');
		}
	},
	input : function (e) {
		if (e.keyCode == 13) {
			funkshark.extract();
		}
		
		if (e.ctrlKey == true) {
	        console.log('Got a control key.');
			if (e.keyCode == 4) {
	            console.log('Got CTRL + D');
				require('nw.gui').Window.get().showDevTools();
			}
		}
	},
	feedback : function (str) {
		$('div#feedback').html(str);
		$('div#feedback').animate({right:0}, 'fast', function () {
			setTimeout(function () {
				$('div#feedback').animate({right:-1000}, 'slow', function () {
					$('div#feedback').html('');
					$('div#feedback').css({right:-40});
				});
			},2000);
		});
	},
	settings : {
		load : function () {
			if (!localStorage.settings) {
				settings = {
					download : funkshark.file.location()
				};
			}
			else {
				
				settings = JSON.parse(localStorage.settings);
				if (typeof settings != 'object') {
					settings = JSON.parse(settings);	
				}
				console.log(settings.download);
			}
		},
		save : function () {
			localStorage.setItem('settings', JSON.stringify(settings));
		}
	},
	init  : function () {
		funkshark.settings.load();
		document.addEventListener('keypress', funkshark.input);
		$('section div#more').click(function (e) {
			if (lastSearch != null || lastSearch != undefined) {
				funkshark.file.search(lastSearch, 120);
			}
			else {
				console.log("There wasn't a last search found.");
			}
		});

		$('span#settings').click(function (e) {
			if ($('span#settings').html() == 'Settings') {
				$('section#main').fadeOut('fast', function () {
					$('section#settings').fadeIn('fast');
					$('span#settings').html('Back');
				});	
			}
			else {
				$('section#settings').fadeOut('fast', function () {
					$('section#main').fadeIn('fast');
					$('span#settings').html('Settings');
				});
			}
			
		});
	
		$('button#downloadlocation').click(function () {
			$('input#downloadlocation').click();
		});
		
		$('input#downloadlocation').change(function () {
			console.log("Changed download location");
			settings.download = $('input#downloadlocation').val();

			if (os.platform() == 'win32') {
				settings.download += '\\';
			}
			else if ((os.platform() == 'linux') || (os.platform() == 'darwin')) {
				settings.download += '/';
			}

			funkshark.settings.save();
			funkshark.settings.load();
		});	

	}
};

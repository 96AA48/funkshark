rm app.nw
zip u app.nw * -r -tzip
zip u app.nw */* -r -tzip
clear

D:/Development/Libraries/node-webkit/nw.exe --enable-logging app.nw
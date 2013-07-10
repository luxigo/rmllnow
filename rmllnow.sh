#!/bin/sh
/usr/bin/wget "http://schedule2013.rmll.info/spip.php?page=rmll_progxml2&lang=fr" -O /var/www/rmllnow/prog.xml
cd /var/www/rmllnow
node rmllnow.js > index.html
node rmllnow.js full=1 > full/index.html


#!/bin/sh
/usr/bin/wget "http://schedule2012.rmll.info/spip.php?page=rmll_progxml2&lang=fr" -O /var/www/rmllnow/prog.xml
cd /var/www/rmllnow
/usr/local/bin/node rmllnow.js > index.html


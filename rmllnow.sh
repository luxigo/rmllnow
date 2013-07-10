#!/bin/sh
cd /var/www/rmllnow
touch prog.0.xml
/usr/bin/wget "http://schedule2013.rmll.info/spip.php?page=rmll_progxml2&lang=fr" -O prog.xml
if [ $(diff prog.xml prog.0.xml | wc -l) -gt 0 ] ; then
  node rmllnow.js > index.html.tmp && mv index.html.tmp index.html
  node rmllnow.js full=1 > full/index.html.tmp && mv full/index.html.tmp full/index.html
  /usr/bin/wget "http://schedule2013.rmll.info/spip.php?page=rmll_progxml2&lang=en" -O prog.xml
  node rmllnow.js lang=en > index.en.html.tmp && mv index.en.html.tmp index.en.html
  node rmllnow.js lang=en full=1 > full/index.en.html.tmp && mv full/index.en.html.tmp full/index.en.html
  mv prog.xml prog.0.xml
fi


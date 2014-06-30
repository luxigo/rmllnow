#!/bin/sh
URL="https://rmll.info/spip.php?page=cfp_progxml&lang="
cd /var/www/rmllnow
touch prog.0.xml
/usr/bin/wget ${URL}"fr" -O prog.xml
if [ $(diff prog.xml prog.0.xml | wc -l) -gt 0 ] ; then
  node rmllnow.js > index.html.tmp && mv index.html.tmp index.html
  node rmllnow.js full=1 > full/index.html.tmp && mv full/index.html.tmp full/index.html
  /usr/bin/wget ${URL}"en" -O prog.xml
  node rmllnow.js lang=en > index.en.html.tmp && mv index.en.html.tmp index.en.html
  node rmllnow.js lang=en full=1 > full/index.en.html.tmp && mv full/index.en.html.tmp full/index.en.html
  mv prog.xml prog.0.xml
fi


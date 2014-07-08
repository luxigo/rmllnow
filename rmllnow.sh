#!/bin/sh
URL="https://$(date +%Y).rmll.info/spip.php?page=cfp_progxml&lang="
cd /var/www/rmllnow
touch prog.fr.xml
if /usr/bin/wget --no-check-certificate ${URL}"fr" -O prog.xml ; then
  if [ $(diff prog.xml prog.fr.xml | wc -l) -gt 0 ] ; then
    node rmllnow.js > index.html.tmp && mv index.html.tmp index.html
    node rmllnow.js full=1 > full/index.html.tmp && mv full/index.html.tmp full/index.html
    mv prog.xml prog.0.xml
  fi
fi
touch prog.en.xml
if /usr/bin/wget --no-check-certificate ${URL}"en" -O prog.xml ; then
  if [ $(diff prog.xml prog.en.xml | wc -l) -gt 0 ] ; then
    node rmllnow.js lang=en > index.en.html.tmp && mv index.en.html.tmp index.en.html
    node rmllnow.js lang=en\&full=1 > full/index.en.html.tmp && mv full/index.en.html.tmp full/index.en.html
    mv prog.xml prog.en.xml
  fi
fi


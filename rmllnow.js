var sys = require('util'),
    fs = require('fs'),
    xml2js = require('xml2js');

var result=[];

var en={};
var intl={};


var parser = new xml2js.Parser();
parser.addListener('end',function(xml, error) {
    if (!error) {
//      console.log(JSON.stringify(xml));
 //     process.exit(0);
        conferences_getCurrent(xml);
    }
    else {
        console.error(error);
    }
//    console.log('Done.');
});

fs.readFile( 'prog.xml', function(err, data) {
    if (!parser.parseString(data)) {
      console.error('xml2js: parse error: "%s"', parser.getError());
    }
});

var _date;
var date;
var now;
var hours;
var minutes;
var thisday;
var thisday_human;

var nameOfDay=[
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi'
];

function twoDigits(a) {
  return (parseInt(a,10)>9)?a:'0'+a;
}

var QUERY_STRING=process.argv[2]||'';
if (QUERY_STRING.substr(0,1)!='?') {
  QUERY_STRING='?'+QUERY_STRING;
}
console.log('<!-- '+QUERY_STRING+ ' -->');
var FULL=param('full');
var lang=param('lang')||'fr';

function param(name) {
  var re=new RegExp('.*[\?&]'+name+'=([^&]+).*');
  var matches=QUERY_STRING.match(re);
  return matches?decodeURIComponent(matches[1]):null;
}

function upDate() {
  var d=param('d');
  _date=(d)?new Date(d):new Date;
	date=_date.getFullYear()+'-'+twoDigits(_date.getMonth()+1)+'-'+twoDigits(_date.getDate());
	hours=_date.getHours();
	minutes=_date.getMinutes();
  var t=param('t');
  if (t) {
    t=t.split(':');
    hours=parseInt(t[0],10);
    minutes=parseInt(t[1],10);
  } else if (d && !d.match(/:/)) {
    var __date=new Date();
    hours=_date.getHours();
    minutes=_date.getMinutes();
  }
	now=_date.getDate()*1440+hours*60+minutes;
}

function conferences_getCurrent(prog) {
//        console.log(sys.inspect(prog,false,100001));

  upDate();

	function event_process(event) {
    event.date=thisday;
    event.date_human=thisday_human;
    var day=parseInt(thisday.split('-')[2],10);
		var start=event.start[0].split(':');
		event.start_time=parseInt(start[0],10)*60+parseInt(start[1],10);
		
		var duration=event.duration[0].split(':');
		var duration_time=parseInt(duration[0],10)*60+parseInt(duration[1],10);
    event.end_time=event.start_time+duration_time;

		var end_hours=Math.floor((event.start_time+duration_time)/60).toString();
		var end_minutes=(event.start_time+duration_time-end_hours*60).toString();
		event.end=twoDigits(end_hours)+':'+twoDigits(end_minutes);

    event.start_time+=day*1440;
    event.end_time+=day*1440;
/*
		if (now>=event.start_time && now<=event.end_time) {
			result.push(event);
		} else if (event.start_time-now < 120) {
			result.push(event);
		}
   */
   result.push(event);
	}

	function room_process(room) {
		var room_name=room['$'].name;
		if (Array.isArray(room.event)) {
			room.event.forEach(function(event) {
				event_process(event);
			});
		} else {
			event_process(room.event);
		}
	}

	prog.schedule.day.forEach(function(day) {
      thisday=day['$'].date;
      var _date=new Date(thisday); 
      thisday_human=t(nameOfDay[_date.getDay()])+' '+_date.getDate();

		if(FULL || day['$'].date==date) {
			if (Array.isArray(day.room)) {
				day.room.forEach(function(room) {
					room_process(room);
				}); 
			} else {
				room_process(day.room);
			}
		}
	});

  result.sort(function(a,b){
    var delta=a.start_time-b.start_time;
    if (!delta) {
      return a.end_time-b.end_time;
    } else  {
      return delta;
    }
  });

  var html='<!DOCTYPE html>';
  html+='<html>';
  html+=HEAD();
  html+='<body>';
  html+=index(result);
  html+=pages(result);
  html+='</body>';
  html+='</html>';

  console.log(html);
//  console.log(JSON.stringify(result));

}


function HEAD() {
  var html='<head>';
  html+='<meta charset="utf-8">';
  html+='<meta name="viewport" content="width=device-width, initial-scale=1">';
  html+='<title>RMLL Now !</title>';
  html+='<link rel="shortcut icon" href="favicon.ico" />';
  html+='<link rel="stylesheet" href="themes/rmll.css" />'

  html+='<link rel="stylesheet" href="jquery.mobile.css" />';
  html+='<link rel="stylesheet" href="rmllnow.css" />';
  html+='<script src="jquery.js"></script>';
  html+='<script src="_rmllnow.js"></script>';
  html+='<script src="jquery.mobile.js"></script>';
  html+='<script>';
  html+='var FULL='+FULL;
  html+='</script>';
  html+='</head>';
  return html;
}

function header(name,title,titleClass) {
  var html='<!-- start of page: #'+name+' -->';
  html+='<div data-role="page" id="'+name+'">';
  html+='<div data-role="header" data-position="fixed">';
  if (name=='index') {
    html+='<a href onclick="setTimeout(moreless,0)" id="moreless" data-position="left" data-role="button" data-icon="plus" data-iconpos="notext" title="Afficher/Cacher les autres événements"></a>';
  } else {
    html+='<a href onclick="document.location.assign(\'#\')" id="home" data-position="left" data-role="button" data-icon="home" data-iconpos="notext" title="Revenir à la liste"></a>';
    html+='<a href id="next" onclick="next()" class="arrow_right" data-role="button" data-position="right" data-icon="arrow-r" data-iconpos="notext" title="Prochain événement"></a>';
  }
//html+='<span class="navbar" data-role="controlgroup" data-type="horizontal">';
//html+='<a href class="arrow_left" data-role="button" data-icon="arrow-l" data-iconpos="notext"></a>';
//html+='<a href class="arrow_up" data-role="button" data-icon="arrow-u" data-iconpos="notext"></a>';
//html+='</span>';
  html+='<h1'+((titleClass)?' class="'+titleClass+'"':'')+'>'+title+'</h1>';
  html+='</div><!-- /header -->';
  html+='<div data-role="content">';
  return html;
}
 
function index(list) {
  
  var html=header('index',date,'today');

  html+="<div id=\"nothing\" data-role=\"popup\"><center>Aucun événement à afficher<center></div>";

  html+=confListView(list);

  html+=footer();
  return html;
}

function confListView(list) {
  var html='<ul data-role="listview" data-filter="true" title="Afficher les détails de l\'événement">';
	list.forEach(function(event){
    html+='<li data-date="'+event.date+'" data-start="'+event.start_time+'" data-end="'+event.end_time+'"><a href="#_'+event['$'].id+'">';

    html+=event.title;
    html+='<span class="details">'+(t(event_type[event.type])?' &nbsp;('+t(event_type[event.type])+' &mdash; '+event.track+')':'('+event.track+')')+'</span>';
    var who=intervenants(event,true);
    html+=who.length?'<div class="who">'+who+'</div>':'';
    html+='<div class="sec">';
    html+=(FULL?'<span class="full">'+event.date_human+' &mdash; </span>':'')+event.start+' - '+event.end+' &nbsp;';
    html+=event.room;
    html+='</div>';
    html+='</a></li>';
	});
  html+='</ul>';
  return html;
} 

var event_type={
  fr : {
    plen: 'Plénière',
    conf: 'Conférence',
    atl: 'Atelier',
    ligtal: 'Lightning talk',
    ag: 'Assemblée générale',
    tabler: 'Table ronde'
  },
  en: {
    plen: 'Plenary',
    conf: 'Conference',
    atl: 'Workshop',
    ligtal: 'Lightning talk',
    ag: 'General meeting',
    tabler: 'Round table'
  }
};

function t(txt) {
  return (intl[lang] && intl[lang][txt])?intl[lang][txt]:txt;
}

function pages(list) {
  var html='';
	list.forEach(function(event){
    html+=header('_'+event['$'].id,(FULL?'<span class="full">'+event.date_human+' &mdash; </span>':'')+event.start+' - '+event.end);
    html+='<h3 class="track">'+event.track+'</h3>';
    html+='<h2>'+event.title+(t(event_type[event.type])?' <span class="etype">('+t(event_type[event.type])+')</span>':'')+'</h2>';
    html+=intervenants(event);
    html+=event.description[0].replace(/h3/g,'strong');
    //var ho='<strong>Horaire:</strong> '+event.start+' - '+event.end+' <strong>&mdash; Salle:</strong> '+event.room;
   // var ho='<strong>Horaire:</strong> '+event.start+' - '+event.end;
   // html+=ho;

    html+=footer(event.room);
	});
  return html;
}

function intervenants(event,notitle) {
   var html='';
   if (event.persons && event.persons[0].person) {
     if (!Array.isArray(event.persons[0].person)) {
       event.persons[0].person=[event.persons[0].person];
     }
     if (!notitle) html+='<p><span class="intervenants">Intervenant'+(event.persons[0].person.length>1?'s' :'')+' :</span> ';
     event.persons[0].person.forEach(function(person,idx){
       html+=(idx?', ':'')+person['_'];
     });
     html+='</p>';
   }
   return html;
}

function footer(title) {
  var html='';
  html+='</div><!-- /content -->';
  if (title) {
    html+='<div data-role="footer" data-position="fixed">';
    html+='<h1>'+(title?title:'')+'</h1>';
    html+='</div><!-- /footer -->';
  }
  html+='</div><!-- /page -->';
  return html;
}


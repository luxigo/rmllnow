var lang="fr";
var firstPageShow=true;

$(document).bind('pagecreate',function(e){
  if ($(e.target).attr('id')=='index') {
    updateList();
  }
});

$(document).bind('pageshow',function(e){
  if ($(e.target).attr('id')!='index') {
    getNextPage();
  }
  if (firstPageShow) {
    updateFull();
    searchInputSetup();
    firstPageShow=false;
  }
});

function searchInputSetup() {
    if (!_FULL) return;
    $(document).bind('keydown',function(e){
      var input=$('input[data-type=search]:visible');
      if (e.keyCode==27) {
        if (input.length && input.val().length) {
          input.val('').trigger('change');
        }
        input.focus();
      }
    });
    var input=$('input[data-type=search]');
    if (!input.val().length) {
      input.val(getNameOfDay(_date.getDay()));
      input.trigger('change');
    }
    input.attr('title',t('Recherche - touche Esc pour effacer/modifier'));
}

function updateFull() {
  if (!_FULL || (_FULL && !showall)) {
    $('li[data-date!='+date+'], .full').addClass('hidden');
  } else if (_FULL) {
    $('li[data-date], .full').removeClass('hidden');
  }
}

var nextPageLI;
function getNextPage() {
	var url;
	var li=$('a[href=#'+$('.ui-page-active').attr('id')+']').closest('li').next('li');
	updateTime();
	while (li.size() && (li.now<parseInt(li.attr('data-start'),10) || now>parseInt(li.attr('data-end'),10) || li.hasClass('hidden') || li.hasClass('ui-screen-hidden'))) {
		li=li.next();
	}
	if (li.size()) {
		$('#next','*').show();
	} else {
		$('#next','*').hide();
	}
	
	nextPageLI=li;
}

function next() {
	url=nextPageLI.find('a').attr('href');
	if (url.length) {
		document.location.assign(url);
	}
}

function twoDigits(a) {
    return (parseInt(a,10)>9)?a:'0'+a;
}

var today;
var prevdate;
var updateListTimeout;
var showall=false;

function moreless(){
	if ($('#moreless').data('icon')=='minus') {
		$('#moreless').data('icon','plus').find('.ui-icon').removeClass('ui-icon-minus').addClass('ui-icon-plus');
		showall=false;
    updateFull();
	} else {
		$('#moreless').data('icon','minus').find('.ui-icon').removeClass('ui-icon-plus').addClass('ui-icon-minus');
		showall=true;
    updateFull();
	}
	updateList();
  showFirst();
}

function showFirst() {
  //setTimeout(function(){
    var li=$('li[data-date]:not(.notnow):first');
      if (li.length) {
        $(document.body).scrollTop(li.offset().top-44);
      }
  //},1);
}

var _date;
var date;
var hours;
var minutes;
var now;
var date_human;

var nameOfDay=[
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi'
];

var nameOfMonth=[
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre'
];

function getNameOfDay(d) {
  return nameOfDay[d].substr(0,1).toUpperCase()+nameOfDay[d].substr(1);
}

function param(name) {
  var QUERY_STRING=document.location.search||'';
//  console.log('QUERY_STRING',QUERY_STRING);
  var re=new RegExp('.*[\?&]'+name+'=([^&]+).*');
  var matches=QUERY_STRING.match(re);
  return matches?decodeURIComponent(matches[1]):null;
}

//var FULL=param('full');
var _FULL;

function updateTime() {
  var d=param('d');
  _date=(d)?new Date(d):new Date;
  date=_date.getFullYear()+'-'+twoDigits(_date.getMonth()+1)+'-'+twoDigits(_date.getDate());
  hours=_date.getHours();
  minutes=_date.getMinutes();
  var _t=param('t');
  if (_t || (!hours && !minutes)) {
    _t=_t.split(':');
    hours=parseInt(_t[0],10);
    minutes=parseInt(_t[1],10);
  } else if (d && !d.match(/:/)) {
    var __date=new Date();
    hours=_date.getHours();
    minutes=_date.getMinutes();
  }
  now=_date.getDate()*1440+hours*60+minutes;
  tomorrow=_date.getDate()*1440+23*60+59;

  date_human=t(getNameOfDay(_date.getDay()))+' '+_date.getDate()+' '+t(nameOfMonth[_date.getMonth()]);

}

function updateSearchInput() {
  var input=$('input[data-type=search]:visible');
  if (!input.length || !input.val().length) {
    return;
  }
  var prevDay=_nameOfDay.indexOf(input.val().toLowerCase().trim());
  if (prevDay<0) {
    return;
  }
  var today=_date.getDay();
  if ((prevDay+1)%7 == today) {
    input.val(getNameOfDay(today)).trigger('change');
  }
}

var today_start=[];
var today_stop=[];

function updateList(){

  if (updateListTimeout) {
    clearTimeout(updateListTimeout);
    updateListTimeout=null;
  }

  updateTime();

  if (date!=prevdate) {
    updateSearchInput();
    if (_FULL==undefined) {
      _FULL=$('.full').length;
    }
    today=$('li[data-date'+(_FULL?'':'='+date)+']')
    .each(function(i,li){
    	li=$(li);
      today_start[i]=parseInt(li.attr('data-start'),10);
      today_stop[i]=parseInt(li.attr('data-end'),10);
    });
    prevdate=date;
  }

  var count=0;
  today.each(function(i,li){
    li=$(li);
	//console.log(i,now,today_start[i]);
    if (now>=today_start[i] && now<=today_stop[i]) {
      li.removeClass('notnow next');
      if (!li.hasClass('ui-screen-hidden')) {
        li.removeClass('hidden');
        ++count;
      }
    } else {
      li.removeClass('next');
      li.addClass('notnow');
      if (showall) {
        if (!li.hasClass('ui-screen-hidden')) {
          li.removeClass('hidden');
          ++count;
        }
      } else {
          li.addClass('hidden');
      }
    } 
  });

  count=nextEvents(today,count);

  if (count==0) {
  	$('#nothing').removeClass('hidden');
  } else {
  	$('#nothing').addClass('hidden');
  }
  //$('.today').text(_FULL?date+' '+twoDigits(hours)+':'+twoDigits(minutes):date);
  $('.today').text(date_human);
  updateListTimeout=setTimeout(updateList,60*1000);
}

function nextEvents(today,count) {
  var delta=0;
  while(true) {
    delta+=60;
    today.each(function(i,li){
      li=$(li);
      if ((now+delta>=today_start[i] && today_start[i]<tomorrow && now<=today_stop[i]) && li.hasClass('notnow')) {
        li.removeClass('notnow').addClass('next');
        if (!li.hasClass('ui-screen-hidden')) {
          li.removeClass('hidden');
          ++count;
        }
      }
    });
    if (count!=0 || now+delta>tomorrow) break;
  }
  return count;
}

var en={
	'Filtrer la liste...': 'Filter list...'
};

function t(txt){
  if (lang=="fr") return txt;
  return en[txt]?en[txt]:txt;
}

function updateNothing() {
  if ($('li:visible').size()==0) {
	$('#nothing').removeClass('hidden');
  } else {
	$('#nothing').addClass('hidden');
  }
}

var filterCallback;
var filterCallbackTimeout;
$(document).bind("mobileinit", function(){
  $.mobile.defaultPageTransition='none';
    // Page
    $.mobile.page.prototype.options.headerTheme="a";
    $.mobile.page.prototype.options.contentTheme="a";
    $.mobile.page.prototype.options.footerTheme="a";
    $.mobile.page.prototype.options.theme="a";

    // Listviews
    $.mobile.listview.prototype.options.headerTheme="a";
    $.mobile.listview.prototype.options.theme="a";
    $.mobile.listview.prototype.options.dividerTheme="a";

    $.mobile.listview.prototype.options.splitTheme="a";
    $.mobile.listview.prototype.options.countTheme="a";
    $.mobile.listview.prototype.options.filterTheme="a";
    $.mobile.listview.prototype.options.filterPlaceholder=t("Filtrer la liste...");
    filterCallback=$.mobile.listview.prototype.options.filterCallback;
    $.mobile.listview.prototype.options.filterCallback=function(text,searchValue) {
        if (filterCallbackTimeout) {
		clearTimeout(filterCallbackTimeout);
	}
	filterCallbackTimeout=setTimeout(updateNothing,100);
	return filterCallback(text.toLowerCase(),searchValue);
    }

});

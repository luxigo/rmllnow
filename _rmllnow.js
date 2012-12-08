var lang="fr";

$(document).bind('pagecreate',function(e){
  if ($(e.target).attr('id')=='index') {
    updateList();
  }
});

$(document).bind('pageshow',function(e){
  if ($(e.target).attr('id')!='index') {
    getNextPage();
  }
});

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
	} else {
		$('#moreless').data('icon','minus').find('.ui-icon').removeClass('ui-icon-plus').addClass('ui-icon-minus');
		showall=true;
	}
	updateList();
}

var _date;
var date;
var hours;
var minutes;
var now;

function updateTime() {
  _date=new Date;
  date=_date.getFullYear()+'-'+twoDigits(_date.getMonth()+1)+'-'+twoDigits(_date.getDate());
  hours=_date.getHours();
  minutes=_date.getMinutes();
  now=_date.getDate()*1440+hours*60+minutes;
/////uncomment for testing (same date must be set in rmllnow.js)
//date='2012-07-09';
//now=10*1440+11*60;
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
    $('li[data-date!='+date+']').addClass('hidden');
    today=$('li[data-date='+date+']')
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
    if (now>=today_start[i] && now<=today_stop[i]) {
      li.removeClass('notnow');
      if (!li.hasClass('ui-screen-hidden')) {
        li.removeClass('hidden');
        ++count;
      }
    } else {
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
  if (count==0) {
	$('#nothing').removeClass('hidden');
  } else {
	$('#nothing').addClass('hidden');
  }
  updateListTimeout=setTimeout(updateList,60*1000);
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

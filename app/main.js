dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("esri.arcgis.utils");
dojo.require("esri.map");

/******************************************************
***************** begin config section ****************
*******************************************************/

var TITLE = "One World, Many Voices: Endangered Languages and Cultural Heritage"
var BYLINE = "Subtitle to come.";
var BASEMAP_SERVICE_NATGEO = "http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer";
var SERVICE_HOTSPOTS = "http://tiles.arcgis.com/tiles/nzS0F0zdNLvs7nc8/arcgis/rest/services/LanguageHotspots/MapServer";
var SERVICE_HOTSPOTS_FEATURES = "http://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/LanguageHotspots/FeatureServer/0"
var SPREADSHEET_MAIN_URL = "/proxy/proxy.ashx?https://docs.google.com/spreadsheet/pub?key=0ApQt3h4b9AptdDR2cjc2Wm4xcFpSQjVlT2ZnX3BEemc&output=csv";
var SPREADSHEET_OVERVIEW_URL = "/proxy/proxy.ashx?https://docs.google.com/spreadsheet/pub?key=0ApQt3h4b9AptdDByc0FOY2NacHZNUlhjWnZ6WHdYb1E&output=csv";

/******************************************************
***************** end config section ******************
*******************************************************/


var STATE_NO_SELECTION = 0;
var STATE_SELECTION_OVERVIEW = 1;
var STATE_SELECTION_LOCAL = 2;

var ICONS_PATH = "resources/icons/";
var ARTWORK_PATH = "resources/artwork/";
var MEDIA_PATH = "https://dl.dropboxusercontent.com/u/142378389/";

var INIT_CENTER;

var _currentState = STATE_NO_SELECTION;
var _languageID;
var _scroll;

var _map;
var _recsMain;
var _recsOV;
var _lods;
var _lut = [
	{languageID:1, language:"Siletz Dee-ni", art:"PanelSiletz.jpg", icon:"Icon1Siletz.png", icon2:"IconSiletz.png", color:"#a72179"},
	{languageID:2, language:"Koro", art:"PanelKoro.jpg", icon:"Icon1Koro.png", icon2:"IconKoro.png", color:"#baa025"},
	{languageID:3, language:"Tuvan", art:"PanelTuvan.jpg", icon:"Icon1Tuvan.png", icon2:"IconTuvan.png", color:"#799811"},
	{languageID:4, language:"Hawaiian", art:"PanelHawaii.jpg", icon:"Icon1Hawaii.png", icon2:"IconHawaii.png", color:"#0b9618"},
	{languageID:5, language:"Welsh", art:"PanelWales.jpg", icon:"Icon1Wales.png", icon2:"IconWales.png", color:"#29a883"},
	{languageID:6, language:"Garifuna", art:"PanelGarifuna.jpg", icon:"Icon1Garifuna.png", icon2:"IconGarifuna.png", color:"#e7870a"},
	{languageID:7, language:"Kalmyk", art:"PanelKalmyk.jpg", icon:"Icon1Kalmyk.png", icon2:"IconKalmyk.png", color:"#7e50e7"},
	{languageID:8, language:"Passama-quoddy", art:"PanelPassamaquoddy.jpg", icon:"Icon1Passamaquoddy.png", icon2:"IconPassamaquoddy.png", color:"#4164d4"},
	{languageID:9, language:"Penobscot", art:"PanelPenobscot.jpg", icon:"Icon1Penobscot.png", icon2:"IconPenobscot.png", color:"#b1551d"},
	{languageID:10, language:"Kallawaya", art:"PanelKallawaya.jpg", icon:"Icon1Kallawaya.png", icon2:"IconKallawaya.png", color:"#17a49c"},
	{languageID:11, language:"Wayuunaiki", art:"PanelWayuu.jpg", icon:"Icon1Wayuu.png", icon2:"IconWayuu.png", color:"#a20b0b"},
	{languageID:13, language:"Kichwa", art:"PanelKichwa.jpg", icon:"Icon1Kichwa.png", icon2:"IconKichwa.png", color:"#aa7830"},
	{languageID:12, language:"Ri Palenge", art:"PanelRiPalenge.jpg", icon:"Icon1RiPalenge.png", icon2:"IconRiPalenge.png", color:"#ca6739"},
	{languageID:14, language:"Kamentzá", art:"PanelKamentza.jpg", icon:"Icon1Kamentza.png", icon2:"IconKamentza.png", color:"#2084e2"},
	{languageID:15, language:"Quechua", art:"PanelQuechua.jpg", icon:"Icon1Quechua.png", icon2:"IconQuechua.png", color:"#4a8920"},
	{languageID:16, language:"Isthmus Zapotec", art:"PanelZapotek.jpg", icon:"Icon1Zapotek.png", icon2:"IconZapotek.png", color:"#0b9ece"},
	{languageID:17, language:"Yiddish", art:"PanelYiddish.jpg", icon:"Icon1Yiddish.png", icon2:"IconYiddish.png", color:"#cb2c21"},
	{languageID:18, language:"Purari - I'ai dialect", art:"PanelPNG.jpg", icon:"Icon1PNG.png", icon2:"IconPNG.png", color:"#d769ce"},
	{languageID:19, language:"Arhuaco", art:"", icon:"", icon2:"", color:"#9143be"},
	{languageID:20, language:"Uitoto", art:"", icon:"", icon2:"", color:"#1e8a9e"}	
];

var _layerOV;
var _layerSelected; // todo: still need a separate layer for selected?
var _layerStoryPoints;
var _layerRegions;

var _dojoReady = false;
var _jqueryReady = false;

var _selected = [];

var _homeExtent; // set this in init() if desired; otherwise, it will 
				 // be the default extent of the web map;

var _isMobile = isMobile();
var _isIE = (navigator.appVersion.indexOf("MSIE") > -1);
var _isLegacyIE = ((navigator.appVersion.indexOf("MSIE 8") > -1) || (navigator.appVersion.indexOf("MSIE 7") > -1));
var _isEmbed = false;

var _lutBallIconSpecs = {
	tiny:new IconSpecs(24,24,12,12),
	medium:new IconSpecs(30,30,15,15),
	large:new IconSpecs(30,30,15,15)
}

var _lutPinIconSpecs = {
	tiny:new IconSpecs(24,24,12,12),
	medium:new IconSpecs(30,30,15,15),
	large:new IconSpecs(43,42,30,21)
}

dojo.addOnLoad(function() {_dojoReady = true;init()});
jQuery(document).ready(function() {_jqueryReady = true;init()});

function init() {
	
	if (!_jqueryReady) return;
	if (!_dojoReady) return;
	
	INIT_CENTER = new esri.geometry.Point(-293518, 2778638, new esri.SpatialReference({wkid: 102100}));
	
	// determine whether we're in embed mode
	
	var queryString = esri.urlToObject(document.location.href).query;
	if (queryString) {
		if (queryString.embed) {
			if (queryString.embed.toUpperCase() == "TRUE") {
				_isEmbed = true;
			}
		}
	}

	$.each(_lut, function(index, value) {
		$("#listThumbs").append("<li value='"+value.languageID+"'><img src='"+ARTWORK_PATH+value.art+"' style='max-height:70px'/><span>"+value.language+"</span><div class='selectionHalo'></div></li>");
	});
	
	if (_isMobile) {
		_scroll = new iScroll('outerCarousel', {snap:'li',momentum:true,hScrollbar:false});
	}
	
	// jQuery event assignment
	
	$(this).resize(handleWindowResize);
	
	$("#zoomIn").click(function(e) {
        _map.setLevel(_map.getLevel()+1);
    });
	$("#zoomOut").click(function(e) {
        _map.setLevel(_map.getLevel()-1);
    });
	$("#zoomExtent").click(function(e) {
        _map.setExtent(_homeExtent);
    });
	
	$("#arrowRight").click(function(e) {
        pageRight();
    });
	
	$("#arrowLeft").click(function(e) {
        pageLeft();
    });
	
	$("#title").append(TITLE);
	$("#subtitle").append(BYLINE);	

	_map = new esri.Map("map", {
		slider:false, 
		center:INIT_CENTER, 
		zoom:2
	});
	_map.addLayer(new esri.layers.ArcGISTiledMapServiceLayer(BASEMAP_SERVICE_NATGEO));

	_layerRegions = new esri.layers.FeatureLayer(SERVICE_HOTSPOTS_FEATURES,{mode:esri.layers.FeatureLayer.MODE_SNAPSHOT, outFields: ["*"]});
	_layerRegions.setOpacity(0.4);
	_map.addLayer(_layerRegions);
		
	_layerOV = new esri.layers.GraphicsLayer();
	_map.addLayer(_layerOV);
	
	_layerSelected = new esri.layers.GraphicsLayer();
	_map.addLayer(_layerSelected);

	_layerStoryPoints = new esri.layers.GraphicsLayer();
	_map.addLayer(_layerStoryPoints);

	
	dojo.connect(_layerRegions, "onMouseOver", layerRegions_onMouseOver);
	dojo.connect(_layerRegions, "onMouseOut", layerRegions_onMouseOut);
	dojo.connect(_layerRegions, "onClick", layerRegions_onClick);
	
	dojo.connect(_layerStoryPoints, "onMouseOver", layerLocal_onMouseOver);
	dojo.connect(_layerStoryPoints, "onMouseOut", layerLocal_onMouseOut);
	dojo.connect(_layerStoryPoints, "onClick", layerLocal_onClick);
			
	dojo.connect(_layerOV, "onMouseOver", layerOV_onMouseOver);
	dojo.connect(_layerOV, "onMouseOut", layerOV_onMouseOut);
	dojo.connect(_layerOV, "onClick", layerOV_onClick);	

	dojo.connect(_layerSelected, "onMouseOver", layerOV_onMouseOver);
	dojo.connect(_layerSelected, "onMouseOut", layerOV_onMouseOut);
	dojo.connect(_layerSelected, "onClick", layerOV_onClick);	
	
	if(_map.loaded){
		init2();
	} else {
		dojo.connect(_map,"onLoad",function(){
			init2();
		});
	}
}

function init2() {

	// if _homeExtent hasn't been set, then default to the initial extent
	// of the web map.  On the other hand, if it HAS been set AND we're using
	// the embed option, we need to reset the extent (because the map dimensions
	// have been changed on the fly).

	if (!_homeExtent) {
		_homeExtent = _map.extent;
	} else {
		if (_isEmbed) {
			setTimeout(function(){
				_map.setExtent(_homeExtent)
			},500);
		}	
	}
	
	_lods = _map._params.lods.reverse();
	
	handleWindowResize();
	setTimeout(function(){_map.centerAt(INIT_CENTER)},500);
	// get the spreadsheet data
	
	var serviceMain = new CSVService();
	$(serviceMain).bind("complete", function(){	
		var parser = new ParserMain(serviceMain.getLines());
		_recsMain = parser.getRecs();
		init3();
	});
	serviceMain.process(SPREADSHEET_MAIN_URL);
	
	var serviceOverview = new CSVService();
	$(serviceOverview).bind("complete", function() {
		var parser = new ParserOV(serviceOverview.getLines());	
		_recsOV = parser.getRecs()
		init3();
	});
	serviceOverview.process(SPREADSHEET_OVERVIEW_URL);
	
}

function init3() 
{
	if ((_recsMain == null) || (_recsOV == null)) {
		return;
	}
	
	// create a master list of unique language id's
	// - sorted by language name (todo: still?)
	// - only languages for which there's artwork in _lut (todo:still?)
	
	_master = createMaster();
	
	$("#listThumbs li").click(function(e) {
		_languageID = $(this).val();
		changeState(STATE_SELECTION_OVERVIEW);
    });
	
	$("#zoomButton").click(function(e) {
		if (_layerStoryPoints.graphics.length == 0) {
			alert('no story points currently available for this language');
			return false;
		}
        changeState(STATE_SELECTION_LOCAL);
    });
	
	var pt;	
	var icon;
	$.each(_recsOV, function(index, value) {
		// todo: this checks to make sure that the language of the current record is represented in
		//       the master list.  check is necessary now because not all languages have artwork.
		//       eventually, probably not necessary.
		if ($.grep(_master, function(n, i){return n.languageID == value.getLanguageID()}).length > 0) {
			pt = esri.geometry.geographicToWebMercator(
				new esri.geometry.Point(
					[value.getLongitude(), value.getLatitude()],
					new esri.SpatialReference({ wkid:4326}))
			);
			icon = $.grep(_lut, function(n, i){return n.languageID == value.getLanguageID()})[0].icon;
			graphic = new esri.Graphic(pt, createIconMarker(ICONS_PATH+icon, _lutBallIconSpecs.tiny), value);		
			_layerOV.add(graphic);
		}
	});

	_map.centerAt(INIT_CENTER);
	
	if(_scroll){_scroll.refresh()}	
				
}

function layerLocal_onMouseOver(event)
{
	if (_isMobile) return;
	var graphic = event.graphic;
	_map.setMapCursor("pointer");	
	$("#hoverInfo").html("Click to show story.");
	var pt = _map.toScreen(graphic.geometry);
	hoverInfoPos(pt.x,pt.y);	
}

function layerLocal_onMouseOut(event)
{
	_map.setMapCursor("default");
	$("#hoverInfo").hide();	
}

function layerLocal_onClick(event)
{
	var graphic = event.graphic;
	_localCounter = $.inArray(graphic, _layerStoryPoints.graphics);
	$("#hoverInfo").hide();	
	displayLocalRecord(_layerStoryPoints.graphics[_localCounter]);
	displayLocalTip(_layerStoryPoints.graphics[_localCounter]);
}

function layerOV_onMouseOver(event) 
{
	if (_isMobile) return;
	var graphic = event.graphic;
	_map.setMapCursor("pointer");
	if ($.inArray(graphic, _selected) == -1) {
		graphic.setSymbol(resizeSymbol(graphic.symbol, _lutBallIconSpecs.medium));
	}
	if (!_isIE) moveGraphicToFront(graphic);	
	$("#hoverInfo").html("<b>"+graphic.attributes.getLanguage()+"</b>"+"<p>"+graphic.attributes.getRegion());
	var pt = _map.toScreen(graphic.geometry);
	hoverInfoPos(pt.x,pt.y);	
}


function layerOV_onMouseOut(event) 
{
	var graphic = event.graphic;
	_map.setMapCursor("default");
	$("#hoverInfo").hide();
	if ($.inArray(graphic, _selected) == -1) {
		graphic.setSymbol(resizeSymbol(graphic.symbol, _lutBallIconSpecs.tiny));
	}
}


function layerOV_onClick(event) 
{
	$("#hoverInfo").hide();
	var graphic = event.graphic;
	_languageID = graphic.attributes.getLanguageID();
	$("#selectLanguage").val(_languageID);
	changeState(STATE_SELECTION_OVERVIEW);
	scrollToPage($.inArray($.grep($("#listThumbs").children("li"),function(n,i){return n.value == _languageID})[0], $("#listThumbs").children("li")));	
}

function layerRegions_onMouseOver(event)
{
	if (_isMobile) return;
	$("#hoverInfo").html("<b>"+event.graphic.attributes.FeatureLabel+"</b>");
	var x = event.x;
	var y = event.y;
	if (!_isLegacyIE) {
		x = x - $("#info").width();
		y = y - ($("#header").height() + $("#controls").height())
	}
	hoverInfoPos(x, y);	
}

function layerRegions_onMouseOut(event)
{
	_map.setMapCursor("default");
	$("#hoverInfo").hide();
}

function layerRegions_onClick(event)
{
}

function changeState(toState)
{
	$("#infoIntro").hide();
	var fromState = _currentState;
	_currentState = toState;
	if (_currentState == STATE_SELECTION_OVERVIEW) {
		_layerStoryPoints.hide();
		_layerOV.show();
		_layerSelected.show();
		doSelect(_languageID);
		zoomToSelected(_selected);
		console.log("url: ", _selected[0].attributes.getURL());
		displayOverviewRecord($("#infoOverview"));
		$("#zoomButton").fadeIn();
		$("#infoLocal").fadeOut(1000);
	} else if (_currentState == STATE_SELECTION_LOCAL) {
		_layerOV.hide();
		_layerSelected.hide();

		$("#map").multiTips({
			pointArray : [],
			mapVariable : _map,
			labelDirection : "top",
			backgroundColor : "#dadada",
			textColor : "#444",
			pointerColor: "#444"
		});
		_layerStoryPoints.show();
		$("#zoomButton").fadeOut();
		_localCounter = 0;
		displayLocalRecord(_layerStoryPoints.graphics[_localCounter]);		
		setTimeout(function(){zoomToStoryPoints()}, 1000)
		setTimeout(function(){displayLocalTip(_layerStoryPoints.graphics[_localCounter])}, 2000);
		$("#infoLocal").fadeIn(1000);
	} else {
		alert('invalid state');
	}
}

function createSoundDiv(soundfile) {
	var audio = $("<audio autoplay controls></audio>");
	// IE9 doesn't like single quotes, so I'm setting
	// the attributes this way.
	var source1 = $("<source></source>");
	$(source1).attr("src", soundfile);
	$(source1).attr("type", "audio/mpeg");
	$(audio).append(source1);
	$(audio).append("<embed src='"+soundfile+"' hidden='true' autostart='true' loop='false' />");
	return audio;
 }

// -----------------
// private functions
// -----------------

function doNextLocal()
{
	_localCounter++;
	if (_localCounter > _layerStoryPoints.graphics.length - 1) _localCounter = 0;
	displayLocalRecord(_layerStoryPoints.graphics[_localCounter]);
	displayLocalTip(_layerStoryPoints.graphics[_localCounter]);
}


function doPrevLocal()
{
	_localCounter--;
	if (_localCounter < 0) _localCounter = _layerStoryPoints.graphics.length - 1;
	displayLocalRecord(_layerStoryPoints.graphics[_localCounter]);
	displayLocalTip(_layerStoryPoints.graphics[_localCounter]);
}

function displayOverviewRecord(parentDiv)
{
	
	$(parentDiv).empty();
	$(parentDiv).append("<div class='info-box'>"+_selected[0].attributes.getLanguage().toUpperCase()+"</div>");
	
	var divTop = $("<div class='top'></div>")
	$(divTop).append("<div class='info-title'>"+_selected[0].attributes.getName()+"</div>");		
	var url = _selected[0].attributes.getURL();
	if (url == "") {
		$(divTop).append("No photo available");
	} else {
		if (url.indexOf("http") == -1) url = MEDIA_PATH+"/"+url;
		$(divTop).append("<div class='picture-frame'><img class='feature-image' src='"+url+"'/><div>");
	}
	$(divTop).append(createSoundDiv(MEDIA_PATH+"/"+_selected[0].attributes.getAudio()));
	
	var divIndented = $("<div class='info-indented'></div>")
	$(divIndented).append(divTop);
	$(divIndented).append("<div class='info-caption'>"+_selected[0].attributes.getText()+"</div>");
	//$(divIndented).append("<a href='"+MEDIA_PATH+"/"+_selected[0].attributes.getAudio()+"' target='_blank' style='margin-top:10px'>Audio Diagnostic</a>");
	
	$(parentDiv).append(divIndented);
	
	var color = $.grep(_lut, function(n, i){return n.languageID == _languageID})[0].color;
	$(".info-box").css("background-color", color);
	
	setTimeout(function(){handleWindowResize()},1000);
	
}

function displayLocalRecord(graphic)
{
	
	var rec = graphic.attributes;
	
	$("#infoLocal").empty();
	$("#infoLocal").append("<div class='info-box'>"+rec.getLanguage().toUpperCase()+"</div>");			
	
	if (rec.getPhoto()) {
		$("#infoLocal").append("<div class='picture-frame'><img class='feature-image' src='"+MEDIA_PATH+"/"+rec.getPhoto()+"'/></div>");
		$("#infoLocal").append("<span class='credits'>"+rec.getCreditPhoto()+"</span>");
	}

	if (rec.getVideo()) {
		var tokens = rec.getVideo().split("/"); 
		var youTubeID = tokens[tokens.length - 1];
		$("#infoLocal").append("<iframe src='http://www.youtube.com/embed/"+youTubeID+"?rel=0' frameborder='0' allowfullscreen></iframe>");
		$("#infoLocal").append("<span class='credits'>"+rec.getCreditVideo()+"</span>");
	}
	
	if (rec.getAudio()) {
		$("#infoLocal").append(createSoundDiv(MEDIA_PATH+"/"+rec.getAudio()));
		$("#infoLocal").append("<span class='credits'>"+rec.getCreditAudio()+"</span>");
	}

	var table = $("<table></table>");
	var tr = $("<tr></tr>");
	
	var tdArrowLeft = $("<td width='20'></td>");
	$(tdArrowLeft).append("<img id='arrowLocalLeft' class='arrows-local' src='resources/images/RedPointerLeft.png'/>");
	$(tr).append(tdArrowLeft);	
	
	var tdMiddle =  $("<td style='padding-left:10px;padding-right:10px'></td>");
	$(tdMiddle).append("<div class='local-name'>"+rec.getName()+"</div>");
	$(tdMiddle).append("<div class='local-text'>"+rec.getText()+"</div>");
	$(tdMiddle).append("<a class='more-info' href='"+rec.getMoreInfoURL()+"' target='_blank'>"+rec.getMoreInfo()+"</a>");
	
	$(tr).append(tdMiddle);	
	
	var tdArrowRight = $("<td width='20'></td>");
	$(tdArrowRight).append("<img id='arrowLocalRight' class='arrows-local' src='resources/images/RedPointerRight.png'/>");
	$(tr).append(tdArrowRight);	
	
	$(table).append(tr);	
	$("#infoLocal").append(table);

	$("#arrowLocalLeft").click(function(e) {
        doPrevLocal();
    });

	$("#arrowLocalRight").click(function(e) {
        doNextLocal();
    });
	
	var color = $.grep(_lut, function(n, i){return n.languageID == _languageID})[0].color;
	$(".info-box").css("background-color", color);	
	
	handleWindowResize();
	
}

function displayLocalTip(graphic)
{
	$("#map").multiTips({
		pointArray : [graphic],
		attributeLabelField: "name",
		mapVariable : _map,
		labelDirection : "top",
		backgroundColor : "#dadada",
		textColor : "#444",
		pointerColor: "#444"
	});
}

function scrollToPage(index)
{
	if (_scroll) {
		_scroll.scrollToPage(index, 0, 500);
	} else {	
		$("#outerCarousel").animate({scrollLeft: (index*$("#listThumbs li").width())}, 'slow');
	}
}

function pageLeft()
{
	var numVisibleTiles = Math.floor($("#outerCarousel").width() / $("#listThumbs li").width());
	var currentIndex;
	if (_scroll) {
		currentIndex = Math.floor(Math.abs(_scroll.x) / $("#listThumbs li").width());
		_scroll.scrollToPage((currentIndex - numVisibleTiles) + 1, 0, 200);
	} else {
		currentIndex = Math.floor($("#outerCarousel").scrollLeft() / $("#listThumbs li").width());
		var left = ((currentIndex - numVisibleTiles) + 1) * $("#listThumbs li").width();
		$("#outerCarousel").animate({scrollLeft: left}, 'slow');
	}
}

function pageRight()
{
	var numVisibleTiles = Math.floor($("#outerCarousel").width() / $("#listThumbs li").width());
	if (_scroll) {
		var currentIndex = Math.floor(Math.abs(_scroll.x) / $("#listThumbs li").width());
		_scroll.scrollToPage(currentIndex + numVisibleTiles, 0, 200);
	} else {
		var left = $("#outerCarousel").scrollLeft() + (numVisibleTiles * $("#listThumbs li").width());
		$("#outerCarousel").animate({scrollLeft: left}, 'slow');
	}
}

function zoomToSelected(selected)
{
	var multi = new esri.geometry.Multipoint(new esri.SpatialReference({wkid:102100}));
	
	$.each(selected, function(index, value) {
		multi.addPoint(value.geometry);
	});
	
	setTimeout(function(){
		var timeout = 0;
		// TODO: Should probably be using state test here instead of going by zoom
		//       level.
		// Test to see whether we're zoomed into local extent.  If so, we can 
		// bypass the ballet
		if (_map.getLevel() <= 4) {
			_map.centerAt(multi.getExtent().getCenter());
			timeout = 1000;
		}
		setTimeout(function(){
			var level;
			var extent;
			var expand = multi.getExtent().expand(1.2);
			$.each(_lods, function(index, value) {
				extent = new esri.geometry.getExtentForScale(_map, value.scale);
				if (extent.contains(expand)) {
					level = value.level;
					return false;
				}
			});
			if (level > 4) level = 4;
			if ((expand.getWidth() == 0) && (expand.getHeight() == 0)) level = 4;
			if (level <= 2) level = 3;
			_map.centerAndZoom(multi.getExtent().getCenter(), level);
		}, timeout);
	},500);
	
}

function doSelect(languageID)
{

	$.each(_selected, function(index, value) {
		_layerSelected.remove(value);
		value.setSymbol(resizeSymbol(value.symbol, _lutBallIconSpecs.tiny));	
		_layerOV.add(value);
	});
	
	$(".selectionHalo").hide();
	
	var li = $.grep($("#listThumbs").children("li"),function(n,i){return n.value == languageID})[0];
	$(li).find(".selectionHalo").show();

	_selected = $.grep(_layerOV.graphics, function(n, i){return n.attributes.getLanguageID() == languageID});
	
	$.each(_selected, function(index, value){
		_layerOV.remove(value);
		_layerSelected.add(value);
		value.setSymbol(resizeSymbol(value.symbol, _lutBallIconSpecs.large));	
	});	

	$("#map").multiTips({
		pointArray : _selected,
		attributeLabelField : "region", 
		mapVariable : _map,
		labelDirection : "top",
		backgroundColor : "#dadada",
		textColor : "#444",
		pointerColor: "#444"
	});
	
	loadStoryPoints(languageID);
}

function createMaster() 
{
	var arr1 = [];
	$.each(_recsOV, function(index, value) {
		if (!($.inArray(value.getLanguageID(), arr1) > -1)) {
			arr1.push(value.getLanguageID());
		}
	});
	
	var recOV;
	var recLUT;
	var arr2 = [];
	$.each(arr1, function(index, id) {
		recOV = $.grep(_recsOV, function(n, i) {
			return n.getLanguageID() == id;
		})[0];
		// todo: this check to make sure that artwork exists for 
		//       the current language -- it should eventually be
		//       unnecessary.
		recLUT = $.grep(_lut, function(n, i) {
			return n.languageID == id;
		})[0];
		if ($.trim(recLUT.icon) != "") {
			arr2.push({languageID: id, language: recOV.getLanguage()});
		}
	});
	
	arr2.sort(function(a,b) {return a.language.replace(/[^a-z]/ig,'') > b.language.replace(/[^a-z]/ig,'') ? 1 : -1;});
	
	return arr2;
}

function loadStoryPoints(languageID)
{
	
	_layerStoryPoints.clear();
	
	var pt;
	var graphic; 			   
	var selected = $.grep(_recsMain, function(n, i){return n.getLanguageID() == languageID});
	var icon = $.grep(_lut, function(n, i){return n.languageID == languageID})[0].icon2;

	$.each(selected, function(index, value) {
		pt = esri.geometry.geographicToWebMercator(
			new esri.geometry.Point(
				[value.getLongitude(), value.getLatitude()],
				new esri.SpatialReference({ wkid:4326}))
		);
		
		graphic = new esri.Graphic(pt, createIconMarker(ICONS_PATH+icon, _lutPinIconSpecs.tiny), value);		
		_layerStoryPoints.add(graphic);
	});
	
}

function zoomToStoryPoints()
{
	var multi = new esri.geometry.Multipoint(new esri.SpatialReference({wkid:102100}));

	$.each(_layerStoryPoints.graphics, function(index, value) {
		multi.addPoint(value.geometry);
	});

	$.each(_lods, function(index, value) {
		extent = new esri.geometry.getExtentForScale(_map, value.scale);
		if (extent.contains(multi.getExtent())) {
			_map.centerAndZoom(multi.getExtent().getCenter(), value.level);
			return false;
		}
	});
}

function handleWindowResize() {
	
	if ((($("body").height() <= 500) || ($("body").width() <= 800)) || _isEmbed) $("#header").height(0);
	else $("#header").height(115);
	$("#map").height($("body").height() - $("#header").height() - $("#listThumbs").height());
	$("#map").width($("body").width() - $("#info").width() - 1); //TODO: figure out why IE & mac need the extra pixel?
	_map.resize();
	var arrowJunk = $("#arrowLeft").width() + (parseInt($("#arrowLeft").css("padding-left"))*2);
	$("#outerCarousel").width($("body").width() - (arrowJunk*2));
	$("#info").height($("body").height() - $("#header").height() - $("#listThumbs").height());
	$("#info iframe").width($("#info").width());
	$("#info iframe").height($("#info iframe").width()*0.6);
	
	$("#zoomButton").css("left", $("#info").width() - 35);
	
	$(".feature-image").css("max-height", $("#info").height() * 0.5);

	$(".info-indented").height($("#info").height() - $(".info-box").height() - 15);
	$(".info-indented .info-caption").height($(".info-indented").height() - $(".info-indented .top").height() - 40);
	$(".info-indented .info-caption").width($(".info-indented").width() - 20);
	
}

function createIconMarker(iconPath, spec) 
{
	return new esri.symbol.PictureMarkerSymbol(iconPath, spec.getWidth(), spec.getHeight()); 
}

function resizeSymbol(symbol, spec)
{
	return symbol.setWidth(spec.getWidth()).setHeight(spec.getHeight())	
}

function moveGraphicToFront(graphic)
{
	var dojoShape = graphic.getDojoShape();
	if (dojoShape) dojoShape.moveToFront();
}

function hoverInfoPos(x,y){
	if (x <= ($("#map").width())-230){
		$("#hoverInfo").css("left",x+15);
	}
	else{
		$("#hoverInfo").css("left",x-25-($("#hoverInfo").width()));
	}
	if (y >= ($("#hoverInfo").height())+50){
		$("#hoverInfo").css("top",y-35-($("#hoverInfo").height()));
	}
	else{
		$("#hoverInfo").css("top",y-15+($("#hoverInfo").height()));
	}
	$("#hoverInfo").show();
}


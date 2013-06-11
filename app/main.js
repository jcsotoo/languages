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
var SERVICE_HOTSPOTS_FEATURES = "http://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/LanguageHotspots/FeatureServer/0";

var SPREADSHEET_MAIN_URL = "data/csv/SI_Main.csv";
var SPREADSHEET_OVERVIEW_URL = "data/csv/SI_Overview.csv";

/******************************************************
***************** end config section ******************
*******************************************************/


var STATE_NO_SELECTION = 0;
var STATE_SELECTION_OVERVIEW = 1;
var STATE_SELECTION_LOCAL = 2;

var ICONS_PATH = "resources/icons/";
var ARTWORK_PATH = "resources/artwork/";
var IMAGES_PATH = "resources/images/";
var MEDIA_PATH = "data/media";

var IMAGE_ARROW_LEFT_GRAY = "GrayLeft.png";
var IMAGE_ARROW_LEFT_WHITE = "WhiteLeft.png";
var IMAGE_ARROW_RIGHT_GRAY = "GrayRight.png";
var IMAGE_ARROW_RIGHT_WHITE = "WhiteRight.png";

var INIT_CENTER;

var _currentState = STATE_NO_SELECTION;
var _languageID;
var _scroll;

var _map;
var _recsMain;
var _recsOV;
var _lods;
var _lut = [
	{languageID:6, language:"Garifuna", art:"PanelGarifuna.jpg", icon:"Icon1Garifuna.png", icon2:"IconGarifuna.png", color:"#e7870a"},
	{languageID:4, language:"Hawaiian", art:"PanelHawaii.jpg", icon:"Icon1Hawaii.png", icon2:"IconHawaii.png", color:"#0b9618", level:10},
	{languageID:16, language:"Isthmus Zapotec", art:"PanelZapotek.jpg", icon:"Icon1Zapotek.png", icon2:"IconZapotek.png", color:"#0b9ece", level: 5},
	{languageID:10, language:"Kallawaya", art:"PanelKallawaya.jpg", icon:"Icon1Kallawaya.png", icon2:"IconKallawaya.png", color:"#17a49c"},
	{languageID:7, language:"Kalmyk", art:"PanelKalmyk.jpg", icon:"Icon1Kalmyk.png", icon2:"IconKalmyk.png", color:"#7e50e7"},
	{languageID:13, language:"Kichwa", art:"PanelKichwa.jpg", icon:"Icon1Kichwa.png", icon2:"IconKichwa.png", color:"#aa7830", level:9},
	{languageID:2, language:"Koro", art:"PanelKoro.jpg", icon:"Icon1Koro.png", icon2:"IconKoro.png", color:"#baa025", level: 7},
	{languageID:8, language:"Passama-quoddy", art:"PanelPassamaquoddy.jpg", icon:"Icon1Passamaquoddy.png", icon2:"IconPassamaquoddy.png", color:"#4164d4"},
	{languageID:9, language:"Penobscot", art:"PanelPenobscot.jpg", icon:"Icon1Penobscot.png", icon2:"IconPenobscot.png", color:"#b1551d", level:8},
	{languageID:18, language:"Purari - I'ai dialect", art:"PanelPNG.jpg", icon:"Icon1PNG.png", icon2:"IconPNG.png", color:"#d769ce"},
	{languageID:15, language:"Quechua", art:"PanelQuechua.jpg", icon:"Icon1Quechua.png", icon2:"IconQuechua.png", color:"#4a8920"},
	{languageID:1, language:"Siletz Dee-ni", art:"PanelSiletz.jpg", icon:"Icon1Siletz.png", icon2:"IconSiletz.png", color:"#a72179", level:8},
	{languageID:3, language:"Tuvan", art:"PanelTuvan.jpg", icon:"Icon1Tuvan.png", icon2:"IconTuvan.png", color:"#799811", level:5},
	{languageID:5, language:"Welsh", art:"PanelWales.jpg", icon:"Icon1Wales.png", icon2:"IconWales.png", color:"#29a883"},
	{languageID:17, language:"Yiddish", art:"PanelYiddish.jpg", icon:"Icon1Yiddish.png", icon2:"IconYiddish.png", color:"#cb2c21", level:6}
];

/*
	{languageID:11, language:"Wayuunaiki", art:"PanelWayuu.jpg", icon:"Icon1Wayuu.png", icon2:"IconWayuu.png", color:"#a20b0b"},
	{languageID:12, language:"Ri Palenge", art:"PanelRiPalenge.jpg", icon:"Icon1RiPalenge.png", icon2:"IconRiPalenge.png", color:"#ca6739"},
	{languageID:14, language:"Kamentzá", art:"PanelKamentza.jpg", icon:"Icon1Kamentza.png", icon2:"IconKamentza.png", color:"#2084e2"},
	{languageID:19, language:"Arhuaco", art:"", icon:"", icon2:"", color:"#9143be"},
	{languageID:20, language:"Uitoto", art:"", icon:"", icon2:"", color:"#1e8a9e"}	
*/

var _layerOV;
var _layerSelected; // todo: still need a separate layer for selected?
var _layerStoryPoints;
var _layerRegions;

var _subInfoCurrent;
var _subInfoOld;

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
	
	_subInfoCurrent = $("#subInfo1");
	displayIntro(_subInfoCurrent);
	
	INIT_CENTER = new esri.geometry.Point(-293518, 2778638, new esri.SpatialReference({wkid: 102100}));
	
	// determine whether we're in embed mode
	
	var queryString = esri.urlToObject(document.location.href).query;
	if (queryString) {
		if (queryString.embed) {
			if (queryString.embed.toUpperCase() == "TRUE") {
				_isEmbed = true;
			}
		}
		if (queryString.dev) {
			if (queryString.dev.toUpperCase() == "TRUE") {
				SPREADSHEET_MAIN_URL = "/proxy/proxy.ashx?https://docs.google.com/spreadsheet/pub?key=0ApQt3h4b9AptdDR2cjc2Wm4xcFpSQjVlT2ZnX3BEemc&output=csv";
				SPREADSHEET_OVERVIEW_URL = "/proxy/proxy.ashx?https://docs.google.com/spreadsheet/pub?key=0ApQt3h4b9AptdDByc0FOY2NacHZNUlhjWnZ6WHdYb1E&output=csv";			
				MEDIA_PATH = "https://dl.dropboxusercontent.com/u/142378389/";
			}
		}
	}

	$.each(_lut, function(index, value) {
		$("#listThumbs").append("<li value='"+value.languageID+"'><img src='"+ARTWORK_PATH+value.art+"' style='max-height:70px'/><span>"+value.language+"</span><div class='selectionHalo'></div></li>");
	});
	
	if (_isMobile) {
		_scroll = new iScroll('outerCarousel', {snap:'li',momentum:true,hScrollbar:false,onScrollEnd:function(){checkArrows()}});
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
		changeState(STATE_NO_SELECTION)
    });
	
	$("#arrowRight").click(function(e) {
        pageRight();
    });
	
	$("#arrowLeft").click(function(e) {
        pageLeft();
    });
	
	$("#title").append(TITLE);
	//$("#subtitle").append(BYLINE);	

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
	
	$("#whiteOut").fadeOut("slow");			
				
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
	swap();
	displayLocalRecord(_layerStoryPoints.graphics[_localCounter], _subInfoCurrent);
	displayLocalTip(_layerStoryPoints.graphics[_localCounter]);
	crossFade();
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
	$("#hoverInfo").html("<span style='font-weight:bold;padding-bottom:5px'>"+event.graphic.attributes.FeatureLabel+"</span><br>"+event.graphic.attributes.Description);
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
	if (!_isMobile) return;
	$("#hoverInfo").html("<span style='font-weight:bold;padding-bottom:5px'>"+event.graphic.attributes.FeatureLabel+"</span><br>"+event.graphic.attributes.Description);
	var x = event.x;
	var y = event.y;
	if (!_isLegacyIE) {
		x = x - $("#info").width();
		y = y - ($("#header").height() + $("#controls").height())
	}
	hoverInfoPos(x, y);	
}

function changeState(toState)
{
	swap();
	
	var fromState = _currentState;
	_currentState = toState;
	if (_currentState == STATE_SELECTION_OVERVIEW) {
		_layerStoryPoints.hide();
		_layerOV.show();
		_layerSelected.show();
		doSelect(_languageID);
		zoomToSelected(_selected);
		displayOverviewRecord(_subInfoCurrent);
		$("#zoomButton").fadeIn();
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
		displayLocalRecord(_layerStoryPoints.graphics[_localCounter], _subInfoCurrent);		
		setTimeout(function(){zoomToStoryPoints()}, 1000)
		setTimeout(function(){displayLocalTip(_layerStoryPoints.graphics[_localCounter])}, 2000);
	} else if (_currentState == STATE_NO_SELECTION) {
		clearSelect();
		displayIntro(_subInfoCurrent);		
		$("#map").multiTips({
			pointArray : [],
			mapVariable : _map,
			labelDirection : "top",
			backgroundColor : "#dadada",
			textColor : "#444",
			pointerColor: "#444"
		});		
		_layerStoryPoints.hide();
		_layerOV.show();
	} else {
		alert('invalid state');
	}
	
	crossFade();
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

function swap()
{
	console.log("going in: ", $(_subInfoCurrent).attr("id"))
	if ($(_subInfoCurrent).attr("id") == $("#subInfo1").attr("id")) {
		_subInfoCurrent = $("#subInfo2");
		_subInfoOld = $("#subInfo1");
	} else {
		_subInfoCurrent = $("#subInfo1");
		_subInfoOld = $("#subInfo2");
	}
	console.log("swapping to: ", $(_subInfoCurrent).attr("id"));
}

function crossFade()
{
	setTimeout(function(){
		_subInfoCurrent.show();
		_subInfoOld.hide();
		_subInfoOld.empty();	
	}, 1000);
}

function doNextLocal()
{
	_localCounter++;
	if (_localCounter > _layerStoryPoints.graphics.length - 1) _localCounter = 0;
	swap();
	displayLocalRecord(_layerStoryPoints.graphics[_localCounter], _subInfoCurrent);
	displayLocalTip(_layerStoryPoints.graphics[_localCounter]);
	crossFade();
}


function doPrevLocal()
{
	_localCounter--;
	if (_localCounter < 0) _localCounter = _layerStoryPoints.graphics.length - 1;
	swap();
	displayLocalRecord(_layerStoryPoints.graphics[_localCounter], _subInfoCurrent);
	displayLocalTip(_layerStoryPoints.graphics[_localCounter]);
	crossFade();
}

function displayIntro(parentDiv)
{

	var top = $("<div class='top'></div>");
	$(top).append("<div class='info-title'>The Smithsonian Folklife Festival Spotlights Language Diversity</div>");
	$(top).append("<div class='picture-frame'><img class='feature-image' src='resources/images/intro.jpg'/></div>");
	$(top).append("<div class='credits'>Photo of Tuvan musician Ai-Xaan Oorzhak by Lynn Johnson / National Geographic Enduring Voices Project</div>");
	
	var text = $("<div class='info-caption'></div>");
	$(text).append(getIntroText());

	var indented = $("<div class='info-indented'></div>");
	$(indented).append(top);
	$(indented).append(text);
	$(indented).append("<div class='info-instructions'>Click on a language in the gallery (above) to start</div>");		
	
	var scroller = $("<div class='scroller'></div>");
	$(scroller).append(indented);
	
	$(parentDiv).append(scroller);
}

function getIntroText()
{
	var text = "<p>Of the 7,105 languages spoken today, over half are considered in danger of extinction in this century. As languages vanish, communities lose a wealth of knowledge about history, culture, the natural environment and the human mind. This will be a catastrophic erosion of the human knowledge base, affecting all fields of science, art, and human endeavor. It will also be an incalculable loss to indigenous peoples' sense of history, identity, belonging, and self.</p><p style='text-indent:10px'>Against this threat, a global cohort of language warriors are mobilizing. They are speaking, texting and publishing in Hawaiian, Koro, Kallawaya, Siletz, and Garifuna. Thousands of tongues previously heard only locally are now—via the internet—raising their voices to a global audience. We can all help to raise awareness of the value of language diversity, and contribute to revitalization efforts. Language rights are, after all, human rights. And the knowledge base found in smaller languages sustains us all in ways we may not even perceive.</p><p style='text-indent:10px'>This story map will take you on a virtual tour of some endangered language communities around the world, to see and hear some of the last speakers, and understand their struggle to save their languages.</p>";
	return text;
}

function displayOverviewRecord(parentDiv)
{

	var color = $.grep(_lut, function(n, i){return n.languageID == _languageID})[0].color;
	
	$(parentDiv).empty();
	$(parentDiv).append("<div class='info-box' style='background-color:"+color+"'>"+_selected[0].attributes.getLanguage().toUpperCase()+"</div>");
	
	var divScroller = $("<div class='scroller'></div>");
	
	var divTop = $("<div class='top'></div>")
	$(divTop).append("<div class='info-title'>"+_selected[0].attributes.getName()+"</div>");		
	var url = _selected[0].attributes.getURL();
	if (url == "") {
		$(divTop).append("No photo available");
	} else {
		if (url.indexOf("http") == -1) url = MEDIA_PATH+"/"+url;
		$(divTop).append("<div class='picture-frame'><img class='feature-image' src='"+url+"'/><div>");
	}
	$(divTop).append("<span class='credits'>"+_selected[0].attributes.getCredit()+"</span>");
	$(divTop).append(createSoundDiv(MEDIA_PATH+"/"+_selected[0].attributes.getAudio()));
	
	var divIndented = $("<div class='info-indented'></div>")
	$(divIndented).append(divTop);
	$(divIndented).append("<div class='info-caption'>"+_selected[0].attributes.getText()+"</div>");
	//$(divIndented).append("<a href='"+MEDIA_PATH+"/"+_selected[0].attributes.getAudio()+"' target='_blank' style='margin-top:10px'>Audio Diagnostic</a>");
	
	$(divScroller).append(divIndented);
	$(parentDiv).append(divScroller);
	
	setTimeout(function(){handleWindowResize()},1000);
	
}

function displayLocalRecord(graphic, parentDiv)
{

	var color = $.grep(_lut, function(n, i){return n.languageID == _languageID})[0].color;
		
	var rec = graphic.attributes;
	
	$(parentDiv).empty();
	$(parentDiv).append("<div class='info-box' style='background-color:"+color+"'>"+rec.getLanguage().toUpperCase()+"</div>");
	
	var scrollerDiv = $("<div class='scroller'></div>");
	
	if (rec.getPhoto()) {
		$(scrollerDiv).append("<div class='picture-frame'><img class='feature-image' src='"+MEDIA_PATH+"/"+rec.getPhoto()+"'/></div>");
	}

	if (rec.getVideo()) {
		var tokens = rec.getVideo().split("/"); 
		var youTubeID = tokens[tokens.length - 1];
		$(scrollerDiv).append("<iframe src='http://www.youtube.com/embed/"+youTubeID+"?rel=0' frameborder='0' allowfullscreen style='padding-bottom:10px'></iframe>");
	}
	
	if (rec.getAudio()) {
		var soundDiv = createSoundDiv(MEDIA_PATH+"/"+rec.getAudio());
		if (rec.getPhoto()) $(soundDiv).css("margin-top", 0);
		$(scrollerDiv).append(soundDiv);
	}
	
	var indentDiv = $("<div style='margin-left:40px;margin-right:33px;padding-bottom:10px;'></div>");
	if (rec.getPhoto()) $(indentDiv).append("<div class='credits'>"+rec.getCreditPhoto()+"</div>");
	if (rec.getVideo()) $(indentDiv).append("<div class='credits'>"+rec.getCreditVideo()+"</div>");
	if (rec.getAudio()) $(indentDiv).append("<div class='credits'>"+rec.getCreditAudio()+"</div>");

	$(scrollerDiv).append(indentDiv);

	var table = $("<table></table>");
	var tr = $("<tr></tr>");
	
	var tdArrowLeft = $("<td width='20'></td>");
	$(tdArrowLeft).append("<img class='arrows-local arrowLocalLeft' src='resources/images/RedPointerLeft.png'/>");
	$(tr).append(tdArrowLeft);	
	
	var tdMiddle =  $("<td style='padding-left:10px;padding-right:10px'></td>");
	$(tdMiddle).append("<div class='local-name'>"+rec.getName()+"</div>");
	$(tdMiddle).append("<div class='local-text'>"+rec.getText()+"</div>");
	$(tdMiddle).append("<a class='more-info' href='"+rec.getMoreInfoURL()+"' target='_blank'>"+rec.getMoreInfo()+"</a>");
	
	$(tr).append(tdMiddle);	
	
	var tdArrowRight = $("<td width='20'></td>");
	$(tdArrowRight).append("<img class='arrows-local arrowLocalRight' src='resources/images/RedPointerRight.png'/>");
	$(tr).append(tdArrowRight);	
	
	$(table).append(tr);	
	$(scrollerDiv).append(table);
	
	$(parentDiv).append(scrollerDiv);

	$(".arrowLocalLeft").click(function(e) {
        doPrevLocal();
    });

	$(".arrowLocalRight").click(function(e) {
        doNextLocal();
    });
	
	if (_layerStoryPoints.graphics.length == 1) {
		$(".arrows-local").hide();
	}
	
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
		_scroll.scrollToPage(index, 0, 200);
		setTimeout(function(){checkArrows()}, 500)
	} else {	
		$("#outerCarousel").animate({scrollLeft: (index*$("#listThumbs li").width())}, 'slow', null, function(){checkArrows()});
	}
}

function pageLeft()
{
	var numVisibleTiles = Math.floor($("#outerCarousel").width() / $("#listThumbs li").width());
	var currentIndex;
	if (_scroll) {
		currentIndex = Math.floor(Math.abs(_scroll.x) / $("#listThumbs li").width());
		_scroll.scrollToPage((currentIndex - numVisibleTiles) + 1, 0, 200);
		setTimeout(function(){checkArrows()}, 500);
	} else {
		currentIndex = Math.floor($("#outerCarousel").scrollLeft() / $("#listThumbs li").width());
		var left = ((currentIndex - numVisibleTiles) + 1) * $("#listThumbs li").width();
		$("#outerCarousel").animate({scrollLeft: left}, 'slow', null, function(){checkArrows()});
	}
}

function pageRight()
{
	var numVisibleTiles = Math.floor($("#outerCarousel").width() / $("#listThumbs li").width());
	if (_scroll) {
		var currentIndex = Math.floor(Math.abs(_scroll.x) / $("#listThumbs li").width());
		_scroll.scrollToPage(currentIndex + numVisibleTiles, 0, 200);
		setTimeout(function(){checkArrows()}, 500);
	} else {
		var left = $("#outerCarousel").scrollLeft() + (numVisibleTiles * $("#listThumbs li").width());
		$("#outerCarousel").animate({scrollLeft: left}, 'slow', null, function(){checkArrows()});
	}
}

function checkArrows()
{
	var left;

	if (_scroll) left = Math.abs(_scroll.x);
	else left = $("#outerCarousel").scrollLeft();
	
	var imgLeft = (left == 0) ? IMAGE_ARROW_LEFT_GRAY : IMAGE_ARROW_LEFT_WHITE;
	imgLeft = IMAGES_PATH+"/"+imgLeft
	
	$("#arrowLeft").attr("src", imgLeft);
	$("#arrowLeft").css("cursor", (left == 0) ? "default" : "pointer"); 

	if (((left + $("#outerCarousel").width()) / $("#listThumbs li").width()) == _lut.length) {
		$("#arrowRight").attr("src", IMAGES_PATH+"/"+IMAGE_ARROW_RIGHT_GRAY);
		$("#arrowRight").css("cursor", "default");
	} else {
		$("#arrowRight").attr("src", IMAGES_PATH+"/"+IMAGE_ARROW_RIGHT_WHITE);
		$("#arrowRight").css("cursor", "pointer");		
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

	clearSelect();
	
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

function clearSelect()
{

	$.each(_selected, function(index, value) {
		_layerSelected.remove(value);
		value.setSymbol(resizeSymbol(value.symbol, _lutBallIconSpecs.tiny));	
		_layerOV.add(value);
	});
	
	$(".selectionHalo").hide();
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
		if (recLUT) {
			if ($.trim(recLUT.icon) != "") {
				arr2.push({languageID: id, language: recOV.getLanguage()});
			}
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
	
	var level = $.grep(_lut, function(n, i){return n.languageID == _languageID})[0].level;
	// if level isn't explicitly defined in lut, then calculate from multi
	if (!level) {
		$.each(_lods, function(index, value) {
			extent = new esri.geometry.getExtentForScale(_map, value.scale);
			if (extent.contains(multi.getExtent())) {
				level = value.level;
				return false;
			}
		});
	}
	
	_map.centerAndZoom(multi.getExtent().getCenter(), level);

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
	
	$(".scroller").height($("#info").height() - $(".info-box").height() - 5);
	
	checkArrows();
	
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


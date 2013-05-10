function RecordMain(name, languageID, language, region, longitude, latitude, text, photo, audio, video, url, creditPhoto, creditAudio, creditVideo, moreInfo, moreInfoURL, notes) 
{
	var _name = name;
	var _languageID = languageID;
	var _language = language;
	var _region = region;
	var _longitude = longitude;
	var _latitude = latitude;
	
	this.getName = function() {
		return _name;
	}
	
	this.getLanguageID = function() {
		return _languageID;
	}
	
	this.getLanguage = function() {
		return _language;
	}
	
	this.getRegion = function() {
		return _region;
	}
	
	this.getLongitude = function() {
		return _longitude;
	}
	
	this.getLatitude = function() {
		return _latitude;
	}
	
}
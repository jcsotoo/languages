function RecordMain(name, languageID, language, region, longitude, latitude, text, photo, audio, video, url, creditPhoto, creditAudio, creditVideo, moreInfo, moreInfoURL, notes) 
{
	this.getName = function() {
		return name;
	}
	
	this.getLanguageID = function() {
		return languageID;
	}
	
	this.getLanguage = function() {
		return language;
	}
	
	this.getRegion = function() {
		return region;
	}
	
	this.getLongitude = function() {
		return longitude;
	}
	
	this.getLatitude = function() {
		return latitude;
	}
	
	this.getText = function() {
		return text;
	}
	
	this.getPhoto = function() {
		return photo;
	}
	
	this.getAudio = function() {
		return audio;
	}
	
	this.getVideo = function() {
		return video;
	}
	
	this.getCreditPhoto = function() {
		return creditPhoto;
	}
	
	this.getCreditAudio = function() {
		return creditAudio;
	}
	
	this.getCreditVideo = function() {
		return creditVideo;
	}
	
	this.getMoreInfo = function() {
		return moreInfo;
	}
	
	this.getMoreInfoURL = function() {
		return moreInfoURL;
	}
	
	this.name = name;
	
}
function RecordOV(name,	languageID, language, region, longitude, latitude, text, media, url, credit, audio, notes) 
{
	this.getName = function()
	{
		return name;
	}
	
	this.getLanguageID = function()
	{
		return languageID;
	}
	
	this.getLanguage = function ()
	{
		return language;
	}
	
	this.getRegion = function() 
	{
		return region;
	}
	
	this.getLongitude = function()
	{
		return longitude;
	}
	
	this.getLatitude = function()
	{
		return latitude;
	}
	
	this.getAudio = function()
	{
		return audio;
	}
	
	this.getText = function()
	{
		return text;
	}
	
	this.getURL = function()
	{
		return url;
	}
	
	this.getName = function()
	{
		return name;
	}
	
	this.getCredit = function()
	{
		return credit;
	}
	
	this.region = region; // to support multiTips
	
}
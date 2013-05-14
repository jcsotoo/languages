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
	
}
function ParserMain(lines)
{
	
	var FIELDNAME_LONGITUDE = "Longitude";
	var FIELDNAME_LATITUDE = "Latitude";	
	var FIELDNAME_NAME = "Name";
	var FIELDNAME_LANGUAGE_ID = "Language_ID";
	var FIELDNAME_LANGUAGE = "Language";
	var FIELDNAME_REGION = "Region";
	var FIELDNAME_TEXT = "Text";
	var FIELDNAME_PHOTO = "Photo";
	var FIELDNAME_AUDIO = "Audio";
	var FIELDNAME_VIDEO = "Video";
	var FIELDNAME_LINK = "Link";
	var FIELDNAME_CREDIT_PHOTO = "Credit_Photo";
	var FIELDNAME_CREDIT_AUDIO = "Credit_Audio";
	var FIELDNAME_CREDIT_VIDEO = "Credit_Video";
	var FIELDNAME_MORE_INFO = "More_Info";
	var FIELDNAME_MORE_INFO_URL = "More_Info_URL";
	var FIELDNAME_NOTES = "Notes";
	
	var _recs = parseRecs(lines);
	
	this.getRecs = function()
	{
		return _recs;
	}
		
	function parseRecs(lines) 
	{
				
		var fields = lines[0];
		
		var values;
		var rec;
		var recs = [];		
		for (var i = 1; i < lines.length; i++) {
			
			values = lines[i];
			if (values.length == 1) {
				break;
			}
	
			rec = new RecordMain(
				values[getFieldIndex(FIELDNAME_NAME,fields)],
				parseInt(values[getFieldIndex(FIELDNAME_LANGUAGE_ID,fields)]),
				values[getFieldIndex(FIELDNAME_LANGUAGE,fields)],
				values[getFieldIndex(FIELDNAME_REGION,fields)],
				values[getFieldIndex(FIELDNAME_LONGITUDE,fields)],
				values[getFieldIndex(FIELDNAME_LATITUDE,fields)],
				values[getFieldIndex(FIELDNAME_TEXT,fields)]							
			);
	
			recs.push(rec);
	
		}	
		
		return recs;
	}	
	
	function getFieldIndex(name,fields) 
	{
		var idx = -1;
		$.each(fields,function(index,value){
			if (value.toUpperCase() == name.toUpperCase()) {
				idx = index;
				return false;
			}
		});
		return idx;
	}	
	
}
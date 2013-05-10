CSVService.prototype.constructor = CSVService;

function CSVService() {
	
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
	
	var _arr = [];

	// **********
	// methods...
	// **********

	this.process = function(csv) {
		var that = this;
		$.ajax({
		  type: 'GET',
		  url: csv,
		  cache: false,
		  success: function(text){ 
			parseCSV(text);	
			$(that).trigger("complete");
		  }
		});	
		
	}

	this.getLocations = function() {
		return _arr;
	}
	
	// *****************
	// private functions
	// *****************

	parseCSV = function(text) {

		var lines = CSVToArray(text)
		var fields = lines[0];
		
		var values;
		var rec;		
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
				values[getFieldIndex(FIELDNAME_LATITUDE,fields)]							
			);
	
			_arr.push(rec);
	
		}
		
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
	
	
	// This will parse a delimited string into an array of
	// arrays. The default delimiter is the comma, but this
	// can be overriden in the second argument.
	// courtesy of Ben Nadel www.bennadel.com

	function CSVToArray( strData, strDelimiter ){
		// Check to see if the delimiter is defined. If not,
		// then default to comma.
		strDelimiter = (strDelimiter || ",");
		 
		// Create a regular expression to parse the CSV values.
		var objPattern = new RegExp(
		(
		// Delimiters.
		"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
		 
		// Quoted fields.
		"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
		 
		// Standard fields.
		"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);
		 
		 
		// Create an array to hold our data. Give the array
		// a default empty first row.
		var arrData = [[]];
		 
		// Create an array to hold our individual pattern
		// matching groups.
		var arrMatches = null;
		 
		 
		// Keep looping over the regular expression matches
		// until we can no longer find a match.
		while (arrMatches = objPattern.exec( strData )){
		 
		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];
		 
		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
		strMatchedDelimiter.length &&
		(strMatchedDelimiter != strDelimiter)
		){
		 
		// Since we have reached a new row of data,
		// add an empty row to our data array.
		arrData.push( [] );
		 
		}
		 
		 
		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){
		 
		// We found a quoted value. When we capture
		// this value, unescape any double quotes.
		var strMatchedValue = arrMatches[ 2 ].replace(
		new RegExp( "\"\"", "g" ),
		"\""
		);
		 
		} else {
		 
		// We found a non-quoted value.
		var strMatchedValue = arrMatches[ 3 ];
		 
		}
		 
		 
		// Now that we have our value string, let's add
		// it to the data array.
		arrData[ arrData.length - 1 ].push( strMatchedValue );
		}
		 
		// Return the parsed data.
		return( arrData );
	}
 	
}


CSVService.prototype.constructor = CSVService;

function CSVService() {
	
	var FIELDNAME_X = "Longitude";
	var FIELDNAME_Y = "Latitude";	
	
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
		
		for (var i = 1; i < lines.length; i++) {
			
			values = lines[i];
			if (values.length == 1) {
				break;
			}
			
			/*
			id = values[getFieldIndex(FIELDNAME_ID,fields)];
			venue = values[getFieldIndex(FIELDNAME_VENUE,fields)];
			url = values[getFieldIndex(FIELDNAME_URL,fields)];
			imageURL = values[getFieldIndex(FIELDNAME_IMAGEURL,fields)];
			city = values[getFieldIndex(FIELDNAME_CITY,fields)];
			*/
			
			pt = esri.geometry.geographicToWebMercator(
				new esri.geometry.Point(
					[values[getFieldIndex(FIELDNAME_X,fields)],values[getFieldIndex(FIELDNAME_Y,fields)]],
					new esri.SpatialReference({ wkid:4326}))
			);
			
			graphic = new esri.Graphic(pt, null, {});		
	
			_arr.push(graphic);
	
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


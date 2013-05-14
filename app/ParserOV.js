function ParserOV(lines)
{

	var _recs = parseRecs(lines);
	
	this.getRecs = function()
	{
		return _recs;
	}

	function parseRecs(lines)
	{
		
		//Name	Language_ID	Language	Region	Longitude	Latitude	Text	Media	Link	Credit	Audio	Notes
	
		var fields = lines[0];
		
		var values;
		var rec;
		var recs = [];		
		for (var i = 1; i < lines.length; i++) {
			
			values = lines[i];
			if (values.length == 1) {
				break;
			}
	
			rec = new RecordOV();
	
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
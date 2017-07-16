// encodeForm.js  by Mark McClure May 2007
// 
// Meant to be used with the HTML form here:
// http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/
// Calls the PolylineEncoder class to do the actual encoding.
// Unlike the PolylineEncoder, I've not gone to any trouble
// to enclose these functions in a single namespace.

// Some global variables
var pathData, pathResults;
var verySmall = 1*0.00001, numLevels = 1*18, zoomFactor = 1*2;
var minLat, maxLat, minLng, maxLng;
var inputText;

// Called by the "Show Code" button.
function showCode(value_) {
	// First check the state of the form to find out how much work needs
	// to be done.
		if(getData(value_)) { // if we find data, do the work
			encodeData();
			return writeCode();
		}
	return '';
}

// Gets the input data and packs it into a pathData array
// and a polygonData array.
function getData(value_) {
	var allCoordStrings = new Array(0);
	var thisCoordString, theseCoordStrings, lle, newCoordString;
	pathData = new Array(0);
	var rawPathData, rawPolygonData, thisPolygonData, point, points;
	var placeData;
	var h, i, j, k;
	var inputText2, inputTextArray, lineStrings, theseCoords, areaStrings, descriptor;
	var found = false, xmldoc;
	inputText = value_;
	if(inputText != "") {
		found = true;
	}
	inputText2 = inputText.replace(/\s*\n\s*/g,"\n").replace(/^\s*/,"").replace(/\s*$/,"");
	process(["L 1\n" + inputText2], "path");
	return found;
}

// The next two functions are called by the getData function during
// the processing of the data from the Input text.
function process(areaStrings, flag) {
	var i, j, thisBoundary, thisBoundaryString, theseCoords, points;
	thisBoundary = new Array(0);
	for(i=0; i<areaStrings.length; i+= 1) {
		points = new Array(0);
		thisBoundaryString = areaStrings[i].split("\n");
		for(j=1; j<thisBoundaryString.length; j+= 1) {
			theseCoords = thisBoundaryString[j].split(/,\s*|\s+/);
			points.push([theseCoords[1], theseCoords[0]]);
		}
		thisBoundary.push(points);
	}
	pathData.push(thisBoundary);
}

// Translate the data to latLngs and encode.  Called by showCode or 
// showMap, if necessary.
// Most of the work is done by a PolylineEncoder object.
function encodeData() {
 	var polylineEncoder = new PolylineEncoder(numLevels, zoomFactor, verySmall);
 	var i, j, k, latLngs;
 	
	pathResults = new Array(0);
 	if(pathData.length > 0) {
 		minLat = maxLat = pathData[0][0][0][0];
 		minLng = maxLng = pathData[0][0][0][1];
 	}

 	for(i=0; i<pathData.length; i+= 1) {
 		thisPathResults = new Array(0);
 		for(j=0; j<pathData[i].length; j+= 1) {
 			latLngs = new Array(0);
 			for(k=0; k<pathData[i][j].length; k+= 1) {
 				latLngs.push(new PolylineEncoder.latLng(pathData[i][j][k][0],pathData[i][j][k][1]));
	 			if(1*pathData[i][j][k][0] < 1*minLat) {
	 				minLat = pathData[i][j][k][0];
	 			}
	 			if(1*pathData[i][j][k][0] > 1*maxLat) {
	 				maxLat = pathData[i][j][k][0];
	 			}
	 			if(1*pathData[i][j][k][1] < 1*minLng) {
	 				minLng = pathData[i][j][k][1];
	 			}
	 			if(1*pathData[i][j][k][1] > 1*maxLng) {
	 				maxLng = pathData[i][j][k][1];
	 			}
  			}
 			thisPathResults.push(polylineEncoder.dpEncode(latLngs));
 		}
 		pathResults.push(thisPathResults);
 	}

}

// The last step of the showCode function.
function writeCode() {
	var i, j, latCenter, lngCenter;
	latCenter = (1*minLat + 1*maxLat)/2;
	lngCenter = (1*minLng + 1*maxLng)/2;
	var w = '';
	for(i=0; i<pathData.length; i+= 1) {
		for(j=0; j<pathData[i].length; j+= 1) {
			//w += "{\n  color: \"" + colorString(i) + "\",\n  weight: 4,\n  opacity: 0.8,\n  points: \"";
			w += "{\n  color: \"#00ff00\",\n  weight: 4,\n  opacity: 0.8,\n  points: \"";
			w += pathResults[i][j].encodedPointsLiteral + "\",\n";
			w += "  levels: \"" + pathResults[i][j].encodedLevels + "\",\n";
			w += "  zoomFactor: " + zoomFactor + ", \n";
			w += "  numLevels: " + numLevels + "\n}";
			
		}
	}
	return w;
}

// Chooses the color of the ith object.
function colorString(i) {
	var colorStep = 6408323;
	return "#" + ((Math.floor((0xff + i*colorStep)) % 0x1000000) + 
		0x1000000).toString(16).substring(1);
}

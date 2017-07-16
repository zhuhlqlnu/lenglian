(function() {
	function Track() {

	}
	
	Track.prototype.getTrack = function(target_id, start_utc, end_utc, callback, scope) {
		var url  = ZionSetting.track.url + "/" + Zion.token + "/history/" + Zion.util.encodeParam([target_id, start_utc, end_utc]);
		Zion.util.getJSON(url, callback, scope);
	};
	
	Track.prototype.getLastTrack = function(target_id, callback, scope) {
		var url  = ZionSetting.track.url + "/" + Zion.token + "/last/" + Zion.util.encodeParam([target_id]);
		Zion.util.getJSON(url, callback, scope);
	};
	
	if (!window.Zion) {
		window.Zion = {};
	}
	window.Zion.Track = Track;
	window.Zion.track = new Track();
})();
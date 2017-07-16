/** **** 轨迹回放使用的方法 ***** */
/**
 * 控制面板按钮点击调用的方法
 */
/**
 * 第一帧
 */
function previousTrack() {
	// 设置控制面板控制状态,第一帧状态
	currentstate = 0;
	// 清除播放对象
	clearInterval(playinterval);
	// 画第一个点
	drawtrackpoint(0);
	sliderposition = 0;
}
/**
 * 播放
 */
function play() {
	sliderpositionflag = false;
	// 设置控制面板控制状态,播放状态
	currentstate = 1;
	// 清除播放对象
	clearInterval(playinterval);
	// 设置播放对象,(refreshTime)根据所选'回放速度'(playspeedlabel)进行播放.
	playinterval = setInterval('draw();', refreshTime * 1000);
}
/**
 * 暂停
 */
function pause() {
	// 设置控制面板控制状态,暂停状态
	currentstate = 2;
	// 清除播放对象
	clearInterval(playinterval);
}
/**
 * 停止
 */
function stop() {
	// 设置控制面板控制状态,停止状态
	currentstate = 3;
	// 功能与previousTrack一样
	previousTrack();
}

/**
 * 最后一帧
 */
function nextTrack() {
	// 设置控制面板控制状态,最后一帧状态
	currentstate = 4;
	// 清除播放对象
	clearInterval(playinterval);
	// 画最后一个点
	drawtrackpoint(sliderlen);
	sliderposition = sliderlen;
}
/**
 * 播放画点
 */
function draw() {
	var p = sliderposition;
	// 判断播放进度值是否超过轨迹点最大值
	if ((sliderposition > sliderlen) && (sliderlen > 0)) {
		// 清除播放对象
		clearInterval(playinterval);
		return;
	}
	var tmpip = Ext.getCmp('intervalpointcombo').getValue();
	p = p + Number(tmpip);
	if ((p > sliderlen) && (sliderposition < sliderlen)) {
		p = sliderlen;
	}
	// 画当前点
	drawtrackpoint(p);
	sliderposition = p;
	// sliderposition++;
}

/**
 * 画当前点
 * 
 * @param {}
 *            position
 */
var currentGMarker = null;
function drawtrackpoint(position) {
	var trackCurrent = trackDataObjArr[position];
	if (trackCurrent == undefined) {
		return;
	}
	// if(currentGMarker != null){
	// map.removeOverlay(currentGMarker);
	// }

	var longitude = trackCurrent.longitude;
	var latitude = trackCurrent.latitude;
	var gps_time = trackCurrent.gps_time;
	var recv_time = trackCurrent.recv_time;
	var speed = trackCurrent.speed;
	var heading = trackCurrent.heading;
	var terminal_status_desc = trackCurrent.terminal_status_desc;
	Ext.getCmp('gps_time').setText(gps_time);
	Ext.getCmp('recv_time').setText(recv_time);
	Ext.getCmp('speed').setText(speed);
	Ext.getCmp('heading').setText(heading);
	Ext.getCmp('terminal_status_desc').setText(terminal_status_desc);
	var point = new GLatLng(latitude, longitude);
	if (!currentGMarker) {
		var targetIcon = new GIcon();
		targetIcon.iconSize = new GSize(16, 16);
		targetIcon.iconAnchor = new GPoint(8, 8);
		targetIcon.image = "/module/pipe/monitor/history/images/car.png";
		var markerOptions = {
			icon : targetIcon,
			clickable : true
		}
		var marker = new GMarker(point, markerOptions);
		map.addOverlay(marker);
		currentGMarker = marker;
	} else {
		currentGMarker.setLatLng(point);
	}
	//
	if (mapViewModal) {
		map.setCenter(point);
	}
	// 设置回放进度条
	var tmpslider = Ext.getCmp('playtemposlider');
	tmpslider.setValue(position + 1, true);
	// 改变播放进度,更改'回放进度'label
	var tmpplaytempolabel = Ext.getCmp('playtempolabel');
	tmpplaytempolabel.setText((position + 1) + '/' + (sliderlen + 1));
}

/**
 * 恢复播放按钮状态
 */
function resetimgsrc() {
	var first = Ext.getCmp('media_controls_first');
	var play = Ext.getCmp('media_controls_play');
	var pause = Ext.getCmp('media_controls_pause');
	var stop = Ext.getCmp('media_controls_stop');
	var last = Ext.getCmp('media_controls_last');

	first.setIconClass('light_first');
	play.setIconClass('light_play');
	pause.setIconClass('light_pause');
	stop.setIconClass('light_stop');
	last.setIconClass('light_last');

}

function trackDataObj(gps_time, recv_time, longitude, latitude, speed, heading,
		status, terminal_status_desc, terminal_status, track_id, temp_0,
		temp_bat_0, temp_id_0, temp_1, temp_bat_1, temp_id_1) {
	this.gps_time = gps_time;
	this.recv_time = recv_time;
	this.longitude = longitude;
	this.latitude = latitude;
	this.speed = speed;
	this.heading = heading;
	this.status = status;
	this.terminal_status_desc = terminal_status_desc;
	this.terminal_status = terminal_status;
	this.track_id = track_id;
	this.temp_0 = temp_0;
	this.temp_bat_0 = temp_bat_0;
	this.temp_id_0 = temp_id_0;
	this.temp_1 = temp_1;
	this.temp_bat_1 = temp_bat_1;
	this.temp_id_1 = temp_id_1;
}

var trackDataObjArr = new Array();
function parseTrackData(data) {
	map.clearOverlays();
	trackDataObjArr = [];
	var points = [];
	for (var i = 0; i < data.length; i++) {
		var tmp = data[i];
		var gps_time = tmp[0];
		var recv_time = tmp[1];
		var longitude = tmp[2];
		var latitude = tmp[3];
		var speed = tmp[4];
		var heading = tmp[5];
		var status = tmp[6];
		var terminal_status_desc = tmp[7];
		var terminal_status = tmp[8];
		var track_id = tmp[9];
		var temp_0 = tmp[10];
		var temp_bat_0 = tmp[11];
		var temp_id_0 = tmp[12];
		var temp_1 = tmp[13];
		var temp_bat_1 = tmp[14];
		var temp_id_1 = tmp[15];
		var tmptrackDataObj = new trackDataObj(gps_time, recv_time, longitude,
				latitude, speed, heading, status, terminal_status_desc,
				terminal_status, track_id, temp_0, temp_bat_0, temp_id_0,
				temp_1, temp_bat_1, temp_id_1);
		trackDataObjArr.push(tmptrackDataObj);
		var point = new GLatLng(latitude, longitude);
		points.push(point);
	}
	
	var polyline = new GPolyline(points);
	map.addOverlay(polyline);
	var bounds = polyline.getBounds();
	map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
	
	var qdObj = trackDataObjArr[0];
	var marker = track_marker(qdObj.latitude, qdObj.longitude, 22, 28 , 22 ,28 , "/module/pipe/monitor/history/images/qd.gif");
	map.addOverlay(marker);
	
	var zdObj = trackDataObjArr[trackDataObjArr.length - 1];
	marker = track_marker(zdObj.latitude, zdObj.longitude, 22, 28 , 22 ,28 , "/module/pipe/monitor/history/images/zd.gif");
	map.addOverlay(marker);

	// 回放进度lable
	var tmpplaytempolabel = Ext.getCmp('playtempolabel');
	tmpplaytempolabel.setText('1/' + trackDataObjArr.length);
	// 回放进度条
	var tmpplaytemposlider = Ext.getCmp('playtemposlider');
	tmpplaytemposlider.setValue(1, true);
	tmpplaytemposlider.minValue = 1;
	tmpplaytemposlider.maxValue = trackDataObjArr.length;
	currentGMarker = null;
	reset_track();

}

function track_marker(lat, lng, iconSizew, iconSizeh , iconAnchorw ,iconAnchorh , image){
	var point = new GLatLng(lat, lng);
	var targetIcon = new GIcon();
	targetIcon.iconSize = new GSize(iconSizew, iconSizeh);
	targetIcon.iconAnchor = new GPoint(iconAnchorw, iconAnchorh);
	targetIcon.image = image;
	var markerOptions = {
		icon : targetIcon,
		clickable : true
	}
	var marker = new GMarker(point, markerOptions);
	return marker;
}

function reset_track() {
	// 回放速度
	var tmpplayspeedlabel = Ext.getCmp('playspeedlabel');
	tmpplayspeedlabel.setText('1');
	var tmpplayspeedslider = Ext.getCmp('playspeedslider');
	tmpplayspeedslider.setValue(1, true);
	// 回放间隔
	var tmpintervalpointcombo = Ext.getCmp('intervalpointcombo');
	tmpintervalpointcombo.setValue(1);
	Ext.getCmp('gps_time').setText('');
	Ext.getCmp('recv_time').setText('');
	Ext.getCmp('speed').setText('');
	Ext.getCmp('heading').setText('');
	Ext.getCmp('terminal_status_desc').setText('');
	// tmpplaytemposlider.setMinValue(1);
	// tmpplaytemposlider.setMaxValue(trackDataObjArr.length);
	// 播放进度条总长度
	sliderlen = trackDataObjArr.length - 1;
	sliderposition = 0;
	clearInterval(playinterval);
	resetimgsrc();
	stop();
}
Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	
	var overlay_type = ["pipeline", "facilities", "defect"];
	var overlays = {};
	for(var i = 0; i < overlay_type.length; i++){
		overlays[overlay_type[i]] = [];
	}
	var defect_button = new Ext.Button({
		text : '管线',
		tooltip : '管线',
		enableToggle:true,
		icon : Ext.zion.image_base+'/select.gif',
		overlay_type:'pipeline'
	});

	var pipeline_button = new Ext.Button({
		text : '测算距离',
		tooltip : '测算距离',
		enableToggle:true,
		icon : Ext.zion.image_base+'/line.png'
	});

	var polygon_button = new Ext.Button({
		text : '测算面积',
		tooltip : '测算面积',
		enableToggle:true,
		icon : Ext.zion.image_base+'/chart_pie.png'
	});

	var overly_buttons = [defect_button,pipeline_button,polygon_button];

	defect_button.on('toggle', overly_button_toggle);
	pipeline_button.on('toggle',draw_pipeline);
	polygon_button.on('toggle',draw_polygon);

	var polyline_overlay;
	function draw_pipeline(button, pressed){
		if(pressed){
			Zion.polyline.draw(map, function(poly){
				if(polyline_overlay){
					polyline_overlay.remove();
					polyline_overlay = null;
				}
				polyline_overlay = poly;
				Ext.Msg.alert("距离", (poly.getLength() > 1000 ? Math.round(poly.getLength())/1000 + '公里': Math.round(poly.getLength()*1000)/1000 + '米'));
			});
		}else{
			if(polyline_overlay){
				polyline_overlay.remove();
				polyline_overlay = null;
			}
		}
	}
	
	var polygon_overlay;
	function draw_polygon(button, pressed){
		if(pressed == true){
			Zion.polygon.draw(map, function(polygon_){
				if(polygon_overlay){
					polygon_overlay.remove();
					polygon_overlay  = null;
				}
				polygon_overlay = polygon_;
				Ext.Msg.alert("面积", (polygon_.getArea() > 1000000 ? Math.round(polygon_.getArea()/1000)/1000 + '平方公里': Math.round(polygon_.getArea()*1000)/1000 + '平方米'));
			});
		}else{
			if(polygon_overlay){
				polygon_overlay.remove();
				polygon_overlay  = null;
			}
		}
	}

	function overly_button_toggle(button, pressed){
		if(pressed == true){
			show_overlays();
		}else{
			remove_overlays(button.overly_type);
		}
	}
	
	function show_overlays(){
		if(defect_button.pressed){
			var loadMask = new Ext.LoadMask(Ext.getBody(), {
				msg : "加载中，请稍后 ..."
			});
			loadMask.show();
			Zion.db.getJSON('monitor.realtime_pipe.axiom_overlay_route.map.select',null,function(data){				
				if(data.r){
					var data_value = data.r;
					for(var i = 0 ; i < data_value.length; i ++){
						var polyline_id = data_value[i][0];
						var polyline_name = data_value[i][1];
						var polyline =  data_value[i][3];
						var points_arr = polyline.split(';');
						var points = [];
						var xy_arr = points_arr[0].split(',');
						var x = xy_arr[0];
						var y = xy_arr[1];
						for(var j = 0;j < points_arr.length;j ++){
							var xy_arr_ = points_arr[j].split(',');
							points.push(new GLatLng(xy_arr_[1],xy_arr_[0]));
						}
						var Polyline = new GPolyline(points,'blue',3);
						var bounds = Polyline.getBounds();
						map.addOverlay(Polyline);
						var polyline_ = (function() { 
							var id = data_value[i][0];
							var name = data_value[i][1];
							return function(latlng){ 
								var g_x = latlng.lng();
								var g_y = latlng.lat();
								var polyline_point = new GLatLng(g_y , g_x);
								var infoHtml = "<b>名称:</b>"+name+"</br>";
								Zion.db.getJSON("realtime.axiom_info_attribute_value.select",[id],function(data){
									if(data.r){
										var attribute_value = data.r;		
										for(var k = 0;k < attribute_value.length; k++){
											var attribute_name = attribute_value[k][0];
											var attribute_v = attribute_value[k][1];
											if(attribute_v == null){
												attribute_v = "";
											}
											infoHtml += "<b>"+attribute_name+":</b>"+attribute_v+"</br>";
										}
										map.openInfoWindowHtml(polyline_point,infoHtml);
									}
								});
							};
						})();
						GEvent.addListener(Polyline, "click",polyline_ );
						
						overlays["pipeline"].push(Polyline);
					}
					loadMask.hide();
				}else{
					
				}
			});
		}
	}

	function remove_overlays(type){
		if(type){
			for(var i = 0; i< overlays[type].length; i++){
				map.removeOverlay(overlays[type][i]);
			}
			map.closeInfoWindow();
		}else{
			for(var i = 0; i < overlay_type.length; i++){
				remove_overlays(overlay_type[i]);
			}
			map.closeInfoWindow();
		}
	}


	var targetTree = new Ext.tree.TreePanel( {
		autoScroll : true,
		split : true,
		region : 'center',
		animate : false,
		border : false,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				if (node.attributes.target) {
					var key = node.attributes.target.target_id;
					showInfoKey = key
					target.moveToTarget(key, true);
					showTargetInfo(key);
					showTailLine(key);
				} else {
					return false;
				}
			}
		}
	});

	function showTargetInfo(target_id) {
		Zion.db.getJSON('monitor.realtime.target', [ target_id ], function(data) {
			if (data && data.r) {
				var target = data.r[0];
				targetInfo.setSource( {
					'目标序号' : target[0],
					'目标名称' : target[1],
					'终端类型' : target[2],
					'终端序号' : target[3],
					'终端编号' : target[4],
					'通讯地址' : target[5]
				});
			}
		});
	}

	var targetInfo = new Ext.grid.PropertyGrid( {
		title : '属性信息',
		collapsible : true,
		region : 'south',
		autoHeight : true,
		selModel : new Ext.grid.RowSelectionModel( {
			singleSelect : true
		}),
		source : {
			'目标序号' : '',
			'目标名称' : '',
			'终端类型' : '',
			'终端序号' : '',
			'终端编号' : '',
			'通讯地址' : ''
		},
		viewConfig : {
			forceFit : true,
			scrollOffset : 2
		},
		listeners : {
			beforeedit : function() {
				return false;
			}
		}
	});
	targetInfo.store.sortInfo = null;
	targetInfo.getColumnModel().config[0].sortable = false;

	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [ {
			title : '监控目标列表',
			region : 'west',
			collapsible : true,
			split : true,
			width : 200,
			layout : 'border',
			tbar:[ '查询',
				new Ext.form.TextField({
					width: 150,
					id:'datasource',
					emptyText:'输入目标',
					enableKeyEvents: true,
					listeners:{
						render: function(f){
							var hiddenPkgs = [];
							var field = Ext.get('datasource');
							var filter = new Ext.tree.TreeFilter(targetTree, {
								clearBlank: true,
								autoClear: true
							});
							field.on('keyup', function(e) {
								var text = Ext.getCmp('datasource').getValue();
								Ext.each(hiddenPkgs, function(n){
									n.ui.show();
								});
								if(!text){
									filter.clear();
									return;
								}
								targetTree.expandAll();
								var re = new RegExp(Ext.escapeRe(text), 'i');
								filter.filterBy(function(n){
									return !n.isLeaf() || re.test(n.text);
								});
								hiddenPkgs = [];
								targetTree.root.cascade(function(n) {
									if(!n.isLeaf() && n.ui.ctNode.offsetHeight < 3){
										n.ui.hide();
										hiddenPkgs.push(n);
									}
								});
							});
						}
					}
				})
			],	
			items : [ targetTree, targetInfo ]
		}, {
			layout : 'border',
			region : 'center',
			items : [ {
				layout : 'fit',
				region : 'center',
				contentEl : 'map_canvas',
				tbar:overly_buttons,
				cmargins : '5 0 0 0',
				listeners : {
					bodyresize : function(p, width, height) {
						document.getElementById("map_canvas").style.width = width;
						document.getElementById("map_canvas").style.height = height;
						if (map) {
							map.checkResize();
						}
					}
				}
			} ]
		} ]
	});

	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);
	

 
	/*
	new Zion.Polyline().draw(map, function(poly){
		Ext.Msg.alert("length", (poly.getLength() > 1000 ? parseInt(poly.getLength() /1000) + '公里': poly.getLength() + '米'));
	});
	

	new Zion.Polygon().draw(map, function(poly){
		Ext.Msg.alert("area", poly.getArea() > 1000 ? parseInt(poly.getArea() / 1000000) + '平方公里' : poly.getArea() + '平方米');
	});
*/
	var lastTrackPolyline;
	var lastTrackKey;
	var lastTrackTime;
	var lastTrackCount = 5;
	var lastTrackPoint;
	function showTailLine(key) {
		lastTrackPoint = null;
		lastTrackKey = key;
		if (lastTrackPolyline) {
			lastTrackPolyline.remove();
			lastTrackPolyline = null;
		}
		Zion.db.getJSON("monitor.realtime.last_track_count", [ key, key, lastTrackCount ], function(data) {
			if (data.r) {
				var latlngs = [];
				for ( var i = 0; i < data.r.length; i++) {
					latlngs.push(new GLatLng(data.r[i][0], data.r[i][1]));
				}
				if (lastTrackPoint) {
					latlngs.push(lastTrackPoint);
				}
				lastTrackPolyline = new GPolyline(latlngs, "#ff0000", 3, 0.8);
				map.addOverlay(lastTrackPolyline);
			}
		});
	}

	function appendLastTrackPolyline(tracks) {
		if (tracks[lastTrackKey]) {
			lastTrackPoint = new GLatLng(tracks[lastTrackKey].y, tracks[lastTrackKey].x);
			if (lastTrackPolyline) {
				if (lastTrackTime != tracks[lastTrackKey].t) {
					if (lastTrackPolyline.getVertexCount() >= lastTrackCount) {
						lastTrackPolyline.deleteVertex(0);
					}
					lastTrackPolyline.insertVertex(lastTrackPolyline.getVertexCount(), lastTrackPoint);
				}
				lastTrackTime = tracks[lastTrackKey].t;
			}
		} else {
			lastTrackPoint = null;
		}
	}

	var opts_target = {
		iconSize : 26,
		iconHead : false,
		mergeSize : 44,
		iconType : "people",
		flashSize : 56,
		application : "axiom",
		onclick : function(key, latlng) {
			target.openInfoWindow(key);
			showTailLine(key);
		},
		onupdated : function(target) {
			appendLastTrackPolyline(target.tracks);
		},
		get_target_icon:function(target, track){
			if(track.s & 0x03 == 0x03){
				return target.image_base + '3.png';
			}
			
			var now_t = new Date().getTime() / 1000;
			if((now_t - track.t) > (corp_setting['terminal.interval.longtime'] * 24 * 3600)){
				return target.image_base + '2.png';
			}
			
			if((now_t - track.t) > corp_setting['terminal.interval.overtime'] * 60){
				return target.image_base + '1.png';
			}
			
			return target.image_base + '0.png';
		}
	};

  //var target = new Zion.Target(map, true, true, opts_target);
  
  var corp_setting = {};
	Zion.db.getJSON('realtime.corp.setting', null, function(data){
			target = new Zion.Target(map, true, true, opts_target);
			if(data.r){
				for(var i = 0; i < data.r.length; i++){
					corp_setting[data.r[i][0]] = data.r[i][1];
				}
			}
		}
	);

	Ext.zion.tree.loadTargetTree(function(tree) {
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		loadMask.hide();
	}, false);
	
	
	var playOverlays = [];
	var playOverlays1 = [];
	var playOverlays2 = [];
	targetTree.on('checkchange',function(node,checked){
		if(node.isLeaf()&&checked==true){
			var targetid = node.attributes.target.target_id;
				Zion.db.getJSON('module.monitor.history_pipe.point_query.select', [ targetid ], function(data) {
					if(data.r&&!data.f){
						data_point = data.r;
						for(var i=0;i<data_point.length;i++){
							var alarm_type_content;
							var g_x=data_point[i][1];
							var g_y = data_point[i][2];
							var range = data_point[i][3];
							var type=data_point[i][4];
							var start_time = data_point[i][5];
							var end_time = data_point[i][6];
							var is_alarm= data_point[i][7];
							var alarm_type = data_point[i][8];
							var targetIcon = new GIcon();
							targetIcon.iconSize = new GSize(16, 16);
							targetIcon.iconAnchor = new GPoint(8, 8);
							targetIcon.image = "/module/pipe/management/alarm/point/images/"+type+".gif";
							if(alarm_type==0){
								alarm_type_content='进漏巡区域报警';
							}else if(alarm_type==1){
								alarm_type_content='出漏巡区域报警';
							}else if(alarm_type==2){
								alarm_type_content='进漏巡区域触发报警';
							}else{
								alarm_type_content='出漏巡区域触发报警';
							}
							var markerOptions = {
								target_id : targetid,
								icon : targetIcon,
								clickable : true
							}
							var point = new GLatLng(g_y , g_x);
							var marker = new GMarker(point, markerOptions);
							map.addOverlay(marker);
							playOverlays.push(targetid);
							playOverlays1.push(marker);
							drawCircle(g_y,g_x,range/1000,'#FF0000',3,0.5,'#ffff00',0.5);
							var pointHtml = '半径(米)：'+range+'<br/>开始时间：'+utc_to_time(start_time)+'<br/>结束时间：'+utc_to_time(end_time)+'<br/>报警类型：'+alarm_type_content;
							GEvent.addListener(marker, "click", GEvent.callbackArgs(null, function(point, pointHtml){
								map.openInfoWindowHtml(point,pointHtml);
							}, point, pointHtml));
						}
						
					}
				})

		}else if(node.isLeaf()&&checked==false){
			var targetid = node.attributes.target.target_id;
			for(var i=0;i<playOverlays.length;i+=1){
				if(playOverlays[i] == targetid){
					map.removeOverlay(playOverlays1[i]);
					map.removeOverlay(playOverlays2[i]);
				}
			}
		}
		node.expand();
		node.attributes.checked = checked;
		
		/*node.on('expand',function(node){
			node.eachChild(function(child){
				child.ui.toggleCheck(checked);
				child.attributes.checked = checked;
				child.fireEvent('checkchange',child,checked);
			});
		});*/

		/*node.eachChild(function(child){
			//alert('2:'+child);
			child.ui.toggleCheck(checked);
			child.attributes.checked = checked;
			child.fireEvent('checkchange',child,checked);
		});*/
	},targetTree);

	/** 地图半径画圆**/
	function drawCircle(lat, lng, radius, strokeColor, strokeWidth, strokeOpacity, fillColor, fillOpacity) {
	    var d2r = Math.PI / 180;
	    var r2d = 180 / Math.PI;
	    var Clat = radius * 0.009;  
	    var Clng = Clat / Math.cos(lat * d2r);
	    var Cpoints = [];
	    // 计算圆周上33个点的经纬度
	    for (var i = 0; i < 33; i++) {
	        var theta = Math.PI * (i / 16);
	        Cy = lat + (Clat * Math.sin(theta));
	        Cx = lng + (Clng * Math.cos(theta));
	        var P = new GPoint(Cx, Cy);
	        Cpoints.push(P);
	    }
	    strokeColor = strokeColor || "#0055ff";   // 边框颜色，默认"#0055ff"
	    strokeWidth = strokeWidth || 1;           // 边框宽度，默认1px
	    strokeOpacity = strokeOpacity || 1;       // 边框透明度，默认不透明
	    fillColor = fillColor || strokeColor;     // 填充颜色，默认同边框颜色
	    fillOpacity = fillOpacity || 0.1;         // 填充透明度，默认0.1
	    polygon = new GPolygon(Cpoints, strokeColor, strokeWidth, strokeOpacity, fillColor, fillOpacity);
	    map.addOverlay(polygon);
	    playOverlays2.push(polygon);
	}

	function utc_to_time(val){
		var time_hour = Math.floor(val/3600);
		var time_minute = Math.floor((val-time_hour*3600)/60);
		if(time_minute.toString().length % 2 == 1){
			return time_hour+':0'+time_minute;
		}else{
			return time_hour+':'+time_minute;
		}
	}

	function drawPolyline(data) {
		if(data.r){
			for ( var i = 0; i < data.r.length; i++) {
				var polyline = new GPolyline.fromEncoded(eval("(" + data.r[i][1] + ")"));
				map.addOverlay(polyline);
				data.r[i].push(polyline);
			}
		}
	}
	
	var opts_point = {
			iconSize : 26,
			iconImageBase : "/api/image/poi",
			infoImageBase : "/api/image/poi",
			onclick : function(key, latlng) {
				overlayPoint.openInfoWindow(key);
			}
		};
	 
	var overlayPoint = new Zion.OverlayPoint(map, opts_point);
});
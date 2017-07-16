Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	var overlay_type = ["pipeline", "facilities", "defect","inspection","point"];
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

	var inspection_button = new Ext.Button({
		text : '巡检点',
		tooltip : '巡检点',
		enableToggle:true,
		icon : Ext.zion.image_base+'/select.gif',
		overlay_type:'inspection'
	});

	var point_button = new Ext.Button({
		text : '设施',
		tooltip : '设施',
		enableToggle:true,
		icon : Ext.zion.image_base+'/select.gif',
		overlay_type:'point'
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

	function show_latlng_win(button, latlng){
		var g_x = latlng.lng();
		var g_y = latlng.lat();
		g_x = parseInt(g_x*1000000)/1000000;
		g_y = parseInt(g_y*1000000)/1000000;
		var form_panel = new Ext.form.FormPanel({
			labelWidth : 35,
			frame : true,
			items:[{
				fieldLabel : '经度',
				xtype:'label',
				text:g_x
			},{
				fieldLabel : '纬度',
				xtype:'label',
				text:g_y
			}]
		});
		var lat_lng_window = new Ext.Window({
		width:300,
		title : '坐标显示',
		closable : true,
		items : [ form_panel ],
		buttons : [{
				text : '确定',
				handler : function() {
					lat_lng_window.close();
				}
			} ]
		});
		lat_lng_window.show();
	}

	var lat_lng_button = new Ext.Button({
		text : '取点坐标',
		tooltip : '取点坐标',
		icon : Ext.zion.image_base+'/map_magnify.png',
		enableToggle:true,
		listeners:{
			'toggle':function(button, pressed){
				if(pressed){
					button.maps_listener = GEvent.addListener(map, "click", function(marker_,latlng_, overlaylatlng_){
						GEvent.removeListener(button.maps_listener);
						button.toggle(false, false);
						var latlng = null;
						if(latlng_){
							latlng = latlng_;
						}else if(overlaylatlng_){
							latlng = overlaylatlng_;
						}
						show_latlng_win(button, latlng);
					});					
				}else{
					GEvent.removeListener(button.maps_listener);
				}
			}
		}
	});

	var overly_buttons = [defect_button,inspection_button,point_button,pipeline_button,polygon_button,lat_lng_button];

	defect_button.on('toggle', overly_button_toggle);
	inspection_button.on('toggle', inspection_button_toggle);
	pipeline_button.on('toggle',draw_pipeline);
	polygon_button.on('toggle',draw_polygon);
	point_button.on('toggle', point_button_toggle);

	function point_button_toggle(button, pressed){
		if(map.getZoom() >= 14){
			if(pressed == true){
				show_point();
			}else{
				remove_overlays(button.overlay_type);
			}
		}
	}
	
	var point_coordinate = [];
	function show_point(){
		if(point_button.pressed){
			var loadMask = new Ext.LoadMask(Ext.getBody(), {
				msg : "加载中，请稍后 ..."
			});
			loadMask.show();
			var bounds = map.getBounds();
			var sw = bounds.getSouthWest();
			var ne = bounds.getNorthEast();
			var params = [sw.lng(),ne.lng(),sw.lat(),ne.lat()];
			//sw.lng()<n<sw.lng() sw.lat()<n< ne.lat()
			Zion.db.getJSON('pipe.management.data.point.area.select',params,function(data){
				if(data.r){
					var data_value = data.r;
					for(var i = 0;i < data_value.length; i++){
						var overlay_id = data_value[i][0];
						var varoverlay_name = data_value[i][1];
						var overlay_type_id = data_value[i][2];
						var info_type_name = data_value[i][3];
						var x = data_value[i][4];
						var y = data_value[i][5];
						var reg_date = data_value[i][6];
						var memo = data_value[i][7];
						var polyline_id = data_value[i][8];
						var polyline_name = data_value[i][9];
						var dictionary_id = data_value[i][10];
						var inspectionIcon = new GIcon();
						inspectionIcon.iconSize = new GSize(26, 26);
						inspectionIcon.iconAnchor = new GPoint(13,13);
						if(dictionary_id == "" || dictionary_id == null){
							inspectionIcon.image = "/api/image/poi"+ "/"+overlay_type_id+".png";
						}else{
							inspectionIcon.image = "/api/image/poi"+ "/"+dictionary_id+".png";
						}
						var markerOptions = {
							icon : inspectionIcon,
							clickable : true
						}
						
						var point = new GLatLng(y,x);
						var marker = new GMarker(point, markerOptions);
						map.addOverlay(marker);
						overlays["point"].push(marker);

						var pointHtml = '<b>名称</b>：'+varoverlay_name+'<br/>';
						
						GEvent.addListener(marker, "click", GEvent.callbackArgs(null, function(point, pointHtml,overlay_id){
							Zion.db.getJSON('pipe.data.point.last_data.select',[overlay_id],function(data){
								if(data.r){
									var data_value = data.r;
									Zion.db.getJSON("axiom_overlay_point.axiom_info_attribute_value.select",[overlay_id],function(data){
										if(data.r){
											for(var i = 0; i < data.r.length; i ++){
												if(data.r[i][1] == null || data.r[i][1] == ""){
													data.r[i][1] = "";
												}
												if(data.r[i][0] == "3D展示" && data.r[i][1] == "是"){
													pointHtml += "<b>"+data.r[i][0]+"</b>："+ "<a href='#' onclick='show_3D("+overlay_id+")'>展示</a><br/>";
												}else{
													pointHtml += "<b>"+data.r[i][0]+"</b>："+ data.r[i][1]+"<br/>";
												}
											}
										}
										if(data_value.length == 1){
											var img_id = data_value[0][0];
											var img_date = data_value[0][2];
											pointHtml += "<b>图片</b>：<a href='#' onclick='show_win("+img_id+",\""+img_date+"\",0,0,false)'>查看</a>";
											//var image_tab = new GInfoWindowTab("设施最近图片" , "<img src=\"/uploaded/visitator/facilities/" + img_id + ".jpg\" />");
											//map.openInfoWindowTabsHtml(latlng,[new GInfoWindowTab("信息" , infoHtml), image_tab]);
										
										}

										if(data_value.length == 2){
											var img_id = data_value[0][0];
											var img_date = data_value[0][2];
											var img_next_id = data_value[1][0];
											var img_next_date = data_value[1][2];
											pointHtml += "<b>图片</b>：<a href='#' onclick='show_win("+img_id+",\""+img_date+"\","+img_next_id+",\""+img_next_date+"\",true)'>查看</a></br>";
										}

										Zion.db.getJSON("axiom_overlay_part.select",[overlay_id],function(json){
											if(json.r && json.r != ""){
												pointHtml += "<b>附属设施</b>：";
												for(var j = 0; j < json.r.length; j++){
													var part_id = json.r[j][0];
													var part_name = json.r[j][1];
													pointHtml += "<a href='#' onclick='show_part("+part_id+",\""+part_name+"\")'>"+json.r[j][1]+"</a>.";
												}
												map.openInfoWindowHtml(point, pointHtml);
											}else{
												map.openInfoWindowHtml(point, pointHtml);
											}
										});
									});
								}else{
									map.openInfoWindowHtml(point, pointHtml);
								}
							});
						}, point, pointHtml,overlay_id));
					}
				}
				loadMask.hide();
			});
		}
	}
	function show_part(part_id,part_name){
		loadMask.show();
		Zion.db.getJSON("axiom_overlay_part.axiom_info_attribute_value.select",[part_id],function(data){
			if(data.r){
				var data_value = data.r;
				Zion.db.getJSON('pipe.data.point.last_data.select',[part_id],function(json){
					if(json.r){
						var pointHtml ="";
						for(var i = 0; i < data_value.length; i ++){
							if(data_value[i][1] == null || data_value[i][1] == ""){
								data_value[i][1] = "";
							}
							if(data_value[i][0] == "3D展示" && data_value[i][1] == "是"){
								pointHtml += "<b>"+data.r[i][0]+"</b>："+ "<a href='#' onclick='show_3D("+part_id+")'>展示</a><br/>";
							}else{
								pointHtml += "<b>"+data.r[i][0]+"</b>："+ data.r[i][1]+"<br/>";
							}
							
						}
						var part_value = json.r;
						var pointHtml;
						if(part_value.length == 0){
							pointHtml += "";
						}
						if(part_value.length == 1){
							var img_id = part_value[0][0];
							var img_date = part_value[0][2];
							pointHtml += "<b>图片</b>：<a href='#' onclick='show_win("+img_id+",\""+img_date+"\",0,0,false)'>查看</a>";
							//var image_tab = new GInfoWindowTab("设施最近图片" , "<img src=\"/uploaded/visitator/facilities/" + img_id + ".jpg\" />");
							//map.openInfoWindowTabsHtml(latlng,[new GInfoWindowTab("信息" , infoHtml), image_tab]);
						}

						if(part_value.length == 2){
							var img_id = part_value[0][0];
							var img_date = part_value[0][2];
							var img_next_id = part_value[1][0];
							var img_next_date = part_value[1][2];
							pointHtml += "<b>图片</b>：<a href='#' onclick='show_win("+img_id+",\""+img_date+"\","+img_next_id+",\""+img_next_date+"\",true)'>查看</a></br>";
						}
					}
					return show_value(pointHtml,part_name);
				});	
			}	
		});
	}
	
	function show_3D(id){
		var panel = new Ext.Panel({
			width:512,
			height:375,
			items:[{
				xtype: 'flash',
				width:512,
				height:375,
				anchor: 'anchor',
				wmode: 'direct',
				autoScroll:true,
				url: '/api/image/flash/'+id+'.swf'
			}]
			//html:'<object width="512" height="375"><embed src="/api/image/flash/'+id+'.swf" type="application/x-shockwave-flash" allowscriptaccess="always"  allowfullscreen="true"  width="512"  height="375" wmode="direct"> </embed></object>'
		});
		var win = new Ext.Window( {
			title : "3D展示",
			closable : true,
			width:520,
			height:380,
			items : [ panel ],
			buttons : [{
				text : '如果不能正常显示，点击此处安装最新Flash播放器',
				handler : function() {
					win.close();
					Ext.Msg.alert('下载',"<a href='http://get.adobe.com/cn/flashplayer/' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载</a>");
				}
			}, {
				text : '取消',
				handler : function() {
					win.close();
				}
			} ]
		});
		win.show();
	}
	window.show_3D = show_3D;

	function show_value(pointHtml,part_name){
		var panel = new Ext.Panel({
			width:300,
			height:200,
			html:pointHtml
		});
		var win = new Ext.Window( {
			title : part_name,
			closable : true,
			width:300,
			height:200,
			items : [ panel ],
			buttons : [{
				text : '取消',
				handler : function() {
					win.close();
				}
			} ]
		});
		win.show();
		loadMask.hide();
	}

	window.show_part = show_part;
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
			remove_overlays(button.overlay_type);
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
						var color = data_value[i][7];
						var width = data_value[i][8];
						var opacity = data_value[i][9];
						var color_value;
						color_value = Zion.util.color(color);
						var points_arr = polyline.split(';');
						var points = [];
						var xy_arr = points_arr[0].split(',');
						var x = xy_arr[0];
						var y = xy_arr[1];
						for(var j = 0;j < points_arr.length;j ++){
							var xy_arr_ = points_arr[j].split(',');
							points.push(new GLatLng(xy_arr_[1],xy_arr_[0]));
						}
						var polylineEncoder = new PolylineEncoder(); 
						var Polyline = polylineEncoder.dpEncodeToGPolyline(points,color_value,width,opacity);
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
	
	function inspection_button_toggle(button, pressed){
		if(pressed == true){
			show_inspection();
		}else{
			remove_overlays(button.overlay_type);
		}
	}
	
	function show_inspection(){
		if(inspection_button.pressed){
			var loadMask = new Ext.LoadMask(Ext.getBody(), {
				msg : "加载中，请稍后 ..."
			});
			loadMask.show();
			Zion.db.getJSON('monitor.realtime_pipe.analyze_point.map.select',null,function(data){
				if(data.r){
					var data_value = data.r;
					for(var i = 0 ; i < data_value.length; i ++){
						var id = data_value[i][0];
						var name = data_value[i][1];
						var longitude = data_value[i][2];
						var latitude = data_value[i][3];
						var inspectionIcon = new GIcon();
						inspectionIcon.iconSize = new GSize(16, 16);
						inspectionIcon.iconAnchor = new GPoint(8, 8);
						inspectionIcon.image = Ext.zion.image_base + "/1.png";
						var markerOptions = {
							icon : inspectionIcon,
							clickable : true
						}
						var point = new GLatLng(latitude , longitude);
						var marker = new GMarker(point, markerOptions);
						map.addOverlay(marker);
						overlays["inspection"].push(marker);
						var inspectionHtml = '名称：'+name+'<br/>';
						GEvent.addListener(marker, "click", GEvent.callbackArgs(null, function(point, inspectionHtml){
							map.openInfoWindowHtml(point,inspectionHtml);
						}, point, inspectionHtml));
					}
				}else{
					
				}
				loadMask.hide();
			});
		}else{
		}
	}

	function remove_overlays(type){
		if(type){	
			for(var i = 0; i< overlays[type].length; i++){
				map.removeOverlay(overlays[type][i]);
			}
			if(type == "point" && map.getZoom() >= 14){
				
			}else{
				map.closeInfoWindow();
			}
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
	
	GEvent.addListener(map, "moveend", function(e){
		if(map.getZoom() >= 14){
			if(point_button.pressed){
				remove_overlays(point_button.overlay_type);
				show_point();
			}else{
				remove_overlays(point_button.overlay_type);
			}
		}else{
			remove_overlays(point_button.overlay_type);
		}
	});
	
 
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
			//showTailLine(key);
		},
		onupdated : function(target) {
			//appendLastTrackPolyline(target.tracks);
		},
		get_target_icon:function(target, track){
			/*if(track.s & 0x03 == 0x03){
				return target.image_base + '3.png';
			}*/
			
			if(track.ti === 'data.collection'){
				return '1.png';
			}

			var now_t = new Date().getTime() / 1000;
			if((now_t - track.t) > (corp_setting['terminal.interval.longtime'] * 24 * 3600)){
				return target.image_base + '3.png';
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
	
	/*var opts_point = {
			iconSize : 26,
			iconImageBase : "/api/image/poi",
			infoImageBase : "/api/image/poi",
			onclick : function(key, latlng) {
				overlayPoint.openInfoWindow(key);
			}
		};
	 
	var overlayPoint = new Zion.OverlayPoint(map, opts_point);*/
});
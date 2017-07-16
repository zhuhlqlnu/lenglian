var map;
Ext.onReady(function() {
	Ext.QuickTips.init();
	var targetid = '';
	var polygon;
	var data_point;
	var pointOverlays = [];
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var overlay_type = ["pipeline", "facilities", "defect","point","point_overlays","inspection"];
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
			id:'select_point',
			enableToggle:true,
			icon : Ext.zion.image_base+'/select.gif',
			listeners : {
				'toggle':function(this_,pressed){
					if(this_.pressed){
						Zion.db.getJSON('module.monitor.history_pipe.point_query.select', [ targetid ], function(data) {
							if(data.r&&!data.f){
								data_point = data.r;
								//Ext.getCmp('select_point').disable();
								for(var i=0;i<data_point.length;i++){
									var alarm_type_content;
									var name=data_point[i][0];
									var g_x=data_point[i][1];
									var g_y = data_point[i][2];
									var range = data_point[i][3];
									var start_time = data_point[i][4];
									var end_time = data_point[i][5];
									if(end_time == "1970-01-01 08:00:00"){
										end_time ="无限周期";
									}
									var targetIcon = new GIcon();
									targetIcon.iconSize = new GSize(16, 16);
									targetIcon.iconAnchor = new GPoint(8, 8);
									targetIcon.image = Ext.zion.image_base + "/1.png";
									
									var markerOptions = {
										target_id : targetid,
										icon : targetIcon,
										clickable : true
									}
									var point = new GLatLng(g_y , g_x);
									var marker = new GMarker(point, markerOptions);
									map.addOverlay(marker);
									overlays["point"].push(marker);
									drawCircle(g_y,g_x,range/1000,'#FF0000',3,0.5,'#ffff00',0.5);					
									var pointHtml = '<b>巡检点名称：</b>'+name+'<br/><b>半径(米)：</b>'+range+'<br/><b>开始时间：</b>'+start_time+'<br/><b>结束时间：</b>'+end_time;
									GEvent.addListener(marker, "click", GEvent.callbackArgs(null, function(point, pointHtml){
										map.openInfoWindowHtml(point,pointHtml);
									}, point, pointHtml));
								}
							}
						});
					}else{
						remove_overlays(this_.overly_type);
						remove_overlays("point_overlays");
						map.closeInfoWindow();
					}
				}
			}
		});
		
	/*var inspection_button = new Ext.Button({
		text : '巡检点',
		tooltip : '巡检点',
		enableToggle:true,
		icon : Ext.zion.image_base+'/select.gif',
		overlay_type:'inspection'
	});*/
	
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

	var point_button = new Ext.Button({
		text : '设施',
		tooltip : '设施',
		enableToggle:true,
		icon : Ext.zion.image_base+'/select.gif',
		overlay_type:'point'
	});
	var point_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['overlay_id', 'overlay_name', 'overlay_type_id','info_type_name','x','y','reg_date','memo','polyline_id','polyline_name','dictionary_id'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/pipe.management.data.point.select'
		})
	});

	point_store.on('load',function(){
		var point_empty = new point_store.recordType({
			overlay_id :-1,
			overlay_name:'所有'
		});
		point_store.insert(0,point_empty);
	});
	
	var point_combo = new Ext.form.ComboBox({
		hiddenName : 'overlay_id',
		valueField : 'overlay_id',
		width:100,
		store : point_store,
		displayField : 'overlay_name',
		mode : 'local',
		listWidth :200,
		triggerAction : 'all',
		listeners : {
			'expand':function(this_){
				point_store.removeAll();
				setTimeout(function(){point_store.load();},0);
			},
			'select' : function(this_, record, index){
				if(record.get("overlay_id") == -1){
					remove_overlays("point");
					show_point();
					return;
				}
				var loadMask = new Ext.LoadMask(Ext.getBody(), {
					msg : "加载中，请稍后 ..."
				});
				loadMask.show();
				remove_overlays("point");
				var overlay_id = record.get("overlay_id");
				var overlay_name = record.get("overlay_name");
				var overlay_type_id = record.get("overlay_type_id");
				var info_type_name = record.get("info_type_name");
				var x = record.get("x");
				var y = record.get("y");
				var reg_date = record.get("reg_date");
				var memo = record.get("memo");
				var polyline_id = record.get("polyline_id");
				var polyline_name = record.get("polyline_name");
				var dictionary_id = record.get("dictionary_id");
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
				map.setCenter(point,16);
				overlays["point"].push(marker);
				
				var pointHtml = '<b>名称</b>：'+overlay_name+'<br/>';
				
				GEvent.addListener(marker, "click", GEvent.callbackArgs(null, function(point, pointHtml,overlay_id,overlay_type_id){
					Zion.db.getJSON('pipe.data.point.last_data.select',[overlay_id],function(data){
						if(data.r){
							var data_value = data.r;
							Zion.db.getJSON("axiom_overlay_point.axiom_info_attribute_value.select",[overlay_id,overlay_type_id,overlay_id],function(data){
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
											var info_type_id = json.r[j][2];
											pointHtml += "<a href='#' onclick='show_part("+part_id+",\""+part_name+"\","+info_type_id+")'>"+(j+1)+":"+json.r[j][1]+"</a> ";
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
				}, point, pointHtml,overlay_id,overlay_type_id));
				loadMask.hide();
			}				
		}
	});

	var overly_buttons = [defect_button,inspection_button,"设施：",point_combo,pipeline_button,polygon_button];

	defect_button.on('toggle', overly_button_toggle);	
	inspection_button.on('toggle', inspection_button_toggle);
	pipeline_button.on('toggle',draw_pipeline);
	polygon_button.on('toggle',draw_polygon);
	
	defect_button.on('toggle', overly_button_toggle);
	inspection_button.on('toggle', inspection_button_toggle);
	pipeline_button.on('toggle',draw_pipeline);
	polygon_button.on('toggle',draw_polygon);
	point_button.on('toggle', point_button_toggle);

	function point_button_toggle(button, pressed){
		if(pressed == true){
			show_point();
		}else{
			remove_overlays(button.overlay_type);
		}
	}
	
	function show_point(){
		var loadMask = new Ext.LoadMask(Ext.getBody(), {
			msg : "加载中，请稍后 ..."
		});
		loadMask.show();
		Zion.db.getJSON('pipe.management.data.point.select',null,function(data){
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
					var pointHtml = '名称：'+varoverlay_name+'<br/>';
					GEvent.addListener(marker, "click", GEvent.callbackArgs(null, function(point, pointHtml){
						map.openInfoWindowHtml(point,pointHtml);
					}, point, pointHtml));
					loadMask.hide();
				}
			}
		});
	}
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
				loadMask.hide();
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
			});
		}else{
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
						var polyline =  data_value[i][3];
						var points_arr = polyline.split(';');
						var points = [];
						var xy_arr = points_arr[0].split(',');
						var x = xy_arr[0];
						var y = xy_arr[1];
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
		split : true,
		region : 'south',
		height : 245,
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
		}
	});
	targetInfo.store.sortInfo = null;
	targetInfo.getColumnModel().config[0].sortable = false;
	var targetTree = new Ext.tree.TreePanel( {
		// title : '人员列表',
		split : true,
		autoScroll : true,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
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
		listeners : {
			checkchange : function(node, checked) {
				node.attributes.checked = checked;
				if (node.hasChildNodes()) {
					node.eachChild(function(child) {
						child.ui.toggleCheck(checked);
					});
				}
			},
			click : function(node) {
				if (node.attributes.target) {
					targetid = node.attributes.target.target_id;
					showInfoKey = targetid;
					Ext.getCmp("target_name").setText(node.attributes.text);
					showTargetInfo(targetid);
				}
			}
		}
	});

	var form = new Ext.Panel( {
		frame:true,
		layout:'form',
		width:100000,
		// labelWidth: 100,
		buttonAlign : 'left',
		items : [ {
			fieldLabel : '开始时间',
			allowBlank : false,
			editable : false,
			id : 'startdttrack',
			width : 115,
			format : 'Y-m-d',
			xtype : 'datefield',
			value : new Date()
		}, {
			xtype : 'timefield',
			allowBlank : false,
			editable : false,
			format : 'H:i',
			id : 'starttftrack',
			width : 115,
			increment : 1,
			value : '05:00'
		}, {
			fieldLabel : '结束时间',
			allowBlank : false,
			editable : false,
			id : 'enddttrack',
			width : 115,
			format : 'Y-m-d',
			xtype : 'datefield',
			value : new Date()
		}, {
			xtype : 'timefield',
			allowBlank : false,
			editable : false,
			format : 'H:i',
			id : 'endtftrack',
			width : 115,
			increment : 1,
			value : '21:00'
		} ],
		buttons : [ {
			text : '查询',
			style:'margin-left:100',
			handler : function() {
				if (targetid.length <= 0) {
					Ext.Msg.alert('提示', '请选择终端');
					return;
				}
				loadMask.show();
				// var s = "2010-05-23 00:00:00";
				var s = Ext.getCmp('startdttrack').getRawValue() + ' ' + Ext.getCmp('starttftrack').getValue() + ':00';
				var std = new Date(Date.parse(s.replace(/-/g, "/")));
				// s = "2010-05-23 20:00:00";
				var e = Ext.getCmp('enddttrack').getRawValue() + ' ' + Ext.getCmp('endtftrack').getValue() + ':00';
				var end = new Date(Date.parse(e.replace(/-/g, "/")));
				// Zion.track.getTrack(91, std.getTime() / 1000 , end.getTime()
				// / 1000 , function(data) {
				Zion.track.getTrack(targetid, std.getTime() / 1000, end.getTime() / 1000, function(data) {
					if (data.r.length == 0) {
						Ext.Msg.alert('提示', '没有轨迹点');
						loadMask.hide();
					}else{
						loadMask.hide();
						parseTrackData(data.r);
						westPanel.layout.setActiveItem(card2);
					}
				});
			}
		} ]
	});

	/*var card1 = new Ext.Panel( {
		width : 200,
		layout : 'vbox',
		layoutConfig : {
			align : 'stretch',
			pack : 'start'
		},
		items : [ targetTree, targetInfo,form ]
	});*/
	
	var card1_west = new Ext.Panel({
		layout : 'border',
		defaults : {
			border : true
		},
		items : [targetInfo, {
			layout : 'fit',
			region : 'center',
			items:[targetTree]
		}]
	});

	var card1 = new Ext.Panel({
		width: 250,
		layout : 'border',
		defaults : {
			border : true
		},
		items : [{
			region : 'south',
			items:[form]
		}, {
			layout : 'fit',
			region : 'center',
			items:[card1_west]
		}]
	});

	var card2 = new Ext.Panel( {
		width : 300,
		layout : 'fit',
		items : [ {
			xtype : 'form',
			bodyStyle : 'padding:5px 10px 0',
			width : 300,
			labelWidth : 100,
			items : [ {
				xtype : 'radiogroup',
				hideLabel : true,
				items : [ {
					boxLabel : '锁定',
					name : 'roadcorrect',
					inputValue : 1,
					handler : function() {
						if (this.checked) {
							mapViewModal = true;
						}
					}
				}, {
					boxLabel : '自由视野',
					name : 'roadcorrect',
					inputValue : 2,
					checked : true,
					handler : function() {
						if (this.checked) {
							mapViewModal = false;
						}
					}
				} ]
			}, {
				id : 'intervalpointcombo',
				xtype : 'combo',
				fieldLabel : '回放间隔(点)',
				editable : false,
				width : 80,
				displayField : 'name',
				store : new Ext.data.ArrayStore( {
					fields : [ 'id', 'name' ],
					data : [ [ 1, '1X' ], [ 5, '5X' ], [ 10, '10X' ], [ 15, '15X' ], [ 20, '20X' ] ]
				}),
				displayField : 'name',
				valueField : 'id',
				typeAhead : true,
				mode : 'local',
				forceSelection : true,
				triggerAction : 'all',
				value : '1',
				selectOnFocus : true
			}, {
				xtype : 'label',
				fieldLabel : '回放速度(秒)',
				id : 'playspeedlabel',
				text : '1'
			}, new Ext.Slider( {
				id : 'playspeedslider',
				width : 214,
				increment : 1,
				minValue : 1,
				maxValue : 4,
				listeners : {
					'changecomplete' : function(slider, newValue) {
						// 改变播放速度
				var tmpplayspeedlabel = Ext.getCmp('playspeedlabel');
				if (newValue != 1) {
					tmpplayspeedlabel.setText((newValue - 1) * 5);
					// 设置播放
				refreshTime = (newValue - 1) * 5;
			} else {
				tmpplayspeedlabel.setText(1);
				// 设置播放
				refreshTime = 1;
			}
			if (currentstate == 1) {
				play();
			}
		}
	}
			}), {
				xtype : 'label',
				fieldLabel : '回放进度(点)',
				id : 'playtempolabel',
				text : '0'
			}, new Ext.Slider( {
				id : 'playtemposlider',
				width : 214,
				increment : 1,
				minValue : 1,
				maxValue : 1,
				listeners : {
					'changecomplete' : function(slider, newValue) {
						// 改变播放进度,更改'回放进度'label
				var tmpplaytempolabel = Ext.getCmp('playtempolabel');
				tmpplaytempolabel.setText(newValue);
				// 停止播放,改变按钮显示图片
				resetimgsrc();
				var tmp = Ext.getCmp('media_controls_pause');
				tmp.setIconClass('dark_pause');
				pause();
				// 画当前进度点
				drawtrackpoint(newValue - 1);
				sliderposition = newValue - 1;
			}
		}
			}), new Ext.Panel( {
				layout : 'table',
				layoutConfig : {
					columns : 9
				},
				items : [ new Ext.Button( {
					id : 'media_controls_first',
					iconCls : 'light_first',
					value : '0',
					handler : function() {
						resetimgsrc();
						this.setIconClass('dark_first');
						previousTrack();
					}
				}), new Ext.Spacer( {
					width : 10
				}), new Ext.Button( {
					id : 'media_controls_play',
					iconCls : 'light_play',
					handler : function() {
						resetimgsrc();
						this.setIconClass('dark_play');
						play();
					}
				}), new Ext.Spacer( {
					width : 10
				}), new Ext.Button( {
					id : 'media_controls_pause',
					iconCls : 'light_pause',
					handler : function() {
						resetimgsrc();
						this.setIconClass('dark_pause');
						pause();
					}
				}), new Ext.Spacer( {
					width : 10
				}), new Ext.Button( {
					id : 'media_controls_stop',
					iconCls : 'light_stop',
					handler : function() {
						resetimgsrc();
						this.setIconClass('dark_stop');
						stop();
					}
				}), new Ext.Spacer( {
					width : 10
				}), new Ext.Button( {
					id : 'media_controls_last',
					iconCls : 'light_last',
					handler : function() {
						resetimgsrc();
						this.setIconClass('dark_last');
						nextTrack();
					}
				}) ]
			}), {
				xtype : 'fieldset',
				title : '信息',
				labelWidth:60,
				items : [ {
					id : 'target_name',
					xtype : 'label',
					fieldLabel : '目标名称'
				}, {
					id : 'gps_time',
					xtype : 'label',
					fieldLabel : 'GPS时间'
				}, {
					id : 'recv_time',
					xtype : 'label',
					fieldLabel : '接收时间'
				}, {
					id : 'speed',
					xtype : 'label',
					fieldLabel : '速度'
				}, {
					id : 'heading',
					xtype : 'label',
					fieldLabel : '方向'
				}, {
					id : 'geocoding',
					xtype : 'label',
					fieldLabel : '位置信息'
				}, {
					id : 'terminal_status_desc',
					xtype : 'label',
					fieldLabel : '详细信息'
				} ]
			} ]
		}],
		buttons : [{
			text : '返回',
			handler : function() {
				clearPlayOverlay();
				//reset_track();
				//map.clearOverlays();
				//drawPolyline();
				Ext.getCmp('select_point').enable();
				westPanel.layout.setActiveItem(card1);
			}
		}]
	});

	var point_polygon;
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
	    point_polygon = new GPolygon(Cpoints, strokeColor, strokeWidth, strokeOpacity, fillColor, fillOpacity);
	    map.addOverlay(point_polygon);
	    overlays["point_overlays"].push(point_polygon);
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
	
	var hide_point_button = new Ext.Button({
		text : '隐藏漏巡点',
		handler : function() {
		}
	})
	var westPanel = new Ext.Panel( {
		title : '目标列表',
		autoScroll : true,
		collapsible : true,
		split : true,
		region : 'west',
		width : 300,
		activeItem : 0,
		layout : 'card',
		items : [card1, card2 ]
	});

	var viewport = new Ext.Viewport({
		layout : 'border',
		defaults : {
			border : true
		},
		items : [westPanel, {
			layout : 'fit',
			region : 'center',
			tbar:overly_buttons,
			contentEl : 'map_canvas',
			listeners : {
				bodyresize : function(p, width, height) {
					if (width != undefined) {
						document.getElementById("map_canvas").style.width = width;
					}
					if (height != undefined) {
						document.getElementById("map_canvas").style.height = height;
					}
					if (map) {
						map.checkResize();
					}
				}
			}
		}]
	});

	map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);

	Ext.zion.tree.loadTargetTree(function(tree) {
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		point_store.load();
		loadMask.hide();
	});

	function getCheckNode(node, arr) {
		var childnodes = node.childNodes;
		for ( var i = 0; i < childnodes.length; i++) {
			var rootnode = childnodes[i];
			if (rootnode.attributes.checked == true) {
				arr.push(rootnode.attributes.target.target_id);
			}
			if (rootnode.childNodes.length > 0) {
				getCheckNode(rootnode, arr);
			}
		}
	}

	function drawPolyline(data) {
		//for ( var i = 0; i < data.r.length; i++) {
		//	var polyline = new GPolyline.fromEncoded(eval("(" + data.r[i][1] + ")"));
		//	map.addOverlay(polyline);
		//	data.r[i].push(polyline);
		//}
	}
	$("div .xtb-text").css("color","#fff");
	Zion.db.getJSON("realtime.polyline.select", null, function(data) {
		//drawPolyline(data);
	});
});
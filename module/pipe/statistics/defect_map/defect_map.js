Ext.onReady(function(){
	Ext.QuickTips.init();
	 //Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
	var selectCorpId;
	var overlay_type = ["pipeline", "facilities", "defect"];
	var overlays = {};
	var defect_id;
	for(var i = 0; i < overlay_type.length; i++){
		overlays[overlay_type[i]] = [];
	}
	var corp_tree = new Ext.tree.TreePanel( {
		id : 'tree_id',
		autoScroll : true,
		region : 'west',
		width : 250,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				selectCorpId = node.attributes.corp.corp_id;
				remove_overlays();
				show_overlays();
			}
		}
	});
	
	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			setTimeout(function(){
			corp_tree.getRootNode().childNodes[0].select();
			},0);
		});
	});

	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(50.718465,116.099052), 4);


	var defect_button = new Ext.Button({
		text : '缺陷',
		tooltip : '缺陷',
		enableToggle:true,
		icon : Ext.zion.image_base+'/select.gif',
		overlay_type:'defect'
	});
	defect_button.on('toggle', overly_button_toggle);

	var overly_buttons = [defect_button,{
					xtype:'label',
					text:'开始时间:'
				},{
					xtype:'datefield',
					id:'startDate',
					value: new Date(),
					format:'Y-m-d',
					width:100
				},{
					xtype:'timefield',
					id:'startTime',
					value:'00:00',
					width:60,
					format:'H:i'
				},'-',{
					xtype:'label',
					text:'结束时间:'
				},{
					xtype:'datefield',
					id:'endDate',
					value: new Date(),
					format:'Y-m-d',
					width:100
				},{
					xtype:'timefield',
					id:'endTime',
					value:'23:59',
					width:60,
					format:'H:i'
				}];

	function show_overlays(){
		if(defect_button.pressed){
			var loadMask = new Ext.LoadMask(Ext.getBody(), {
				msg : "加载中，请稍后 ..."
			});
			loadMask.show();
			var s = Ext.getCmp('startDate').getRawValue() + ' ' + Ext.getCmp('startTime').getValue() + ':00';
			var std = (new Date(Date.parse(s.replace(/-/g, "/")))).getTime()/1000;
			// s = "2010-05-23 20:00:00";
			var e = Ext.getCmp('endDate').getRawValue() + ' ' + Ext.getCmp('endTime').getValue() + ':59';
			var end = (new Date(Date.parse(e.replace(/-/g, "/")))).getTime()/1000;
			Zion.db.getJSON('pipe.statistics.defect_map.select',[selectCorpId,selectCorpId,selectCorpId,std,end],function(data){
				if(data.r){
					var data_value = data.r;
					for(var i = 0 ; i < data_value.length; i ++){
						var id = data_value[i][0];
						defect_id = id;
						var recv_time =  data_value[i][1];
						var gps_time =  data_value[i][2];
						var lat = data_value[i][3];
						var lng = data_value[i][4];
						var name = data_value[i][5];
						var user_name = data_value[i][6];
						var memo = data_value[i][7];
						var status = data_value[i][8];
						var reg_date = data_value[i][10];
						var status_value;
						var targetIcon = new GIcon();
						if(memo == null || memo== ""){
							memo = "";
						}	
						targetIcon.iconSize = new GSize(26, 26);
						targetIcon.iconAnchor = new GPoint(13, 13);
						if(status == 1){
							targetIcon.image = "1.png";
							status_value = "未处理";
						}else if(status == 2){
							targetIcon.image = "2.png";
							status_value = "处理中";
						}else{
							targetIcon.image = "3.png";
							status_value = "已处理";
							if(((parseInt(new Date().getTime()/1000)-reg_date) > (3*3600*24)) && status == 3){
								continue;
							}
						}		
						var markerOptions = {
							icon : targetIcon,
							clickable : true
						}
						var point = new GLatLng(lng,lat);
						var marker = new GMarker(point, markerOptions);
						var window_info = '缺陷类型：'+name+'<br/>发送人：'+user_name+'<br/>发送时间：'+gps_time+'<br/>经度：'+lat+'<br/>纬度：'+lng+'<br/>状态：<a href=# onclick="show_process('+id+')">'+status_value+'</a></br>备注：'+memo+'</br>查看图片：<a href=# onclick="show_win('+id+',false)">'+id+'.jpg</a>';
						GEvent.addListener(marker, "click",  GEvent.callbackArgs(this, function(point,i,window_info){
							map.openInfoWindowHtml(point,window_info);
						}, point, i,window_info));
						map.addOverlay(marker);
						overlays["defect"].push(marker);
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

	function overly_button_toggle(button, pressed){
		if(pressed == true){
			show_overlays();
		}else{
			remove_overlays(button.overly_type);
		}
	}

	show_win = function(id,type){
		var path;
		if(type){
			path = '<span><img width="100%" height="100%" id="rotImg" src="/uploaded/visitator/defect_process/'+id+'.jpg"/></span>';
		}else{
			path = '<span><img id="rotImg" width="100%" height="100%" src="/uploaded/visitator/defect/'+id+'.jpg"/></span>';
		}
		var panel = new Ext.Panel({
			 height:200,
			 width:200,
			 html:path
		 })
		 var new_win = new Ext.Window({
			 xtype:'window',
			 title: '图片',
			 modal : true, 
			 buttonAlign : 'left',
			 closable:true,
			 constrainHeader:true, 
			 autoHeight:false,
			 layout:'fit',
			 tbar:[{
				id : 'rotleft',
				width:35,
				text : '左转',
				icon:Ext.zion.image_base +'/arrow_rotate_clockwise.png',
				handler:function(){
					$('#rotImg').rotateRight(-90);
					new_win.setWidth($("#rotImg").width()+14);
					new_win.setHeight($("#rotImg").height()+60);
				}
			},{
				id : 'rotright',
				width:35,
				text : '右转',
				icon:Ext.zion.image_base +'/arrow_rotate_anticlockwise.png',
				handler:function(){
					$('#rotImg').rotateRight(90);
					new_win.setWidth($("#rotImg").width()+14);
					new_win.setHeight($("#rotImg").height()+60);
				}
			}],
			 html:'<span><img id="rotImg" src="/uploaded/visitator/defect/'+id+'.jpg"/></span>'
		 })
		 var win  = new Ext.Window({
			 xtype:'window',
			 id:'window',
			 title: '图片',
			 height:350,
			 width:300,
			 buttonAlign : 'center',
			 closable:true,
			 constrainHeader:true,  
			 layout:'fit',
			/* html:'<span><img width=200 height=200 src="images/11.jpg"/></span>'+
				 '<div><div align="center"><input type="button" value="点击查看原图" onclick="show_original(win)"></div></div>'*/
			 items:[panel],
			 buttons : [ {
				id : 'select',
				text : '点击查看原图',
				handler : function() {
					Ext.getCmp('window').close();
					new_win.show();
				}
			}]
		 })
		 
		 win.show();
	 }
	 
	
	show_process = function(id) {
		var process_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : ['id', 'type', 'reg_date', 'memo', 'defect_id','user_name', 'reg_user_id', 'way','corp_name'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/pipe.management.data.pipe_defect_process.select/['+id+']'
			})
		});
		
		var process_grid = new Ext.grid.GridPanel({
			height:350,
			width:550,
			layout:'fit',
			store : process_store,
			autoScroll : true,
			enableColumnHide : false,
			loadMask : {
				msg : '查询中...'
			},
			// frame: true,
			columns : [new Ext.grid.RowNumberer({header:'序号',width:35}),
			{
				header : "类型",
				width : 75,
				sortable : true,
				dataIndex : 'type',
				renderer:function(type){
					if(type==1){
						return "已处理";
					}else if(type == 2){
						return "转发";
					}else if(type == 3){
						return "生成任务";
					}else if(type == 4){
						return "误报";
					}else if(type == 5){
						return "进程";
					}else{
						return "";
					}
				}
			},{
				header : "图片",
				width : 50,
				sortable : true,
				dataIndex : 'id',
				renderer : function(v, c, r) {
					var id = r.data["id"];
					var way = r.data["way"];
					var type = r.data["type"];
					if(type == 3){
						return "<a href=# onclick='show_win("
								+ defect_id + ",false)'>" + defect_id + ".jpg</a>";
					}
					if (way == 1) {
						return "";
					} else {
						return "<a href=# onclick='show_win("
							+ id + ",true)'>" + id + ".jpg</a>";
					}
				},
				dataIndex : 'event_photo'
			}, {
				header : "处理时间",
				width : 160,
				sortable : true,
				dataIndex : 'reg_date'
			}, {
				header : "处理人员",
				width : 90,
				sortable : true,
				dataIndex : 'user_name'
			}, {
				header : "处理说明",
				width : 400,
				sortable : true,
				dataIndex : 'memo',
				renderer : function(val,c,r){
					var type = r.data["type"];
					var corp_name = r.data["corp_name"];
					if(val == null){
						return '';
					}
					if(type == 2){
						return "由"+corp_name+"转发";
					}else{
						return '<span style="display:table;width:100%;" title="' + val + '">' + val + '</span>';
					}
				}
			}]
		});
		process_store.load();
		
		process_win = new Ext.Window({
			 title: '处理过程',
			height:350,
			width:550,
			 buttonAlign : 'center',
			 closable:true,
			 constrainHeader:true,  
			 items:[process_grid],
			 buttons : [ {
				id : 'select',
				text : '关闭',
				handler : function() {
					process_win.close();
				}
			}]
		});
		process_win.show();
	}

	// grid自适应
	new Ext.Viewport({  
		layout:'border',  
		border:false,  
		items:[ {
			width:250,
			split:true,
			region : 'west',
			layout : 'fit',
			collapsible : true,
			title : '集团列表',
			items :[corp_tree]
		},{
			region : 'center',
			layout : 'fit',
			items : [{
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
			}]
		}]
	});	 
})
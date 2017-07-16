Ext.onReady(function() {
	var Polygon;
	Ext.QuickTips.init();
	var formPanel;
	var limit = 20;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	
	var sm = new Ext.grid.CheckboxSelectionModel({});
	var store = new Ext.data.ArrayStore({
		root: 'r',
		fields: [
			'region_id','region_name','points','corp_id','create_date','user_id','memo','is_delete'
		]
	});

    var grid = new Ext.grid.GridPanel({
        store: store,
        sm : sm,
        enableColumnHide : false,
        loadMask : {msg:'查询中...'},
        columns: [
        	sm,
        	new Ext.grid.RowNumberer({header:'序号',width:35}),
        	{id:'region_id',header: "region_id", width: 10, sortable: true, dataIndex: 'region_id',hidden:true},
        	{header: '越界名称', width: 130, sortable: true, dataIndex: 'region_name'},
        	{header: "points", width: 10, sortable: true, dataIndex: 'points',hidden:true},
        	{header: "corp_id", width: 10, sortable: true, dataIndex: 'corp_id',hidden:true},
        	{header: "user_id", width: 10, sortable: true, dataIndex: 'user_id',hidden:true},
        	{header: "创建时间", width: 130, sortable: true, dataIndex: 'create_date'},
        	{header: "备注", width: 130, sortable: true, dataIndex: 'memo'},
        	{header: "is_delete", width: 130, sortable: true, dataIndex: 'is_delete',hidden:true}
        ],
		viewConfig : {
			autoFill : true,
			forceFit : true
		},
        tbar: [
            { 
				id : 'newButton',
				text : '新增',
				icon : Ext.zion.image_base+'/add.gif',
				tooltip : '新增记录',
				scope : this,
				handler: function(){
	            	if(Polygon){
						map.removeOverlay(Polygon);
					}
					//Ext.getCmp('namefrm').reset();
					cardPanel.layout.setActiveItem(form);
				}
            }/*,'-',{ 
            	id : 'editButton',
				text: '修改',
				icon : Ext.zion.image_base+'/update.gif',
				tooltip : '修改记录',
				disabled : true
				//handler: modifyData
            }*/,'-',{
				text : '删除',
				id : 'deleteButton',
				icon : Ext.zion.image_base+'/delete.gif',
				tooltip : '删除记录',
				scope : this,
				disabled : true,
				handler: deleteData
            }, '-', {
				text : '刷新',
				icon : Ext.zion.image_base+'/refresh.gif',
				tooltip : '刷新记录',
				handler : function() {
	            	Zion.db.getJSON("pipe.management.region.select", null, function(data) {
	            		store.loadData(data);
	            	});
					disableButton();
					if(Polygon){
						map.removeOverlay(Polygon);
					}
				},
				scope : this
			}/*, '-', {
				id : 'bindButton',
				text : '绑定',
				icon : '/image/module/refresh.gif',
				tooltip : '终端绑定区域',
				handler : bindData,
				disabled : true,
				scope : this
			}*/
        ],
		listeners: {
			cellclick : function( grid, rowIndex, columnIndex, e ){
				var record_ = grid.getStore().getAt(rowIndex);
				var points_ = record_.get('points');
				var region_name_ = record_.get('region_name');
				var points_arr = points_.split(';');
            	if(points_arr.length<=1){
            		Ext.Msg.alert('提示','错误数据');
            		return;
            	}
            	var points = [];
				var xy_arr = points_arr[0].split(',');
				var x = xy_arr[0];
				var y = xy_arr[1];
				for(var i = 0;i < points_arr.length;i += 1){
					var xy_arr_ = points_arr[i].split(',');
					points.push(new GLatLng(xy_arr_[1],xy_arr_[0]));
				}
				points.push(new GLatLng(y,x));
				if(Polygon){
					map.removeOverlay(Polygon);
				}
				
				/*points = [];
				points.push(new GLatLng('32.47269502206151','112.236328125'));
				points.push(new GLatLng('37.09023980307208','97.3828125'));
				points.push(new GLatLng('33.13755119234614','97.55859375'));
				points.push(new GLatLng('32.47269502206151','112.236328125'));*/
				
				Polygon = new GPolygon(points,'#FF0000',3,0.5,'#ffff00',0.5)
				var bounds = Polygon.getBounds();
				map.addOverlay(Polygon); 
				map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
			}
        	/*rowcontextmenu: function(grid, rowIndex, e){
        		e.preventDefault();
        		var gridMenu = new Ext.menu.Menu
	            ([
	                {text:"查看标注",icon:"",handler:function(){
	                	var tmprecord = grid.getStore().getAt(rowIndex);
	                	var tmpx = tmprecord.get('x');
	                	var tmpy = tmprecord.get('y');
	                	var tmpname  = tmprecord.get('name');
						map.removeOverlays();
						
						var targetIcon = new GIcon();
						targetIcon.iconSize = new GSize(16, 16);
						targetIcon.iconAnchor = new GPoint(16, 16);
						targetIcon.image = "images/poi0.gif";
						var markerOptions = {
							icon : targetIcon,
							clickable : true
						}
						var point = new GLatLng(tmpy, tmpx);
						var marker = new GMarker(point, markerOptions);
						map.addOverlay(marker);
						map.setCenter(point);
	                }}
	            ]);
	            gridMenu.showAt(e.getPoint());
        	}*/
			
        }
    });
    
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
			//Ext.getCmp('bindButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
			//Ext.getCmp('bindButton').disable();
		}
	});
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
			//Ext.getCmp('bindButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
			//Ext.getCmp('bindButton').disable();
		}
	});
	
	function dateRender(val){
    	return new Date(val*1000).toLocaleString();
    }
	
    var form = new Ext.FormPanel({
    	labelWidth:100,
    	heigth: 300,
    	buttonAlign: 'left',
	    bodyStyle:'padding:0px 0px 0',
	    //autoScroll : true,
		//autoHeight : true,
		frame : true,
	    defaults: {width: 150},
    	items: [{
    		id: 'region_name',
    		xtype: 'textfield',
    		fieldLabel: '越界名称',
    		allowBlank:false
    	},{
    		id: 'memo',
    		xtype: 'textfield',
    		fieldLabel: '备注'
    	}],
		buttons: [{
            text: '画越界区域',
            handler: function(){
				Ext.getCmp('saveModifyBut').setDisabled(true);
				if(Polygon){
					map.removeOverlay(Polygon);
				}
				Zion.polygon.draw(map, function(poly) {
					setTimeout(function() { Zion.polygon.edit(map, poly); Polygon = poly;}, 0);
					Ext.getCmp('saveModifyBut').setDisabled(false);
				});
            }
        },{
        	id: 'saveModifyBut',
            text: '保存',
            disabled: true,
            handler: function(){
        		var points = Zion.polygon.toString(Zion.polygon.endEdit());
        		var params = [];
        		var region_name = Ext.getCmp('region_name').getValue();
        		if(region_name.length <= 0){
        			Ext.Msg.alert('提示','请输入越界名称!');
        			return;
        		}

        		var memo = Ext.getCmp('memo').getValue();
        		params.push(region_name);
        		params.push(points);
        		params.push(parseInt(new Date().getTime()/1000));
        		params.push(memo);
        		
        		Ext.zion.db.getJSON('analyze_region.id.select',null,function(data){
        			if(!data.f){
        				var id = data.r[0][0];
        				params.unshift(id);
	        			Ext.zion.db.getJSON('axiom_analyze_region.insert', params, function(data) {
							if (data.f) {
								Ext.Msg.alert("提示", "数据添加错误");
							} else {
								if (data.r == 1) {
									Ext.Msg.alert("提示", "数据添加成功");
									map.removeOverlay(Polygon);
									cardPanel.layout.setActiveItem(grid);
            						Ext.getCmp('saveModifyBut').disable();
									Zion.db.getJSON("pipe.management.region.select", null, function(data) {
										store.loadData(data);
									});
									disableButton();
								} else {
									Ext.Msg.alert("提示", "数据添加错误");
								}
							}
						})
        			}else{
        				Ext.Msg.alert("提示", "数据添加错误");
        			}
        		})
        		
            }
        },{
            text: '返回',
            handler: function(){
            	cardPanel.layout.setActiveItem(grid);
            	Ext.getCmp('saveModifyBut').disable();
            	if(Polygon){
					map.removeOverlay(Polygon);
				}
            }
        }]
    });
    
	function disableButton() {
		//Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
		//Ext.getCmp('bindButton').disable();
	}
	
	function bindData() {
		var arr = [];
		var root = targetTree.getRootNode();
		if(root.attributes.checked == true){
			if(root.attributes.target!=undefined){
				arr.push(root.attributes.target.target_id);
			}
		}
		getCheckNode(root , arr);
		if(arr.length <= 0){
			Ext.Msg.alert('提示','请选择终端');
			return;
		}
	    win_show(arr);
	}
	
	var id = [];
	function deleteData() {
		var sm = grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							id.push(member.region_id);
						} else {
							store.remove(store.getAt(i));
						}
					}
					if (id.length > 0) {
						deleNext();
					}
				}
			})
		}
	}
	
	var deleNext = function() {
		if (id.length > 0) {
			Ext.zion.db.getJSON("axiom_analyze_region.delete", [id.pop()],
					function(data) {
						if (data.r != 0 && data.r) {
							map.removeOverlay(Polygon);
							Ext.Msg.alert("提示", "删除成功");
						} else {
							Ext.Msg.alert("提示", "删除失败");
						}
						deleNext();
					});
		} else {
			Zion.db.getJSON("pipe.management.region.select", null, function(data) {
				store.loadData(data);
			});
			disableButton();
		}
	}
	
	function bindDataDb() {
		var arr = [];
		var root = targetTree.getRootNode();
		if(root.attributes.checked == true){
			if(root.attributes.target!=undefined){
				arr.push(root.attributes.target.target_id);
			}
		}
		getCheckNode(root , arr);
		if(arr.length <= 0){
			Ext.Msg.alert('提示','请选择终端');
			return;
		}
		var flag = true;
		var alarm_type = Ext.getCmp('areaAlarmTypefrm').getValue();
		var start_time = Ext.getCmp('areaAlarmStartTimefrm').getValue();
		var end_time = Ext.getCmp('areaAlarmEndTimefrm').getValue();
		var memofrm1 = Ext.getCmp('memofrm1').getValue();
		
		start_time = formatetime(start_time);
		end_time = formatetime(end_time);
		for(var j = 0;j < arr.length;j++){
			var tagetid = arr[j];
			var delparams = [];
			delparams.push(tagetid);
			Ext.zion.db.getJSON("axiom_alarm_target_region.target_id.delete", delparams, function(data) {
			});
		}
		var areaid = Ext.getCmp('refTermAreaIdfrm').getValue();
		var len = arr.length;
		for(var j = 0;j < len;j++){
			Ext.zion.db.getJSON("axiom_alarm_target_region.id", null, function(data) {
				
				var tagetid = arr.pop();
				var insertparams = [];
				insertparams.push(data.r[0][0]);
				insertparams.push(tagetid);
				insertparams.push(Number(areaid));
				insertparams.push(Number(alarm_type));
				insertparams.push(start_time);
				insertparams.push(end_time);
				insertparams.push(memofrm1);
				//alert(areaid+','+tagetid+','+alarm_type+','+start_time+','+end_time);
				Ext.zion.db.getJSON("axiom_alarm_target_region.insert", insertparams, function(data) {
					if (data.r == 1) {
						flag = true;
					} else {
						flag = false;
					}
				});
			});
		}
		if(flag){
			Ext.Msg.alert("提示", "数据添加成功");
		}else{
			Ext.Msg.alert("提示", "数据添加错误");
		}
	}
	
	function formatetime(time){
		var timeArr = time.split(':');
		if(timeArr.length == 2){
			return (Number(timeArr[0]) * 60 + Number(timeArr[1])) * 60;
		}else{
			return 0;
		}
	}

	var cardPanel = new Ext.Panel({
		title: '越界列表',
		activeItem: 0,
		layout:'card',
		margins : '5 0 0 0',
		collapsible : true,
		split : true,
		width : 400,
		region : 'west',
		items: [
			grid,form
		]
	});
	
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [  cardPanel , {
			layout : 'fit',
			region : 'center',
			contentEl : 'map_canvas',
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
	});
	
	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(25.676186684959894, 119.1082763671875), 8);

	Zion.db.getJSON("pipe.management.region.select", null, function(data) {
		store.loadData(data);
		loadMask.hide();
	});
	
	function drawPolyline(data) {
		for ( var i = 0; i < data.r.length; i++) {
			var polyline = new GPolyline.fromEncoded(eval("(" + data.r[i][2] + ")"));
			map.addOverlay(polyline);
			data.r[i].push(polyline);
		}
	}
	
	/*Zion.db.getJSON("pipe.management.data.pipe.select", null, function(data) {
		drawPolyline(data);
	});*/
	
});

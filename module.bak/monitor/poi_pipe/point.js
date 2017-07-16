Ext.onReady(function() {
	Ext.QuickTips.init();
	var marker;
	var e_click = null;
	var g_x;
	var g_y;
	var modify_x;
	var modify_y;
	var is_approve=false;
	var formPanel;
	var limit = 20;
	var modify_poi_id;
	var map_state = 1;//地图状态,0:初始状态;1:管线项目,显示管线.
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	/**类型下拉框**/
	var type_value = new Ext.ux.IconCombo({
        store: new Ext.data.SimpleStore({
            fields: ['type_value', 'type_name', 'type_icon'],
            data: [
                ['1', '油库', 'x-flag-1'],
                ['2', '阀室', 'x-flag-2'],
                ['3', '点', 'x-flag-3'],
                ['5', '桥', 'x-flag-5']
            ]
        }),
        fieldLabel: '类型',
        valueField: 'type_value',
        editable : false,
        displayField: 'type_name',
        iconClsField: 'type_icon',
        triggerAction: 'all',
        mode: 'local',
		value:'1',
        width: 160,
        listeners:{
			select : function( combo, record, index ){
				if(marker){
					marker.setImage('/api/image/poi/'+type_value.getValue()+'.png');
				}
			}
		}
    });

	var sm = new Ext.grid.CheckboxSelectionModel();
	var store = new Ext.zion.db.ArrayStore({
		db : {
			alias : "axiom_poi.select"
		},
		root: 'r',
		fields: [
			'poi_id', 'x', 'y', 'name', 'type', 'info', 'memo'
		]
	});
	function render_type(val){
		if(val == '5'){
			return '';
		}
		return '<img src="/api/image/poi/'+val+'.png">';
	}
    var grid = new Ext.grid.GridPanel({
        store: store,
        sm : sm,
        enableColumnHide : false,
        loadMask : {msg:'查询中...'},
        columns: [
        	sm,
        	new Ext.grid.RowNumberer({header:'序号',width:35}),
        	{header: 'POI点名称', width: 130, sortable: true, dataIndex: 'name'},
        	{header: "类型", width: 50, sortable: true, dataIndex: 'type',renderer: render_type},
        	{header: "信息", width: 130, sortable: true, dataIndex: 'memo'}
        ],
        tbar: [
            { 
				id : 'newButton',
				text : '新增',
				icon : Ext.zion.image_base+'/add.gif',
				tooltip : '新增记录',
				scope : this,
				handler: function(){
					is_approve = true;
					cardPanel.layout.setActiveItem(form);
					Ext.getCmp('saveModifyBut').setDisabled(true);
					Ext.getCmp('point_name').reset();
					Ext.getCmp('memo').reset();
					type_value.setValue('1');
				}
            },'-',{ 
            	id : 'editButton',
				text: '修改',
				icon : '/image/module/update.gif',
				tooltip : '修改记录',
				disabled : true,
				handler: function(){
					is_approve = false;
					Ext.getCmp('saveModifyBut').setDisabled(false);
					cardPanel.layout.setActiveItem(form);
					var sm = grid.getSelectionModel().getSelected();
					Ext.getCmp('point_name').setValue(sm.data.name);
					Ext.getCmp('memo').setValue(sm.data.memo);
					type_value.setValue(sm.data.type);
					modify_x = sm.data.x;
					modify_y = sm.data.y;
					var point = new GLatLng(modify_y , modify_x);
					map.setCenter(point, 13);
					modify_poi_id = sm.data.poi_id;
				}
            },'-',{
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
            		store.load({params : {start : 0, limit : limit}});
					disableButton();
				},
				scope : this
			}
        ],
        bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		listeners: {
			cellclick : function( grid, rowIndex, columnIndex, e ){
				var record_ = grid.getStore().getAt(rowIndex);
				var x = record_.get('x');
				var y = record_.get('y');
				var point = new GLatLng(y , x);
				map.setCenter(point, 13);
        	}
        }
    });
    store.load({params : {start : 0, limit : limit}});
    function dateRender(val){
    	return new Date(val*1000).toLocaleString();
    }

    var form = new Ext.FormPanel({
    	heigth: 300,
    	buttonAlign: 'left',
	    bodyStyle:'padding:0px 0px 0',
		frame : true,
	    defaults: {width: 200},
	    labelWidth:75,
    	items: [{
    		id: 'point_name',
    		xtype: 'textfield',
    		fieldLabel: 'POI点名称',
    		allowBlank:false
    	},
		type_value
		//type_value 
		,{
    		id: 'memo',
    		xtype: 'textarea',
    		fieldLabel: '信息',
    		height: 100
    	}],
		buttons: [{
            text: '标注POI点',
            handler: pointDraw
        },{
        	id: 'saveModifyBut',
            text: '保存',
            disabled: true,
            handler: saveDate
        },{
            text: '返回',
            handler: function(){
            	cardPanel.layout.setActiveItem(grid);
            	if(marker){
					map.removeOverlay(marker);
					marker = null;
				}
            }
        }]
    });
    
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	});
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	});
	
	function saveDate(){
		var point_name = Ext.getCmp('point_name').getValue();
		if(point_name.length <= 0){
			Ext.Msg.alert('提示','请输入POI点名称!');
			return;
		}
		
		var params = [];
		var memo = Ext.getCmp('memo').getValue();
		params.push(type_value.getValue());
		params.push(point_name);
		if(g_x){
			params.push(g_x);
			params.push(g_y);
		}else{
			params.push(modify_x);
			params.push(modify_y);
		}
        params.push(memo);
		params.push(parseInt(new Date().getTime()/1000));
		if(is_approve){
			Ext.zion.db.getJSON('axiom_poi.insert', params, function(data) {
				if (data.f) {
					Ext.Msg.alert("提示", "添加失败");
				} else {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "添加成功");
						store.load({params : {start : 0, limit : limit}});
						disableButton();
						Zion.db.getJSON("axiom_poi", null, function(data){
							pois = [];
							 for ( var i = 0; i < data.r.length; i++) {
								var d = data.r[i];
								pois.push({
										id:d[0],
										x:d[1],
										y:d[2],
										text:d[3],
										type:d[4],
										info:eval("(" + d[5] + ")"),
										memo:d[6] == null ? '' : d[6]
									});
							}
							if(map.getZoom() >= 13){
								poiDrawed = true;
								poiManager.draw(pois);
							}
							cardPanel.layout.setActiveItem(grid);
							if(marker){
								map.removeOverlay(marker);
								marker = null;
							}
						});
					} else {
						Ext.Msg.alert("提示", "添加失败");
					}
				}
			})
		}else if(!is_approve && modify_poi_id){
			params.push(modify_poi_id);
			Ext.zion.db.getJSON('axiom_poi.update', params, function(data) {
				if (data.f) {
					Ext.Msg.alert("提示", "修改失败");
				} else {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "修改成功");
						store.load({params : {start : 0, limit : limit}});
						disableButton();
						Zion.db.getJSON("axiom_poi", null, function(data){
							pois = [];
							 for ( var i = 0; i < data.r.length; i++) {
								var d = data.r[i];
								pois.push({
										id:d[0],
										x:d[1],
										y:d[2],
										text:d[3],
										type:d[4],
										info:eval("(" + d[5] + ")"),
										memo:d[6] == null ? '' : d[6]
									});
							}
							if(map.getZoom() >= 13){
								poiDrawed = true;
								poiManager.draw(pois);
							}
							cardPanel.layout.setActiveItem(grid);
							if(marker){
								map.removeOverlay(marker);
								marker = null;
							}
						});
					} else {
						Ext.Msg.alert("提示", "修改失败");
					}
				}
			})
		}
		
	}
	
	function pointDraw(){
    	Ext.getCmp('saveModifyBut').setDisabled(true);
		if(marker){
			map.removeOverlay(marker);
			marker = null;
		}
		g_x = null;
		g_y = null;
		e_click = GEvent.addListener(map, "click", function(marker_, latlng_, overlaylatlng_) {
			var latlng = null;
			if(latlng_){
				latlng = latlng_;
			}else if(overlaylatlng_){
				latlng = overlaylatlng_;
			}
			g_x = latlng.lng();
			g_y = latlng.lat();
			g_x = parseInt(g_x*1000000)/1000000;
			g_y = parseInt(g_y*1000000)/1000000;
			var targetIcon = new GIcon();
			targetIcon.iconSize = new GSize(26, 26);
			targetIcon.iconAnchor = new GPoint(13, 13);
			var image_ = type_value.getValue();
			if(image_ == '5'){
				targetIcon.image = "/api/image/poi/"+3+".png";
			}else{
				targetIcon.image = "/api/image/poi/"+image_+".png";
			}
			var markerOptions = {
				icon : targetIcon,
				clickable : true
			}
			var point = new GLatLng(g_y, g_x);
			marker = new GMarker(point, markerOptions);
			map.addOverlay(marker);
            Ext.getCmp('saveModifyBut').setDisabled(false);
            removeListener();
        });
    }
	
	function disableButton() {
		//Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}
	
	/**删除漏巡点**/
	function deleteData() {
		var sm = grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					var id = [];
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						id.push(member.poi_id);
					}
					var delete_poi = function(id) {
						if (id.length > 0) {
							Ext.zion.db.getJSON("axiom_poi.delete", [ id.pop() ], function(data) {
								delete_poi(id);
							});
						}else{
							Ext.Msg.alert("提示", "删除成功");
							grid.store.reload();
							//store.load({params : {start : 0, limit : limit}});
							disableButton();
							Zion.db.getJSON("axiom_poi", null, function(data){
								pois = [];
								 for ( var i = 0; i < data.r.length; i++) {
									var d = data.r[i];
									pois.push({
											id:d[0],
											x:d[1],
											y:d[2],
											text:d[3],
											type:d[4],
											info:eval("(" + d[5] + ")"),
											memo:d[6] == null ? '' : d[6]
										});
								}
								if(map.getZoom() >= 13){
									poiDrawed = true;
									poiManager.draw(pois);
								}
							});
						}
					};
					delete_poi(id);
				}
			})
		}
	}
	var cardPanel = new Ext.Panel({
		title: 'POI点列表',
		activeItem: 0,
		layout:'card',
		margins : '5 0 0 0',
		collapsible : true,
		split : true,
		width : 300,
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


	/**显示漏巡点**/
	/*grid.addListener('rowclick', SelectGridRowClick);
	function SelectGridRowClick(grid, rowIndex, e) {
		map.clearOverlays();
		if(grid.getSelectionModel().getSelected()){
			g_x = grid.getSelectionModel().getSelected().data.x;
			g_y = grid.getSelectionModel().getSelected().data.y;
			var targetIcon = new GIcon();
			targetIcon.iconSize = new GSize(16, 16);
			targetIcon.iconAnchor = new GPoint(16, 16);
			targetIcon.image = "images/"+grid.getSelectionModel().getSelected().data.type+".gif";
			var markerOptions = {
				icon : targetIcon,
				clickable : true
			}
			var point = new GLatLng(g_y , g_x);
			var marker = new GMarker(point, markerOptions);
			map.setCenter(point);
			map.addOverlay(marker);
		}else{
			
		}
	}*/

	function removeListener(){
		if(e_click){
			GEvent.removeListener(e_click);
			e_click = null;
		}
	}
	
	function drawPolyline(data) {
		for ( var i = 0; i < data.r.length; i++) {
			var polyline = new GPolyline.fromEncoded(eval("(" + data.r[i][1] + ")"));
			map.addOverlay(polyline);
			data.r[i].push(polyline);
		}
	}
	
	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	if(map_state == 0){
		map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);
		loadMask.hide();
	}else if(map_state == 1){
		map.setCenter(new GLatLng(25.676186684959894, 119.1082763671875), 8);
		Zion.db.getJSON("realtime.polyline.select", null, function(data) {
			drawPolyline(data);
			loadMask.hide();
		});

	}

	var poiManager = new Zion.POI(map,{image_base:'/api/image/poi',icon_size:26});
	var pois = [];
	Zion.db.getJSON("axiom_poi", null, function(data){
		 for ( var i = 0; i < data.r.length; i++) {
			var d = data.r[i];

			pois.push({
					id:d[0],
					x:d[1],
					y:d[2],
					text:d[3],
					type:d[4],
					info:eval("(" + d[5] + ")"),
					memo:d[6] == null ? '' : d[6]
				});
		}
	});
	
	var poiDrawed = false;
	
	GEvent.addListener(map, "zoomend", function(oldLevel, newLevel){
		if(newLevel >= 13){
			if(!poiDrawed){
				poiDrawed = true;
				poiManager.draw(pois);
			}
		}else{
			if(poiDrawed){
				poiDrawed = false;
				poiManager.clear();
			}
		}
	});
	
});

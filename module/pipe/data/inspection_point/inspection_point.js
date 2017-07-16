Ext.onReady(function() {
	Ext.QuickTips.init();
	var marker;
	var selectCorpId;
	var e_click = null;
	var g_x = '';
	var g_y = '';
	var is_approve=false;
	var formPanel;
	var limit = 20;
	var x;
	var y;
	var map_state = 1;//地图状态,0:初始状态;1:管线项目,显示管线.
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	
	
	var type_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['overlay_type_id', 'overlay_type_name', 'memo','type'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/axiom_info_type.point.select'
		})
	});

	var type_combo = new Ext.form.ComboBox({
		fieldLabel : '类型名称',
		hiddenName : 'overlay_type_id',
		valueField : 'overlay_type_id',
		store : type_store,
		displayField : 'overlay_type_name',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		listeners : {
			'select' : function(this_, record, index){
			}				
		}
	});
	type_store.load();
	
	var select_data = [ [1, '图上点取' ],
			[ 2, '输入经纬度' ],
			[ 3, '查询设施位置' ] ];
	var selelct_store = new Ext.data.SimpleStore( {
		fields : [ 'type', 'name' ],
		data : select_data
	});
	var select_combo = new Ext.form.ComboBox( {
		fieldLabel:'选择方式',
		hiddenName : 'type',
		valueField : 'type',
		store : selelct_store,
		displayField : 'name',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		listeners : {
			'select' : function(this_, record, index) {
				if(record.data["type"] == 2){
					Ext.getCmp("longitude").reset();
					Ext.getCmp("latitude").reset();
					Ext.getCmp('name').reset();
					point_combo.reset();
					Ext.getCmp("longitude").show();
					Ext.getCmp('longitude').el.parent().parent().show(); 
					Ext.getCmp('longitude').el.up('.x-form-item').setDisplayed(true);  
					Ext.getCmp("latitude").show();
					Ext.getCmp('latitude').el.parent().parent().show(); 
					Ext.getCmp('latitude').el.up('.x-form-item').setDisplayed(true);  
					Ext.getCmp("drow_point").hide();
					point_combo.hide();
					form.getForm().findField("overlay_name").el.parent().parent().hide(); 
					form.getForm().findField("overlay_name").el.up('.x-form-item').setDisplayed(false);
					Ext.getCmp("name").show();
					Ext.getCmp('name').el.parent().parent().show();  
					Ext.getCmp('name').el.up('.x-form-item').setDisplayed(true);
					Ext.getCmp('saveModifyBut').setDisabled(false);
					Ext.getCmp('memo').reset();
				}else if(record.data["type"] == 3){
					Ext.getCmp("longitude").hide();
					Ext.getCmp("drow_point").hide();
					Ext.getCmp("longitude").hide();
					Ext.getCmp('longitude').el.parent().parent().hide(); 
					Ext.getCmp('longitude').el.up('.x-form-item').setDisplayed(false);  
					Ext.getCmp("latitude").hide();
					Ext.getCmp('latitude').el.parent().parent().hide();  
					Ext.getCmp('latitude').el.up('.x-form-item').setDisplayed(false);
					point_combo.show();
					form.getForm().findField("overlay_name").el.parent().parent().show(); 
					form.getForm().findField("overlay_name").el.up('.x-form-item').setDisplayed(true);
					Ext.getCmp("name").hide();
					Ext.getCmp('name').el.parent().parent().hide();  
					Ext.getCmp('name').el.up('.x-form-item').setDisplayed(false);
					Ext.getCmp('saveModifyBut').setDisabled(false);
					Ext.getCmp("longitude").reset();
					Ext.getCmp("latitude").reset();
					Ext.getCmp('name').reset();
					Ext.getCmp('memo').reset();
				}else{
					Ext.getCmp("longitude").reset();
					Ext.getCmp("latitude").reset();
					Ext.getCmp('name').reset();
					Ext.getCmp('memo').reset();
					point_combo.reset();
					Ext.getCmp("longitude").hide();
					Ext.getCmp('longitude').el.parent().parent().hide(); 
					Ext.getCmp('longitude').el.up('.x-form-item').setDisplayed(false);  
					Ext.getCmp("latitude").hide();
					Ext.getCmp('latitude').el.parent().parent().hide();  
					Ext.getCmp('latitude').el.up('.x-form-item').setDisplayed(false);
					Ext.getCmp("name").show();
					Ext.getCmp('name').el.parent().parent().show();  
					Ext.getCmp('name').el.up('.x-form-item').setDisplayed(true);
					Ext.getCmp("drow_point").show();
					Ext.getCmp("longitude").hide();
					point_combo.hide();
					form.getForm().findField("overlay_name").el.parent().parent().hide(); 
					form.getForm().findField("overlay_name").el.up('.x-form-item').setDisplayed(false);
					Ext.getCmp('saveModifyBut').setDisabled(true);
				}
			}
		}
	});
	select_combo.setValue(select_data[0][0]);
	
	var point_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['overlay_id', 'overlay_name','overlay_type_id','info_type_name','x','y'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/pipe.management.data.point.select'
		})
	});
	var point_combo = new Ext.form.ComboBox({
		fieldLabel : '设备名称',
		hiddenName : 'overlay_name',
		valueField : 'overlay_name',
		store : point_store,
		displayField : 'overlay_name',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		listeners : {
			'select' : function(this_, record, index){
				x = record.data["x"];
				y = latitude = record.data["y"];
				var targetIcon = new GIcon();
				targetIcon.iconSize = new GSize(16, 16);
				targetIcon.iconAnchor = new GPoint(8, 8);
				targetIcon.image = "/api/image/poi/"+record.data["overlay_type_id"]+".png";
				var markerOptions = {
					icon : targetIcon,
					clickable : true
				}
				if(marker){
					map.removeOverlay(marker);
				}
				var point = new GLatLng(y , x);
				marker = new GMarker(point, markerOptions);
				map.setCenter(point);
				map.addOverlay(marker);
			}				
		}
	});
	point_store.load();
	
	var sm = new Ext.grid.CheckboxSelectionModel();
	var store = new Ext.zion.db.ArrayStore({
		db : {
			alias : "pipe.management.inspection_point.analyze_point.select"
		},
		root: 'r',
		fields: [
			'id', 'name', 'longitude', 'latitude', 'reg_date',  'memo'
		]
	});
	function render_type(val){
		return '<img src="images/'+val+'.gif">';
	}
    var grid = new Ext.grid.GridPanel({
        store: store,
        sm : sm,
        enableColumnHide : false,
        loadMask : {msg:'查询中...'},
        columns: [
        	sm,
        	new Ext.grid.RowNumberer({header:'序号',width:35}),
//        	{id:'id',header: "id", width: 10, sortable: true, dataIndex: 'id',hidden:true},
        	{header: '巡检点名称', width: 130, sortable: true, dataIndex: 'name'},
        	{header: "经度", width: 70, sortable: true, dataIndex: 'longitude'},
        	{header: "纬度", width: 70, sortable: true, dataIndex: 'latitude'},
//        	{header: "corp_id", width: 10, sortable: true, dataIndex: 'corp_id',hidden:true},
        	{header: "创建时间", width: 150, sortable: true, dataIndex: 'reg_date', renderer: dateRender},
        	{header: "备注", width: 130, sortable: true, dataIndex: 'memo'}
        ],
		viewConfig : {
			//autoFill : true,
			//forceFit : true
		},
        tbar: [
            { 
				id : 'newButton',
				text : '新增',
				icon : Ext.zion.image_base+'/add.gif',
				tooltip : '新增记录',
				scope : this,
				handler: function(){
	            	if(marker){
						map.removeOverlay(marker);
					}
					is_approve = true;
					cardPanel.layout.setActiveItem(form);
					select_combo.show();
					form.getForm().findField("type").el.parent().parent().show(); 
					form.getForm().findField("type").el.up('.x-form-item').setDisplayed(true);
					Ext.getCmp("longitude").hide();
					Ext.getCmp('longitude').el.parent().parent().hide(); 
					Ext.getCmp('longitude').el.up('.x-form-item').setDisplayed(false);  
					Ext.getCmp("latitude").hide();
					Ext.getCmp('latitude').el.parent().parent().hide();  
					Ext.getCmp('latitude').el.up('.x-form-item').setDisplayed(false);
					Ext.getCmp("name").show();
					Ext.getCmp('name').el.parent().parent().show();  
					Ext.getCmp('name').el.up('.x-form-item').setDisplayed(true);
					Ext.getCmp("drow_point").show();
					Ext.getCmp("longitude").hide();
					point_combo.hide();
					form.getForm().findField("overlay_name").el.parent().parent().hide(); 
					form.getForm().findField("overlay_name").el.up('.x-form-item').setDisplayed(false);
					Ext.getCmp("longitude").reset();
					Ext.getCmp("latitude").reset();
					Ext.getCmp('name').reset();
					Ext.getCmp('memo').reset();
					point_combo.reset();
					select_combo.setValue(select_data[0][0]);
					Ext.getCmp('saveModifyBut').setDisabled(true);
				}
            },{
				text : '修改',
				id : 'editButton',
				icon : Ext.zion.image_base+'/delete.gif',
				tooltip : '修改记录',
				scope : this,
				disabled : true,
				handler: function(){
					cardPanel.layout.setActiveItem(form);
					Ext.getCmp("drow_point").show();
					point_combo.hide();
					select_combo.hide();
					form.getForm().findField("type").el.parent().parent().hide(); 
					form.getForm().findField("type").el.up('.x-form-item').setDisplayed(false);
					form.getForm().findField("overlay_name").el.parent().parent().hide(); 
					form.getForm().findField("overlay_name").el.up('.x-form-item').setDisplayed(false);
					Ext.getCmp("longitude").show();
					Ext.getCmp('longitude').el.parent().parent().show(); 
					Ext.getCmp('longitude').el.up('.x-form-item').setDisplayed(true);  
					Ext.getCmp("latitude").show();
					Ext.getCmp('latitude').el.parent().parent().show();  
					Ext.getCmp('latitude').el.up('.x-form-item').setDisplayed(true);
					is_approve = false;
					var sm = grid.getSelectionModel().getSelected();
					Ext.getCmp("saveModifyBut").enable();
					form.form.loadRecord(sm);
				}
            },{
				text : '删除',
				id : 'deleteButton',
				icon : Ext.zion.image_base+'/delete.gif',
				tooltip : '删除记录',
				scope : this,
				disabled : true,
				handler: deleteData
            }, {
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
				var x = record_.get('longitude');
				var y = record_.get('latitude');
				var targetIcon = new GIcon();
				targetIcon.iconSize = new GSize(16, 16);
				targetIcon.iconAnchor = new GPoint(8, 8);
				targetIcon.image = Ext.zion.image_base + "/1.png";
				var markerOptions = {
					icon : targetIcon,
					clickable : true
				}
				if(marker){
					map.removeOverlay(marker);
				}
				var point = new GLatLng(y , x);
				marker = new GMarker(point, markerOptions);
				map.setCenter(point);
				map.addOverlay(marker);
        	}
        }
    });
    
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
    	items: [select_combo,{
    		id: 'name',
    		xtype: 'textfield',
    		fieldLabel: '巡检点名称',
    		allowBlank:false
    	},point_combo,{
    		xtype: 'textfield',
    		id:'longitude',
    		fieldLabel: '经度坐标',
    		allowBlank:false
    	},{
    		id: 'latitude',
    		xtype: 'textfield',
    		fieldLabel: '纬度坐标',
    		allowBlank:false
    	},/*type_combo ,*/{
    		id: 'memo',
    		xtype: 'textarea',
    		fieldLabel: '备注',
    		height: 100
    	}],
		buttons: [{
            text: '标注巡检点',
            id:'drow_point',
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
				}
            }
        }]
    });
   
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
	});
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
	});
	
	function saveDate(){
		var longitude;
		var latitude;
		var params;
		var select_id = select_combo.getValue();
		var reg_time = parseInt(new Date().getTime()/1000);
		var memo = Ext.getCmp("memo").getValue();
		
		if(is_approve){
			if(select_id == 2){
				longitude = Ext.getCmp("longitude").getValue();
				latitude = Ext.getCmp("latitude").getValue();
				var point_name = Ext.getCmp('name').getValue();
				if(point_name.length <= 0){
					Ext.Msg.alert('提示','请输入巡检点名称');
					return;
				}
				if(longitude == ""){
					Ext.Msg.alert('提示','请输入经度坐标');
					return;
				}
				if(latitude == ""){
					Ext.Msg.alert('提示','请输入纬度坐标');
					return;
				}
				params = [point_name,longitude,latitude,reg_time,memo,selectCorpId];
			}else if(select_id == 3){
				var overlay_name = point_combo.getValue();
				if(overlay_name == ""){
					Ext.Msg.alert('提示','请选择设备名称');
					return;
				}
				longitude = x;
				latitude = y;
	//			var longitude = point_combo.r
				params = [overlay_name,longitude,latitude,reg_time,memo,selectCorpId];
			}else{
				var point_name = Ext.getCmp('name').getValue();
				longitude = g_x;
				latitude = g_y;
				params = [point_name,longitude,latitude,reg_time,memo,selectCorpId];
			}
			Ext.zion.db.getJSON('pipe.management.inspection_point.analyze_point.id.select', null, function(data) {
				if (data.r) {
					var id = data.r[0][0];
					params.unshift(id);
					Ext.zion.db.getJSON('pipe.management.inspection_point.analyze_point.insert', params, function(data) {
						if (data.f) {
							Ext.Msg.alert("提示", "数据添加错误");
						} else {
							if (data.r == 1) {
								Ext.Msg.alert("提示", "数据添加成功");
								store.load({params : {start : 0, limit : limit}});
								disableButton();
								cardPanel.layout.setActiveItem(grid);
							} else {
								Ext.Msg.alert("提示", "数据添加错误");
							}
						}
					});
				}
			});
		}else{
			var sm = grid.getSelectionModel().getSelected();
			var id = sm.data.id;
			longitude = Ext.getCmp("longitude").getValue();
			latitude = Ext.getCmp("latitude").getValue();
			var point_name = Ext.getCmp('name').getValue();
			if(point_name.length <= 0){
				Ext.Msg.alert('提示','请输入巡检点名称');
				return;
			}
			if(longitude == ""){
				Ext.Msg.alert('提示','请输入经度坐标');
				return;
			}
			if(latitude == ""){
				Ext.Msg.alert('提示','请输入纬度坐标');
				return;
			}
			params = [point_name,longitude,latitude,memo,id];
			Ext.zion.db.getJSON('pipe.management.inspection_point.analyze_point.update', params, function(data) {
				if (data.f) {
					Ext.Msg.alert("提示", "数据修改错误");
				} else {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "数据修改成功");
						store.load({params : {start : 0, limit : limit}});
						disableButton();
						cardPanel.layout.setActiveItem(grid);
					} else {
						Ext.Msg.alert("提示", "数据修改错误");
					}
				}
			});
		}
	}
	
	function pointDraw(){
    	Ext.getCmp('saveModifyBut').setDisabled(true);
		if(marker){
			map.removeOverlay(marker);
		}
		g_x = '';
		g_y = '';
		if(e_click){
			GEvent.removeListener(e_click);
		}
		e_click = GEvent.addListener(map, "click", function(marker_, latlng_, overlaylatlng_) {
			var latlng = null;
			if(latlng_){
				latlng = latlng_;
			}else if(overlaylatlng_){
				latlng = overlaylatlng_;
			}
			g_x = latlng.lng();
			g_y = latlng.lat();
			var targetIcon = new GIcon();
			targetIcon.iconSize = new GSize(16, 16);
			targetIcon.iconAnchor = new GPoint(8, 8);
			targetIcon.image =  Ext.zion.image_base + "/1.png";
			var markerOptions = {
				icon : targetIcon,
				clickable : true
			}
			var point = new GLatLng(g_y, g_x);
			marker = new GMarker(point, markerOptions);
			map.addOverlay(marker);
            Ext.getCmp('saveModifyBut').setDisabled(false);
            removeListener();
			if(is_approve == false){
				Ext.getCmp("longitude").setValue(Math.ceil(g_x*1000000)/1000000);
				Ext.getCmp("latitude").setValue(Math.ceil(g_y*1000000)/1000000);
			}
        });
    }
	
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}
	
	/**删除漏巡点**/
	var id = [];
	function deleteData(){
		var sm = grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							id.push(member.id);
						} else {
							store.remove(store.getAt(i));
						}
					}
					if (id.length > 0) {
						deleNext();
					}
				}
			});
		}
	}
	var deleNext = function() {
		if (id.length > 0) {
			var params = [ id.pop() ];
			Zion.db.getJSON('pipe.management.inspection_point.analyze_point.delete',params,function(data){
				if(!data.f){
					Ext.Msg.alert("提示","数据删除成功");
					disableButton();
					map.clearOverlays();
				}else{
					Ext.Msg.alert("提示","数据删除错误");
					disableButton();
					map.clearOverlays();
				}
				deleNext();
			})
		}else{
			grid.store.reload();
		}
	}
	var cardPanel = new Ext.Panel({
		title: '巡检点列表',
		activeItem: 0,
		layout:'card',
		collapsible : true,
		split : true,
		width : 300,
		region : 'west',
		items: [
			grid,form
		]
	});

	var corp_tree = new Ext.tree.TreePanel( {
		title:'集团列表',
		collapsible : true,
		split : true,
		id : 'tree_id',
		autoScroll : true,
		region : 'west',
		width : 250,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				if(marker){
					map.removeOverlay(marker);
				}
				selectCorpId = node.attributes.corp.corp_id;
				store.constructor( {
					db : {
						alias : "pipe.management.inspection_point.analyze_point.select",
						params:[selectCorpId]
					},
					root: 'r',
					fields: [
						'id', 'name', 'longitude', 'latitude', 'reg_date',  'memo'
					]
				});
				store.load( {
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				});
				Ext.getCmp("deleteButton").disable();
			}
		}
	});
	
	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
		});
		
		store.constructor( {
			db : {
				alias : "pipe.management.inspection_point.analyze_point.select",
				params:[Zion.user.corp_id]
			},
			root: 'r',
			fields: [
				'id', 'name', 'longitude', 'latitude', 'reg_date',  'memo'
			]
		});
		store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
	});
	
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [  corp_tree , {
			layout : 'fit',
			region : 'center',
			items:[{
				layout : 'border',
				defaults : {
					border : true
				},
				items:[cardPanel,{
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
			}]
			
		}]
	});
	
	function removeListener(){
		if(e_click){
			GEvent.removeListener(e_click);
			e_click = null;
		}
	}
	
	/*function drawPolyline(data) {
		for ( var i = 0; i < data.r.length; i++) {
			var polyline = new GPolyline.fromEncoded(eval("(" + data.r[i][2] + ")"));
			map.addOverlay(polyline);
			data.r[i].push(polyline);
		}
	}*/
	
	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	if(map_state == 0){
		map.setCenter(new GLatLng(38.718465,116.099052), 4);
		loadMask.hide();
	}else if(map_state == 1){
		map.setCenter(new GLatLng(38.718465,116.099052), 4);
		Zion.db.getJSON("pipe.management.data.pipe.select", null, function(data) {
//			drawPolyline(data);
			loadMask.hide();
		});
	}
	
});

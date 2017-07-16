Ext.onReady(function() {
	Ext.QuickTips.init();
	var marker;
	var e_click = null;
	var g_x = '';
	var g_y = '';
	var is_approve=false;
	var formPanel;
	var limit = 20;
	var map_state = 1;//地图状态,0:初始状态;1:管线项目,显示管线.
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	/**类型下拉框**/
	var type_value = new Ext.ux.IconCombo({
        store: new Ext.data.SimpleStore({
            fields: ['type_value', 'type_icon'],
            data: [
                [1, 'x-flag-1'],
                [2, 'x-flag-2']
            ]
        }),
        fieldLabel: '类型',
        valueField: 'type_value',
        //hiddenName : 'type_value',
        editable : false,
        displayField: 'type_value',
        iconClsField: 'type_icon',
        triggerAction: 'all',
        mode: 'local',
		value:1,
        width: 160,
        listeners:{
			select : function( combo, record, index ){
				if(marker){
					marker.setImage('images/'+type_value.getValue()+'.gif');
				}
			}
		}
    });
	var sm = new Ext.grid.CheckboxSelectionModel();
	var store = new Ext.zion.db.ArrayStore({
		db : {
			alias : "axiom_analyze_point.select"
		},
		root: 'r',
		fields: [
			'point_id','type','point_name','x','y','info','corp_id','create_date','user_id','memo'
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
        	{id:'point_id',header: "point_id", width: 10, sortable: true, dataIndex: 'point_id',hidden:true},
        	{header: '漏巡点名称', width: 130, sortable: true, dataIndex: 'point_name'},
        	{header: "类型", width: 50, sortable: true, dataIndex: 'type',renderer: render_type},
        	{header: "x", width: 10, sortable: true, dataIndex: 'x',hidden:true},
        	{header: "y", width: 10, sortable: true, dataIndex: 'y',hidden:true},
        	{header: "info", width: 10, sortable: true, dataIndex: 'info',hidden:true},
        	{header: "corp_id", width: 10, sortable: true, dataIndex: 'corp_id',hidden:true},
        	{header: "user_id", width: 10, sortable: true, dataIndex: 'user_id',hidden:true},
        	{header: "创建时间", width: 150, sortable: true, dataIndex: 'create_date', renderer: dateRender},
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
					Ext.getCmp('saveModifyBut').setDisabled(true);
				}
            },/*'-',{ 
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
					Ext.getCmp('namefrm').setValue(sm.data.name);
					Ext.getCmp('memofrm').setValue(sm.data.memo);
					form.getForm().findField('type_value').setValue(sm.data.type);
				}
            },*/'-',{
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
			}/* ,'-', {
				id : 'bindButton',
				text : '绑定',
				icon : '/image/module/refresh.gif',
				tooltip : '终端绑定区域',
				handler : bindData,
				disabled : true,
				scope : this
			}*/
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
				var type = record_.get('type');
				var targetIcon = new GIcon();
				targetIcon.iconSize = new GSize(16, 16);
				targetIcon.iconAnchor = new GPoint(8, 8);
				targetIcon.image = "images/"+type+".gif";
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
    store.load({params : {start : 0, limit : limit}});
    function dateRender(val){
    	return new Date(val*1000).toLocaleString();
    }
    var form = new Ext.FormPanel({
    	heigth: 300,
    	buttonAlign: 'left',
	    bodyStyle:'padding:0px 0px 0',
	    //autoScroll : true,
		//autoHeight : true,
		frame : true,
	    defaults: {width: 200},
	    labelWidth:75,
    	items: [{
    		id: 'point_name',
    		xtype: 'textfield',
    		fieldLabel: '漏巡点名称',
    		allowBlank:false
    	},type_value ,{
    		id: 'memo',
    		xtype: 'textarea',
    		fieldLabel: '备注',
    		height: 100
    	}],
		buttons: [{
            text: '标注漏巡点',
            handler: pointDraw
        },{
        	id: 'saveModifyBut',
            text: '保存',
            disabled: true,
            handler: saveDate
            	/*function(){
		    	if(grid.getSelectionModel().getSelected()){
		    		var id = grid.getSelectionModel().getSelected().data.point_id;
		    	}
		    	var name = Ext.getCmp('namefrm').getValue();
		    	var type_value = form.getForm().findField('type_value').getValue();
		    	var memofrm = Ext.getCmp('memofrm').getValue();
		    	var x = (Math.floor(g_x*1000000))/1000000;
		    	var y = (Math.floor(g_y*1000000))/1000000;
		    	var info = '';
			    if(name == ''){
			    	Ext.Msg.alert("提示", "请输入漏巡点名称");
			    	return;
			    }
			   	var params = [];
		    	if(is_approve){
		    		 
				    params.push(type_value,name,x,y,info,memofrm);
					Ext.getCmp('namefrm').reset();
					g_x = '';
					g_y = '';
					Ext.getCmp('memofrm').reset();
				    Ext.getCmp('saveModifyBut').setDisabled(true);
			    	map.clearOverlays();
		    		Ext.zion.db.getJSON("pipe.management.alarm.point.insert", params, function(data) {
						if (data.r == 1) {
							Ext.Msg.alert("提示", "数据添加成功");
							grid.store.reload();
							disableButton();
							cardPanel.layout.setActiveItem(grid);
							//addPanel.layout.setActiveItem(grid);
						} else {
							Ext.Msg.alert("提示", "数据添加错误");
						}
					});
		    	}else{
		    		params.push(type_value,name,x,y,info,memofrm,id);
					Ext.getCmp('namefrm').reset();
					g_x = '';
					g_y = '';
					Ext.getCmp('memofrm').reset();
			    	map.clearOverlays();
		    		Ext.zion.db.getJSON("axiom_analyze_target_point.update", params, function(data) {
						if(data.r && !data.f){
							Ext.Msg.alert("提示", "漏巡点修改成功");
							grid.store.reload();
							disableButton();
							cardPanel.layout.setActiveItem(grid);
						}else{
							Ext.Msg.alert("提示", "漏巡点修改失败");
						}
					});
		    	}	    
		    }*/
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
			//Ext.getCmp('editButton').enable();
		} else {
			//Ext.getCmp('editButton').disable();
			Ext.getCmp('deleteButton').disable();
		}
	});
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
			//Ext.getCmp('editButton').enable();
		} else {
			//Ext.getCmp('editButton').disable();
			Ext.getCmp('deleteButton').disable();
		}
	});
	
	function saveDate(){
		var point_name = Ext.getCmp('point_name').getValue();
		if(point_name.length <= 0){
			Ext.Msg.alert('提示','请输入漏巡点名称!');
			return;
		}
		
		Ext.zion.db.getJSON('axiom_seq_analyze_point_id.select', null, function(data) {
			if (data.r) {
				var params = [];
				var id = data.r[0][0];
				var memo = Ext.getCmp('memo').getValue();
				params.push(id);
				params.push(type_value.getValue());
				params.push(point_name);
				params.push(g_x);
				params.push(g_y);
				params.push(parseInt(new Date().getTime()/1000));
        		params.push(memo);
				Ext.zion.db.getJSON('axiom_analyze_point.insert', params, function(data) {
					if (data.f) {
						Ext.Msg.alert("提示", "数据添加错误");
					} else {
						if (data.r == 1) {
							Ext.Msg.alert("提示", "数据添加成功");
							store.load({params : {start : 0, limit : limit}});
							disableButton();
						} else {
							Ext.Msg.alert("提示", "数据添加错误");
						}
					}
				})
			}
		});
	}
	
	function pointDraw(){
    	Ext.getCmp('saveModifyBut').setDisabled(true);
		if(marker){
			map.removeOverlay(marker);
		}
		g_x = '';
		g_y = '';
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
			targetIcon.image = "images/"+type_value.getValue()+".gif";
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
					var id2 = [];
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						id.push(member.point_id);
						id2.push(member.point_id);
					}
					
					var delete_target_point = function(id) {
						if (id.length > 0) {
							Ext.zion.db.getJSON("axiom_analyze_target_point.point_id.delete", [ id.pop() ], function(data) {
								delete_target_point(id);
							});
						}else{
							delete_point(id2);
						}
					};
					delete_target_point(id);
					
					var delete_point = function(id2) {
						if (id2.length > 0) {
							Ext.zion.db.getJSON("axiom_analyze_point.point_id.delete", [ id2.pop() ], function(data) {
								delete_point(id2);
							});
						} else {
							Ext.Msg.alert("提示", "删除成功");
							grid.store.reload();
							disableButton();
						}
					};
					
				}
			})
		}
	}
	var cardPanel = new Ext.Panel({
		title: '漏巡点列表',
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
			var polyline = new GPolyline.fromEncoded(eval("(" + data.r[i][2] + ")"));
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
		Zion.db.getJSON("pipe.management.data.pipe.select", null, function(data) {
			drawPolyline(data);
			loadMask.hide();
		});
	}
	
});

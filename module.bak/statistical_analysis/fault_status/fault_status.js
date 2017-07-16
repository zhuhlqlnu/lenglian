function timeStr(n) {
	return new Date(n * 1000).toLocaleString();
}
Ext.onReady(function() {
	Ext.QuickTips.init();
	var panel = new Ext.Panel({
		frame:true,
		height:100,
		html:'<span style">'
	})
	var select_data = [
				[ "module.statistical_analysis.fault_status.fault_vehicle.select", '所有故障类型' ],
				[ "bc.main.img.car_number.select.query", '24小时未回传信息' ],
				[ "bc.main.img.target_name.select.query",'24小时未定位' ],
				[ "bc.main.img.address.select.query",'从未回传信息' ]
				];
	var selelct_store = new Ext.data.SimpleStore( {
		fields : [ 'type', 'params' ],
		data : select_data
	});
	var select_combo = new Ext.form.ComboBox({
		fieldLabel:'查询方式',
		width:160,
		hiddenName : 'type',
		valueField : 'type',
		store : selelct_store,
		displayField : 'params',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		anchor : '90%',
		listeners : {
				'select' : function(index) {
					var objv = this.getValue();
					if(objv == "module.statistical_analysis.fault_status.fault_vehicle.select"){
						Ext.getCmp('term').setValue('');
						group_combo.setValue('');
						group_combo.disable();
						Ext.getCmp('term').disable();
					} else {
						Ext.getCmp('term').enable();
						group_combo.enable();
					}
				}
		}
	});
	select_combo.setValue('所有故障类型');
	
	var group_store = new Ext.data.SimpleStore({
		fields : ['group_name'],
		root : 'r',
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/module.statistical_analysis.fault_status.group'
		})
	});
	var group_combo = new Ext.form.ComboBox({
		hiddenName : 'group_name',
		valueField : 'group_name',
		store : group_store,
		width : 150,
		displayField : 'group_name',
		mode : 'local',
		triggerAction : 'all',
		disabled:true,
		emptyText:'填写车辆组',
		anchor:'90%'
	})
	group_store.load();
	var fields = ['target_id','number_plates','terminal_sn','address','customer','recv_time'];
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : "module.statistical_analysis.fault_status.fault_vehicle.select"
				},
				root : "r",
				fields : fields
			});

	var grid = new Ext.grid.GridPanel({
		title:'所有故障类型',
		id : 'grid',
		store : store,
		layout:'fit',
		autoScroll : true,
		columns : [{
			header : "车辆编号",
			dataIndex : 'number_plates',
			width : 75,
			sortable : true
		}, {
			header : "终端编号",
			dataIndex : 'terminal_sn',
			width : 75,
			sortable : true
		}, {
			header : "通讯地址",
			dataIndex : 'address',
			width : 75,
			sortable : true
		}, {
			header : "顾客",
			dataIndex : 'customer',
			width : 75,
			sortable : true
		}, {
			header : "回传时间",
			dataIndex : 'recv_time',
			width : 75,
			sortable : true,
			renderer:function(recv_time){
				if(recv_time){
					return timeStr(recv_time);
				}else{
					return "";
				}
			}
		}],
		tbar:['根据:',select_combo,'',{
				xtype : 'textfield',
				width : 150,
				emptyText:'填写车辆编号',
				name : 'term',
				id : 'term',
				anchor : '90%',
				disabled:true
			},group_combo, {
				text : '查询',
				tooltip : '查询',
				icon : Ext.zion.image_base+'/select.gif',
				handler : select_form
			}
		],
		bbar : new Ext.PagingToolbar({
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		buttonAlign : 'left',
		buttons : [{
			text : '下载文件',
			id : 'download',
			handler : function() {
			}
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		},
		listeners : {
			render : function() {
				Ext.getCmp("grid").setHeight(Ext.getBody().getHeight()
						- panel.getHeight());
			}
		}
	})
	store.load({
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
	
	function select_form(){
		
	}	
	
	var view = new Ext.Viewport( {
		//layout : 'border',
		border : false,
		items : [ {
					region : 'north',
					items : [panel]
				}, {
					region : 'center',
					items : grid
				}]
	});
})
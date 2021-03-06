function dateFormat(value) {
    var dt = new Date.parseDate(value, 'U');
	return dt.format('Y-m-d H:i:s');
} 

function dateFormatToDay(value) {
    var dt = new Date.parseDate(value, 'U');
	return dt.format('Y-m-d');
} 
Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	var selectCorpId;
	var is_task = false;
	var checkeding = false;
	Ext.zion.page.limit = 100;
	var store_sql = 'pipe.management.alarm.target_task.select';
	var fields =  ['task_id', 'task_name', 'start_time', 'end_time', 'interval'];
	var task_sm = new Ext.grid.CheckboxSelectionModel({singleSelect : true});
	
	task_sm.on('rowselect', function() {
		if (task_grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
		if (task_grid.selModel.getSelections().length == 1) {
			var task_id = task_grid.getSelectionModel().getSelected().data.task_id;
			Zion.db.getJSON('pipe.management.alarm.target_task.pipe_patrol_task_target.select', [ task_id ], function(data) {
				if (!data.f) {
					checkedTarget(data.r);
				}
			});
			point_store.constructor( {
					db : {
						alias : "pipe.management.inspection_point.analyze_point.corp_id.select",
						params : [ task_id]
					},
					root : "r",
					fields :  [
						'point_id', 'name', 'longitude', 'latitude', 'memo','distance','reg_date','id'
					]
				});
				point_store.load( {
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				});
			Ext.getCmp('editButton').enable();
			targetTree.enable();
			Ext.getCmp('add_button').enable();
		}else{
			checkedTarget( []);
			Ext.getCmp('delete_Button').disable();
			Ext.getCmp('edit_Button').enable();
			Ext.getCmp('editButton').disable();
			Ext.getCmp('add_button').disable();
			point_grid.store.removeAll();
			targetTree.disable();
		}
		if (task_grid.selModel.getSelections().length != 1) {
			point_sm.clearSelections();
		}else{
			point_sm.selectRows([1],true);
		}
	});
	task_sm.on('rowdeselect', function() {
		if (task_grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
		if (task_grid.selModel.getSelections().length == 1) {
			var task_id = task_grid.getSelectionModel().getSelected().data.task_id;
			Zion.db.getJSON('pipe.management.alarm.target_task.pipe_patrol_task_target.select', [ task_id ], function(data) {
				if (!data.f) {
					checkedTarget(data.r);
				}
			});
			point_store.constructor( {
					db : {
						alias : "pipe.management.inspection_point.analyze_point.corp_id.select",
						params : [ task_id]
					},
					root : "r",
					fields :  [
						'point_id', 'name', 'longitude', 'latitude', 'memo','distance','reg_date','id'
					]
				});
				point_store.load( {
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				});
			Ext.getCmp('editButton').enable();
			Ext.getCmp('add_button').enable();
			targetTree.enable();
		}else{
			checkedTarget([]);
			Ext.getCmp('delete_Button').disable();
			Ext.getCmp('edit_Button').disable();
			Ext.getCmp('editButton').disable();
			Ext.getCmp('add_button').disable();
			point_grid.store.removeAll();
			targetTree.disable();
		}
		if (task_grid.selModel.getSelections().length != 1) {
			point_sm.clearSelections();
		}else{
			point_sm.selectRows([1],true);
		}
	});
	
	var task_store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : store_sql,
			params : [ selectCorpId ]
		},
		root : "r",
		fields : fields
	});
	
	var task_grid = new Ext.grid.GridPanel({
		store : task_store,
		sm : task_sm,
		columns : [ task_sm,{
			header : "名称",
			dataIndex : 'task_name',
			width : 120,
			sortable : true
		},{
			header : "开始时间",
			dataIndex : 'start_time',
			width : 100,
			sortable : true,
			renderer:dateFormat
		},{
			header : "结束时间",
			dataIndex : 'end_time',
			width : 100,
			sortable : true,
			renderer:function(end_time){
				if(end_time == "" || end_time == null){
					return "无限周期循环";
				}else{
					return dateFormat(end_time);
				}
			}
		},{
			header : "循环周期",
			dataIndex : 'interval',
			width : 100,
			sortable : true,
			renderer:function(interval){
				if(interval == 86400){
					return '一天';
				}else if(interval == 172800){
					return '两天';
				}else if(interval == 259200){
					return '三天';
				}else if(interval == 345600){
					return '四天';
				}else if(interval == 432000){
					return '五天';
				}else if(interval == 518400){
					return '六天';
				}else if(interval == 604800){
					return '一周';
				}else if(interval == 1209600){
					return '两周';
				}else if(interval == 2592000){
					return "一月";
				}else{
					return '';
				}
			}
		}],
		tbar: [ {
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '添加任务',
			handler : function() {
				is_task = true;
				show_task();
			},
			scope : this
		}, {
			id : 'editButton',
			disabled : true,
			text : '修改',
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '修改任务',
			handler : function() {
				is_task = false;
				show_task();
			},
			scope : this
		}, {
			id : 'deleteButton',
			disabled : true,
			text : '删除',
			icon : Ext.zion.image_base+'/delete.gif',
			tooltip : '删除任务',
			handler : function() {
				deleteForm();
			},
			scope : this
		}, {
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新任务',
			handler : function() {
				task_store.reload();
			},
			scope : this
		} ],
		bbar: new Ext.PagingToolbar( {
			store : task_store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});
	
	var point_sm = new Ext.grid.CheckboxSelectionModel({});
	
	point_sm.on('rowdeselect', function() {
		if (point_grid.selModel.getSelections().length != 0) {
			Ext.getCmp('delete_Button').enable();
			Ext.getCmp('edit_Button').enable();
		}else{
			Ext.getCmp('delete_Button').disable();
			Ext.getCmp('edit_Button').disable();
		}
	});
	point_sm.on('rowselect', function() {
		if (point_grid.selModel.getSelections().length != 0) {
			Ext.getCmp('delete_Button').enable();
			Ext.getCmp('edit_Button').enable();
		}else{
			Ext.getCmp('delete_Button').disable();
			Ext.getCmp('edit_Button').disable();
		}
	});
	
	var point_store = new Ext.zion.db.ArrayStore({
		db : {
			alias : "pipe.management.inspection_point.analyze_point.corp_id.select"
		},
		root: 'r',
		fields: [
			'point_id', 'name', 'longitude', 'latitude', 'memo','distance','reg_date','id'
		]
	});

    var point_grid = new Ext.grid.GridPanel({
    	title:'巡检点列表',
        store: point_store,
        sm : point_sm,
        enableColumnHide : false,
        loadMask : {msg:'查询中...'},
        columns: [
        	point_sm,
        	new Ext.grid.RowNumberer({header:'序号',width:35}),
//        	{id:'id',header: "id", width: 10, sortable: true, dataIndex: 'id',hidden:true},
        	{header: '巡检点名称', width: 130, sortable: true, dataIndex: 'name'},
//        	{header: "x", width: 10, sortable: true, dataIndex: 'x',hidden:true},
//        	{header: "y", width: 10, sortable: true, dataIndex: 'y',hidden:true},
        	{header: "范围(米)", width: 50, sortable: true, dataIndex: 'distance'},
        	{header: "创建时间", width: 150, sortable: true, dataIndex: 'reg_date', renderer: dateFormat},
        	{header: "备注", width: 130, sortable: true, dataIndex: 'memo'}
        ],
        tbar: [ {
			text : '增加',
			id:'add_button',
			disabled:true,
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '增加',
			handler : function() {
				show_point();
			},
			scope : this
		}, {
			id : 'edit_Button',
			disabled : true,
			text : '修改',
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '修改范围',
			handler : function() {
				 edit_rule_point();
			},
			scope : this
		}, {
			id : 'delete_Button',
			disabled : true,
			text : '删除',
			icon : Ext.zion.image_base+'/delete.gif',
			tooltip : '删除',
			handler : function() {
				delete_rule_point();
			},
			scope : this
		}, {
			text : '刷新巡线点',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新巡线点',
			handler : function() {
				if(task_grid.getSelectionModel().getSelected()){
					point_store.reload();
				}else{
				}
			},
			scope : this
		} ],
		viewConfig : {
			autoFill : true,
			forceFit : true
		},
		bbar : new Ext.PagingToolbar( {
			store : point_store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		})
	});
	
	function show_point(){
		var task_id = task_grid.getSelectionModel().getSelected().data.task_id;
		rule_point_sm = new Ext.grid.CheckboxSelectionModel({});

		rule_point_store = new Ext.zion.db.ArrayStore( {
			db : {
				alias : 'pipe.management.alarm.target_task.point.not_in.analyze_rule_point.select',
				params : [ task_id,selectCorpId ]
			},
			root : "r",
			fields : ['id','name','longitude','latitude','memo','reg_date']
		});
		rule_point_grid = new Ext.grid.GridPanel({
	        store: rule_point_store,
	        sm : rule_point_sm,
			width:500,
	        enableColumnHide : false,
	        loadMask : {msg:'查询中...'},
	        columns: [
	       	rule_point_sm,
	       	new Ext.grid.RowNumberer({header:'序号',width:35}),
//        	{id:'id',header: "id", width: 10, sortable: true, dataIndex: 'id',hidden:true},
        	{header: '巡检点名称', width: 130, sortable: true, dataIndex: 'name'},
        	{header: "创建时间", width: 150, sortable: true, dataIndex: 'reg_date', renderer: dateFormat},
        	{header: "备注", width: 130, sortable: true, dataIndex: 'memo'}
	        ],
	     /*   tbar: [ '范围(米)：',{
	    		id: 'distance',
	    		xtype: 'numberfield',
	    		width:140,
	    		allowBlank : false,
				blankText : '不能为空'
	    	}, '报警类型',new Ext.form.ComboBox({
		    	name: 'alarm_name',
		    	store : new Ext.data.SimpleStore({
		    		fields:['alarm_type', 'alarm_name'],
			    	data:[[1,'进范围报警'],[2,'出范围报警'],[3,'进范围触发报警'],[4,'出范围触发报警'],[5,'进出范围触发报警']]
			    }),
			    editable:false,
			    mode: 'local',
			    triggerAction:'all',
			    displayField:'alarm_name',
			    valueField :'alarm_type',
			    value : 1,
			    width:140,
				id : 'alarm_type'
			})],*/
			viewConfig : {
				autoFill : true,
				forceFit : true
			},
			bbar : new Ext.PagingToolbar( {
				store : rule_point_store,
				pageSize : Ext.zion.page.limit,
				displayInfo : true
			})
		});

		rule_point_form = new Ext.FormPanel({
	    	heigth: 50,
		    defaults: {width: 230},
		    labelWidth:75,
	    	items: [{
	    		fieldLabel: '范围(米)',
	    		id: 'distance',
	    		xtype: 'numberfield',
	    		width:140,
				maxLength:8,
	    		allowBlank : false,
				blankText : '不能为空'
	    	},new Ext.form.ComboBox({
		    	name: 'alarm_name',
		    	store : new Ext.data.SimpleStore({
		    		fields:['alarm_type', 'alarm_name'],
			    	data:[[1,'进范围报警'],[2,'出范围报警'],[3,'进范围触发报警'],[4,'出范围触发报警'],[5,'进出范围触发报警']]
			    }),
			    editable:false,
			    mode: 'local',
			    triggerAction:'all',
			    displayField:'alarm_name',
			    valueField :'alarm_type',
			    value : 1,
			    width:140,
			    hidden:true,
			    hideLabel:true,
				id : 'alarm_type'
			})]
		});
    	
		rule_point_panel = new Ext.Panel({
			height : 400,
			width:500,
			layout : 'border',
			defaults : {
				border : false
			},
			items:[{
				region : 'south',
				layout : 'fit',
				height : 50,
				items :[rule_point_form]
			},{
				region : 'center',
				layout : 'fit',
				height :340,
				items :[rule_point_grid]
			}]
		});
		
		rule_point_grid.store.constructor({
			db : {
				alias : 'pipe.management.alarm.target_task.point.not_in.analyze_rule_point.select',
				params : [ task_id,selectCorpId ]
			},
			root : "r",
			fields : ['id','name','longitude','latitude','memo','reg_date']
		});
		rule_point_grid.store.load({
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
		
		rule_point_win = new Ext.Window({
			title:'点列表',
			height : 400,
			autoWidth:false,
			width: 500,
			items:[rule_point_panel],
			buttons : [{
				text : '保存',
				handler : function() {
					add_rule_point(rule_point_win,rule_point_form.getForm());
				}
			} ,{
				text : '关闭',
				handler : function() {
					rule_point_win.close();
				}
			} ]
		});
		rule_point_win.show();
	}
	
	function show_task(){
		var time_data = [[86400,'一天'],[172800,'两天'],[259200,'三天'],[345600,'四天'],[432000,'五天'],[518400,'六天'],[604800,'一周'],[1209600,'两周'],[2592000,'一月']];
		var time_store = new Ext.data.SimpleStore({
			data : time_data,
			fields : ['interval','show_time']
		});
		var time_combo = new Ext.form.ComboBox({
			fieldLabel : '循环周期',
			hiddenName : 'interval',
			valueField : 'interval',
			store : time_store,
			displayField : 'show_time',
			mode : 'local',
			editable : false,
			triggerAction : 'all',
			allowBlank : false,
			blankText : '不能为空',
			value : 86400
		});
		
		var formPanel = new Ext.form.FormPanel({
			frame:true,
	    	height:210,
			frame : true,
		    defaults: {width: 230},
		    labelWidth:60,
	    	items: [{
	    		id: 'task_name',
	    		xtype: 'textfield',
	    		fieldLabel: '任务名称',
	    		allowBlank : false,
				blankText : '不能为空'
	    	},{
	    		id: 'start_time',
	    		xtype: 'datefield',
	    		fieldLabel: '开始时间',
	    		editable : false,
	    		format:'Y-m-d',
	    		allowBlank : false,
				blankText : '不能为空'
	    	},{
	    		id: 'end_time_check',
	    		xtype: 'checkbox',
	    		labelWidth:75,
	    		fieldLabel: '结束时间',
	    		editable : false,
	    		checked:true,
	    		allowBlank : false,
				blankText : '不能为空'
	    	},{
	    		id: 'end_time',
	    		xtype: 'datefield',
//	    		fieldLabel: '结束时间',
	    		editable : false,
	    		format:'Y-m-d',
	    		allowBlank : false,
				blankText : '不能为空'
	    	},
	    	time_combo,
	    	{
	    		id : 'task_id',
	    		name : 'task_id',
				hidden:true,
	    		hideLabel:true
	    	}]
		});
		var task_win = new Ext.Window({
			title:'任务',
			height : 210,
			width:390,
			items:[formPanel],
			buttons : [ {
				text : '保存',
				handler : function() {
					add_update_task(formPanel.getForm(),task_win,time_combo);
				}
			}, {
				text : '取消',
				handler : function() {
					task_win.close();
				}
			} ]
		});
		task_win.show();
		Ext.getCmp("end_time_check").on('check',function(obj,checked){
			if(Ext.getCmp("end_time_check").checked){
				Ext.getCmp("end_time").enable();
			}else{
				Ext.getCmp("end_time").reset();
				Ext.getCmp("end_time").disable();
			}
		});
		if(is_task == false){
			var sm = task_grid.getSelectionModel().getSelected();
			var start_time = sm.data.start_time;
			var end_time = sm.data.end_time;
			formPanel.form.loadRecord(sm);
			if(end_time == ""){
				Ext.getCmp("end_time_check").setValue(false);
				Ext.getCmp("end_time").reset();
				Ext.getCmp("end_time").disable();
			}else{
				Ext.getCmp("end_time_check").setValue(true);
				Ext.getCmp("end_time").setValue(dateFormatToDay(end_time));
			}
			Ext.getCmp("start_time").setValue(dateFormatToDay(start_time));
			
		}
	}
	
	function add_rule_point(rule_point_win,rule_point_form){
		if (rule_point_form.isValid() == false) {
				return false;
		}
		loadMask.show();
		var distance = Ext.getCmp("distance").getValue();
		var alarm_type = Ext.getCmp("alarm_type").getValue();
		if(distance == ""){
			Ext.Msg.alert('提示','请输入范围');
			loadMask.hide();
			return;
		}
		var sm = rule_point_grid.getSelectionModel().getSelections();
		var task_id = task_grid.getSelectionModel().getSelected().data.task_id;
		if (sm.length > 0) {
			var data_value = [];
			for ( var i = 0; i < sm.length; i ++) {
				var member = sm[i].data;
				if (member) {
					data_value.push({name:member.name,analyze_id:member.id,distance:distance,alarm_type:alarm_type});
				}
			}
			var insertNext = function(data_value){
				if(data_value.length>0){
					Zion.db.getJSON('pipe.management.alarm.target_task.seq_analyze_rule_point_id.select',null,function(data){
						if(data.r){
							var id = data.r[0][0];
							var ids = data_value.pop();
							var params = [];
							params.push(id);
							params.push(ids.name);
							params.push(ids.analyze_id);
							params.push(ids.distance);
							params.push(3);
							params.push(1);
							params.push(0);
							params.push(127);
							params.push(0);
							params.push(0);
							params.push(3);
							Zion.db.getJSON('pipe.management.alarm.target_task.analyze_rule_point.insert',params,function(data){
								if(data.r){
									Zion.db.getJSON('pipe.management.alarm.target_task.pipe_patrol_task_rule_point.insert',[task_id,id],function(data){
										if(data.r){
											insertNext(data_value);
											insertRuleTargetNext(id);
										}
									})
								}
							});
						}
					});
				}else{
					loadMask.hide();
					Ext.Msg.alert('提示','数据添加成功');
					rule_point_win.close();
					point_grid.store.reload();
				}
			}
			insertNext(data_value);
		}else{
			loadMask.hide();
			Ext.Msg.alert('提示','请选择要添加的列');
		}
	}
	
	function getCheckedTarget() {
		var checkedTargetMap = {};
		var checkedTarget = [];
		function checkedNode(node) {
			if (node.attributes.target && node.attributes.checked) {
				var key = node.attributes.target.target_id;
				if (!checkedTargetMap[key]) {
					checkedTargetMap[key] = key;
					checkedTarget.push(key);
				}
			}
			if (node.hasChildNodes()) {
				node.eachChild(function(child) {
					checkedNode(child);
				});
			}
		}
		checkedNode(targetTree.getRootNode());
		return checkedTarget;
	}
	
	function delete_rule_point(){
		var task_id = task_grid.getSelectionModel().getSelected().data.task_id;
		var sm = point_grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					var params = [];
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							params.push({id:member.id,point_id:member.point_id});
						} else {
							target_store.remove(target_store.getAt(i));
						}
					}
					
					var deleteNext = function(params) {
						if (params.length > 0) {
							var ids = params.pop();
							var id = ids.id;
							var point_id = ids.point_id;
							Ext.zion.db.getJSON("pipe.management.alarm.target_task.analyze_rule_point.delete", [id,point_id], function(data) {
								if(data.r){
									Ext.zion.db.getJSON("pipe.management.alarm.target_task.pipe_patrol_task_rule_point.delete", [task_id,id], function(data) {
										deleteNext(params);
										deleteRuleTargetNext(id);
									});
								}
							});
						} else {
							Ext.Msg.alert("提示", "删除成功");
							point_grid.store.reload();
							Ext.getCmp("delete_Button").disable();
							Ext.getCmp("edit_Button").disable();
						}
					};
					deleteNext(params);
				}
			})
		}
	}
	
	function add_update_task(formPanel,task_win,time_combo){
		if (formPanel.isValid() == false) {
				return false;
		}
		var task_name = Ext.getCmp("task_name").getValue();
		var start_time = utc_to_timestamp(Ext.util.Format.date(Ext.getCmp("start_time").getValue(), 'Y-m-d H:i:s'));
		
		var interval = time_combo.getValue();
		if(Ext.getCmp("end_time_check").checked == true){
			var end_time = utc_to_timestamp(Ext.util.Format.date(Ext.getCmp("end_time").getValue(), 'Y-m-d H:i:s'))+ 23 * 3600 + 3599;
			if(start_time > end_time){
				Ext.Msg.alert('提示','开始时间应小于结束时间');
				return;
			}
		}else{
			var end_time = 0;
		}
		
		if(is_task == true){
			Zion.db.getJSON('pipe.management.alarm.target_task.id.select',null,function(data){
				if(data.r){
					var id = data.r[0][0];
					var params = [id,task_name,start_time,end_time,interval,selectCorpId];
					Zion.db.getJSON('pipe.management.alarm.target_task.insert',params,function(data){
						if(data.r){
							Ext.Msg.alert('提示','数据添加成功');
							task_store.reload();
							disableButton();
							task_win.close();
						}else{
							Ext.Msg.alert('提示','数据添加失败');
							task_store.reload();
							disableButton();
							task_win.close();
						}
					});
				}else{
					Ext.Msg.alert('提示','数据添加失败');
					task_store.reload();
					disableButton();
					task_win.close();
				}	
			});
		}else{
			var task_id = task_grid.getSelectionModel().getSelected().data.task_id;
			var params = [task_name,start_time,end_time,interval,task_id]
			Zion.db.getJSON('pipe.management.alarm.target_task.update',params,function(data){
				if(data.r){
					Ext.Msg.alert('提示','数据修改成功');
					task_store.reload();
					disableButton();
					task_win.close();
				}else{
					Ext.Msg.alert('提示','数据修改失败');
					task_store.reload();
					disableButton();
					task_win.close();
				}
			});
		}
	}
	
	var id = [];
	function deleteForm() {
		var sm = task_grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							id.push(member.task_id);
						} else {
							task_store.remove(store.getAt(i));
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
			var params = id.pop() ;
			Ext.zion.db.getJSON("pipe.management.alarm.target_task.delete", [params],function(data) {
				if (!data.r) {
					Ext.Msg.alert("删除提示", "删除失败");
					disableButton();
				} else {
					Zion.db.getJSON('pipe.management.alarm.target_task.task_target_rule.select',[params],function(data){
						if(data.r != ""){
							var data_value = data.r;
								for(var i = 0;i < data_value.length;i++){
									Zion.db.getJSON('pipe.management.alarm.target_task.analyze_target_rule_point.delete',[data_value[i][0],data_value[i][1]],function(data){
									});
								}
						}
					});
					deleNext();
				}
			});
		} else {
			task_grid.store.reload();
			point_grid.store.removeAll();
			Ext.Msg.alert("删除提示", "删除成功");
			targetTree.disable();
			disableButton();
			Ext.getCmp("add_button").disable();
		}
	}
		
	function utc_to_timestamp(val) {
		var text_time = val.replace(/:/g, '-');
		time_str = text_time.replace(/ /g, '-');
		var time_arr = time_str.split("-");
		var time_datum = new Date(Date.UTC(time_arr[0], time_arr[1] - 1,
				time_arr[2], time_arr[3] - 8, time_arr[4], time_arr[5]));
		var new_time = time_datum.getTime() / 1000;
		return new_time;
	}
	
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}
	
	function checkedTarget(target) {
		var mod_map = {};
		for ( var i = 0; i < target.length; i++) {
			mod_map[target[i]] = target[i];
		}
		function checkedNode(node) {
			if (node.attributes.target && mod_map[node.attributes.target.target_id]) {
				node.attributes.checked = true;
				node.ui.toggleCheck(true);
			} else {
				node.attributes.checked = false;
				node.ui.toggleCheck(false);
			}
			if (node.hasChildNodes()) {
				node.eachChild(function(child) {
					checkedNode(child);
				});
			}
			;
		}
		checkeding = true;
		checkedNode(targetTree.getRootNode());
		checkeding = false;
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
			click : function(node) {
				if (node.attributes.target) {
					var key = node.attributes.target.target_id;
					showTargetInfo(key);
					getClickTargetRegion(key);
				} else {
					return false;
				}
			},
			checkchange : function(node, checked) {
				if (checkeding) {
					return;
				}
				if (node.hasChildNodes()) {
					node.eachChild(function(child) {
						child.ui.toggleCheck(checked);
					});
				}
				if (node.attributes.target) {
					if (checked) {
						insert_task_target(node.attributes.target.target_id);
					} else {
						delete_task_target(node.attributes.target.target_id);
					}
				}
			}
		}
	});
	function insert_task_target(target_id){
		if (task_grid.getSelectionModel().getSelected().data.task_id) {
			var task_id = task_grid.getSelectionModel().getSelected().data.task_id;
			Zion.db.getJSON('pipe.management.alarm.target_task.pipe_patrol_task_target.insert', [task_id, target_id ], function(data) {
				if (data.r) {
					Zion.db.getJSON('pipe.management.inspection_point.pipe_patrol_task_rule_point.analyze_rule_point_id.select',[task_id],function(data){
						var data_value = data.r;
						var params = [];
						for ( var i = 0; i < data_value.length; i += 1) {
							params.push(data_value[i][0]);
						}
						var insertNext = function(params) {
							if(params.length > 0){
								var id = params.pop();
								Zion.db.getJSON('pipe.management.alarm.target_task.analyze_target_rule_point.insert',[target_id,id],function(data){
									if(data.r){
										insertNext(params);
									}else{}
								});
							}
						}
						insertNext(params);
					});
				} else {
					
				}
			})
		} else {

		}
	}
	
	function delete_task_target(target_id){
		if (task_grid.getSelectionModel().getSelected().data.task_id) {
			var task_id = task_grid.getSelectionModel().getSelected().data.task_id;
			Zion.db.getJSON('pipe.management.alarm.target_task.pipe_patrol_task_target.delete', [ task_id, target_id ], function(data) {
				if (!data.f) {
					Zion.db.getJSON('pipe.management.inspection_point.pipe_patrol_task_rule_point.analyze_rule_point_id.select',[task_id],function(data){
						var data_value = data.r;
						var params = [];
						for ( var i = 0; i < data_value.length; i += 1) {
							params.push(data_value[i][0]);
						}
						var deleteNext = function(params) {
							if(params.length > 0){
								var id = params.pop();
								Zion.db.getJSON('pipe.management.alarm.target_task.analyze_target_rule_point.delete',[target_id,id],function(data){
									if(data.r){
										deleteNext(params);
									}else{}
								});
							}
						}
						deleteNext(params);
					});
				} else {
				}
			})
		} else {

		}
	}
	
	var insertRuleTargetNext = function(id){
		for(var i=0; i< getCheckedTarget().length; i++){
			Zion.db.getJSON('pipe.management.alarm.target_task.analyze_target_rule_point.insert',[getCheckedTarget()[i],id],function(data){
			});
		}
	}
	
	var deleteRuleTargetNext = function(id){
		for(var i=0; i< getCheckedTarget().length; i++){
			Zion.db.getJSON('pipe.management.alarm.target_task.analyze_target_rule_point.delete',[getCheckedTarget()[i],id],function(data){
			});
		}
	}
	
	var target_store = new Ext.data.ArrayStore({
		root: 'r',
		fields: [
		    'region_id','region_name','points','analyze_id',
		    'analyze_type','start_time','end_time',
		    'week_flag','is_alarm','alarm_delay','alarm_times',
		    'to_phone','analyze_rule_region_id','target_id'
		]
	});
	
	function getClickTargetRegion(target_id){
		loadMask.msg = "查询中，请稍后 ...";
		loadMask.show();
		Zion.db.getJSON("axiom_analyze_target_region.target_id.select", [target_id], function(data) {
			target_store.loadData(data);
			loadMask.hide();
		});
	}
	
	function getCheckedTarget() {
		var checkedTargetMap = {};
		var checkedTarget = [];
		function checkedNode(node) {
			if (node.attributes.target && node.attributes.checked) {
				var key = node.attributes.target.target_id;
				if (!checkedTargetMap[key]) {
					checkedTargetMap[key] = key;
					checkedTarget.push(key);
				}
			}
			if (node.hasChildNodes()) {
				node.eachChild(function(child) {
					checkedNode(child);
				});
			}
		}
		checkedNode(targetTree.getRootNode());
		return checkedTarget;
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
	Ext.zion.tree.loadTargetTree(function(tree) {
		/*Zion.db.getJSON("pipe.management.region.select", null, function(data) {
			store.loadData(data);
		});*/
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		targetTree.disable();
		loadMask.hide();
	},true);

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
				disableButton();
				task_store.constructor( {
					db : {
						alias : store_sql,
						params : [ selectCorpId ]
					},
					root : "r",
					fields : fields
				});
				task_store.load( {
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				});
				checkedTarget([]);
				point_grid.store.removeAll();
				Ext.getCmp("delete_Button").disable();
				Ext.getCmp("edit_Button").disable();
				Ext.getCmp("add_button").disable();
			}
		}
	});
	
	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
		});
		
		task_store.constructor( {
			db : {
				alias : store_sql,
				params : [ Zion.user.corp_id ]
			},
			root : "r",
			fields : fields
		});
		task_store.load( {
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
		items : [{
			width:200,
			split:true,
			region : 'west',
			layout : 'fit',
			collapsible : true,
			title : '集团列表',
			items :[corp_tree]
		},{
			width:250,
			split:true,
			region : 'center',
			layout : 'fit',
			title:'任务列表',
			items :[{
				layout : 'border',
				defaults : {
					border : true
				},
				items:[{
					region : 'north',
					layout : 'fit',
					split : true,
					height :340,
					items :[task_grid]
				},{
					region : 'center',
					layout : 'fit',
					items :[point_grid]
				}]
			}]
		},{
			title : '监控目标列表',
			region : 'east',
			collapsible : true,
			split : true,
			width : 200,
			layout : 'border',
			items : [ targetTree, targetInfo ]
		}]
	});
});
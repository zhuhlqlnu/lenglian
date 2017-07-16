Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var selectSpeedName = '';
	var click_key;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
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
					click_key = key;
					showTargetInfo(key);
					getClickTargetSpeed(key);
				} else {
					return false;
				}
			},
			checkchange : function(node, checked) {
				if (node.hasChildNodes()) {
					node.eachChild(function(child) {
						child.ui.toggleCheck(checked);
					});
				}
			}
		}
	});
	
	function getClickTargetSpeed(target_id){
		loadMask.msg = "查询中，请稍后 ...";
		loadMask.show();
		Zion.db.getJSON("axiom_analyze_target_speed.target_id.select", [target_id], function(data) {
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
	
	var sm = new Ext.grid.CheckboxSelectionModel({});
	var store_sql = "axiom_analyze_speed.select";
	var fields =  [ 'speed_id','speed_name','speed','duration','corp_id', 'user_id','create_date','memo','is_delete' ]
	var store = new Ext.zion.db.ArrayStore({
		db : {
			alias : store_sql,
			params : [selectSpeedName]
		},
		root: 'r',
		fields: fields
	});
	
    var grid = new Ext.grid.GridPanel({
    	//margins : '5 0 0 0',
    	title: '超速报警列表',
    	flex: 1,
    	region : 'center',
        store: store,
        sm : sm,
        enableColumnHide : false,
        loadMask : {msg:'查询中...'},
        columns: [
              	sm,
            	new Ext.grid.RowNumberer({header:'序号',width:35}),
                {header: '超速名称', width: 130, sortable: true, dataIndex: 'speed_name'},
            	{header: "速度限制", width: 130, sortable: true, dataIndex: 'speed'},
            	{header: "持续时间", width: 130, sortable: true, dataIndex: 'duration'},
            	{header: "创建时间", width: 150, sortable: true, dataIndex: 'create_date',renderer: dateRender},
            	{header: "备注", width: 130, sortable: true, dataIndex: 'memo'}
        ],
		viewConfig : {
			//autoFill : true,
			//forceFit : true
		},
        tbar: [{
				text : '刷新',
				icon : Ext.zion.image_base+'/refresh.gif',
				tooltip : '刷新记录',
				handler : function() {
        			store.load({params : {start : 0, limit : Ext.zion.page.limit}});
					disableButton();
				},
				scope : this
			}, '-', {
				id : 'bindButton',
				text : '绑定',
				icon : Ext.zion.image_base+'/binding.png',
				tooltip : '终端绑定超速报警',
				handler : bindData,
				disabled : true,
				scope : this
			}, '-',{
				xtype : 'textfield',
				width : 150,
				name : 'term',
				id : 'term',
				emptyText:'超速名称'
			},{
				id : 'selectButton',
				text : '查询',
				icon : Ext.zion.image_base+'/select.gif',
				tooltip : '查询超速报警',
				handler : function() {
					select_bind_data();
				},
				scope : this
			}
        ],
        bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		})
    });
    store.load({params : {start : 0, limit : Ext.zion.page.limit}});
    
    sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('bindButton').enable();
		} else {
			Ext.getCmp('bindButton').disable();
		}
	});
    
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length !=0) {
			Ext.getCmp('bindButton').enable();
		} else {
			Ext.getCmp('bindButton').disable();
		}
	});
	
	function select_bind_data(){
		var term = Ext.getCmp("term").getValue();
		store.constructor( {
			db : {
				alias : store_sql,
				params : [ term ]
			},
			root : "r",
			fields : fields
		});
		store.load({params : {start : 0, limit : Ext.zion.page.limit}});
	}
	
	function disableButton() {
		Ext.getCmp('bindButton').disable();
	}
	
    function bindData(){
    	var checkedTarget = getCheckedTarget();
    	if(checkedTarget.length <= 0){
    		Ext.Msg.alert('提示','请选择目标!');
    		return;
    	}
    	win_show();
    }
    
    function win_show() {
		formPanel = new Ext.form.FormPanel({
			labelWidth : 80,
			frame : true,
			bodyStyle : 'padding:5px 5px 0',
			layout : 'form',
			defaultType : 'textfield',
			defaults: {width: 150},
			items : [
			    new Ext.form.ComboBox({
			    	name: 'alarm_type',
			    	store : new Ext.data.SimpleStore({
			    		fields:['id', 'name'],
				    	data:[[0,'超速报警'],[1,'超速触发报警']]
				    }),
				    editable:false,
				    mode: 'local',
				    triggerAction:'all',
				    fieldLabel: '报警类型',
				    displayField:'name',
				    valueField :'id',
				    value : 0,
				    maxHeight: 200,
					id : 'alarm_type'
				}),
				new Ext.form.TimeField({
					name: 'start_time',
		            fieldLabel: '报警开始时间',
		            format:'H:i',
		            value:'08:00',
					editable: false,
					increment: 1,
					id : 'start_time'
		        }),new Ext.form.TimeField({
		        	name: 'end_time',
		            fieldLabel: '报警结束时间',
		            format:'H:i',
		            value:'18:00',
					editable: false,
				    increment: 1,
					id : 'end_time'
		        }),{
					xtype : 'textarea',
					fieldLabel : '备注',
					name : 'memo',
					id : 'memo'
				}]
		});
		
		var win = new Ext.Window({
			title : '超速报警设置',
			closable : true,
			closeAction : 'close',
			autoWidth : false,
			width : 300,
			items : [formPanel],
			buttons : [{
				text : '保存',
				handler : function(){
			    	var sm_ = grid.selModel.getSelections();
			    	if (sm_.length > 0) {
						Ext.Msg.confirm('绑定确认', '你是否确认绑定选中的记录？', function(btn) {
							if (btn == 'yes') {
								loadMask = new Ext.LoadMask(Ext.getBody() , {
									msg : "操作中，请稍后 ..."
								});
								loadMask.show();
								var insert_ids = [];
								var del_speed_ids = [];
								var checkedTarget = getCheckedTarget();
								var sm_ = grid.selModel.getSelections();
								var alarm_type = Ext.getCmp('alarm_type').getValue();
								var start_time = Ext.getCmp('start_time').getRawValue();
								var end_time = Ext.getCmp('end_time').getRawValue();
								var memo = Ext.getCmp('memo').getValue();
								win.close();
								for ( var i = 0; i < sm_.length; i += 1) {
									var member = sm_[i].data;
									if (member) {
										for(var j = 0;j < checkedTarget.length ; j +=1){
											del_speed_ids.push({ t:checkedTarget[j], s:member.speed_id });
											insert_ids.push({t:checkedTarget[j], s:member.speed_id
												, at:alarm_type, st:start_time
												, et:end_time, m:memo});
										}
									}
								}
								if (insert_ids.length > 0) {
									delete_by_speed_id(del_speed_ids, insert_ids, win);
								}
							}
						})
					}
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
    
    var delete_by_speed_id = function(del_speed_ids, insert_ids, win){
		if(del_speed_ids.length > 0){
    		var id = del_speed_ids.pop();
    		var params = [];
    		params.push(id.s);
    		params.push(id.t);
			Ext.zion.db.getJSON("axiom_analyze_target_speed.speed_id_target_id.delete", params,function(data) {
				delete_by_speed_id(del_speed_ids, insert_ids, win);
			});
		}else{
			insertNext(insert_ids, win);
		}
	}

    var insertNext = function(insert_ids, win){
    	if(insert_ids.length > 0){
    		Ext.zion.db.getJSON("axiom_seq_analyze_t_speed_id.select", null,function(data) {
				if (data.r != 0 && data.r) {
		    		var params = [];
		    		var id = insert_ids.pop();
		    		params.push(data.r[0][0]);
		    		params.push(id.t);
		    		params.push(id.at);
		    		params.push(time_to_utc(id.st));
		    		params.push(time_to_utc(id.et));
		    		params.push(parseInt(new Date().getTime()/1000));
		    		params.push(id.m);
		    		params.push(1);
		    		params.push(id.s);
		    		Ext.zion.db.getJSON("axiom_analyze_target_speed.insert", params,function(data) {
						insertNext(insert_ids, win);
					});
				}
			});
    	}else{
			//getClickTargetSpeed(click_key);
    		loadMask.hide();
    		Ext.Msg.alert("提示", "绑定成功");
    	}
    }
    
    function time_to_utc(time){
    	var time_arr = time.split(':');
    	if(time_arr.length == 2){
    		if(time_arr[0].substring(0,1) == 0){
    			time_arr[0] = time_arr[0].substring(1,2);
    		}
    		return (parseInt(time_arr[0])*60 + parseInt(time_arr[1]))*60;
    	}
    	return 0;
    }
    function dateRender(val){
    	return new Date(val*1000).toLocaleString();
    }
    
    function timeRender(val){
    	val = val/60;
		return parseInt(val/60) + ':' + val%60;
	}
    
    var target_sm = new Ext.grid.CheckboxSelectionModel({});
	var target_store = new Ext.data.ArrayStore({
		root: 'r',
		fields: [
			'speed_id','speed_name','speed','duration','corp_id',
			'user_id','is_delete',
			'target_speed_id','target_id','alarm_type','start_time',
			'end_time','is_alarm','create_date','memo'
		]
	});

    var target_grid = new Ext.grid.GridPanel({
    	//margins : '5 0 0 0',
    	//heigth : 300,
    	title: '监控目标已绑定超速报警列表',
    	flex: 1,
    	region : 'south',
        store: target_store,
        sm : target_sm,
        enableColumnHide : false,
        loadMask : {msg:'查询中...'},
        columns: [
        	target_sm,
        	new Ext.grid.RowNumberer({header:'序号',width:35}),
        	{header: "speed_id", width: 10, sortable: true, dataIndex: 'speed_id',hidden:true},
            {header: '超速名称', width: 130, sortable: true, dataIndex: 'speed_name'},
        	{header: "速度限制", width: 130, sortable: true, dataIndex: 'speed'},
        	{header: "持续时间", width: 130, sortable: true, dataIndex: 'duration'},
        	{header: "corp_id", width: 10, sortable: true, dataIndex: 'corp_id',hidden:true},
        	{header: "user_id", width: 10, sortable: true, dataIndex: 'user_id',hidden:true},
        	{header: "is_delete", width: 10, sortable: true, dataIndex: 'is_delete',hidden:true},
        	{header: "target_speed_id", width: 10, sortable: true, dataIndex: 'target_speed_id',hidden:true},
        	{header: "target_id", width: 10, sortable: true, dataIndex: 'target_id',hidden:true},
        	{header: "报警类型", width: 130, sortable: true, dataIndex: 'alarm_type',renderer:function(val){
        		if(val == 0){return '超速报警';}else if(val == 1){return '超速触发报警';}else{return '未知';}
        	}},
        	{header: "报警开始时间", width: 130, sortable: true, dataIndex: 'start_time',renderer:timeRender},
        	{header: "报警结束时间", width: 130, sortable: true, dataIndex: 'end_time',renderer:timeRender},
        	{header: "is_alarm", width: 130, sortable: true, dataIndex: 'is_alarm',hidden:true},
        	{header: "创建时间", width: 150, sortable: true, dataIndex: 'create_date',renderer:dateRender},
        	{header: "备注", width: 130, sortable: true, dataIndex: 'memo'}
        ],
		viewConfig : {
			//autoFill : true,
			//forceFit : true
		},
        tbar: [{
				text : '删除',
				id : 'deleteButton_',
				icon : '/image/module/delete.gif',
				tooltip : '删除记录',
				scope : this,
				handler: deleteData,
				disabled : true
            }/*, '-', {
				text : '刷新',
				icon : '/image/module/refresh.gif',
				tooltip : '刷新记录',
				handler : function() {
					//grid.store.reload();
					//disableButton();
				},
				scope : this
			}*/
            /*, '-', {
				//id : 'bindButton',
				text : '绑定',
				icon : '/image/module/refresh.gif',
				tooltip : '终端绑定超速报警',
				//handler : bindData,
				disabled : true,
				scope : this
			}*/
        ]
    });
    
    function deleteData(){
    	var sm = target_grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					loadMask = new Ext.LoadMask(Ext.getBody() , {
						msg : "操作中，请稍后 ..."
					});
					loadMask.show();
					var params = [];
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							params.push({id:member.target_speed_id, index:sm[i], tid:member.target_id});
						} else {
							target_store.remove(target_store.getAt(i));
						}
					}
					var deleteNext = function(params) {
						if (params.length > 0) {
							var param = params.pop();
							target_store.remove(param.index);
							Ext.zion.db.getJSON("axiom_analyze_target_speed.target_speed_id.delete", [  param.tid ,param.id ], function(data) {
								deleteNext(params);
							});
						} else {
							loadMask.hide();
							Ext.Msg.alert("提示", "删除成功");
							Ext.getCmp('deleteButton_').disable();
						}
					};
					deleteNext(params);
				}
			})
		}
	}
    
    target_sm.on('rowselect', function() {
		if (target_grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton_').enable();
		} else {
			Ext.getCmp('deleteButton_').disable();
		}
	});
    
    target_sm.on('rowdeselect', function() {
		if (target_grid.selModel.getSelections().length !=0) {
			Ext.getCmp('deleteButton_').enable();
		} else {
			Ext.getCmp('deleteButton_').disable();
		}
	});
	
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [ {
			margins : '5 0 0 0',
			title : '监控目标列表',
			region : 'west',
			collapsible : true,
			split : true,
			width : 200,
			layout : 'border',
			items : [ targetTree, targetInfo ]
		},  {
			margins : '5 0 0 0',
			//title : '监控目标列表',
			region : 'center',
			//collapsible : true,
			//split : true,
			//width : 200,
			layout : 'vbox',
			layoutConfig: {
			    align : 'stretch',
			    pack  : 'start',
			},

			items : [ grid, target_grid ]
		} ]
	});

	Ext.zion.tree.loadTargetTree(function(tree) {
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		loadMask.hide();
	},true);
	
});

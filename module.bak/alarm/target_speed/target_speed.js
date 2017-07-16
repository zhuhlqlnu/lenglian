Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	
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
	var store = new Ext.data.ArrayStore({
		root: 'r',
		fields: [
		    'speed_id','speed_name','speed','duration','corp_id',
		    'user_id','create_date','memo','is_delete'
		]
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
            	{id:'speed_id',header: "speed_id", width: 10, sortable: true, dataIndex: 'speed_id',hidden:true},
                {header: '超速名称', width: 130, sortable: true, dataIndex: 'speed_name'},
            	{header: "速度限制", width: 130, sortable: true, dataIndex: 'speed'},
            	{header: "持续时间", width: 130, sortable: true, dataIndex: 'duration'},
            	{header: "corp_id", width: 10, sortable: true, dataIndex: 'corp_id',hidden:true},
            	{header: "user_id", width: 10, sortable: true, dataIndex: 'user_id',hidden:true},
            	{header: "创建时间", width: 150, sortable: true, dataIndex: 'create_date',renderer: dateRender},
            	{header: "备注", width: 130, sortable: true, dataIndex: 'memo'},
            	{header: "is_delete", width: 130, sortable: true, dataIndex: 'is_delete',hidden:true}
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
	            	Zion.db.getJSON("axiom_analyze_speed.select", null, function(data) {
						store.loadData(data);
					});
					disableButton();
				},
				scope : this
			}, '-', {
				id : 'bindButton',
				text : '绑定',
				icon : '/image/module/refresh.gif',
				tooltip : '终端绑定超速报警',
				handler : bindData,
				disabled : true,
				scope : this
			}
        ]
    });
    
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
	
	function disableButton() {
		Ext.getCmp('bindButton').disable();
		Ext.getCmp('deleteButton_').disable();
	}
	
    function bindData(){
    	var checkedTarget = getCheckedTarget();
    	if(checkedTarget.length <= 0){
    		Ext.Msg.alert('提示','请选择终端!');
    		return;
    	}
    	win_show();
    }
    
    function win_show() {
		day_value = new Ext.form.CheckboxGroup({
	    	id:'day_group',
	    	xtype: 'checkboxgroup',  
	    	fieldLabel: '报警周期',
	    	columns: 1,   
	    	items:[{
	    		layout : 'column', 
	        	items: [{
	                boxLabel: '星期一',
	                checked: true,
	                name: 'monday',
	                fieldLabel: '',
	                inputValue  : 1
	            }, {
	                fieldLabel: '',
	                checked: true,
	                boxLabel: '星期二',
	                name: 'tuesday',
	                inputValue  : 2
	            }]
	        },{
	        	layout : 'column', 
	        	items: [  {
	                fieldLabel: '',
	                checked: true,
	                labelSeparator: '',
	                boxLabel: '星期三',
	                name: 'wednesday',
	                inputValue :3
	            },{
	                fieldLabel: '',
	                labelSeparator: '',
	                checked: true,
	                boxLabel: '星期四',
	                name: 'thursday',
	                inputValue :4
	            }]
	        },{
	        	columns: 2,
	        	items: [ {
	                fieldLabel: '',
	                labelSeparator: '',
	                checked: true,
	                boxLabel: '星期五',
	                name: 'friday',
	                inputValue :5
	            },{ 
	            	fieldLabel: '',
	                labelSeparator: '',
	                boxLabel: '星期六',
	                name: 'saturday',
	                inputValue :6
	            }]
	        },{
		    	columns: 2,
		    	items: [{
		            fieldLabel: '',
		            labelSeparator: '',
		            boxLabel: '星期日',
		            name: 'sunday',
		            inputValue  : 0
		        }]
		    }]
		});

		formPanel = new Ext.form.FormPanel({
			labelWidth : 80,
			frame : true,
			bodyStyle : 'padding:5px 5px 0',
			layout : 'form',
			defaultType : 'textfield',
			defaults: {width: 150},
			items : [{
					xtype : 'textfield',
					fieldLabel : '规则名称',
					name : 'speed_name',
					id : 'speed_name',
					allowBlank : false,
					blankText : '不能为空',
					emptyText:'最长40个字符',
					maxLength:40
				},
			   new Ext.form.ComboBox({
			    	name: 'alarm_type',
			    	store : new Ext.data.SimpleStore({
			    		fields:['id', 'name'],
				    	data:[[2,'超速报警'],[4,'超速触发报警']]
				    }),
				    editable:false,
				    mode: 'local',
				    triggerAction:'all',
				    fieldLabel: '报警类型',
				    displayField:'name',
				    valueField :'id',
				    value : 2,
				    maxHeight: 200,
					id : 'alarm_type'
				}),
				new Ext.form.TimeField({
					name: 'start_time',
		            fieldLabel: '报警开始时间',
		            format:'H:i',
		            value:'08:00',
					increment: 1,
					editable: false,
					id : 'start_time'
		        }),new Ext.form.TimeField({
		        	name: 'end_time',
		            fieldLabel: '报警结束时间',
		            format:'H:i',
		            value:'18:00',
				    increment: 1,
					editable: false,
					id : 'end_time'
		        }),day_value,
				new Ext.form.ComboBox({
					name: 'alarm_times',
					store : new Ext.data.SimpleStore({
						fields:['alarm_times', 'alarm_times_value'],
						data:[[0,'无限次数'],[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5'],[6,'6'],[7,'7'],[8,'8'],[9,'9'],[10,'10']]
					}),
					mode: 'local',
					editable:false,
					triggerAction:'all',
					fieldLabel: '报警次数',
					displayField:'alarm_times_value',
					valueField :'alarm_times',
					value : 0,
					maxHeight: 200,
					id : 'alarm_times'
				})
			,new Ext.form.ComboBox({
				name: 'is_true',
				hidden:true,
				hideLabel:true,
				store : new Ext.data.SimpleStore({
					fields:['is_alarm', 'is_true'],
					data:[[0,'不报警'],[1,'报警']]
				}),
				editable:false,
				mode: 'local',
				triggerAction:'all',
				fieldLabel: '是否报警',
				displayField:'is_true',
				valueField :'is_alarm',
				value : 1,
				maxHeight: 200,
				id : 'is_alarm'
			})]
		});
		
		win = new Ext.Window({
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
								loadMask.msg = "绑定中，请稍后 ...";
								loadMask.show();
								var checkedTarget = getCheckedTarget();
								insert(checkedTarget);
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
    
    var insert = function(target_ids_){
    	if(target_ids_.length > 0){
    		var ids = [];
			var checkedTarget = getCheckedTarget();
			var sm_ = grid.selModel.getSelections();
			var speed_name = Ext.getCmp('speed_name').getValue();
			var alarm_type = Ext.getCmp('alarm_type').getValue();
			var start_time = Ext.getCmp('start_time').getValue();
			var end_time = Ext.getCmp('end_time').getValue();
			var new_start_time = start_time.split(":");
			var start_ = new_start_time[0]*3600+new_start_time[1]*60;
			var new_end_time = end_time.split(":");
			var end_ = new_end_time[0]*3600+new_end_time[1]*60;
			var week_flag = 0;
			var alarm_times = Ext.getCmp("alarm_times").getValue();
			for (var i = 0; i < day_value.items.length; i++){  
				if (day_value.items.itemAt(i).checked){  
					var value = day_value.items.itemAt(i).inputValue;
					week_flag |= (1 << value);
				}  
			}  
     		var is_alarm = Ext.getCmp("is_alarm").getValue();
			for ( var i = 0; i < sm_.length; i += 1) {
				var member = sm_[i].data;
				if (member) {
					for(var j = 0;j < checkedTarget.length ; j +=1){
						ids.push({sn:speed_name,t:checkedTarget[j],si:member.speed_id
							, at:alarm_type, st:start_
							, et:end_, w:week_flag,ia:is_alarm,ad:member.duration,alt:alarm_times, s:member.speed});
					}
				}
			}
			if (ids.length > 0) {
				insertNext(ids);
			}
    	}
    }
    
    var insertNext = function(ids){
    	if(ids.length > 0){
			Ext.zion.db.getJSON("axiom_seq_analyze_t_speed_id.select", null,function(data) {
				if(data.r != 0 && data.r){
					var rule_id = data.r[0][0];
					var params = [];
					var id = ids.pop();
					var speed_id = id.si;
					var target_id = id.t;
					params.push(rule_id);
					params.push(id.sn);
					params.push(id.si);
					params.push(id.at);
					params.push(id.st);
					params.push(id.et);
					params.push(id.w);
					params.push(id.ia);
					params.push(id.ad*60);
					params.push(id.alt);
					params.push(id.s);
					params.push(1);
					Ext.zion.db.getJSON("axiom_analyze_rule_speed.insert", params,function(data) {
						if(data.r){
							Zion.db.getJSON('axiom_seq_analyze_target_speed_id.select',null,function(data){
								if(data.r){
									id = data.r[0][0];
									Zion.db.getJSON('axiom_analyze_target_speed.insert',[id,target_id,rule_id],function(data){
										insertNext(ids);
									});
								}else{
								
								}	
							});	
						}else{
						
						}
					});
				}
			});  		
    	}else{
    		Ext.Msg.alert("提示", "绑定成功");
			win.close();
    		loadMask.hide();
    	}
    }
    
    function time_to_utc(time){
    	var time_arr = time.split(':');
    	if(time_arr.length == 2){
    		if(time_arr[0].substring(0,1) == 0){
    			time_arr[0] = time_arr[0].substring(1,2);
    		}
    		return parseInt(time_arr[0])*60 + parseInt(time_arr[1]);
    	}
    	return 0;
    }
    function dateRender(val){
    	return new Date(val*1000).toLocaleString();
    }
    
    function timeRender(val){
		var hh = parseInt(val/3600);
    	var mi = parseInt((val/3600 -  hh) * 60);
    	if(hh < 10){
    		hh = '0' + hh ;
    	}
    	if(mi < 10){
    		mi = '0' + mi;
    	}
		return  hh + ':' + mi;
	}
    
	function week_flag_value(week_flag){
		var alarm1;
		var alarm2;
		var alarm3;
		var alarm4;
		var alarm5;
		var alarm6;
		var alarm7;
		if ((week_flag & 0x01) == 0x01) {
			alarm1 = "周日 ";
		} else {
			alarm1 = "";
		}
		if ((week_flag & 0x02) == 0x02) {
			alarm2 = "周一 ";
		} else {
			alarm2 = "";
		}
		if ((week_flag & 0x04) == 0x04) {
			alarm3 = "周二 ";
		} else {
			alarm3 = "";
		}
		if ((week_flag & 0x08) == 0x08) {
			alarm4 = "周三 ";
		} else {
			alarm4 = "";
		}
		if ((week_flag & 0x10) == 0x10) {
			alarm5 = "周四 ";
		} else {
			alarm5 = "";
		}
		if ((week_flag & 0x20) == 0x20) {
			alarm6 = "周五 ";
		} else {
			alarm6 = "";
		}
		if ((week_flag & 0x40) == 0x40) {
			alarm7 = "周六 ";
		} else {
			alarm7 = "";
		}
		var alarm = alarm1 + alarm2 + alarm3 + alarm4 + alarm5
					+ alarm6 + alarm7 ;
		if(alarm1 != "" && alarm2 != "" && alarm3 != "" && alarm4 != "" && alarm5 != "" && alarm6 != "" && alarm7 != ""){
			alarm = "每一天";
		}
		return alarm;
	}

    var target_sm = new Ext.grid.CheckboxSelectionModel({});
	var target_store = new Ext.data.ArrayStore({
		root: 'r',
		fields: [
			'id','name','analyze_type','start_time','end_time','week_flag','alarm_delay','alarm_times','speed','target_id'
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
        	{header: "speed_id", width: 10, sortable: true, dataIndex: 'id',hidden:true},
            {header: '规则名称', width: 130, sortable: true, dataIndex: 'name'},
        	{header: "速度限制", width: 130, sortable: true, dataIndex: 'speed'},
        	{header: "持续时间", width: 130, sortable: true, dataIndex: 'alarm_delay',renderer:function(val){
				return (val/60);
			}},
        	{header: "报警类型", width: 130, sortable: true, dataIndex: 'analyze_type',renderer:function(analyze_type){
        		if(analyze_type == 2){return '超速报警';}else if(analyze_type == 4){return '超速触发报警';}else{return '未知';}
        	}},
        	{header: "报警开始时间", width: 130, sortable: true, dataIndex: 'start_time',renderer:timeRender},
        	{header: "报警结束时间", width: 130, sortable: true, dataIndex: 'end_time',renderer:timeRender},
        	{header: "报警周期", width: 230, sortable: true, dataIndex: 'week_flag',renderer:week_flag_value},
        	{header: "报警次数", width: 150, sortable: true, dataIndex: 'alarm_times'}
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
					var params = [];
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							params.push({id:member.id,t_id:member.target_id,index:sm[i]});
						} else {
							target_store.remove(target_store.getAt(i));
						}
					}
					var deleteNext = function(params) {
						if (params.length > 0) {
							var param = params.pop();
							target_store.remove(param.index);
							Ext.zion.db.getJSON("axiom_analyze_target_speed.target_speed_id.delete", [ param.id,param.t_id ], function(data) {
								deleteNext(params);
							});
						} else {
							Ext.Msg.alert("提示", "删除成功");
							disableButton();
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
			    pack  : 'start'
			},

			items : [ grid, target_grid ]
		} ]
	});

	Ext.zion.tree.loadTargetTree(function(tree) {
		Zion.db.getJSON("axiom_analyze_speed.select", null, function(data) {
			store.loadData(data);
		});
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		loadMask.hide();
	},true);
	
});

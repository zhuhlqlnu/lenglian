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
					getClickTargetRegion(key);
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
	
	function getClickTargetRegion(target_id){
		disableButton_();
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
	
	var sm = new Ext.grid.CheckboxSelectionModel({});
	var store = new Ext.data.ArrayStore({
		root: 'r',
		fields: [
		    'region_id','region_name','points','corp_id','create_date','user_id','memo','is_delete'
		]
	});
	
    var grid = new Ext.grid.GridPanel({
    	//margins : '5 0 0 0',
    	title: '越界列表',
    	flex: 1,
    	region : 'center',
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
        	{header: "创建时间", width: 150, sortable: true, dataIndex: 'create_date'},
        	{header: "备注", width: 130, sortable: true, dataIndex: 'memo'},
        	{header: "is_delete", width: 130, sortable: true, dataIndex: 'is_delete',hidden:true}
        ],
		viewConfig : {
			autoFill : true,
			forceFit : true
		},
        tbar: [{
				text : '刷新',
				icon : Ext.zion.image_base+'/refresh.gif',
				tooltip : '刷新记录',
				handler : function() {
		        	Zion.db.getJSON("pipe.management.region.select", null, function(data) {
		        		store.loadData(data);
		        	});
					disableButton();
				},
				scope : this
			}, '-', {
				id : 'bindButton',
				text : '绑定',
				icon : Ext.zion.image_base+'/chart_organisation.png',
				tooltip : '终端绑定路线',
				handler : bindData,
				disabled : true,
				scope : this
			}, '-',{
				id : 'mapButton',
				text : '地图',
				icon : Ext.zion.image_base+'/map_magnify.png',
				tooltip : '显示越界区域',
				handler : function() {
					var sm_ = grid.selModel.getSelections();
					show_map(sm_);
				},
				disabled : true,
				scope : this
			}
        ]
    });
    
    sm.on('rowselect', function() {
    	if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('mapButton').enable();
		} else {
			Ext.getCmp('mapButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('bindButton').enable();
		} else {
			Ext.getCmp('bindButton').disable();
		}
	});
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('mapButton').enable();
		} else {
			Ext.getCmp('mapButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('bindButton').enable();
		} else {
			Ext.getCmp('bindButton').disable();
		}
	});
	
	function disableButton() {
		Ext.getCmp('bindButton').disable();
		Ext.getCmp('mapButton').disable();
	}
	
	function bindData(){
	    var checkedTarget = getCheckedTarget();
	    if(checkedTarget.length <= 0){
	    	Ext.Msg.alert('提示','请选择终端!');
	    	return;
	    }
	    win_show();
	}
	
	
    function win_show(record){
    	
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
		})
	
    	var formPanel = new Ext.form.FormPanel({
			labelWidth : 80,
			frame : true,
			bodyStyle : 'padding:5px 5px 0',
			layout : 'form',
			defaults: {width: 150},
			items : [{
					xtype : 'textfield',
					fieldLabel : '规则名称',
					name : 'region_name',
					id : 'region_name',
					allowBlank : false,
					blankText : '不能为空',
					emptyText:'最长40个字符',
					maxLength:40
				},
			    new Ext.form.ComboBox({
			    	name: 'alarm_name',
			    	store : new Ext.data.SimpleStore({
			    		fields:['alarm_type', 'alarm_name'],
				    	data:[[1,'进区域报警'],[2,'出区域报警'],[3,'进区域触发报警'],[4,'出区域触发报警'],[5,'进出区域触发报警']]
				    }),
				    editable:false,
				    mode: 'local',
				    triggerAction:'all',
				    fieldLabel: '报警类型',
				    displayField:'alarm_name',
				    valueField :'alarm_type',
				    value : 1,
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
		        }),day_value,new Ext.form.ComboBox({
				    	name: 'alarm_delay',
				    	store : new Ext.data.SimpleStore({
				    		fields:['alarm_delay', 'alarm_delay_value'],
					    	data:[[0,'无延时'],[60,'1分钟'],[120,'2分钟'],[300,'5分钟'],[600,'10分钟'],[1800,'30分钟'],[3600,'1小时']]
					    }),
					    mode: 'local',
					    editable:false,
					    triggerAction:'all',
					    fieldLabel: '报警延时',
					    displayField:'alarm_delay_value',
					    valueField :'alarm_delay',
					    value : 0,
					    maxHeight: 200,
						id : 'alarm_delay'
					}),new Ext.form.ComboBox({
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
					}),{
			    	xtype:'textfield',
			    	id:'to_phone',
			    	fieldLabel: '短信通知',
			    	emptyText:'逗号分隔'
			    },{
			    	xtype:'textfield',
			    	id:'to_phone',
			    	fieldLabel: '短信通知',
			    	emptyText:'逗号分隔'
			    },new Ext.form.ComboBox({
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
			title : '越界报警设置',
			closable : true,
			closeAction : 'close',
			autoWidth : false,
			width : 300,
			items : [ formPanel ],
			buttons : [{
				text : '保存',
				id : 'save',
				handler : function() {
					var sm_ = grid.selModel.getSelections();
			    	if (sm_.length > 0) {
			    		if (Ext.getCmp('region_name').getValue().length > 40)  {
							return false;
						}
						if(Ext.getCmp('region_name').getValue() == ""){
							Ext.Msg.alert('提示','规则名称必须填写');
							return ;
						}
						Ext.Msg.confirm('绑定确认', '你是否确认绑定选中的记录？', function(btn) {
							if (btn == 'yes') {
								loadMask.msg = "绑定中，请稍后 ...";
								loadMask.show();
								var checkedTarget = getCheckedTarget();
								deleteNext(checkedTarget);
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
    
    var deleteNext = function(target_ids_){
		var ids = [];
		var checkedTarget = getCheckedTarget();
		var sm_ = grid.selModel.getSelections();
		var region_name = Ext.getCmp('region_name').getValue();
		var alarm_type = Ext.getCmp('alarm_type').getValue();
		var start_time = Ext.getCmp('start_time').getValue();
		var end_time = Ext.getCmp('end_time').getValue();
		var new_start_time = start_time.split(":");
		var start_ = new_start_time[0]*3600+new_start_time[1]*60;
		var new_end_time = end_time.split(":");
		var end_ = new_end_time[0]*3600+new_end_time[1]*60;
		var week_flag = 0;
		for (var i = 0; i < day_value.items.length; i++){  
			if (day_value.items.itemAt(i).checked){  
				var value = day_value.items.itemAt(i).inputValue;
				week_flag |= (1 << value);
            }  
        }  
     	
        var alarm_delay = Ext.getCmp("alarm_delay").getValue();
        var alarm_times = Ext.getCmp("alarm_times").getValue();
        var is_alarm = Ext.getCmp("is_alarm").getValue();
        var to_phone = Ext.getCmp("to_phone").getValue();
		for ( var i = 0; i < sm_.length; i += 1) {
			var member = sm_[i].data;
			if (member) {
				for(var j = 0;j < checkedTarget.length ; j +=1){
					ids.push({t:checkedTarget[j], s:member.region_id,re:region_name
						, at:alarm_type, st:start_
						, et:end_,we:week_flag,al:alarm_delay,ala:alarm_times,is:is_alarm,tp:to_phone});
				}
			}
		}
		if (ids.length > 0) {
			insertNext(ids);
		}
    }
    
    var insertNext = function(ids){
    	if(ids.length > 0){
    		Ext.zion.db.getJSON("axiom_seq_analyze_t_region_id.select", null,function(data) {
				if (data.r != 0 && data.r) {
					var params = [];
		    		var id = ids.pop();
		    		var target_id = id.t;
					var to_phone = id.tp;
					var region_id = data.r[0][0];
		    		params.push(data.r[0][0]);
		    		params.push(id.re);
		    		params.push(id.s);
		    		params.push(id.at);
		    		params.push(id.st);
		    		params.push(id.et);
		    		params.push(id.we);
		    		params.push(id.is);
		    		params.push(id.al);
		    		params.push(id.ala);
    				Ext.zion.db.getJSON("axiom_analyze_target_region.insert", params,function(data) {
    					if(data.r){
    						Zion.db.getJSON('analyze_target_rule_region.id.select',null,function(data){
    							if(data.r){
    								var id = data.r[0][0];
    								Zion.db.getJSON('analyze_target_rule_region.insert',[id,target_id,region_id,to_phone],function(data){
		    							insertNext(ids);
		    						})
    							}else{
    								Ext.Msg.alert("提示", '绑定错误');
    							}
    						})
    						
    					}
					});
    			}else{
					Ext.Msg.alert("提示", data.f);
    			}
    		})
    	}else{
    		Ext.Msg.alert("提示", "绑定成功!");
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
    
	var mapwin = new Ext.Window({
        layout: 'fit',
        closeAction: 'hide',
        width:400,
        height:400,
        items: {
			layout : 'fit',
			contentEl : 'map_canvas',
			width:600,
            height:500,
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
		}
    });
	
    function show_map(sm_){
    	mapwin.show();
    	var member = sm_[0].data;
    	if(member){
			map.clearOverlays();
    		var points_arr = member.points.split(';');
        	if(points_arr.length<=1){
        		Ext.Msg.alert('提示','错误数据');
        		return;
        	}
        	var points_ = [];
			var xy_arr = points_arr[0].split(',');
			var x = xy_arr[0];
			var y = xy_arr[1];
			for(var i = 0;i < points_arr.length;i += 1){
				var xy_arr_ = points_arr[i].split(',');
				points_.push(new GLatLng(xy_arr_[1],xy_arr_[0]));
			}
			points_.push(new GLatLng(y,x));
			var Polygon = new GPolygon(points_,'#FF0000',3,0.5,'#ffff00',0.5)
			var bounds = Polygon.getBounds();
			map.addOverlay(Polygon); 
			map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
			setDefaultMapUI(map);
    	}
    }

    var target_sm = new Ext.grid.CheckboxSelectionModel({});
	var target_store = new Ext.data.ArrayStore({
		root: 'r',
		fields: [
		    'region_id','region_name','points','analyze_id',
		    'analyze_type','start_time','end_time',
		    'week_flag','is_alarm','alarm_delay','alarm_times',
		    'to_phone','analyze_rule_region_id','target_id'
		]
	});

    var target_grid = new Ext.grid.GridPanel({
    	//margins : '5 0 0 0',
    	//heigth : 300,
    	title: '监控目标已绑定越界报警列表',
    	flex: 1,
    	region : 'south',
        store: target_store,
        sm : target_sm,
        enableColumnHide : false,
        loadMask : {msg:'查询中...'},
        columns: [
        	target_sm,
        	new Ext.grid.RowNumberer({header:'序号',width:35}),
        	{id:'region_id',header: "region_id", width: 10, sortable: true, dataIndex: 'region_id',hidden:true},
            {header: '规则名称', width: 130, sortable: true, dataIndex: 'region_name'},
        	{header: "points", width: 10, sortable: true, dataIndex: 'points',hidden:true},
        	{header: "analyze_id", width: 10, sortable: true, dataIndex: 'analyze_id',hidden:true},
        	{header: "报警类型", width: 130, sortable: true, dataIndex: 'analyze_type',renderer:function(val){
        		if(val == 1){return '进区域报警';}else if(val == 2){return '出区域报警';}else if(val == 3){return '进区域触发报警';}else if(val == 4){return '出区域触发报警';}else if(val ==5){return "进出区域触发报警";}else{return '未知';}
        	}},
        	{header: "报警开始时间", width: 130, sortable: true, dataIndex: 'start_time',renderer:timeRender},
        	{header: "报警结束时间", width: 130, sortable: true, dataIndex: 'end_time',renderer:timeRender},
        	{header: "is_alarm", width: 130, sortable: true, dataIndex: 'is_alarm',hidden:true},
        	{header: "报警周期", width: 150, sortable: true, dataIndex: 'week_flag',hidden:true},
        	{header: "报警次数", width: 130, sortable: true, dataIndex: 'alarm_times',renderer:function(alarm_times){if(alarm_times == 0){return "无限次数";}else{return alarm_times}}},
        	{header: "短信通知", width: 130, sortable: true, dataIndex: 'to_phone'},
        	{header: "车辆ID", width: 130, sortable: true, dataIndex: 'target_id',hidden:true}

        ],
		viewConfig : {
			//autoFill : true,
			//forceFit : true
		},
        tbar: [{
				text : '删除',
				id : 'deleteButton_',
				icon : Ext.zion.image_base+'/delete.gif',
				tooltip : '删除记录',
				scope : this,
				handler: deleteData,
				disabled : true
            }/*, '-', {
				text : '刷新',
				icon : Ext.zion.image_base+'/refresh.gif',
				tooltip : '刷新记录',
				handler : function() {
					//grid.store.reload();
					//disableButton();
				},
				scope : this
			}, '-', {
				//id : 'bindButton',
				text : '绑定',
				icon : Ext.zion.image_base+'/refresh.gif',
				tooltip : '终端绑定路线',
				//handler : bindData,
				disabled : true,
				scope : this
			}, '-'*/
        	,{
        		id : 'mapButton_',
				text : '地图',
				icon : Ext.zion.image_base+'/map_magnify.png',
				tooltip : '显示越界区域',
				handler : function() {
        			var sm_ = target_grid.selModel.getSelections();
					show_map(sm_);
				},
				scope : this,
				disabled : true
			}
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
							params.push({t_id:member.target_id,id:member.region_id ,index:sm[i]});
						} else {
							target_store.remove(target_store.getAt(i));
						}
					}
					
					var deleteNext = function(params) {
						if (params.length > 0) {
							var param = params.pop();
							target_store.remove(param.index);
							
							Ext.zion.db.getJSON("axiom_analyze_target_region.region_id.delete", [param.t_id,param.id ], function(data) {
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
    	if (target_grid.selModel.getSelections().length == 1) {
			Ext.getCmp('mapButton_').enable();
		} else {
			Ext.getCmp('mapButton_').disable();
		}
		if (target_grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton_').enable();
		} else {
			Ext.getCmp('deleteButton_').disable();
		}
	});
    
    target_sm.on('rowdeselect', function() {
		if (target_grid.selModel.getSelections().length == 1) {
			Ext.getCmp('mapButton_').enable();
		} else {
			Ext.getCmp('mapButton_').disable();
		}
		if (target_grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton_').enable();
		} else {
			Ext.getCmp('deleteButton_').disable();
		}
	});
	
    function disableButton_() {
		Ext.getCmp('mapButton_').disable();
		Ext.getCmp('deleteButton_').disable();
	}
    
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

    var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);
	
	Ext.zion.tree.loadTargetTree(function(tree) {
		Zion.db.getJSON("pipe.management.region.select", null, function(data) {
			store.loadData(data);
		});
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		loadMask.hide();
	},true);

});

Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var gps_project = false;
	var is_approve=false;
	var fields = [ 'id','pgd_id', 'company', 'work_type', 'number_plates',
					'wagon_id', 'acc_status', 'gps_status', 'gps_date',
					'wagon_status', 'memo','approve','approve_memo' ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "project.maintain.gps_project_approve.select"
		},
		root : "r",
		fields : fields
	});
	var sm = new Ext.grid.CheckboxSelectionModel({singleSelect : true});

	var select_data = [["project.maintain.gps_project_approve.select",'所有'],["project.maintain.gps_project_approve.query.work_type",'工作性质'],["project.maintain.gps_project_approve.query.number_plates",'车牌号码']];
	var selelct_store =  new Ext.data.SimpleStore( {
		fields : [ 'type', 'name' ],
		data : select_data
	});
	var select_combo = new Ext.form.ComboBox( {
		hiddenName : 'type',
		valueField : 'type',
		store : selelct_store,
		displayField : 'name',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		anchor : '95%',
		listeners : {
			'select' : function (index){
				var objv = this.getValue();
				if(objv=="reward_system.select"){
					Ext.getCmp('term').setValue('');
					Ext.getCmp('term').disable();
				}else{
					Ext.getCmp('term').enable();
				}
			
			}
		}
	});
	select_combo.setValue(select_data[0][0]);
	
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {
//			Ext.getCmp('editButton').enable();
			var sm_ch = grid.getSelectionModel().getSelected();
			var params_terminal_id = -1;
			if(sm_ch.data.id){
				params_terminal_id = sm_ch.data.id;			
			}
			grid_msg_info.store.constructor( {
				db : {
					params : [params_terminal_id],
					alias : 'project.maintain.gps_msg_reply.search'
				},
				root : "r",
				fields : fields_msg_info
			});
			grid_msg_info.store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			})
			
		} else {
//			Ext.getCmp('editButton').disable();
		}
		
	})
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
//			Ext.getCmp('editButton').enable();
		} else {
//			Ext.getCmp('editButton').disable();
		}
	})
	var id = []; // 编号
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		autoScroll : true,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'id',
			sortable : true
		}, {
			header : "派工单号",
			dataIndex : 'pgd_id',
			sortable : true,
			renderer : function(value){
				return "WXPD"+value;
			}
		}, {
			header : "单位名称",
			dataIndex : 'company',
			sortable : true
		}, {
			header : "工作性质",
			dataIndex : 'work_type',
			sortable : true
		}, {
			header : "车牌号码",
			dataIndex : 'number_plates',
			sortable : true
		}, {
			header : "车台ID",
			dataIndex : 'wagon_id',
			sortable : true
		}, {
			header : "ACC状态",
			dataIndex : 'acc_status',
			sortable : true
		}, {
			header : "GPS状态",
			dataIndex : 'gps_status',
			sortable : true
		}, {
			header : "GPS时间",
			dataIndex : 'gps_date',
			sortable : true
		}, {
			header : "车台类型",
			dataIndex : 'wagon_status',
			sortable : true
		}, {
			header : "备注",
			dataIndex : 'memo',
			sortable : true
		}, {
			header : "审批:通过/不通过",
			dataIndex : 'approve',
			sortable : true,
			width : 120,
			renderer:function(approve){
				if(approve ==2){
					return '<img src="'+Ext.zion.image_base+'/cancel.png'+'" alt="未通过"></img>';//"未通过";
				}else if(approve ==1){
					return '<img src="'+Ext.zion.image_base+'/accept.png'+'" alt="通过"></img>';//"通过";
				}else{
					return '<img src="'+Ext.zion.image_base+'/exclamation.png'+'" alt="未审核"></img>';//"未审核";
				}
			}
		}, {
			header : "审核备注",
			dataIndex : 'approve_memo',
			sortable : true
		} ],
		tbar : [],
		// 第二个toolbar
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : [ '请根据',select_combo, {
						xtype : 'textfield',
						width : 150,
						name:'term',
						id : 'term',
						disabled:true
					}, {
						text : '查询',
						icon : Ext.zion.image_base+'/select.gif',
						handler : selectForm
					} ]
				})
				tbar.render(this.tbar);
			},
			'cellclick' : function(this_,rowIndex,columnIndex,eObj){
				if(columnIndex!=12){
					return null;
				}
			    var record = grid.getStore().getAt(rowIndex);  // Get the Record
			    var fieldName = grid.getColumnModel().getDataIndex(columnIndex); // Get field name
			    var data = record.get('id');
			    var approveV = record.get('approve');
			    if(!data){
			    	Ext.Msg.alert('警告','记录消失');
			    	return false;
			    }
			    if(approveV==2){
			    	approveV = 1;
			    }else{
			    	approveV = 2;
			    }
			    Ext.zion.db.getJSON('project.maintain.terminal.gps_project_pass.update',[approveV,data],function(data){
			    	if(data.f){
			    		Ext.Msg.alert('警告','审批失败！');
			    	}else{
			    		grid.getStore().reload();
			    		grid_msg_info.getStore().removeAll(false);
			    	}
			    
			    },this);
							
			}
		},
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});
	store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});

	// ///////////////////////////////////////////////////////////////////////////////////
	// ----------gird-form表单---------
	// ///////////////////////////////////////////////////////////////////////////////////
	var fields_msg_info = [ 'id','deal_order_id','gps_project_id','company','work_type','number_plates','wagon_id',
			'wagon_status','sim_number','sim_status','acc_status','gps_status','gps_time','detect_result','memo'];
	var store_msg_info = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "project.maintain.gps_msg_reply.search",
			params : [-1]
		},
		root : "r",
		fields : fields_msg_info
	});

	var grid_msg_info = new Ext.grid.GridPanel( {
		store : store_msg_info,
		autoHeight : false,
		height : 240,
		autoScroll : true,
		columns : [{
			header : "序号",
			dataIndex : 'id',
			sortable : true
		}, {
			header : "派工单号",
			dataIndex : 'deal_order_id',
			sortable : true,
			renderer: function(value){
				if(value!='WXDD'&&value!=null){
					return ''+value;
				}else{
					return 'null';
				}
			}
		}, {
			header : "单位名称",
			dataIndex : 'company',
			sortable : true
		}, {
			header : "工作性质",
			dataIndex : 'work_type',
			sortable : true				
		}, {
			header : "车牌号码",
			dataIndex : 'number_plates',
			sortable : true				
		}, {
			header : "车台ID",
			dataIndex : 'wagon_id',
			sortable : true
		}, {
			header : "车台类型",
			dataIndex : 'wagon_status',
			sortable : true
		}, {
			header : "数据卡号",
			dataIndex : 'sim_number',
			sortable : true
		}, {
			header : "数据卡状态",
			dataIndex : 'sim_status',
			sortable : true	
		}, {
			header : "ACC状态",
			dataIndex : 'acc_status',
			sortable : true
		}, {
			header : "GPS状态",
			dataIndex : 'gps_status',
			sortable : true
		}, {
			header : "GPS时间",
			dataIndex : 'gps_time',
			sortable : true
		}, {
			header : "检测结果",
			dataIndex : 'detect_result',
			sortable : true
		}, {
			header : "回复备注",
			dataIndex : 'memo',
			sortable : true
		} ],
		// 第二个toolbar
		bbar : new Ext.PagingToolbar( {
			store : store_msg_info,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : false,
			forceFit : false
		},
		listeners : {
			rowclick : function( this_, rowIndex, e ){
				var temp_record = grid.getStore().data.get(rowIndex);
				showGpsMsgInfo(temp_record);
			}
		}
	});
	store_msg_info.load({
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});

	var gps_msg_Info = new Ext.grid.PropertyGrid( {
//		title : '属性信息',
//		collapsible : true,
		region : 'south',
		autoHeight : false,
		height : 240,
      viewConfig : {
            forceFit:true,
            scrollOffset:0 // 没有滚动条
        },
  		
		selModel : new Ext.grid.RowSelectionModel( {
			singleSelect : true
		}),
		source : {
			'派工单号' : '',
			'单位名称' : '',
			'车牌号码' : '',
			'车台ID' : '',
			'车台类型' : '',
			'数据卡号' : '',
			'数据卡状态' : '',
			'ACC状态' : '',
			'GPS状态' : '',
			'检测结果' : ''
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

	
	var gridForm = new Ext.form.FormPanel({
        id: 'company-form',
        frame: true,
        labelAlign: 'left',
        autoWidth : true,
        autoHeight : false,
        height : 400,
        layout: 'column',    // Specifies that the items will now be arranged in columns
        items: [{
	            columnWidth: .7,
	            layout: 'fit',
	            items: grid_msg_info},{
            	columnWidth : .3,
            	layout : 'fit',
            	items : gps_msg_Info
            }
        ]
    });

	function showGpsMsgInfo(temp_record) {
		gps_msg_Info.setSource( {
			'派工单号' : 'WXDD'+temp_record.get('deal_order_id'),
			'单位名称' : temp_record.get('company'),
			'车牌号码' : temp_record.get('number_plates'),
			'车台ID' : temp_record.get('wagon_id'),
			'车台类型' : temp_record.get('wagon_status'),
			'数据卡号' : temp_record.get('sim_number'),
			'数据卡状态' : temp_record.get('sim_status'),
			'ACC状态' : temp_record.get('acc_status'),
			'GPS状态' : temp_record.get('gps_status'),
			'检测结果' : temp_record.get('detect_result')
		});
	}


	// 修改操作
	function updagte_gps_project(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var sm = grid.getSelectionModel().getSelected();
		var id = sm.data.id;
		var approve = formPanel.findField("approve").getGroupValue();
		var approve_memo = formPanel.findField("approve_memo").getValue();
		var params = [approve,approve_memo,id];
		Ext.zion.db.getJSON("project.maintain.gps_project_approve.update", params,
				function(data) {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "数据修改成功");
						win.close();
						grid.store.reload();
//						Ext.getCmp('editButton').disable();
					} else {
						Ext.Msg.alert("提示", "数据修改错误");
					}
				});
	}
	// ----------修改window表单---------
	function update_form() {
		gps_project = false;
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		if (!sm) {
			Ext.Msg.alert("修改操作", "请选择要修改的项");
		} else if (sm_num > 1) {
			Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
		} else {
			var approve = sm.data.approve;
			if( approve ==1){
				 is_approve = true;
			 } else {
				 is_approve = false;
			 }
			win_show();
			formPanel.form.loadRecord(sm);
			Ext.getCmp('pgd_id').setValue('WXPD'+sm.get('pgd_id'));
		}
	}
	// 查询form
	function selectForm() {
		var type = select_combo.getValue();
		var term = $('#term').val();
		var paramsA;
		if (!Ext.getCmp('term').disabled) {
			paramsA = [ term ];
		}
		grid.store.constructor( {
			db : {
				params : paramsA,
				alias : type
			},
			root : "r",
			fields : fields
		});
		grid.store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		})
//		Ext.getCmp('editButton').disable();
	}

	// grid自适应
	var view = new Ext.Viewport( {
		layout : 'vbox',
		layoutConfig : {
			align : 'stretch',
			pack : 'start'
		},
		collapsible : true,
		split : true,
		width : 210,
		minSize : 100,
		maxSize : 250,
		items : [ {
			xtype : 'panel',
			title : '终端工作表列表',
			layout : 'fit',
			flex : 1,
			items : [ grid ]
		}, {
			xtype : 'panel',
			title : '终端回复信息',
			layout : 'fit',
			flex : 1,
			items : [ gridForm ]
		} ]
	});

})


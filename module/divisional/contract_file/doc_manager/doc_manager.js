Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var manager_data  = false;
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "muchun.relate_company_file.select"
		},
		root : "r",
		fields : [ 'id','file_id','approval_part','approvaler','file_type',
		           'file_title','file_simple','approval_date','appraval_reason','approval_memo','approve','memo','be_checker','memo_lead' ]
	});
	var sm = new Ext.grid.CheckboxSelectionModel();
	var id = []; 
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'id',
			sortable : true
		}, {
			header : "公文编号",
			dataIndex : 'file_id',
			sortable : true
		}, {
			header : "申请部门",
			dataIndex : 'approval_part',
			sortable : true
		}, {
			header : "申请人",
			dataIndex : 'approvaler',
			sortable : true
		}, {
			header : "公文类型",
			dataIndex : 'file_type',
			sortable : true
		}, {
			header : "公文题目",
			dataIndex : 'file_title',
			maxLength:16,
			sortable : true
		}, {
			header : "内容简述",
			dataIndex : 'file_simple',
			maxLength:64,
			sortable : true,
			renderer : function(value){
				return "<span style='display:table;width:100%;' qtip="+value+">"+value+"</span>";
			}
		}, {
			header : "申请时间",
			dataIndex : 'approval_date',
			sortable : true
		}
//		, {
//			header : "申请理由",
//			maxLength:128,
//			dataIndex : 'appraval_reason',
//			sortable : true
//		}
		, {
			header : "申请备注",
			dataIndex : 'approval_memo',
			maxLength:512,
			sortable : true
		}, {
			header : "申请状态",
			dataIndex : 'approve',
			sortable : true,
			renderer : function(approve) {
				if (approve == 0) {
					return "未审核";
				} else if (approve == 1) {
					return "审核通过";
				} else {
					return "审核未通过";
				}
			}
		},{
			header : "部门意见",
			dataIndex : 'memo',
			sortable : true
		},{
			header : "审核人",
			dataIndex : 'be_checker',
			sortable : true
		},{
			header : "领导意见",
			dataIndex : 'memo_lead',
			sortable : true
		} ],
		tbar : [{
			id : 'editButton',
			text : '公文提交管理',
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '部门公文提交部门领导',
			handler : updateForm,
			disabled : true,
			scope : this
		}, '-',{
			id : 'returnButton',
			text : '公文退回管理',
			icon : Ext.zion.image_base+'/cross.png',
			tooltip : '部门公文退回部门经理',
			handler : returnForm,
			disabled : true,
			scope : this
		}, '-',{
			id : 'dispatchButton',
			text : '公文下发',
			icon : Ext.zion.image_base+'/arrow_divide.png',
			tooltip : '按领导指示向下分发',
			handler : dispatchForm,
			disabled : true,
			scope : this
		}, '-',{
			id : 'browseButton',
			text : '公文查看',
			icon : Ext.zion.image_base+'/book_open.png',
			tooltip : '查看部门提交或领导分发的公文',
			handler : browseFile,
			disabled : true,
			scope : this
		}, '-', {
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新纪录',
			handler : function() {
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('returnButton').disable();
				Ext.getCmp('browseButton').disable();
				Ext.getCmp('dispatchButton').disable();
			},
			scope : this
		} ],
		// 第二个toolbar
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : [ '请根据', {
						xtype : 'textfield',
						width : 150,
						id : 'term'
					}, {
						text : '查询',
						tooltip : '查询',
						icon : Ext.zion.image_base+'/select.gif'
					} ]
				})
				//tbar.render(this.tbar);

			}
		},
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : true
		}
	});

	store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
	
	

//==============grid 选中事件==================		
	sm.on('rowselect', function() {
		if (grid.getSelectionModel().getCount() > 0) {
			Ext.getCmp('editButton').enable();
			Ext.getCmp('returnButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
			Ext.getCmp('returnButton').disable();
		}

		if (grid.getSelectionModel().getCount() == 1) {
			Ext.getCmp('browseButton').enable();
			Ext.getCmp('dispatchButton').enable();
		} else {
			Ext.getCmp('browseButton').disable();
			Ext.getCmp('dispatchButton').disable();
		}

	})
	sm.on('rowdeselect', function() {
		if (grid.getSelectionModel().getCount() > 0) {
			Ext.getCmp('editButton').enable();
			Ext.getCmp('returnButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
			Ext.getCmp('returnButton').disable();
		}
		if (grid.getSelectionModel().getCount() == 1) {
			Ext.getCmp('browseButton').enable();
			Ext.getCmp('dispatchButton').enable();
		} else {
			Ext.getCmp('browseButton').disable();
			Ext.getCmp('dispatchButton').disable();
		}

	})
		
	
	
	
	grid.addListener('rowdblclick', browseFile);
	function update_manager_data(grid, rowIndex, e) {
		manager_data = false;
		updateForm();
	}
	function win_show(value){
		formPanel = new Ext.form.FormPanel( {
			labelWidth : 65,
			frame : true,
			bodyStyle : 'padding:5px 5px 0',
			height:200,
			items : [ {
				layout : 'column',
				items : [ {
					columnWidth : .48,
					layout : 'form',
					defaultType : 'textfield',
					items : [ {
						name : 'id',
						hidden : true,
						hideLabel : true
					},{
						fieldLabel : '编号',
						name : 'file_id',
						disabled:true
					}, {
						fieldLabel : '申请部门',
						name : 'approval_part',
						disabled:true
					}, {
						fieldLabel : '申请人',
						name : 'approvaler',
						disabled:true
					}, {
						fieldLabel : '公文类型',
						name : 'file_type',
						disabled:true
					},{
						fieldLabel : '公文标题',
						name : 'file_title',
						disabled:true
					}, {
						xtype : 'textarea',
						fieldLabel : '内容简述',
						name : 'file_simple',
						disabled:true
					}, {
						fieldLabel : '申请备注',
						name : 'approval_memo',
						id : 'approval_memo',
						xtype:'textarea',
						disabled:true
					}]
				}, {
					columnWidth : .48,
					layout : 'form',
					defaultType : 'textfield',
					items : [ {
						fieldLabel : '申请日期',
						name : 'approval_date',
						disabled:true
					},{
						fieldLabel : '部门意见',
						name : 'memo',
						xtype:'textarea',
						maxLength:512,
						disabled:true
					},{
						fieldLabel : '领导意见',
						name : 'memo_lead',
						xtype:'textarea',
						maxLength:512,
						disabled:true
					}]
				}]
			}]
		})

		// ----window表单----
		win = new Ext.Window( {
			title : '部门审阅',
			closable : true,
			autoWidth:false,
			autoHeight:false,
			width : 700,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				id:'save_id',
				handler : function(){
					if(manager_data){
//						add_manager_Form(formPanel,win);
					}else{
						update_manager_Form(formPanel,win);
					}
				}
			}, {
				id:'cancle_id',
				text : '取消',
				handler : function() {
					formPanel.form.reset();
					win.close();
				}
			} ]
		})
		if(!value){
			Ext.getCmp("save_id").disable();
		}
	    win.show();
	}

//	================文件提交领导窗口=================
	
	function dispart_lead_show(){

		var leader_store = new Ext.zion.db.ArrayStore( {
			db : {
				alias : "divisional.lead_list_user.select"
			},
			root : "r",
			fields : [ 'user_id','login_name','user_name','corp_id','enable' ]
		});
		var leader_sm = new Ext.grid.CheckboxSelectionModel({singleSelect : true});
		var leader_grid = new Ext.grid.GridPanel({
			store : leader_store,
			sm : leader_sm,
//			height : 300,
			autoScroll : true,
			columns : [
				leader_sm ,
			    {header: "序号", dataIndex: 'user_id', width:50, sortable: true},  
	            {header: "用户名", dataIndex: 'user_name', width:80, sortable: true}  
				
			]
		});
		leader_store.load();
		
		var leader_win = new Ext.Window( {
			title : '领导列表',
			hideBorders : true,
			closable : true,
			autoWidth:false,
			autoHeight:false,
			width : 240,
			height : 300,
//			items : [ treep ],
			items : [ leader_grid ],
			buttons : [
				{
					text : '公文提交',
					handler : function(){
						send_leader(leader_grid,leader_win);
					}
				},
				{
					text : '关闭',
					handler : function(){
						leader_win.close();
					}
				}
			]
		})
	    leader_win.show();
	}

//	=================文件分发职工窗口==============
	
	function dispatch_user_show(){

		var user_store = new Ext.zion.db.ArrayStore({
			db : {
				alias : "divisional.dispatch_list_user.select"
			},
			root : "r",
			fields : [ 'user_id','login_name','user_name','telephone','corp_id','post_name' ]
		});
		var user_sm = new Ext.grid.CheckboxSelectionModel({singleSelect : false});
		var user_grid = new Ext.grid.GridPanel({
			store : user_store,
			sm : user_sm,
			autoWidth : true,
//			autoHeight : true,
			autoScroll : true,
			columns : [
				user_sm ,
			    {header: "序号", dataIndex: 'user_id', width:50, sortable: true},  
	            {header: "用户名", dataIndex: 'user_name', width:80, sortable: true},
				{header: "职务", dataIndex: 'post_name', width:80, sortable: true},
				{header: "电话", dataIndex: 'telephone', width:80, sortable: true}
			],
			bbar : new Ext.PagingToolbar( {
				store : user_store,
				pageSize : Ext.zion.page.limit,
				displayInfo : true
			}),
			viewConfig : {
				autoFill : true
			}

		});
		user_store.load({
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
		
//	==================信息表单显示页面============
		formPanel = new Ext.form.FormPanel( {
			labelWidth : 65,
			frame : true,
			bodyStyle : 'padding:5px 5px 5px',
			items : [ {
				layout : 'column',
				items : [ {
					columnWidth : .48,
					layout : 'form',
					defaultType : 'textfield',
					items : [ {
//						id :'file_id',
						name : 'id',
						hidden : true,
						hideLabel : true
					},{
						fieldLabel : '编号',
						name : 'file_id',
						disabled:true
					}, {
						fieldLabel : '申请部门',
						name : 'approval_part',
						disabled:true
					}, {
						fieldLabel : '申请人',
						name : 'approvaler',
						disabled:true
					}, {
						fieldLabel : '公文类型',
						name : 'file_type',
						disabled:true
					},{
						fieldLabel : '公文标题',
						name : 'file_title',
						disabled:true
					}, {
						xtype : 'textarea',
						fieldLabel : '内容简述',
						name : 'file_simple',
						disabled:true
					}, {
						fieldLabel : '申请备注',
						name : 'approval_memo',
						id : 'approval_memo',
						xtype:'textarea',
						disabled:true
					},{
						fieldLabel : '申请日期',
						name : 'approval_date',
						disabled:true
					},{
						fieldLabel : '部门意见',
						name : 'memo',
						xtype:'textarea',
						maxLength:512,
						disabled:true
					},{
						fieldLabel : '领导意见',
						name : 'memo_lead',
						xtype:'textarea',
						maxLength:512,
						disabled:true
					}]
				}, {
					columnWidth : .48,
					layout : 'form',
					defaultType : 'textfield',
					items : [user_grid ]
				}]
			}]
		})

		// ----window表单----
		win = new Ext.Window( {
			title : '公文下发',
			closable : true,
			autoWidth:false,
			autoHeight:false,
			width : 700,
			items : [ formPanel ],
			buttons : [ {
				text : '分发',
				id:'save_id',
				handler : function(){
					dispatch_save(formPanel,user_grid,win);
				}
			}, {
				id:'cancle_id',
				text : '取消',
				handler : function() {
					formPanel.form.reset();
					win.close();
				}
			} ]
		})
//		if(!value){
//			Ext.getCmp("save_id").disable();
//		}
		user_grid.setHeight(440);
	    win.show();

	    
	}

	//修改操作
	function update_manager_Form(formPanel,win) {
		if (formPanel.getForm().isValid() == false) {
			return false;
		} else {
			var sm = grid.getSelectionModel().getSelected();
			var id = sm.data.id;
			var relate_memo_all = formPanel.getForm().findField("relate_memo").getValue();
			var company = formPanel.getForm().findField("company").getValue();
			var approve = formPanel.getForm().findField("approve").getGroupValue();
			var company_memo = formPanel.getForm().findField("company_memo").getValue();
			var relte_memo = relate_memo_all+'部门：'+company+','+approve+',部门意见：'+company_memo+'..........';
			var params=[relte_memo,id];
			Ext.zion.db.getJSON(
				"muchun.relate_company_file.update", params,
				function(data) {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "数据修改成功");
						formPanel.form.reset();
						win.close();
						grid.store.reload();
					} else {
						Ext.Msg.alert("提示", "数据修改错误");
					}
			});
		}
	} 
	// ----------修改window表单---------
	function updateForm(){
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		
		if (sm_num != 1) {
			Ext.Msg.alert("修改操作", "请选择一条要修改的项");
		} else {
			dispart_lead_show();
//			return null;
//			win_show();
//			formPanel.form.loadRecord(sm);
		}
	}
//	==============浏览查看公文===========
	function browseFile(){
		var sm = grid.getSelectionModel().getSelected();
		win_show(false);
		formPanel.form.loadRecord(sm);
	
	}
//	=============公文退回操作===============
	function returnForm(){
		
		Ext.Msg.confirm('确认退回','是否确认退回选择文件',function(btn){
			if(btn == 'yes'){
				var sm = grid.getSelectionModel().getSelections();
				for(var i = 0;i<sm.length;i++){
					var params = [];
					params.push(0);
					params.push(sm[i].data.id);
					Ext.zion.db.getJSON("divisional.return_lead_file", params, function(data){
						if ( !data.f ){
							Ext.Msg.alert("提示","退回成功");
							leader_win.close();
						 	grid.store.reload();	
						} else {
							Ext.Msg.alert("提示","数据添加错误");
						}
					});	
					
				}
				
				
			}else{
			}
		
		},this)

	
	}
	
//	==============公文分发操作==============
	function dispatchForm(){
		var sm = grid.getSelectionModel().getSelected();
		dispatch_user_show();
		formPanel.form.loadRecord(sm);
	
	}
	
//	=============公文分发提交===============
	function dispatch_save(formPanel,user_grid,win){
		var params = [];
		var file_id = formPanel.getForm().findField('id').getValue();
		var user_sm = user_grid.getSelectionModel().getSelections();
		if(user_sm.length<=0){
			return null;
		}
		for(var i = 0; i < user_sm.length; i++){
			var temp_p = [];
			temp_p.push(user_sm[i].data.user_id);
			temp_p.push(file_id);
			params.push(temp_p);
		}
//	============修改公文提交领导的属性值，is_send_lead=8分发状态===========
		Ext.zion.db.getJSON("divisional.contract_file.dispatch_param_file",[file_id],function(data){
			if(data.r>0){
				save_user_document(params,win);
			}else{
				Ext.Msg.alert("警告","数据修改出错!");
				return false;
			}
		
		},this)
	}

//	============操作数据的保存============
	function save_user_document(params,win){
		if(params.length<=0){
			win.close();
			grid.store.reload();
			Ext.getCmp('editButton').disable();
			Ext.getCmp('returnButton').disable();
			Ext.getCmp('browseButton').disable();
			Ext.getCmp('dispatchButton').disable();

			return null;
		}
		Ext.zion.db.getJSON('divisional.contract_file.save_user_file',params.pop(),function(data){
			if(data.r>0){
				Ext.Msg.alert("提示","数据保存成功!");
				save_user_document(params,win);
				
			}else{
				Ext.Msg.alert("警告","数据修改错误!");
			}
			
		
		},this)
		
	}


	
//	=============公文提交操作================
	function send_leader(leader_grid,leader_win){
		var sm_leader = leader_grid.getSelectionModel();
		var select_records = sm_leader.getSelections();
		var user_str = '';
		if(sm_leader.getCount()<=0){
			Ext.Msg.alert("公文提交","请选择要提交的公文");
		}else{
			for(var i = 0;i<select_records.length;i++){
				if(i==(select_records.length-1)){
					user_str =user_str + select_records[i].data.user_id;

				}else{
					user_str =user_str + select_records[i].data.user_id+',';
				}
			}
		}
		var sm = grid.getSelectionModel().getSelections();
		for(var i = 0;i<sm.length;i++){
			var params = [];
			params.push(user_str);
			params.push(1);
			params.push(sm[i].data.id);
			Ext.zion.db.getJSON("divisional.send_lead_file", params, function(data){
				if ( !data.f ){
					Ext.Msg.alert("提示","添加成功");
					leader_win.close();
				 	grid.store.reload();	
				} else {
					Ext.Msg.alert("提示","数据添加错误");
				}
			});	
			
		}
		
	}
	var view = new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [ {
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		} ]
	});

})
Ext.onReady(function(){
	Ext.QuickTips.init();
	var formPanel;
	var terminal_add = false;
	var old_id;
	// 终端
	
	var store = new Ext.zion.db.ArrayStore({
		db:{
			alias: "axiom_terminal_type.select"
		},
		root:"r",
		fields : [ 'terminal_type_id', 'terminal_type_name', 'identity', 'memo', 'enable ' ]
	});
	var sm = new Ext.grid.CheckboxSelectionModel();
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
	});
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
	});
	var id = [];  //编号
	var grid = new Ext.grid.GridPanel({  
		 store: store, 
		 sm:sm, 
		 columns: [  
			 sm, 
			 {header: "序号", dataIndex: 'terminal_type_id', width:100, sortable: true},  
			 {header: "类型名称", dataIndex: 'terminal_type_name', width:180, sortable: true},  
			 {header: "类型特征码", dataIndex: 'identity', width:200, sortable: true},  
			 {header: "备注", dataIndex: 'memo', width:250, sortable: true}
		 ],  
		 tbar:[{
			id:'editButton',
			text:'修改',
			disabled:true,
			icon:Ext.zion.image_base+'/update.gif',
			tooltip:'修改记录',
			handler:function(){
				win_show();
			},				
			scope:this
		},{
			text:'刷新',
			icon:Ext.zion.image_base+'/refresh.gif',
			tooltip:'刷新纪录',          
			handler: function(){
				grid.store.reload();
				disableButton();
			},
			scope:this
		}],
		bbar:new Ext.PagingToolbar({
			store: store,
			pageSize: Ext.zion.page.limit,
			displayInfo : true 
		})
	}); 
	store.load({params:{start:0,limit:Ext.zion.page.limit}});

	// 双击列事件
	grid.addListener('rowdblclick',updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e ){
		win_show();
	}
	//按钮不可用
	function disableButton(){
		Ext.getCmp('editButton').disable();
	}

	// ///////////////////////////////////////////////////////////////////////////////////
	// ----------gird-form表单---------
	// ///////////////////////////////////////////////////////////////////////////////////
	function win_show(){
		formPanel=new Ext.form.FormPanel({
			defaultType: 'textfield',
			items: [{
				fieldLabel: '类型名称',
				name: 'terminal_type_name',
				allowBlank: false,
				blankText:'不能为空'
			},{
				fieldLabel: 'ID',
				name: 'terminal_type_id',
				hideLabel:true,
				hidden:true	
			}]						 
		})
		// ----window表单----
		
		var win = new Ext.Window({
			title: '终端类型管理',
			closable:true,
			width:380,
			items:[formPanel],
			buttons: [{
				text: '保存',
				handler:function(){
					update_termital(formPanel.getForm(),win);
				}
			},{
				text: '取消',
				handler:function(){win.close();}
			}]
		});
		win.show();
		var sm = grid.getSelectionModel().getSelected();
		formPanel.form.loadRecord(sm);
	}

	// ----------gird操作---------
	//修改操作
	function update_termital(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var terminal_type_name = formPanel.findField("terminal_type_name").getValue();
		var terminal_type_id = formPanel.findField("terminal_type_id").getValue();
		alert(terminal_type_name+","+terminal_type_id);
		Ext.zion.db.getJSON("axiom_terminal_type.update", [terminal_type_name,terminal_type_id], function(data) {
			if (!data.f) {
				Ext.Msg.alert("提示", "数据修改成功");
				win.close();
				grid.store.reload();	
				disableButton();
			}else {
				Ext.Msg.alert("提示","数据修改错误");
			}
		});
	}

// grid自适应
	var view=new Ext.Viewport({  
		layout:'border',  
		border:false,  
		items:[{  
			region:'center',  
			layout:'fit',  
			items:[grid]  
		}]  
	});	 
})
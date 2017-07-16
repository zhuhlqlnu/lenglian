Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var add_speed = false;
	
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var sm = new Ext.grid.CheckboxSelectionModel({});
	var store = new Ext.data.ArrayStore({
		root: 'r',
		fields: [
			'speed_id','speed_name','speed','duration','corp_id','user_id','create_date','memo','is_delete'
		]
	});

    var grid = new Ext.grid.GridPanel({
    	margins : '5 0 0 0',
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
        	{header: "速度限制(公里/小时)", width: 130, sortable: true, dataIndex: 'speed'},
        	{header: "持续时间(分钟)", width: 130, sortable: true, dataIndex: 'duration'},
        	{header: "corp_id", width: 10, sortable: true, dataIndex: 'corp_id',hidden:true},
        	{header: "user_id", width: 10, sortable: true, dataIndex: 'user_id',hidden:true},
        	{header: "创建时间", width: 150, sortable: true, dataIndex: 'create_date',renderer: function(val){return new Date(val*1000).toLocaleString()}},
        	{header: "备注", width: 130, sortable: true, dataIndex: 'memo'},
        	{header: "is_delete", width: 130, sortable: true, dataIndex: 'is_delete',hidden:true}
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
            		add_speed = true;
            		win_show();
				}
            }, '-', {
				text : '修改',
				id : 'editButton',
				icon : Ext.zion.image_base+'/update.gif',
				tooltip : '修改记录',
				handler : updateForm,
				scope : this,
				disabled:true
			},'-',{
				text : '删除',
				id : 'deleteButton',
				icon : Ext.zion.image_base+'/delete.gif',
				tooltip : '删除记录',
				scope : this,
				handler: deleteForm,
				disabled : true
            }, '-', {
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
			}
        ]
    });
    
 // 删除 form
	var id = [];
	function deleteForm() {
		var sm = grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							id.push(member.speed_id);
						} else {
							store.remove(store.getAt(i));
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
			Ext.zion.db.getJSON("axiom_analyze_speed.delete", [id.pop()],
					function(data) {
						if (data.r != 0 && data.r) {
							Ext.Msg.alert("提示", "删除成功");
						} else {
							Ext.Msg.alert("提示", "删除失败");
						}
						deleNext();
					});
		} else {
			Zion.db.getJSON("axiom_analyze_speed.select", null, function(data) {
				store.loadData(data);
			});
			disableButton();
		}
	}
	
    function updateForm(){
		add_speed = false;
    	var sm = grid.getSelectionModel().getSelected();
		win_show(sm);
		formPanel.form.loadRecord(sm);
	}
    
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
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
		if (grid.selModel.getSelections().length !=0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	});
	
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}
    
    function win_show() {
		formPanel = new Ext.form.FormPanel( {
			labelWidth : 120,
			//width : 200,
			frame : true,
			bodyStyle : 'padding:5px 5px 0',
			//height : 200,
					layout : 'form',
					//autoHeight : true,
					defaultType : 'textfield',
					defaults: {width: 200},
					items : [ {
						fieldLabel : '超速名',
						name : 'speed_name',
						id:'speed_name',
						allowBlank : false,
						blankText : '不能为空',
						//width: 250,
						maxLength : 16
					}, {
						xtype: 'numberfield',
						fieldLabel : '速度限制(公里/小时)',
						name : 'speed',
						id:'speed',
						allowBlank : false,
						blankText : '不能为空',
						//width: 250,
						maxLength : 16
					}, {
						xtype: 'numberfield',
						fieldLabel : '持续时间(分钟)',
						name : 'duration',
						id : 'duration',
						allowBlank : false,
						blankText : '不能为空',
						//width: 250,
						maxLength : 16
					}, new Ext.form.Hidden({
						name : 'corp_id',
						id : 'corp_id'
					}),new Ext.form.Hidden({
						name : 'speed_id',
						id : 'speed_id'
					}), new Ext.form.Hidden({
						name : 'user_id',
						id : 'user_id'
					}),{
						xtype : 'textarea',
						fieldLabel : '备注',
						name : 'memo',
						//width: 250,
						id : 'memo'
					} ]
		});
		
		var win = new Ext.Window( {
			title : '超速设置',
			closable : true,
			closeAction : 'close',
			autoWidth : false,
			width : 370,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				id : 'save',
				handler : function() {
					if (add_speed) {
						add_speed_Form(formPanel.getForm(), win);
					} else {
						update_speed_Form(formPanel.getForm(), win);
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
    
    function add_speed_Form(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		// 增加操作
		var params = Ext.zion.form.getParams(formPanel, [ 'speed_name',
		    'speed', 'duration', 'memo' ]);
		params.push(parseInt(new Date().getTime()/1000));
		Ext.zion.db.getJSON("axiom_analyze_speed.speed_id.nextval.select", null, function(data) {	
			if(data.r && !data.f){
				var alias = 'axiom_analyze_speed.insert';
				params.unshift(data.r[0][0]);
				Ext.zion.db.getJSON(alias, params, function(data) {
					if (data.f) {
						Ext.Msg.alert("提示", "数据添加错误");
					} else {
						if (data.r == 1) {
							Ext.Msg.alert("提示", "数据添加成功");
							win.close();
							Zion.db.getJSON("axiom_analyze_speed.select", null, function(data) {
								store.loadData(data);
							});
							disableButton();
						} else {
							Ext.Msg.alert("提示", "数据添加错误");
						}
					}
				})
			}
		})
	}
    
	function update_speed_Form(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		// 修改操作
		var params = Ext.zion.form.getParams(formPanel, [ 'speed_name',
		    'speed', 'duration', 'memo' ]);
		params.push(Ext.getCmp('speed_id').getValue());
		var alias = 'axiom_analyze_speed.update';
		Ext.zion.db.getJSON(alias, params, function(data) {
			if (data.f) {
				Ext.Msg.alert("提示", "数据修改错误");
			} else {
				if (data.r != 0 && data.r) {
					Ext.Msg.alert("提示", "数据修改成功");
					win.close();
					Zion.db.getJSON("axiom_analyze_speed.select", null, function(data) {
						store.loadData(data);
					});
					disableButton();
				} else {
					Ext.Msg.alert("提示", "数据修改错误");
				}
			}
		});
	}
	
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [ grid ]
	});

	Zion.db.getJSON("axiom_analyze_speed.select", null, function(data) {
		store.loadData(data);
		loadMask.hide();
	});
	
});

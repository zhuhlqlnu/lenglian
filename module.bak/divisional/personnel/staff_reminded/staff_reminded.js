Ext.onReady(function() {
	Ext.QuickTips.init();
	var staff_add = false;
	var fields = ['id', 'name', 'presenter', 'reminded_name', 'reminded_time', 'memo'];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "staff_reminded.select"
		},
		root : "r",
		fields : fields
	});
	var select_data = [ [ "staff_reminded.select", '所有' ],
						[ "staff_reminded.query.name", '员工姓名' ],
						[ "staff_reminded.query.reminded_name", '提示名称' ] ];
				var selelct_store = new Ext.data.SimpleStore( {
					fields : [ 'type', 'name' ],
					data : select_data
				});
				var select_combo = new Ext.form.ComboBox( {
					fieldLabel : '工作表类型',
					hiddenName : 'type',
					valueField : 'type',
					store : selelct_store,
					displayField : 'name',
					mode : 'local',
					editable : false,
					triggerAction : 'all',
					anchor : '95%',
					listeners : {
						'select' : function(index) {
							var objv = this.getValue();
							if (objv == "staff_reminded.select") {
								Ext.getCmp('term').setValue('');
								Ext.getCmp('term').disable();
							} else {
								Ext.getCmp('term').enable();
							}
						}
					}
				});
				select_combo.setValue(select_data[0][0]);
	var sm = new Ext.grid.CheckboxSelectionModel();
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	})
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	})
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		autoScroll:true,
		columns : [
			sm, {
				header : "编号",
				dataIndex : 'id',
				width:50,
				sortable : true
			}, {
				header : "员工姓名",
				dataIndex : 'name',
				width:100,
				sortable : true
			}, {
				header : "提示人",
				width:70,
				dataIndex : 'presenter',
				sortable : true
			}, {
				header : "提示名称",
				width:50,
				dataIndex : 'reminded_name',
				sortable : true
			}, {
				header : "提示时间",
				width:70,
				dataIndex : 'reminded_time',
				sortable : true
			}, {
				header : "备注",
				dataIndex : 'memo',
				sortable : true
			}],
		tbar : [ {
				id : 'addButton',
				text : '新增',
				icon : Ext.zion.image_base+'/add.gif',
				tooltip : '添加新纪录',
				handler : function() {
					staff_add = true;
					staff_reminded_show();
				},
				scope : this
			}, '-',
			{
				id : 'editButton',
				disabled:true,
				text : '修改',
				icon : Ext.zion.image_base+'/update.gif',
				tooltip : '修改记录',
				handler : function(){
					updateForm();
				},
				scope : this
			}, '-', {
				id : 'deleteButton',
				disabled:true,
				text : '删除',
				icon : Ext.zion.image_base+'/delete.gif',
				tooltip : '删除记录',
				handler : deleteForm,
				scope : this
			}, '-', {
				text : '刷新',
				icon : Ext.zion.image_base+'/refresh.gif',
				tooltip : '刷新纪录',
				handler : function() {
					grid.store.reload();
					Ext.getCmp('editButton').disable();
					Ext.getCmp('deleteButton').disable();
				},
				scope : this
			} ,'-',{
				text : '导出报表',
				icon : Ext.zion.image_base+'/report_link.png',
				tooltip : '导出报表',
				handler : function() {
					Ext.Msg
							.alert(
									"下载报表",
									"<a href='"
											+ Zion.report
													.getURL('personnel.staff_reminded')
											+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
				},
				scope : this
			}],
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
						tooltip : '查询',
						icon : Ext.zion.image_base+'/select.gif',
						handler : selectForm
					} ]
				})
				tbar.render(this.tbar);
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

	})
		/////////////////////////////////////////////////////////////////////////////////////
		// ----------form表单---------
	function staff_reminded_show(){
		var address_book_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : [ {
				name : 'address_book_id'
			}, {
				name : 'name'
			} ],
			proxy : new Ext.data.ScriptTagProxy( {
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/address_book.select_id_name'
			})
		});
		var address_book_combo = new Ext.form.ComboBox( {
			fieldLabel : '员工姓名',
			valueField : 'name',
			store : address_book_store,
			hiddenName: 'name',
			displayField : 'name',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			triggerAction : 'all',
			maxLength:12,
			emptyText : '请选择...'
		});
			
		var reminded_time = new Ext.form.DateField( {
			fieldLabel : '提示日期',
			name : 'reminded_time',
			altFormats : 'Y-m-d',
			format : 'Y-m-d',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			minValue : new Date
		})
			
		formPanel=new Ext.form.FormPanel({
		        defaultType: 'textfield',
		        items: [address_book_combo,{
	            	fieldLabel: '提示人',
	                name: 'presenter',
	                maxLength:24,
					allowBlank: false,
					blankText:'不能为空'
	            },{
	            	fieldLabel: '提示名称',
	            	maxLength:32,
	                name: 'reminded_name',
	                allowBlank: false,
					blankText:'不能为空'
	            },reminded_time,{
					fieldLabel : '备注',
					maxLength:512,
					xtype : 'textarea',
					name : 'memo'
	            },{
	            	fieldLabel: 'ID',
	                name: 'id',
	                hideLabel:true,
	                hidden:true	
	            }]						 
			})
		// ----window表单----
		win = new Ext.Window( {
			title : '员工提醒',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function(){
					if(staff_add){
						add_staff_reminded(formPanel.getForm(),win);
					}else{
						update_staff_reminded(formPanel.getForm(),win)
					}
				}
			}, {
				text : '取消',
				handler : function() {
					formPanel.form.reset();
					win.close();
				}
			} ]
		})
		win.show();
	}
	function getParams(form, feilds) {
		var values = form.getFieldValues();
		var params = [];
		for ( var i = 0; i < feilds.length; i++) {
			params.push(values[feilds[i]]);
		}
		return params;
	}
	function add_staff_reminded(formPanel,win){
		if (formPanel.isValid() == false) {
			return false;
		}
		var params = getParams(formPanel, ['name', 'presenter',
						'reminded_name','reminded_time','memo']);
		Ext.zion.db.getJSON("staff_reminded.insert", params, function(data) {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "数据添加成功");
				win.close();
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			} else {
				Ext.Msg.alert("提示", "数据添加错误");
			}
		});	
	}
	function update_staff_reminded(formPanel,win){
		if (formPanel.isValid() == false) {
			return false;
		} 
		var params = getParams(formPanel, ['name', 'presenter',
						'reminded_name','reminded_time','memo','id' ]);
		Ext.zion.db.getJSON("staff_reminded.update", params,function(data) {
			if (data.r == 1) {
				Ext.Msg.alert("提示", "数据修改成功");
				win.close();
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			} else {
				Ext.Msg.alert("提示", "数据修改错误");
			}
		});	
	}
	// ----------修改window表单---------
	function updateForm() {
		staff_add = false;
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		if (!sm) {
			Ext.Msg.alert("修改操作", "请选择要修改的项");
		} else if (sm_num > 1) {
			Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
		} else {
			staff_reminded_show();
			formPanel.form.loadRecord(sm);
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
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}

	// 删除 form
	var id=[];
	function deleteForm() {
		var sm = grid.getSelectionModel().getSelections();
		if (sm.length == 0) {
			Ext.Msg.alert("删除操作", "请选择要删除的项");
		} else {
			if (sm.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
					if (btn == 'yes') {
						for ( var i = 0; i < sm.length; i += 1) {
							var member = sm[i].data;
							if (member) {
								id.push(member.id);
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
	}
	var deleNext = function() {
		if (id.length > 0) {
			Ext.zion.db.getJSON("staff_reminded.delete", [id.pop()],
					function(data) {
						if (data.r == 1) {
							Ext.Msg.alert("提示", "删除成功");
							Ext.getCmp('editButton').disable();
							Ext.getCmp('deleteButton').disable();
						} else {
							Ext.Msg.alert("提示", "删除失败");
						}
						deleNext();
					});
		} else {
			grid.store.reload();
		}
	}
	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		updateForm();
	}
	// grid自适应
	var view = new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [ {
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		}]
	});
})
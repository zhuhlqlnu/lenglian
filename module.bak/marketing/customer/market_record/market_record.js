Ext.onReady(function() {
	Ext.QuickTips.init();
	var id = []; // 编号
	var formPanel;
	var sex_combo;
	var formPanelUpdate;
	var position_combo;
	var customer_data = false;
	var sql_array = [];
	var params_search ;
	var fields;
	fields = ['id', 'company_id', 'company', 'contact', 'name',
						'com_time', 'com_way', 'com_info', 'memo', 'ispassed'];
	
	sql_array.push("marketing.customer.store_marketing.query");
	sql_array.push('marketing.customer.store_marketing_com.query');
	sql_array.push('marketing.customer.store_marketing_cont.query');
	sql_array.push('marketing.customer.store_marketing_cust.query');
	var query_data = [[sql_array[0], '全部'], [sql_array[1], '客户单位'],
			[sql_array[2], '联系人'], [sql_array[3], '客户姓名'] ];
	var query_store = new Ext.data.SimpleStore({
				fields : ['sql_str', 'sql_name'],
				data : query_data
			});
	var select_combo = new Ext.form.ComboBox({
				hiddenName : 'sql_str',
				valueField : 'sql_str',
				store : query_store,
				displayField : 'sql_name',
				emptyText : '--列表条件--',
				mode : 'local',
				editable : false,
				triggerAction : 'all'
			});
	select_combo.setValue(sql_array[0]);
	select_combo.on('select',function(combo,record,index){
		if(combo.getValue()==sql_array[0]){
			Ext.getCmp('term').disable();
			Ext.getCmp('term').setValue('');
		}else{
			Ext.getCmp('term').enable();
		}
	
	},this);
	
//===============查询combox===============	
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : sql_array[0]
				},
				root : "r",
				fields : fields
			});
	var sm = new Ext.grid.CheckboxSelectionModel();
	var grid = new Ext.grid.GridPanel({
				store : store,
				sm : sm,
				columns : [sm, {
							header : "序号",
							dataIndex : 'id',
							sortable : true
						},
							{
							header : "客户单位",
							dataIndex : 'company',
							sortable : true
						}, {
							header : "联系人",
							dataIndex : 'contact',
							sortable : true
						}, {
							header : "客户名字",
							dataIndex : 'name',
							sortable : true
						}, {
							header : "联系时间",
							dataIndex : 'com_time',
							sortable : true
						}, {
							header : "联系方式",
							dataIndex : 'com_way',
							sortable : true
						}, {
							header : "联系内容",
							dataIndex : 'com_info',
							sortable : true
						},{header: '是否审核', dataIndex: 'ispassed', sortable: true
						, renderer:function(str){
			             	var re_str = '';
			             	if("Y" == str){
			             		re_str = "通过";
			             	}else if("N" == str){
			             		re_str = "不通过";
			             	}else{
			             		re_str = "未审核";
			             	}
			             	return re_str;
			             
			             }
			             }],
				tbar : [{
							id : 'addButton',
							text : '新增',
							icon : Ext.zion.image_base+'/add.gif',
							tooltip : '添加新纪录',
							handler : function() {
								customer_data = true;
								customer_win();
							},
							scope : this
						}, '-',
						{
							id : 'editButton',
							disabled : true,
							text : '修改',
							icon : Ext.zion.image_base+'/update.gif',
							tooltip : '修改记录',
							handler : function() {
								customer_data = false;
								update_Form();
							},
							scope : this
						}, '-', {
							id : 'deleteButton',
							disabled : true,
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
							},
							scope : this
						},'-',
					{
						text : '导出报表',
						icon : Ext.zion.image_base+'/report_link.png',
						tooltip : '导出报表',
						handler : function() {
							Ext.Msg.alert(
											"下载报表",
											"<a href='"+ Zion.report.getURL(select_combo.getValue(),params_search)
													+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
						},
						scope : this
					}],
				// 第二个toolbar
				listeners : {
					'render' : function() {
						var tbar = new Ext.Toolbar({
									items : ['请根据',select_combo,{
												xtype : 'textfield',
												disabled : true,
												id : 'term'
											}, {
												text : '查询',
												tooltip : '查询',
												icon : Ext.zion.image_base+'/select.gif',
												handler : selectForm
											}]
								})
						tbar.render(this.tbar);

					}
				},
				bbar : new Ext.PagingToolbar({
							store : store,
							pageSize : Ext.zion.page.limit,
							displayInfo : true
						}),
				viewConfig : {
					autoFill : true,
					forceFit : true
				}
			});
	store.load({
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
	grid.addListener('rowdblclick', update_customer_data);
	function update_customer_data(grid, rowIndex, e) {
		customer_data = false;
		update_Form();

	}
//===========================grid记录选择事件==========================
			sm.on('rowselect', function() {
				var length = grid.selModel.getSelections().length;
				if (length == 1) {
					Ext.getCmp('editButton').enable();
				} else {
					Ext.getCmp('editButton').disable();
				}
				if (length > 0) {
					Ext.getCmp('deleteButton').enable();
				} else {
					Ext.getCmp('deleteButton').disable();
				}
			})
			sm.on('rowdeselect', function() {
				var length = grid.selModel.getSelections().length;
				if (length == 1) {
					Ext.getCmp('editButton').enable();
				} else {
					Ext.getCmp('editButton').disable();
				}
				if (length > 0) {
					Ext.getCmp('deleteButton').enable();
				} else {
					Ext.getCmp('deleteButton').disable();
				}
			})

	// ///////////////////////////////////////////////////////////////////////////////////
	// ----------form表单---------
	// ///////////////////////////////////////////////////////////////////////////////////
	function customer_win() {
		// ----修改window表单----
		var idU = new Ext.form.TextField({
					name : 'id',
					hidden : true

				});
		var componyIdU = new Ext.form.TextField({
					name : 'company_id',
					hidden : true

				});


		var componAU = new Ext.form.TextField({
					fieldLabel : '客户单位',
					name : 'company',
					allowBlank : false,
					blankText : '不能为空'

				});

		var componBU = new Ext.form.TextField({
					fieldLabel : '联系人',
					name : 'contact',
					allowBlank : false,
					blankText : '不能为空'

				});
		var componCU = new Ext.form.TextField({
					fieldLabel : '客户姓名',
					name : 'name',
					allowBlank : false,
					blankText : '不能为空'

				});

		var componDU = new Ext.form.DateField({
					fieldLabel : '联系时间',
					autoHeight : true,
					allowBlank : false,
					name : 'com_time',
					format : 'Y-m-d'
				});

		var componEU = new Ext.form.TextField({
					fieldLabel : '联系方式',
					name : 'com_way',
					allowBlank : false,
					blankText : '不能为空'

				});
		var componFU = new Ext.form.TextField({
					fieldLabel : '联系内容',
					name : 'com_info',
					allowBlank : false,
					blankText : '不能为空'

				});

		// Ext.form.Field.prototype.msgTarget='side';
		formPanelUpdate = new Ext.form.FormPanel({
					defaultType : 'textfield',
					items : [idU, componAU, componBU, componCU, componDU,
							componEU, componFU]
				})
		winUpdate = new Ext.Window({
			title : '营销记录',
			closable : true,
			closeAction : 'close',
			items : [formPanelUpdate],
			buttons : [{
				text : '保存',
				handler : function() {

					if (customer_data) {
						add_market_record(formPanelUpdate.getForm(), winUpdate);
					} else {
						updateForm(formPanelUpdate, winUpdate)
					}
				}
			}, {
				text : '取消',
				handler : function() {
					formPanelUpdate.form.reset();
					winUpdate.close();
				}
			}]
		})
		winUpdate.show();

	}

	// 添加客户信息
	function add_market_record(formPanelUpdate, winUpdate) {
		if (formPanelUpdate.isValid() == false) {
			return false;
		}
		var params = Ext.zion.form.getParams(formPanelUpdate, [ 'company',
						'contact', 'name', 'com_time', 'com_way', 'com_info',
						'memo']);

		Ext.zion.db.getJSON("muchun.store_marketing.insert", params, function(
						data) {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "添加成功");
						winUpdate.close();
						grid.store.reload();
						Ext.getCmp('editButton').disable();
						Ext.getCmp('deleteButton').disable();
					} else {
						Ext.Msg.alert("提示", "添加失败");
					}
				})

	}
	function updateForm(formPanelUpdate, winUpdate) {
		if (formPanelUpdate.getForm().isValid() == false) {
			return false;
		} else {
			// 修改操作
			var sm = grid.getSelectionModel().getSelected();
			var id = sm.data['id'];
			var params = Ext.zion.form.getParams(formPanelUpdate.form, ['company', 'contact',
							'name', 'com_time', 'com_way', 'com_info', 'id']);
			Ext.zion.db.getJSON("muchun.store_marketing.update", params,
					function(data) {
						if (data.r == 1) {
							Ext.Msg.alert("提示", "修改成功");
							formPanelUpdate.form.reset();
							winUpdate.close();
							grid.store.reload();
							Ext.getCmp('editButton').disable();
							Ext.getCmp('deleteButton').disable();
						} else {
							Ext.Msg.alert("提示", "数据修改错误");
						}
					});

		}
	}

	function update_Form() {
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		if("Y"==sm.data.ispassed||"N"==sm.data.ispassed){
			Ext.Msg.alert("警告","已经审核的数据，不能修改");
			return null;
		}
		if (sm_num != 1) {
			Ext.Msg.alert("修改操作", "请选择要一条修改的项");
		} else {
			customer_win();
			formPanelUpdate.form.loadRecord(sm);
		}
	}

	// 删除客户信息
	var id = [];
	function deleteForm() {
		var sm = grid.getSelectionModel().getSelections();
		if("Y"==sm.data.ispassed||"N"==sm.data.ispassed){
			Ext.Msg.alert("警告","已经审核的数据，不能修改");
			return null;
		}
		if (sm.length == 0) {
			Ext.Msg.alert("删除操作", "请选择要删除的项");
		} else {
			if (sm.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
							if (btn == 'yes') {
								for (var i = 0; i < sm.length; i += 1) {
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
			Ext.zion.db.getJSON("muchun.store_marketing.delete", [id.pop()], function(
							data) {
						if (data.r != 0 || data.r != 'undefined') {
							Ext.Msg.alert("提示", "删除成功");
						} else {
							Ext.Msg.alert("提示", "删除失败");
						}
						deleNext();
					});
		} else {
			grid.store.reload();
			Ext.getCmp('editButton').disable();
			Ext.getCmp('deleteButton').disable();
		}
	}
		// 查询form
	function selectForm() {
		var type = select_combo.getValue();

		var term = Ext.getCmp('term').getValue();
		params_search = [];
		if (!Ext.getCmp('term').disabled) {
			params_search.push(term);
		}

		grid.store.constructor({
					db : {
						params : params_search,
						alias : type
					},
					root : "r",
					fields : fields
				});
		grid.store.load({
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				})
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();

	}

	// grid自适应
	new Ext.Viewport({
				layout : 'border',
				// renderTo:'topic-grid',
				border : false,
				items : [{
							region : 'center',
							layout : 'fit',
							items : [grid]
						}]
			});
})
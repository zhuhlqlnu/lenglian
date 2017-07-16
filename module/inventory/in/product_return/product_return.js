Ext.onReady(function() {
	Ext.QuickTips.init();
	var id = []; // 鍗曚綅缂栧彿
	var win_update = false;
	// ===========同批次货品判断============
	var same_order_sign = true;
	var order_in_array;
	var order_in_query = [];
	var order_in_id = '';
	var id_length;
	var judge_sign = false;
	// ==========同批次货品判断========
	var sql_array = [];
	var params_search ;
	var fields;
	fields = ['id', 'goods_code', 'goods_id', 'serial','supplier_id', 'name',
		'price', 'memo', 'acount','goods_name', 'model', 'unit'];
	sql_array.push("inventory.in.produce_back_in");
	sql_array.push('inventory.in.produce_back_in_supplier');
	sql_array.push('inventory.in.produce_back_in_code');
	sql_array.push('inventory.in.produce_back_in_name');
	var query_data = [[sql_array[0], '全部'], [sql_array[1], '供货商'],
			[sql_array[2], '货品编码'], [sql_array[3], '货品名称'] ];
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
//===============查询combox===================
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : sql_array[0],
					params : ['2']
				},
				root : "r",
				fields : fields
			});

	var sm = new Ext.grid.CheckboxSelectionModel();
	var grid = new Ext.grid.GridPanel({
				store : store,
				sm : sm,
				columns : [
						// new Ext.grid.RowNumberer(),//获得行号
						sm, {
							header : "序号",
							dataIndex : 'id',
							sortable : true,
							renderer : function(id) {
								return "B" + id;
							}
						}, {
							header : "供货商",
							dataIndex : 'name',
							sortable : true
						}, {
							header : "货品名称",
							dataIndex : 'goods_name',
							sortable : true
						}, {
							header : "规格型号",
							dataIndex : 'model',
							sortable : true
						}, {
							header : "计量单位",
							dataIndex : 'unit',
							sortable : true
						}, {
							header : "货品单价",
							dataIndex : 'price',
							sortable : true
						}, {
							header : "货品数量",
							dataIndex : 'acount',
							sortable : true
						}, {
							header : "备注",
							dataIndex : 'memo',
							sortable : true
						}, {
							header : "是否入库",
							dataIndex : 'serial',
							sortable : true,
							renderer : function(str) {
								if (null == str || '' == str) {
									return '未入库';
								} else {
									return '已经入库';
								}
							}
						}],
				tbar : [{
							id : 'addButton',
							text : '新增',
							icon : Ext.zion.image_base+'/add.gif',
							tooltip : '添加新纪录',
							handler : add_form,
							scope : this
						}, '-',// '-'给工具栏按钮之间添加'|'
						{
							id : 'editButton',
							text : '修改',
							disabled : true,
							icon : Ext.zion.image_base+'/update.gif',
							tooltip : '修改记录',
							handler : updateForm,
							scope : this
						}, '-', {
							id : 'deleteButton',
							text : '删除',
							disabled : true,
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
								disableButton();
							},
							scope : this
						}],
				// 第二个toolbar
				listeners : {
					'render' : function() {
						var tbar = new Ext.Toolbar({
									items : ['请根据', select_combo, {
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

	// ===========================grid记录选择事件==========================
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

	// ----------form表单---------
	

	var purchase_id;
	var order_in_comp;
	var goods_id_comp;
	var company_combo;
//	var goods_code_comp;
	var goods_name;
	var goods_model_comp;
	var goods_unit;
	var price_goods;
	var count_goods;
	var goods_note;
	var win;
	var formPanel;

	function show_win(){
	purchase_id = new Ext.form.TextField({
				fieldLabel : '退库序号',
				hideLabel : true,
				name : 'id',
				hidden : true
			});

	order_in_comp = new Ext.form.TextField({
				fieldLabel : '入库单号',
				hideLabel : true,
				name : 'order_in',
				hidden : true
			});

	goods_id_comp = new Ext.form.TextField({
				fieldLabel : '货品编号',
				name : 'goods_id',
				id : 'goods_id',
				emptyText : '...输入货品编号...',
				allowBlank : false,
				blankText : '请输入编号...'
			});

	
	company_combo = new Ext.form.TextField({
				fieldLabel : '供货商名称',
				name : 'name',
				id : 'name',
				disabled : true
			});

	goods_name = new Ext.form.TextField({
				fieldLabel : '货品名称',
				name : 'goods_name',
				id : 'goods_name',
				disabled : true,
				allowBlank : false,
				blankText : '不能为空'
			});
	// 规格型号

			goods_model_comp = new Ext.form.TextField({
				fieldLabel : '规格型号',
				name : 'model',
				disabled : true
			});


	goods_unit = new Ext.form.TextField({
				fieldLabel : '计量单位',
				name : 'unit',
				disabled : true,
				id : 'unit',
				allowBlank : false,
				blankText : '不能为空'
			});

	price_goods = new Ext.form.TextField({
				fieldLabel : '单价',
				name : 'price',
				id : 'price',
				disabled : true
			});

	count_goods = new Ext.form.TextField({
				fieldLabel : '退库数量',
				name : 'acount',
				id : 'acount',
				disabled : true
			});

	goods_note = new Ext.form.TextArea({
				fieldLabel : '商品备注',
				name : 'memo',
				allowBlank : true,
				height : 80,
				maxLength : 500
			});

	// Ext.form.Field.prototype.;
	formPanel = new Ext.form.FormPanel({
				defaultType : 'textfield',
				items : [purchase_id,order_in_comp, goods_id_comp, company_combo,
						goods_name,goods_model_comp, goods_unit, price_goods,
						count_goods, goods_note]
			})
	// ----window表单----
	win = new Ext.Window({
				title : '生产退库表单',
				closable : true,
//				closeAction : 'hide',
				items : [formPanel],
				buttons : [{
							text : '保存',
							handler : addForm
						}, {
							text : '取消',
							handler : function() {
								formPanel.form.reset();
								win.close();
							}
						}]
			})
			
	win.show();
	
	}
	// ============不在货品入库信息列表=========
	function repir_id_win() {
		var sm_in = new Ext.grid.CheckboxSelectionModel();
		var repir_in_store = new Ext.data.SimpleStore({
					fields : ['goods_id', 'order_in_id'],
					data : order_in_array
				});

		var repir_in_grid = new Ext.grid.GridPanel({
					store : repir_in_store,
					sm : sm_in,
					columns : [sm, {
								header : "货品id",
								dataIndex : 'goods_id',
								sortable : true
							}, {
								header : "入库单号",
								dataIndex : 'order_in_id',
								sortable : true

							}],
					tbar : [{
								// id : 'deleteButton',
								text : '删除',
								icon : Ext.zion.image_base+'/delete.gif',
								tooltip : '删除记录',
								handler : function() {
									delete_back_id(repir_in_grid,repair_win);
								},
								scope : this
							}],
					bbar : [{
								text : '请留下库存中存在的货品！',
								icon : Ext.zion.image_base+'/show_tip.png',
								tooltip : '删除不不在库存的货品'
							}]
				});

		var repair_win = new Ext.Window({
					title : '退库货品详细',
					closable : true,
					// closeAction : 'hide',
					autoScroll : true,
					autoHeight : false,
					height : 320,
					resizable : true,
					items : [repir_in_grid]
				})
		repair_win.show();

	}
	// ==============删除处理退库货品==============
	function delete_back_id(temp_grid,win) {
		var temp_str = goods_id_comp.getValue();
		var temp_sm = temp_grid.getSelectionModel().getSelections();
		for (var i = 0; i < temp_sm.length; i++) {
			temp_str = temp_str.replace(temp_sm[i].data.goods_id+',', '');
			temp_str = temp_str.replace(','+temp_sm[i].data.goods_id, '');
		}
		goods_id_comp.setValue(temp_str);
		goods_id_comp.focus(true,true);
		win.close();

	}

	function addForm() {
				judge_sign = true;
				var params_list = [];
				var params_id_str = [];
				order_in_array = [];
				var temp_str = goods_id_comp.getValue();
				if (temp_str == '' || temp_str == null) {
					return null;
				}
				var temp_array = temp_str.split(',');
				for (var i = 0; i < temp_array.length; i++) {
					var params = [];
					params.push(11);
					params.push(temp_array[i]);
					params_id_str.push(temp_array[i]);
					params_list.push(params);
				}
				id_length = temp_array.length;
				order_in_id = '';
				judge_order_in(params_list, params_id_str);
//=======================方法完善=====================
	}
// =============增加入库单============
	function add_form() {
		win_update = false;
		show_win();
	}
// ----------修改window表单---------
	function updateForm() {
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		if (1 != sm_num) {
			Ext.Msg.alert("修改操作", "选择一条要修改的记录");
		} else {
			show_win();
			win_update = true;
			formPanel.form.loadRecord(sm);
		}
	}
//	=========================
	function update_save(){
		if (formPanel.getForm().isValid() == false) {
			return false;
		} else {
			// 修改操作
			if (win_update) {
				var sm = grid.getSelectionModel().getSelected();
				var id = sm.data.id;
				var params = Ext.zion.form.getParams(formPanel.form, ['goods_id', 'price',
						'acount','memo','order_in','id']);
				Ext.zion.db.getJSON("inventory.in.produce_back_in.update",
						params, function(data) {
							if (data.r && data.r != 0) {
								Ext.Msg.alert("提示", "修改成功");
								win.close();
								grid.store.reload();
								formPanel.form.reset();
							} else {
								Ext.Msg.alert("提示", "数据修改错误");
							}
						});

			} else {
				// 增加操作goods_id,goods_code,price,acount,memo,order_in_id
				var params = Ext.zion.form.getParams(formPanel.form, ['goods_id','price',
						'acount','memo','order_in']);
				Ext.zion.db.getJSON("inventory.in.produce_back_in.insert",
						params, function(data) {
							if (!data.f) {
								Ext.Msg.alert("提示", "添加成功");
								win.close();
								grid.store.reload();
								formPanel.form.reset();
							} else {
								Ext.Msg.alert("提示", "数据添加错误");
							}
						});

			}
		}

	}
		// 查询form
	function selectForm() {
		var type = select_combo.getValue();

		var term = Ext.getCmp('term').getValue();
		params_search = [];
		params_search.push(2);
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
		disableButton();

	}

	// 删除 form
	function deleteForm() {
		var sm = grid.getSelectionModel().getSelections();
		var params = [];
		if (sm.length == 0) {
			Ext.Msg.alert("删除操作", "请选择要删除的项");
		} else {
			if (sm.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
							if (btn == 'yes') {
								for (var i = 0; i < sm.length; i++) {
									var id_str = [];
									id_str.push(10);
									var member = sm[i].data;
									if (member) {
										id_str.push(member.id);

									} else {
										store.remove(store.getAt(i));
									}
									params.push(id_str);
								}
							}
							deleNext(params);
						})
			}
		}
	}
	var deleNext = function(params_id) {
		if (params_id.length > 0) {
			Ext.zion.db.getJSON("muchun.store_purchase_in.delete", params_id
							.pop(), function(data) {
						if (data.r && (data.r != 0)) {
							Ext.Msg.alert("提示", "成功");

						} else {
							Ext.Msg.alert("提示", "失败");
						}
						deleNext(params_id);
					});
		} else {
			grid.store.reload();
			// alert("to do refresh data");
		}
	}
	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		updateForm();

	}
	// ===========按钮失效方法=========
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}
	
	function judge_order_in(params_list, params_id_str) {
		if (params_list.length > 0) {
			Zion.db.getJSON("inventory.in.produce_back.query", params_list.shift(),
					function(data) {
						var temp_str = params_id_str.shift();
						var temp_array = [];
						if (data.r>0) {
							order_in_query = data.r[0];
							if (order_in_id == '') {
								order_in_id = order_in_query[0];
								temp_array.push(temp_str);
								temp_array.push(order_in_query[0]);
								order_in_array.push(temp_array);
								order_in_comp.setValue(order_in_query[0]);
								company_combo.setValue(order_in_query[1]);
//								goods_code_comp.setValue(order_in_query[2]);
								goods_name.setValue(order_in_query[3]);
								goods_model_comp.setValue(order_in_query[4]);//===========
								goods_unit.setValue(order_in_query[5]);
								price_goods.setValue(order_in_query[6]);
								count_goods.setValue(id_length);
//								alert("ID" + order_in_query[0]);
							} else {
//								if (order_in_id != order_in_query[0]) {
//									temp_array.push(temp_str);
//									temp_array.push(order_in_query[0]);
//									order_in_array.push(temp_array);
//									same_order_sign = false;
//									order_in_comp.setValue('');
//									company_combo.setValue('');
////									goods_code_comp.setValue('');
//									goods_name.setValue('');
//									goods_model_comp.setValue('');
//									goods_unit.setValue('');
//									price_goods.setValue('');
////									alert('不同批次');
//								} else {
									temp_array.push(temp_str);
									temp_array.push(order_in_query[0]);
									order_in_array.push(temp_array);
//									alert('同批次的');

//								}

							}

						} else if (data.r && data.r == 0) {
							same_order_sign = false;
							temp_array.push(temp_str);
							temp_array.push('不在库存');
							order_in_array.push(temp_array);
							order_in_comp.setValue('');
							company_combo.setValue('');
//							goods_code_comp.setValue('');
							goods_name.setValue('');
							goods_model_comp.setValue('');
							goods_unit.setValue('');
							price_goods.setValue('');
						}
						judge_order_in(params_list, params_id_str);
					});
		}else{
		if (!same_order_sign) {
			repir_id_win();
			same_order_sign = true;
			return null;
		}else{
			update_save();
			
		}
		}

	}



	// grid自适应
	new Ext.Viewport({
				layout : 'border',
				border : false,
				items : [{
							region : 'center',
							layout : 'fit',
							items : [grid]
						}]
			});
})
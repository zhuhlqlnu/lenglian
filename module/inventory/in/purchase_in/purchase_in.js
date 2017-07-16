Ext.onReady(function() {
	Ext.QuickTips.init();
	var id = []; // 鍗曚綅缂栧彿
	var sql_array = [];
	var params_search ;
	var fields;
	fields = ['id','goods_code','goods_id','serial' , 'supplier_id', 'name', 'price', 'memo', 'acount',
						'goods_name', 'model','unit'];
	sql_array.push("inventory.in.store_goods_spplier_purchase_by_in_type.select");
	sql_array.push('inventory.in.purchase_in_by_supplier.query');
	sql_array.push('inventory.in.purchase_in_by_code.query');
	sql_array.push('inventory.in.purchase_in_by_name.query');
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
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : sql_array[0],
					params : ['1']
				},
				root : "r", 
				fields :  fields
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
						}
						, {
							header : "供货商",
							dataIndex : 'name',
							sortable : true
						},{
							header : "货品名称",
							dataIndex : 'goods_name',
							sortable : true
						},{
							header : "规格型号",
							dataIndex : 'model',
							sortable : true
						},{
							header : "计量单位",
							dataIndex : 'unit',
							sortable : true
						},{
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
						},{
							header : "是否入库",
							dataIndex : 'serial',
							sortable : true,
							renderer : function(str){
								if(null==str||''==str){
									return '未入库';
								}else{
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
						}, '-',{
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
							icon : Ext.zion.image_base+'/delete.gif',
							tooltip : '删除记录',
							disabled : true,
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
					var term = Ext.getCmp('term').getValue();
					params_search = [];
					params_search.push('1');
					if (!Ext.getCmp('term').disabled) {
						params_search.push(term);
					}

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
									items : ['请根据', select_combo, {
												id : 'term',
												xtype : 'textfield',
												disabled : true
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
					params : ['1'],
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
			
//===========================grid记录选择事件==========================
			sm.on('rowselect', function() {
				var length = grid.selModel.getSelections().length;
				if (length == 1) {
					Ext.getCmp('editButton').enable();
				} else {
					Ext.getCmp('editButton').disable();
				}
				if(length>0){
					Ext.getCmp('deleteButton').enable();
				}else{
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
				if(length>0){
					Ext.getCmp('deleteButton').enable();
				}else{
					Ext.getCmp('deleteButton').disable();
				}
			})

	// ----------form表单---------
	// 单位名称
	var purchase_id = new Ext.form.TextField({
				name : 'id',
				hidden : true
			});

	var com_store = new Ext.data.SimpleStore({
				root : 'r',
				fields : ['id', 'type_id', 'name'],
				proxy : new Ext.data.ScriptTagProxy({
							url : ZionSetting.db.url + '/' + Zion.token
									+ '/store_supplier.select'
						})
			});

	var company_combo = new Ext.form.ComboBox({
				fieldLabel : '供货商',
				hiddenName : 'purchase_id',
				valueField : 'id',
				store : com_store,
				displayField : 'name',
				mode : 'local',
				editable : false,
				triggerAction : 'all',
				allowBlank : false,
				emptyText : '...请选择...',
				listeners : {
					'select' : function(this_, record, index){
						goods_model.setValue('');
						goods_name.setValue('');
						goods_unit.setValue('');
					}				
				}
			});
	com_store.load();
	// =================事件触发===================
	company_combo.on('select', load_com_store, this);
	var goods_proxy = new Ext.data.ScriptTagProxy({
				url : ''
			});
	// ================传参修改================
	function load_com_store(combo, record, index) {
		read_url.url = ZionSetting.db.url + '/' + Zion.token
				+ '/getStore_goods_by_supplier_id.select/'
				+ Zion.util.encodeParam([record.get("id")]);
		goods_store.load();
	}
	// 货品名称
	var read_url = {
		url : null
	};
	var goods_store = new Ext.data.SimpleStore({
				root : "r",
				fields : ['id', "goods_code", "name", "model", "unit", "note",
						"amount", "supplier_id"],
				// proxy :goods_proxy
				proxy : new Ext.data.ScriptTagProxy({
							api : {
								read : read_url
							}
						})

			});

	var goods_model = new Ext.form.ComboBox({
				fieldLabel : '规格型号',
				hiddenName : 'model',
				valueField : 'model',
				store : goods_store,
				displayField : 'model',
				mode : 'local',
				editable : false,
				triggerAction : 'all',
				allowBlank : false,
				emptyText : '...请选择...',
				listeners : {
					'select' : function(this_, record, index){
						goods_name.setValue(record.get('name'));
						goods_code.setValue(record.get('goods_code'));
						goods_unit.setValue(record.get('unit'));
					}				
				}
			});
			
	var goods_name = new Ext.form.TextField({
				fieldLabel : '货品名称',
				name : 'goods_name',
				id : 'goods_name',
				disabled : true
	});
	
	var goods_code = new Ext.form.TextField({
		name : 'goods_code',
		id : 'goods_code',
		hidden : true,
		hideLabel : true
	});
	
//	var goods_model = new Ext.form.TextField({
//		fieldLabel : '规格型号',
//		name : 'goods_model',
//		id : 'goods_model',
//		disabled : true
//	});

	var goods_unit = new Ext.form.TextField({
				fieldLabel : '计量单位',
				name : 'unit',
				id : 'unit',
				disabled : true
	});

	var goods_id_comp = new Ext.form.TextField({
				fieldLabel : '货品编号',
				name : 'goods_id',
				id : 'goods_id',
				emptyText : '货品编号输入：',
				allowBlank : false,
				maxLength : 512
			});
	goods_id_comp.on('blur',function(this_){
		var tempV = this_.getValue();
		var arrayL = tempV.split(',');
		count_goods.setValue(arrayL.length);
	
	});

	var price_goods = new Ext.form.TextField({
				fieldLabel : '单价',
				name : 'price',
				id : 'price',
				emptyText : '填写数字',
				allowBlank : false,
				regex : /^[0-9]*$/,// 正则表达式 这里假设只允许输入数字 如果输入的不是数字 就会出现下面定义的提示信息
				regexText : '只能填写数字'
			});

	var count_goods = new Ext.form.TextField({
				fieldLabel : '购买数量',
				name : 'acount',
				id : 'acount',
				readOnly : true,
				value : 0,
				allowBlank : false,
				blankText : '不能为空'
			});

	var goods_note = new Ext.form.TextArea({
				fieldLabel : '商品备注',
				name : 'memo',
				allowBlank : true,
    			emptyText:'--备注填写--',
				height : 80,
				maxLength : 500
			});

	// Ext.form.Field.prototype.;
	var formPanel = new Ext.form.FormPanel({
				defaultType : 'textfield',
				items : [purchase_id , company_combo,goods_model, goods_name,goods_unit, goods_id_comp,
						price_goods,goods_code, count_goods, goods_note]
			})
	// ----window表单----
	var win = new Ext.Window({
				title : '采购货品表单',
				closable : true,
				closeAction : 'hide',
				items : [formPanel],
				buttons : [{
							text : '保存',
							handler : addForm
						}, {
							text : '取消',
							handler : function() {
								formPanel.form.reset();
								win.hide();
							}
						}]
			})

	function addForm() {
		var in_type = 1;
		if (formPanel.getForm().isValid() == false) {
			return false;
		} else {
			// 修改操作
			if (win.update) {
				var sm = grid.getSelectionModel().getSelected();
				var id = sm.data.id;
				var params = Ext.zion.form.getParams(formPanel.form,['model','goods_code','goods_id','price','memo','acount','id']);
				Ext.zion.db.getJSON("muchun.store_purchase_in_buy.update", params,
						function(data) {
							if (!data.f) {
								Ext.Msg.alert("提示", "修改成功");
								win.hide();
								grid.store.reload();
								formPanel.form.reset();
							} else {
								Ext.Msg.alert("提示", "数据修改错误");
							}
						});

			} else {
				// 增加操作
				var params = Ext.zion.form.getParams(formPanel.form,['model','goods_code','goods_id','price','memo','acount']);
				params.push(in_type);
				Ext.zion.db.getJSON("muchun.store_purchase_in_buy.insert", params,
						function(data) {
							if (!data.f) {
								Ext.Msg.alert("提示", "添加成功");
								win.hide();
								grid.store.reload();
								formPanel.form.reset();
							} else {
								Ext.Msg.alert("提示", "数据添加错误");
							}
						});
			}
		}
	}
	// ===============增加入库单============
	function add_form() {
		win.update = false;
		win.show();
	}
	// ----------修改window表单---------
	function updateForm() {
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		if (1 != sm_num) {
			Ext.Msg.alert("修改操作", "选择一条要修改的记录");
		} else {
			win.show();
			win.update = true;
			formPanel.form.loadRecord(sm);
			company_combo.setValue(sm.data.supplier_id);
			
		}
	}
		// 查询form
	function selectForm() {
		var type = select_combo.getValue();

		var term = Ext.getCmp('term').getValue();
		params_search = [];
		params_search.push('1');
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
			Ext.zion.db.getJSON("muchun.store_purchase_in.delete", params_id.pop(), function(
							data) {
						if (data.r && (data.r!=0)) {
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
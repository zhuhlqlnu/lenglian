Ext.onReady(function() {
	Ext.QuickTips.init();
	var id = []; // 鍗曚綅缂栧彿
	var params_search ;
	var sql_array = [];
	var fields;
	fields = ['id','goods_code','serial' , 'supplier_id', 'name', 'price', 'memo', 'acount',
						'goods_name', 'model','unit'];
	sql_array.push("inventory.access.purchase_goods_in.query");
	sql_array.push('inventory.access.purchase_goods_in_spplier');
	sql_array.push('inventory.access.purchase_goods_in_code');
	sql_array.push('inventory.access.purchase_goods_in_name');

	var query_data = [[sql_array[0],'全部'],[sql_array[1],'供货商'],[sql_array[2],'货品编码'],[sql_array[3],'货品名称']];
	var query_store = new Ext.data.SimpleStore({
		fields: [ 'sql_str','text'],
		data : query_data
	});
	var select_combo = new Ext.form.ComboBox({
	   	hiddenName: 'sql_str',
	   	valueField: 'sql_str',
	    store: query_store,
	    displayField:'text',
	    mode: 'local',
	    editable: false,
	    triggerAction: 'all',
		listeners : {
			'select' : function (index){
				var objv = this.getValue();
				if(objv==sql_array[0]){
					Ext.getCmp('term').setValue('');
					Ext.getCmp('term').disable();
				}else{
					Ext.getCmp('term').enable();
				}
		
			}
		}
	  });
	  select_combo.setValue(sql_array[0]);
//===============查询combox=============

	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : sql_array[0],
					params : ['1']
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
						}
						, {
							header : "供货商",
							dataIndex : 'name',
							sortable : true
						}, {
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
							id : 'editButton',
							disabled : true,
							text : '入库',
							icon : Ext.zion.image_base+'/basket_put.png',
							tooltip : '确认入库',
							handler : updateForm,
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
//======入库申请单号==============
	var purchase_id = new Ext.form.TextField({
				name : 'id',
				hidden : true
			});

			
// 单位名称
	var purchase_unit = new Ext.form.TextField({
				fieldLabel : '供货商',
				name : 'name',
				disabled : true
			});
	// 货品编码
//
//			var goods_code = new Ext.form.TextField({
//				fieldLabel : '货品编码',
//				name : 'goods_code',
//				disabled : true
//			});

	// 货品名称

			var goods_name_comp = new Ext.form.TextField({
				fieldLabel : '货品名称',
				name : 'goods_name',
				disabled : true
			});

	// 规格型号

			var goods_model_comp = new Ext.form.TextField({
				fieldLabel : '规格型号',
				name : 'model',
				disabled : true
			});

	// 计量单位

			var goods_unit_comp = new Ext.form.TextField({
				fieldLabel : '计量单位',
				name : 'unit',
				disabled : true
			});

	var price_goods = new Ext.form.TextField({
				fieldLabel : '单价',
				name : 'price',
				id : 'price',
				disabled:true
			});

	var count_goods = new Ext.form.TextField({
				fieldLabel : '购买数量',
				name : 'acount',
				id : 'acount',
				disabled:true
			});

	var memo_comp = new Ext.form.TextArea({
				fieldLabel : '入库备注',
				name : 'memop',
				disabled:false,
				maxLength  : 500
			});

// Ext.form.Field.prototype.;
	var formPanel = new Ext.form.FormPanel({
				defaultType : 'textfield',
				items : [ purchase_id , purchase_unit, goods_name_comp,goods_model_comp,
					goods_unit_comp, price_goods, count_goods,memo_comp  ]
			})
// ----window表单----
	var win = new Ext.Window({
				title : '入库表单信息',
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
		var goods_modelV = goods_model_comp.getValue();
		var amountV = count_goods.getValue();
		var memoV = memo_comp.getValue();
		var idV = purchase_id.getValue();
		var dateStr = new Date().format('Ymd');		
		var serialV = ''+ dateStr + Math.floor(Math.random()*24);
		var in_type = 11;
		if (formPanel.getForm().isValid() == false) {
			return false;
		} else {
			// 修改操作
			if (win.update) {
				var sm = grid.getSelectionModel().getSelected();
				var id = sm.data.id;
				var params = [serialV, '11', idV,goods_modelV,amountV,memoV];
//				Ext.zion.db.getJSON("muchun.process.store_in_update_purchase.insert", params,
//						function(data) {
//							if (data.r && data.r!=0) {
//								Ext.Msg.alert("提示", "修改成功");
////								Ext.zion.db.getJSON("muchun.store_purchased_goods.insert", params_add,
////										function(data) {
////											if (!data.f) {
////												Ext.Msg.alert("提示", "修改成功");
//												win.hide();
//												grid.store.reload();
//												formPanel.form.reset();
////											} else {
////												Ext.Msg.alert("提示", "数据修改错误");
////											}
////										});
//								
//							} else {
//								Ext.Msg.alert("提示", "数据修改错误");
//							}
//						});

				Ext.zion.db.getJSON("muchun.process.store_in_update_purchase.count", [goods_modelV],
						function(data) {
							if (!data.f) {
								if(data.r[0][0]>0){
									Ext.zion.db.getJSON("muchun.process.store_in_addCOunt_purchase.insert", params,
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
								
								}else{
									Ext.zion.db.getJSON("muchun.process.store_in_update_purchase.insert", params,
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
								
								}
							} else {
								Ext.Msg.alert("提示", "数据修改错误");
							}
						});

			}
		}
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
		}
	}
	// 查询form
	function selectForm() {
		var type = select_combo.getValue();
		var term = Ext.getCmp('term').getValue();
		params_search = [];
		params_search.push(1);
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
	// grid自适应
	var view = new Ext.Viewport({
				layout : 'border',
				border : false,
				items : [{
							region : 'center',
							layout : 'fit',
							items : [grid]
						}]
			});
})
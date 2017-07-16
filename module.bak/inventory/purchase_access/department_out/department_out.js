Ext.onReady(function() {
	Ext.QuickTips.init();
	var id = []; // 鍗曚綅缂栧彿

	var params_search ;
	var sql_array = [];
	var fields;

	fields = ['id','project','use_unit' , 'apply_unit', 'user_action_time', 'bill_count', 'self_count', 'pay_way',
			'pay_count', 'supp_id','supplier_name','goods_name','model','out_price','out_id','acount' ];
	sql_array.push("inventory.access.goods_out_apply_all");
	sql_array.push('inventory.access.goods_use_by_supplier');
	sql_array.push('inventory.access.goods_use_by_code');
	sql_array.push('inventory.access.goods_use_by_name');
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : sql_array[0]//,
//					params : ['1']
				},
				root : "r", 
				fields :  fields
			});

	var sm = new Ext.grid.CheckboxSelectionModel();
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
							header : "项目名称",
							dataIndex : 'project',
							sortable : true
						}, {
							header : "申请单位",
							dataIndex : 'apply_unit',
							sortable : true
						}, {
							header : "供货商名称",
							dataIndex : 'supplier_name',
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
							header : "结算金额",
							dataIndex : 'pay_count',
							sortable : true
						},{
							header : "出库价格",
							dataIndex : 'out_price',
							sortable : true
						}, {
							header : "出库数量",
							dataIndex : 'acount',
							sortable : true
						},{
							header : "是否入库",
							dataIndex : 'serial',
							sortable : true,
							renderer : function(str){
								if(null==str||''==str){
									return '未领用';
								}else{
									return '已经领用';
								}
							}
						}],
				tbar : [{
							id : 'editButton',
							disabled : true,
							text : '领用',
							icon : Ext.zion.image_base+'/basket_put.png',
							tooltip : '确认领用',
							handler : updateForm,
							scope : this
						}, '-', {
							id : 'deleteButton',
							disabled : true,
							text : '放弃',
							icon : Ext.zion.image_base+'/delete.gif',
							tooltip : '放弃领用',
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
//======入库单号==============
	var out_goods_id = new Ext.form.TextField({
				name : 'out_id',
				hidden : true,
				hideLabel : true
			});

			
// 项目名称
	var project_comp = new Ext.form.TextField({
				fieldLabel : '项目名称',
				name : 'project',
				disabled : true
			});
// 项目名称
	var apply_unit_comp = new Ext.form.TextField({
				fieldLabel : '申请单位',
				name : 'apply_unit',
				disabled : true
			});
// 单位名称
	var supplier_comp = new Ext.form.TextField({
				fieldLabel : '供货商',
				name : 'supplier_name',
				disabled : true
			});

	// 货品名称

			var goods_name_comp = new Ext.form.TextField({
				fieldLabel : '货品名称',
				name : 'goods_name',
				disabled : true
			});

	// 货品型号

			var goods_model_comp = new Ext.form.TextField({
				fieldLabel : '规格型号',
				name : 'model',
				disabled : true
			});

	// 出库价格

	var price_goods = new Ext.form.TextField({
				fieldLabel : '出库单价',
				name : 'out_price',
				id : 'out_price',
				disabled:true
			});

	var count_goods = new Ext.form.TextField({
				fieldLabel : '申请数量',
				name : 'acount',
				id : 'acount',
				disabled:true
			});

	var goods_ids_comp = new Ext.form.TextField({
				fieldLabel : '货品编号',
				name : 'goods_id',
				id : 'goods_id',
				allowBlank : false,
				blankText : '请输入货品编号...',
				disabled:false
			});

	var memo_comp = new Ext.form.TextArea({
				fieldLabel : '出库备注',
				name : 'memop',
				disabled:false,
				maxLength  : 500
			});

// Ext.form.Field.prototype.;
	var formPanel = new Ext.form.FormPanel({
				defaultType : 'textfield',
				items : [ out_goods_id , project_comp, apply_unit_comp,supplier_comp,goods_name_comp,
					goods_model_comp, price_goods, count_goods,goods_ids_comp ,memo_comp  ]
			});
// ----window表单----
	var win = new Ext.Window({
				title : '部门领用信息',
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
		var memoV = memo_comp.getValue();
		var idV = out_goods_id.getValue();
		var dateStr = new Date().format('Ymd');		
		var serialV = ''+ dateStr + Math.floor(Math.random()*24);
		var goods_id_strV = goods_ids_comp.getValue();
		var count_goodsV = goods_ids_comp.getValue();
		var goods_id_length = goods_id_strV.split(',').length;
		var in_typeV = 11;
		if(goods_id_length!=count_goodsV){
			Ext.Msg.alert("警告","出库货品数量和申请数量不一致!");
			return false;

		}
		if (formPanel.getForm().isValid() == false) {
			return false;
		} else {
			// 修改操作
			
			if (win.update) {
				var sm = grid.getSelectionModel().getSelected();
				var id = sm.data.id;
				var params = [serialV, memoV,goods_id_strV,in_typeV, idV ];
//				alert(params);
				Ext.zion.db.getJSON(
						"inventory.purchase_access.purchase_out.update",
						params, function(data) {
							if (data.r && data.r != 0) {
								Ext.Msg.alert("提示", "出库成功");
								win.hide();
								grid.store.reload();
								formPanel.form.reset();

							} else {
								Ext.Msg.alert("提示", "货品出库失败!");
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
			Ext.Msg.alert("放弃", "请选择要放弃的项");
		} else {
			if (sm.length > 0) {
				Ext.Msg.confirm('放弃确认', '你是否确认放弃选中的记录？', function(btn) {
							if (btn == 'yes') {
								for (var i = 0; i < sm.length; i++) {
									var id_str = [];
									var goods_up = [];
									id_str.push(10);
									var member = sm[i].data;
									if (member) {
										id_str.push(member.out_id);
										goods_up.push(member.acount);
										goods_up.push(member.model);

									} else {
										store.remove(store.getAt(i));
									}
									params.push(id_str);
									params.push(goods_up);
								}
							}
							deleNext(params);
						})
			}
		}
	}
	var deleNext = function(params_id) {
		if (params_id.length > 0) {
			Ext.zion.db.getJSON("inventory.purchase_access.purchase_out.update.delete", params_id.shift(), function(
							data) {
						if (data.r && (data.r!=0)) {
							Ext.Msg.alert("提示", "成功");
							Ext.zion.db.getJSON("inventory.purchase_access.purchase_goods_appy_out.update", params_id.shift(), function(
											data) {
										if (data.r && (data.r!=0)) {
											Ext.Msg.alert("提示", "成功");
				
										} else {
											Ext.Msg.alert("提示", "失败");
										}
									});

						} else {
							Ext.Msg.alert("提示", "失败");
						}
						deleNext(params_id);
					});
		} else {
			grid.store.reload();
			disableButton();
			// alert("to do refresh data");
		}
	}
	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		updateForm();

	}
	
//	========== 使按钮失效=======
	function disableButton(){
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
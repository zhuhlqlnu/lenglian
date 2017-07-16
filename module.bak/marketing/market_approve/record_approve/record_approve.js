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
	sql_array.push("marketing.customer.store_marketing_approve");
	sql_array.push('marketing.customer.store_marketing_approve_com');
	sql_array.push('marketing.customer.store_marketing_approve_cont');
	sql_array.push('marketing.customer.store_marketing_approve_cust');
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : sql_array[0]
				},
				root : "r",
				fields : fields 
			});
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
	var sm = new Ext.grid.CheckboxSelectionModel();
	var grid = new Ext.grid.GridPanel({
				store : store,
				sm : sm,
				columns : [sm, {
							header : "序号",
							dataIndex : 'id',
							sortable : true
						}, {
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
						}, {
							header : "是否审批",
							dataIndex : 'ispassed',
							sortable : true,
							renderer:transStr
						}],
				tbar : [{
							id : 'editButton',
							text : '记录审批',
							icon : Ext.zion.image_base+'/update.gif',
							tooltip : '修改记录',
							handler : function() {
								customer_data = false;
								updateForm();
							},
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
									items : ['请根据',select_combo, {
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
		updateForm();

	}
	// ----------form表单---------

	function customer_win() {
		// ----修改window表单----
		var idU = new Ext.form.TextField({
					name : 'id',
					hidden : true

				});

		var componAU = new Ext.form.TextField({
					fieldLabel : '客户单位',
					name : 'company',
					allowBlank : false,
					disabled:true,
					blankText : '不能为空'

				});

		var componBU = new Ext.form.TextField({
					fieldLabel : '联系人',
					name : 'contact',
					disabled:true,
					allowBlank : false,
					blankText : '不能为空'

				});
		var componCU = new Ext.form.TextField({
					fieldLabel : '客户姓名',
					name : 'name',
					disabled:true,
					allowBlank : false,
					blankText : '不能为空'

				});

		var componDU = new Ext.form.DateField({
					fieldLabel : '联系时间',
					disabled:true,
					editable:false,
					autoHeight : true,
					allowBlank : false,
					name : 'com_time',
					format : 'Y-m-d'
				});

		var componEU = new Ext.form.TextField({
					fieldLabel : '联系方式',
					name : 'com_way',
					allowBlank : false,
					disabled:true,
					blankText : '不能为空'

				});
		var componFU = new Ext.form.TextField({
					fieldLabel : '联系内容',
					name : 'com_info',
					allowBlank : false,
					disabled:true,
					blankText : '不能为空'

				});

		// Ext.form.Field.prototype.msgTarget='side';
		formPanelUpdate = new Ext.form.FormPanel({
					defaultType : 'textfield',
					items : [
					idU,
	                componAU,
	                componBU,
	                componCU,
	                componDU,
	                componEU,
	                componFU,
	                {
										xtype : "panel",
										layout : "column",
										fieldLabel : '审批',
										isFormField : true,
										anchor : '90%',
										items : [{
													columnWidth : .5,
													checked : true,
													xtype : "radio",
													boxLabel : "不同意",
													name : "ispassed",
													inputValue : 'N'
												}, {
													columnWidth : .5,
													xtype : "radio",
													boxLabel : "同意",
													name : "ispassed",
													inputValue : 'Y'
												}]
									}, {
										xtype : 'textarea',
										fieldLabel : '审批意见',
										name : 'memo'
										}

					]
				})
		var winUpdate = new Ext.Window({
					title : '修改营销记录',
					closable : true,
					items : [formPanelUpdate],
					buttons : [{
								text : '保存',
								handler : function() {
									addForm(formPanelUpdate, winUpdate)
								}
							}, {
								text : '取消',
								handler : function() {
									formPanelUpdate.form.reset();
									winUpdate.hide();
								}
							}]
				})
		winUpdate.show();

		function addForm(formPanelUpdate, winUpdate) {

			if (formPanelUpdate.getForm().isValid() == false) {
				return false;
			} else {
				// 修改操作
				var sm = grid.getSelectionModel().getSelected();
				var idV = sm.data.id;
			var ispassedV = formPanelUpdate.getForm().findField("ispassed").getGroupValue();
			var memoV = formPanelUpdate.getForm().findField("memo").getValue();//$("#check_notes").val();
				
				var params = [ispassedV,memoV,idV];
				alert(params);
				Ext.zion.db.getJSON("muchun.store_marketing_appravel.update", params,
						function(data) {
							if (data.r == 1) {
								Ext.Msg.alert("提示", "修改成功");
								formPanelUpdate.form.reset();
								winUpdate.close();
								grid.store.reload();
							} else {
								Ext.Msg.alert("提示", "数据修改错误");
							}
						});

			}
		}

	}
	// 修改营销记录信息

	function updateForm() {
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		if (sm_num != 1) {
			Ext.Msg.alert("修改操作", "请选择要一条修改的项");
		} else {
			customer_win();
			formPanelUpdate.form.loadRecord(sm);
		}
	}

//================字符转化===================
		function transStr(str){
	             		var reStr = '';
	             		if('Y'.localeCompare(str)==1){
	             		
	             			reStr = '通过';
	             		}else if('N'.localeCompare(str)==1){
	             		reStr = '不通过';
	             		}else if(1){
	             		reStr = '未审核';
	             		}
	             		return reStr;
	             	
	             	}
		


//================字符转化===================
	             	
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
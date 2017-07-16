Ext.apply(Ext.form.VTypes, {
	daterange : function(val, field) {
		var date = field.parseDate(val);
		if (!date) {
			return false;
		}
		if (field.startDateField
				&& (!this.dateRangeMax || (date.getTime() != this.dateRangeMax
						.getTime()))) {
			var start = Ext.getCmp(field.startDateField);
			start.setMaxValue(date);
			start.validate();
			this.dateRangeMax = date;
		} else if (field.endDateField
				&& (!this.dateRangeMin || (date.getTime() != this.dateRangeMin
						.getTime()))) {
			var end = Ext.getCmp(field.endDateField);
			end.setMinValue(date);
			end.validate();
			this.dateRangeMin = date;
		}
		return true;
	}
})
Ext
		.onReady(function() {
			Ext.QuickTips.init();
			var travel_cost_add = false;
			var report_type_combo;
			var is_approve = false;
			var fields = [ 'id', 'depart_name', 'applier', 'reason','start_day', 'return_day', 
				'start_add', 'return_add','recoup', 'bus_ticket', 'train_ticket', 'room', 'taxi',
				'mobile', 'other', 'total','version','approve', 'plane_ticket', 'pass_road_bridge',
				'fuel_money', 'data_money', 'repair_money', 'water_money', 'ele_money' ];
			var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "fare_apply.travel_cost.select"
				},
				root : "r",
				fields : fields
			});

			var select_data = [
					[ "fare_apply.travel_cost.select", '所有' ],
					[ "fare_apply.travel_cost.applier.select",
							'申报人' ],
					[ "fare_apply.travel_cost.reason.select",
						'出差理由' ] ];
			var select_store = new Ext.data.SimpleStore( {
				fields : [ 'type', 'name' ],
				data : select_data
			});
			var select_combo = new Ext.form.ComboBox( {
				hiddenName : 'type',
				valueField : 'type',
				store : select_store,
				displayField : 'name',
				mode : 'local',
				editable : false,
				triggerAction : 'all',
				anchor : '90%',
				listeners : {
					'select' : function(index) {
						var objv = this.getValue();
						if (objv == "fare_apply.travel_cost.select") {
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
			var grid = new Ext.grid.GridPanel(
					{
						store : store,
						sm : sm,
						autoScroll : true,
						columns : [ sm, {
							header : "序号",
							dataIndex : 'id',
							width : 50,
							sortable : true
						}, {
							header : "部门名称",
							dataIndex : 'depart_name',
							width : 100,
							sortable : true
						}, {
							header : "申报人",
							width : 100,
							dataIndex : 'applier',
							sortable : true
						}, {
							header : "出差理由",
							width : 100,
							dataIndex : 'reason',
							sortable : true
						}, {
							header : "出发日",
							width : 100,
							dataIndex : 'start_day',
							sortable : true
						}, {
							header : "返回日",
							width : 100,
							dataIndex : 'return_day',
							sortable : true
						}, {
							header : "出发地",
							dataIndex : 'start_add',
							sortable : true
						}, {
							header : "返回地",
							dataIndex : 'return_add',
							sortable : true
						}, {
							header : "差补（元）",
							dataIndex : 'recoup',
							sortable : true
						}, {
							header : "汽车票（元）",
							dataIndex : 'bus_ticket',
							sortable : true
						}, {
							header : "火车票（元）",
							dataIndex : 'train_ticket',
							sortable : true
						}, {
							header : "飞机票（元）",
							dataIndex : 'plane_ticket',
							sortable : true
						}, {
							header : "过路过桥费（元）",
							dataIndex : 'pass_road_bridge',
							sortable : true
						}, {
							header : "住宿费（元）",
							dataIndex : 'room',
							sortable : true
						}, {
							header : "打的费（元）",
							dataIndex : 'taxi',
							sortable : true
						}, {
							header : "通信费（元）",
							dataIndex : 'mobile',
							sortable : true
						}, {
							header : "燃料费（元）",
							dataIndex : 'fuel_money',
							sortable : true
						}, {
							header : "资料费（元）",
							dataIndex : 'data_money',
							sortable : true
						}, {
							header : "维修费（元）",
							dataIndex : 'repair_money',
							sortable : true
						}, {
							header : "水费（元）",
							dataIndex : 'water_money',
							sortable : true
						}, {
							header : "电费（元）",
							dataIndex : 'ele_money',
							sortable : true
						}, {
							header : "其他费用（元）",
							dataIndex : 'other',
							sortable : true
						}, {
							header : "合计费用（元）",
							dataIndex : 'total',
							sortable : true
						}, {
							header : "审核状态",
							dataIndex : 'approve',
							sortable : true,
							renderer:function(approve){
								if(approve==0){
									return "审核未通过";
								}else if(approve==1){
									return "审核通过";
								}else{
									return "等待审核";
								}
							}
						} ],
						tbar : [
								{
									id : 'addButton',
									text : '新增',
									icon : Ext.zion.image_base+'/add.gif',
									tooltip : '添加纪录',
									handler : function() {
										is_approve = false;
										travel_cost_add = true;
										win_show();
									},
									scope : this
								},
								'-',
								{
									id : 'editButton',
									text : '修改',
									disabled : true,
									icon : Ext.zion.image_base+'/update.gif',
									tooltip : '修改记录',
									handler : function() {
										updateForm();
									},
									scope : this
								},
								'-',
								{
									text : '删除',
									id : 'deleteButton',
									disabled : true,
									icon : Ext.zion.image_base+'/delete.gif',
									tooltip : '删除记录',
									handler : deleteForm,
									scope : this
								},
								'-',
								{
									text : '刷新',
									icon : Ext.zion.image_base+'/refresh.gif',
									tooltip : '刷新纪录',
									handler : function() {
										grid.store.reload();
										Ext.getCmp('editButton').disable();
										Ext.getCmp('deleteButton').disable();
									},
									scope : this
								},
								'-',
								{
									text : '导出报表',
									icon : Ext.zion.image_base+'/report_link.png',
									tooltip : '导出报表',
									handler : function() {
										Ext.Msg
												.alert(
														"下载报表",
														"<a href='"
																+ Zion.report
																		.getURL('fare_apply.travel_cost.report')
																+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
									},
									scope : this
								} ],
						// 第二个toolbar
						listeners : {
							'render' : function() {
								var tbar = new Ext.Toolbar( {
									items : [ '请根据', select_combo, {
										xtype : 'textfield',
										width : 150,
										name : 'term',
										id : 'term',
										disabled : true
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
							autoFill : false,
							forceFit : false
						}
					});
			reward_system_data = {};
			store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
			// ----------form表单---------
			function win_show() {
				var reason_data=[['工程维护','工程维护'],['系统研发','系统研发'],['市场开发','市场开发'],['其他','其他']];
				var reason_store=new Ext.data.SimpleStore({
					fields : ['reason', 'reason_name'],
					data : reason_data
				});
				var reason_combo = new Ext.form.ComboBox({
					fieldLabel : '出差理由',
					hiddenName : 'reason',
					valueField : 'reason',
					store : reason_store,
					displayField : 'reason_name',
					mode : 'local',
					editable : false,
					allowBlank : false,
					blankText : '不能为空',
					triggerAction : 'all',
					anchor : '90%'
				});
				formPanel = new Ext.form.FormPanel( {
					autoHeight : true,
					items : [ {
						layout : 'column',
						items : [ {
							columnWidth : .48,
							layout : 'form',
							defaultType : 'textfield',
							defaults : {
								width : 180
							},
							items : [ {
								fieldLabel : '部门名称',
								name : 'depart_name',
								maxLength : 12,
								allowBlank : false,
								blankText : '不能为空',
								anchor : '90%'
							}, {
								fieldLabel : '申请人',
								allowBlank : false,
								maxLength : 12,
								blankText : '不能为空',
								name : 'applier',
								anchor : '90%'
							}, reason_combo, {
								xtype : 'datefield',
								fieldLabel : '出发日',
								format : 'Y-m-d',
								editable : false,
								maxValue : new Date,
								name : 'start_day',
								id : 'startdt',
								vtype : 'daterange',
								endDateField : 'enddt',
								anchor : '90%'
							}, {
								xtype : 'datefield',
								fieldLabel : '返回日',
								format : 'Y-m-d',
								editable : false,
								name : 'return_day',
								id : 'enddt',
								vtype : 'daterange',
								startDateField : 'startdt',
								anchor : '90%'
							}, {
								fieldLabel : '出发地',
								name : 'start_add',
								maxLength : 16,
								anchor : '90%'
							}, {
								fieldLabel : '返回地',
								name : 'return_add',
								maxLength : 16,
								anchor : '90%'
							},{
								fieldLabel : '差补',
								name : 'recoup',
								maxLength : 8,
								anchor : '90%'
							}, {
								fieldLabel : '汽车票',
								name : 'bus_ticket',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								maxLength : 8,
								anchor : '90%'
							}, {
								fieldLabel : '火车票',
								name : 'train_ticket',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								maxLength : 8,
								anchor : '90%'
							} ]
						}, {
							columnWidth : .48,
							layout : 'form',
							defaultType : 'textfield',
							defaults : {
								width : 180
							},
							items : [ {
								fieldLabel : '飞机票',
								name : 'plane_ticket',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								maxLength : 8,
								anchor : '90%'
							}, {
								fieldLabel : '住宿费',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								name : 'room',
								maxLength : 8,
								anchor : '90%'
							}, {
								fieldLabel : '打的费',
								maxLength : 8,
								name : 'taxi',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								anchor : '90%'
							}, {
								fieldLabel : '过路过桥费',
								name : 'pass_road_bridge',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								anchor : '90%'
							}, {
								fieldLabel : '通信费',
								name : 'mobile',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								anchor : '90%'
							}, {
								fieldLabel : '燃料费',
								name : 'fuel_money',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								anchor : '90%'
							}, {
								fieldLabel : '资料费',
								name : 'data_money',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								anchor : '90%'
							}, {
								fieldLabel : '维修费',
								name : 'repair_money',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								anchor : '90%'
							}, {
								fieldLabel : '水费',
								name : 'water_money',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								anchor : '90%'
							}, {
								fieldLabel : '电费',
								name : 'ele_money',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								anchor : '90%'
							}, {
								fieldLabel : '其他费用',
								name : 'other',
								regex : /^\d+(\.\d+)?$/,
								regexText : '大于等于0的数',
								anchor : '90%'
							}, {
								fieldLabel : '合计',
								name : 'total',
								hidden : true,
								hideLabel : true,
								anchor : '90%'
							}, {
								fieldLabel : '序号',
								name : 'id',
								hidden : true,
								hideLabel : true
							}, {
								fieldLabel : '审核',
								name : 'approve',
								hideLabel : true,
								hidden : true,
								value : 0,
								anchor : '90%'
							}, {
								fieldLabel : '版本',
								name : 'version',
								hideLabel : true,
								hidden : true,
								anchor : '90%'
							}]
						} ]
					} ]
				})
				win = new Ext.Window( {
					title : '差旅费录入',
					closable : true,
					autoWidth : false,
					width : 540,
					items : [ formPanel ],
					buttons : [ {
						id : 'save',
						text : '保存',
						handler : function() {
							if (travel_cost_add) {
								add_travel_cost(formPanel.getForm(), win);
							} else {
								update_travel_cost(formPanel.getForm(), win)
							}
						}
					}, {
						text : '取消',
						id : 'cancel',
						handler : function() {
							formPanel.form.reset();
							win.close();
						}
					} ]
				})
				if (is_approve) {
					Ext.getCmp('save').disable();
				}
				win.show();
			}
			function add_travel_cost(formPanel, win) {
				if (formPanel.isValid() == false) {
					return false;
				}
//============================================='plane_ticket', 'pass_road_bridge',
//				'fuel_money', 'data_money', 'repair_money', 'water_money', 'ele_money' 
				var params = Ext.zion.form.getParams(formPanel, [ 'depart_name', 'applier',
              			'reason', 'start_day', 'return_day', 'start_add','return_add', 'recoup',
              			'bus_ticket', 'train_ticket','room', 'taxi', 'mobile', 'other','plane_ticket', 'pass_road_bridge',
						'fuel_money', 'data_money', 'repair_money', 'water_money', 'ele_money' ]);
				var params_total = [];
				var totalV = 0;
				params_total = Ext.zion.form.getParams(formPanel, [ 'recoup',
              			'bus_ticket', 'train_ticket','room', 'taxi', 'mobile', 'other','plane_ticket', 'pass_road_bridge',
						'fuel_money', 'data_money', 'repair_money', 'water_money', 'ele_money' ]);
				for(var i=0;i<params_total.length;i++){
					if(params_total[i]==null || params_total[i]==''){
						params_total[i]=0;
					}
					totalV = parseFloat(totalV) + parseFloat(params_total[i]);
				}
				params.push(totalV);

				Ext.zion.db.getJSON("fare_apply.travel_cost.insert", params,function(data) {
					if (!data.f) {
							Ext.Msg.alert("增加操作", "数据添加成功");
							win.close();
							grid.store.reload();
							Ext.getCmp('editButton').disable();
							Ext.getCmp('deleteButton').disable();
						}else {
							Ext.Msg.alert("警告","数据保存错误!");
						}
				})
			}
			function update_travel_cost(formPanel, win) {
				if (formPanel.isValid() == false) {
					return false;
				}
				
				var params_total = [];
				var totalV = 0;
				params_total = Ext.zion.form.getParams(formPanel, [ 'recoup',
              			'bus_ticket', 'train_ticket','room', 'taxi', 'mobile', 'other','plane_ticket', 'pass_road_bridge',
						'fuel_money', 'data_money', 'repair_money', 'water_money', 'ele_money' ]);
				for(var i=0;i<params_total.length;i++){
					if(params_total[i]==null || params_total[i]==''){
						params_total[i]=0;
					}
					totalV = parseFloat(totalV) + parseFloat(params_total[i]);
				}

				var params = Ext.zion.form.getParams(formPanel, [ 'depart_name', 'applier',
			                            						'reason', 'start_day', 'return_day', 'start_add',
			                            						'return_add', 'recoup', 'bus_ticket', 'train_ticket',
			                            						'room', 'taxi', 'mobile', 'other','plane_ticket', 'pass_road_bridge',
				'fuel_money', 'data_money', 'repair_money', 'water_money', 'ele_money','total','id','version' ]);
				params[21] = totalV;
				Ext.zion.db.getJSON("fare_apply.travel_cost.update", params,
						function(data) {
							if (data.r == 1) {
								win.close();
								grid.store.reload();
								Ext.Msg.alert("提示", "数据修改成功");
								Ext.getCmp('editButton').disable();
								Ext.getCmp('deleteButton').disable();
							}else{
								Ext.Msg.alert("提示", "数据修改错误");
							}
						});
			}
			// ----------修改window表单---------
			function updateForm() {
				travel_cost_add = false;
				var sm = grid.getSelectionModel().getSelected();
				var approve = sm.data.approve;
				var sm_num = grid.selModel.getSelections().length;
				if (!sm) {
					Ext.Msg.alert("修改操作", "请选择要修改的项");
				} else if (sm_num > 1) {
					Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
				} else {
					if (approve == 1 || approve == 2) {
						is_approve = true;
					} else {
						is_approve = false;
					}
					win_show();
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
			var id = [];
			function deleteForm() {
				var sm = grid.getSelectionModel().getSelections();
				var sm_select = grid.getSelectionModel().getSelected();
				if (sm.length == 0) {
					Ext.Msg.alert("删除操作", "请选择要删除的项");
				} else {
					var approve = sm_select.data.approve;
					if (approve == 1 || approve == 2) {
						Ext.Msg.alert("删除操作", "不能删除审核后的报表");
						return false;
					}
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
					var params = [ id.pop() ];
					Ext.zion.db.getJSON("fare_apply.travel_cost.delete",
							params, function(data) {
								if (!data.r) {
									Ext.Msg.alert("删除提示", "删除失败");
								} else {
									if (data.r != 0 || data.r != null) {
										Ext.Msg.alert("删除提示", "删除成功");
										Ext.getCmp('editButton').disable();
										Ext.getCmp('deleteButton').disable();
									} else {
										Ext.Msg.alert("删除提示", "删除失败");
									}
									deleNext();
								}
							});
				} else {
					grid.store.reload();
				}
			}
			grid.addListener('rowdblclick', updateGridRowClick);
			function updateGridRowClick(grid, rowIndex, e) {
				updateForm();
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
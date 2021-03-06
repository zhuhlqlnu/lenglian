Ext.onReady(function() {

	Ext.QuickTips.init();
	var formPanel;
	var add_user = false;
	var selectCorpId;
	
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
				msg : "加载中，请稍后 ..."
			});

	loadMask.show();
	var sql_array = [];
	sql_array.push("axiom_user.axiom_user_info.select");
	sql_array.push('axiom_user.axiom_user_info.by_user_name.select');
	sql_array.push('axiom_user.axiom_user_info.by_login_name.select');
	var query_data = [[sql_array[0], '全部'], [sql_array[1], '用户名称'],
			[sql_array[2], '登录名'] ];
	var query_store = new Ext.data.SimpleStore({
				fields : ['sql_str', 'sql_name'],
				data : query_data
			});
	var select_combo = new Ext.form.ComboBox({
		width:100,
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
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : "axiom_user.axiom_user_info.select"
				},
				root : "r",
				fields : ['user_id', 'login_name', 'password', 'user_name',
						'birthday','birthplace', 'national', 'telephone', 'fax',
						'email', 'address', 'work_start', 'id_number',
						'education', 'work_experience', 'status',
						'corp_id', 'enable', 'reg_date', 'reg_user_id',
						'memo','polyline']

			});
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}
	var id = []; // 编号
	var grid = new Ext.grid.GridPanel({
				title : '集团用户管理',
				store : store,
				sm : sm,
				columns : [sm, {
							header : "序号",
							dataIndex : 'user_id',
							sortable : true,
							width:60
						}, {
							header : "用户名称",
							dataIndex : 'user_name',
							sortable : true,
							width:80
						}, {
							header : "登陆名",
							dataIndex : 'login_name',
							sortable : true,
							width:80
						}, {
							header : "登录密码",
							dataIndex : 'password',
							sortable : true,
							renderer : function(password, cellmeta, record) {
								if (Zion.user.corp_id == record.data["corp_id"]
										&& record.data["status"] == 1) {
									return "*********";
								} else {
									return password;
								}
							},
							width:80
						}, {
							header : "出生日期",
							dataIndex : 'birthday',
							sortable : true,
							width:70,
							renderer:function(birthday){
								if(birthday == "" || birthday == null){
									return "";
								}else{
									return dateFormat(birthday);
								}
							}
						}, {
							header : "籍贯",
							dataIndex : 'birthplace',
							sortable : true,
							width:120
						}, {
							header : "民族",
							dataIndex : 'national',
							sortable : true
						}, {
							header : "电话",
							dataIndex : 'telephone',
							sortable : true,
							width:90
						}, {
							header : "传真",
							dataIndex : 'fax',
							sortable : true,
							width:90
						}, {
							header : "email地址",
							dataIndex : 'email',
							sortable : true,
							width:90
						}, {
							header : "地址",
							dataIndex : 'address',
							sortable : true,
							width:120
						}, {
							header : "聘入时间",
							dataIndex : 'work_start',
							sortable : true,
							width:70,
							renderer:function(work_start){
								if(work_start == null || work_start == ""){
									return "";
								}else{
									return dateFormat(work_start);
								}
							}
						}, {
							header : "巡检管段",
							dataIndex : 'polyline',
							sortable : true,
							width:120
						},{
							header : "身份证号",
							dataIndex : 'id_number',
							sortable : true,
							width:140
						},{
							header : "文化程度",
							dataIndex : 'education',
							sortable : true,
							width:70
						},{
							header : "工作状态",
							dataIndex : 'work_experience',
							sortable : true,
							width:70
						},{
							header : "是否为集团管理员",
							dataIndex : 'status',
							sortable : true,
							renderer : function(status) {
								return status == 0 ? "否" : "是";
							},
							width:120
						}, {
							header : "是否生效",
							dataIndex : 'enable',
							sortable : true,
							renderer : function(enable) {
								return enable == 0 ? "否" : "是";
							},
							width:70
						}, {
							header : "注册时间",
							dataIndex : 'reg_date',
							sortable : true,
							width:80
						}/*, {
							header : "注册人编号",
							dataIndex : 'reg_user_id',
							sortable : true,
							width:70
						}*/, {
							header : "备注",
							dataIndex : 'memo',
							sortable : true,
							width:160
						}],
				tbar : [{
							id : 'addButton',
							text : '新增',
							icon : Ext.zion.image_base + '/add.gif',
							tooltip : '添加新纪录',
							handler : function() {
								add_user = true;
								win_show();
							},
							scope : this
						},// '-'给工具栏按钮之间添加'|'
						{
							id : 'editButton',
							text : '修改',
							icon : Ext.zion.image_base + '/update.gif',
							tooltip : '修改记录',
							handler : updateForm,
							scope : this,
							disabled : true
						},{
							text : '删除',
							id : 'deleteButton',
							icon : Ext.zion.image_base + '/delete.gif',
							tooltip : '删除记录',
							handler : deleteForm,
							scope : this,
							disabled : true
						},{
							text : '刷新',
							icon : Ext.zion.image_base + '/refresh.gif',
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
												id : 'term',
												width:200,
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
						})/*,
				viewConfig : {
					autoFill : true,
					forceFit : true
				}*/
			});

	// ============增加数据form================
	function win_show(record) {
		formPanel = new Ext.form.FormPanel({
					labelWidth : 65,
					frame : true,
					bodyStyle : 'padding:5px 5px 0',
					height : 200,
					items : [{
								layout : 'column',
								items : [{
											columnWidth : .48,
											layout : 'form',
											autoHeight : true,
											defaultType : 'textfield',
											items : [{
														fieldLabel : '登录名',
														name : 'login_name',
														id : 'login_name',
														allowBlank : false,
														blankText : '不能为空',
														maxLength : 16
													}, {
														fieldLabel : '登录密码',
														name : 'password',
														id : 'password',
														allowBlank : false,
														blankText : '不能为空',
														maxLength : 16
													}, {
														fieldLabel : '显示名称',
														name : 'user_name',
														allowBlank : false,
														blankText : '不能为空',
														maxLength : 16
													}, {
														id : 'birthday',
														name : 'birthday',
														xtype : 'datefield',
														fieldLabel : '生日',
														editable : false,
														format : 'Y-m-d'
													}, {
														fieldLabel : '籍贯',
														name : 'birthplace',
														maxLength : 21
													}, {
														fieldLabel : '民族',
														name : 'national',
														maxLength : 5
													}, {
														fieldLabel : '电话',
														name : 'telephone',
														maxLength : 16
													}, {
														fieldLabel : '传真',
														name : 'fax',
														maxLength : 16
													}, {
														fieldLabel : 'email地址',
														name : 'email',
														vtype : "email",
														vtypeText : "邮箱格式错误",
														maxLength : 16
													}, {
														fieldLabel : '地址',
														name : 'address',
														maxLength : 64
													}]
										}, {
											columnWidth : .48,
											layout : 'form',
											autoHeight : true,
											defaultType : 'textfield',
											items : [{
														id : 'work_start',
														name : 'work_start',
														xtype : 'datefield',
														fieldLabel : '聘入时间',
														editable : false,
														format : 'Y-m-d'
													}, {
														fieldLabel : '巡检管段',
														name : 'polyline',
														id:'polyline',
														maxLength : 64
													}, {
														fieldLabel : '身份证号',
														width : 230,
														name : 'id_number',
														maxLength : 18,
														regex:/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,
														regexText:'身份证号填写错误，15或18位'
													}, {
														fieldLabel : '文化程度',
														name : 'education',
														maxLength : 10
													}, {
														fieldLabel : '工作状态',
														name : 'work_experience',
														maxLength : 10
													}, {
														xtype : 'radiogroup',
														id : 'status',
														fieldLabel : '是否为管理员',
														items : [{
																	boxLabel : '是',
																	name : 'status',
																	inputValue : 1
																}, {
																	boxLabel : '否',
																	name : 'status',
																	inputValue : 0,
																	checked : true
																}]
													}, {
														xtype : 'radiogroup',
														fieldLabel : '是否生效',
														id : 'enable',
														items : [{
																	boxLabel : '是',
																	name : 'enable',
																	inputValue : 1,
																	checked : true
																}, {
																	boxLabel : '否',
																	name : 'enable',
																	inputValue : 0
																}]
													}, {
														fieldLabel : '备注',
														xtype : 'textarea',
														id : 'memo',
														name : 'memo'
													}, {
														fieldLabel : 'user_id',
														name : 'user_id',
														hideLabel : true,
														hidden : true
													}, {
														fieldLabel : 'corp_id',
														name : 'corp_id',
														value : selectCorpId,
														hideLabel : true,
														hidden : true
													}]
										}]
							}]
				})
		var win = new Ext.Window({
					title : '集团用户管理',
					closable : true,
					closeAction : 'close',
					autoWidth : false,
					width : 700,
					items : [formPanel],
					buttons : [{
								text : '保存',
								id : 'save',
								handler : function() {
									if (add_user) {
										add_user_Form(formPanel.getForm(), win);
									} else {
										update_user_Form(formPanel.getForm(),
												win);
									}
								}
							}, {
								text : '取消',
								handler : function() {
									win.close();
								}
							}]
				});

		if (record) {
			if (record.get('status') == 1
					&& (Zion.user.corp_id == selectCorpId)) {
				Ext.zion.form.disable(formPanel, ['login_name', 'password',
								'user_name', 'telephone', 'fax', 'email',
								'address', 'status', 'enable', 'memo']);
				Ext.getCmp('save').disable();
				Ext.getCmp("password").inputType = 'password';
			} else {
				Ext.getCmp('save').enable();
			}
			if (Zion.user.corp_id == selectCorpId) {
				Ext.getCmp('status').disable();
			} else {
				Ext.getCmp('status').enable();
			}
		} else {
			if (Zion.user.corp_id == selectCorpId) {
				Ext.getCmp('status').disable();
			} else {
				Ext.getCmp('status').enable();
			}
		}
		win.show();
	}
	function add_user_Form(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		// 增加操作
		var params = Ext.zion.form.getParams(formPanel, ['login_name',
						'password', 'user_name', 'telephone', 'fax', 'email',
						'address', 'status', 'corp_id', 'enable', 'memo']);

		var info_params = Ext.zion.form.getParams(formPanel,
				['birthplace', 'national', 'id_number', 'education',
						'work_experience']);

		var birthday = Ext.getCmp("birthday").getValue();
		var work_start = Ext.getCmp("work_start").getValue();
		if (birthday == "") {
			info_params.push("");
		} else {
			info_params.push(parseInt(birthday.getTime() / 1000));
		}
		if (work_start == "") {
			info_params.push("");
		} else {
			info_params.push(parseInt(work_start.getTime() / 1000));
		}
		var polyline = Ext.getCmp("polyline").getValue();
		info_params.push(polyline);
		Ext.zion.db.getJSON("axiom_user.user_id.nextval.select", null,
				function(data) {
					if (data.r && !data.f) {
						var alias;
						if (params[9] == 1) {
							alias = 'axiom_user.insert';
						} else {
							alias = 'axiom_user.insert_disable';
						}
						params.unshift(data.r[0][0]);
						info_params.unshift(data.r[0][0]);
						Ext.zion.db.getJSON(alias, params, function(data) {
									if (data.f) {
										if (data.f.indexOf('PK_USER_LOGIN')) {
											Ext.Msg.alert("提示",
													"用户名重复,请重新输入用户名");
										} else {
											Ext.Msg.alert("提示", "数据添加错误");
										}
									} else {
										if (data.r == 1) {
											Zion.db.getJSON(
													'axiom_user_info.insert',
													info_params,
													function(data) {
														if (data.r) {
															Ext.Msg.alert("提示",
																	"数据添加成功");
															win.close();
															grid.store.reload();
															disableButton();
														} else {
															Ext.Msg.alert("提示",
																	"数据添加错误");
															win.close();
															disableButton();
														}
													})
										} else {
											Ext.Msg.alert("提示", "数据添加错误");
											win.close();
											disableButton();
										}
									}
								})
					}
				})
	}
	function update_user_Form(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		// 修改操作
		var params = Ext.zion.form.getParams(formPanel, ['login_name',
						'password', 'user_name', 'telephone', 'fax', 'email',
						'address', 'status', 'enable', 'memo', 'user_id',
						'corp_id']);
		var alias;
		if (params[8] == 1) {
			alias = 'axiom_user.update';
		} else {
			alias = 'axiom_user.update_disable';
		}
		var info_params = Ext.zion.form.getParams(formPanel,
				['birthplace', 'national', 'id_number', 'education',
						'work_experience']);

		var birthday = Ext.getCmp("birthday").getValue();
		var work_start = Ext.getCmp("work_start").getValue();
		var user_id = formPanel.findField('user_id').getValue();
		if (birthday == "") {
			info_params.push("");
		} else {
			info_params.push(parseInt(birthday.getTime() / 1000));
		}
		if (work_start == "") {
			info_params.push("");
		} else {
			info_params.push(parseInt(work_start.getTime() / 1000));
		}
		var polyline = Ext.getCmp("polyline").getValue();
		info_params.push(polyline);
		info_params.push(user_id);
		Ext.zion.db.getJSON(alias, params, function(data) {
					if (data.f) {
						if (data.f.indexOf('PK_USER_LOGIN')) {
							Ext.Msg.alert("提示", "用户名重复,请重新输入用户名");
						} else {
							Ext.Msg.alert("提示", "数据修改错误");
						}
					} else {
						if (data.r != 0 && data.r) {
							Zion.db.getJSON('axiom_user_info.update',info_params,function(data){
								if(data.r){
									Ext.Msg.alert("提示", "数据修改成功");
									win.close();
									grid.store.reload();
									disableButton();
								}else{
									Ext.Msg.alert("提示", "数据修改错误");
									win.close();
									disableButton();
								}
							});
						} else {
							Ext.Msg.alert("提示", "数据修改错误");
							win.close();
							disableButton();
						}
					}
				});
	}
	// ----------修改window表单---------
	function updateForm() {
		add_user = false;
		var sm = grid.getSelectionModel().getSelected();
		win_show(sm);
		formPanel.form.loadRecord(sm);
		var birthday = sm.data.birthday;
		var work_start = sm.data.work_start;
		if(birthday == "" || birthday == null){
			Ext.getCmp("birthday").setValue("");
		}else{
			Ext.getCmp("birthday").setValue(dateFormat(birthday));
		}
		if(work_start == "" || work_start == null){
			Ext.getCmp("work_start").setValue("");
		}else{
			Ext.getCmp("work_start").setValue(dateFormat(work_start));
		}
	}
	// 查询form
	function selectForm() {
		var type = select_combo.getValue();
		var term = Ext.getCmp('term').getValue();
		if(Ext.getCmp('term').disabled){
			grid.store.constructor({
				db : {
					params : [selectCorpId],
					alias : type
				},
				root : "r",
				fields : ['user_id', 'login_name', 'password', 'user_name',
						'birthday','birthplace', 'national', 'telephone', 'fax',
						'email', 'address', 'work_start', 'id_number',
						'education', 'work_experience', 'status',
						'corp_id', 'enable', 'reg_date', 'reg_user_id',
						'memo','polyline']
			});
		}else{
			grid.store.constructor({
				db : {
					params : [selectCorpId,term],
					alias : type
				},
				root : "r",
				fields : ['user_id', 'login_name', 'password', 'user_name',
						'birthday','birthplace', 'national', 'telephone', 'fax',
						'email', 'address', 'work_start', 'id_number',
						'education', 'work_experience', 'status',
						'corp_id', 'enable', 'reg_date', 'reg_user_id',
						'memo','polyline']
			});
		}
		grid.store.load({
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				})
		disableButton();

	}
	// 删除 form
	var ids = [];
	function deleteForm() {

		var sm = grid.getSelectionModel().getSelections();
		var corp_id = grid.getSelectionModel().getSelected().data.corp_id;
		var status = grid.getSelectionModel().getSelected().data.status;
		if (Zion.user.corp_id == corp_id && status == 1) {
			Ext.Msg.alert("提示", "不能删除同级管理员");
		} else {
			if (sm.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
							if (btn == 'yes') {
								for (var i = 0; i < sm.length; i += 1) {
									var member = sm[i].data;
									if (member) {
										ids.push({id:member.user_id,
												name:member.login_name});
									} else {
										store.remove(store.getAt(i));
									}
								}
								if (ids.length > 0) {
									deleNext();
								}
							}
						})
			}
		}
	}
	var deleNext = function() {
		if (ids.length > 0) {
			var id = ids.pop();
			var user_id = id.id;
			var name = id.name;
			Ext.zion.db.getJSON("axiom_user.delete", [user_id,name], function(data) {
						if (data.r != 0 && data.r) {
							Zion.db.getJSON('axiom_user_info.delete',[user_id],function(data){
								if(data.r){
									Ext.Msg.alert("提示", "删除成功");
								}
							});
						} else {
							Ext.Msg.alert("提示", "删除失败");
						}
						deleNext();
					});
		} else {
			grid.store.reload();
			disableButton();
		}
	}

	function dateFormat(value) {
		var dt = new Date.parseDate(value, 'U');
		return dt.format('Y-m-d');
	}

	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		updateForm();
	}

	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		store.constructor({
			db : {
				alias : "axiom_user.axiom_user_info.select",
				params:[selectCorpId]
			},
			root : "r",
			fields : ['user_id', 'login_name', 'password', 'user_name',
					'birthday','birthplace', 'national', 'telephone', 'fax',
					'email', 'address', 'work_start', 'id_number',
					'education', 'work_experience', 'status',
					'corp_id', 'enable', 'reg_date', 'reg_user_id',
					'memo','polyline']
		});
		store.load({
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
	});

	// =========显示树和grid列表================

	var tree = new Ext.tree.TreePanel({
		title : '集团列表',
		id : 'tree_id',
		autoScroll : true,
		collapsible : true,
		split : true,
		region : 'west',
		width : 200,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				disableButton();
				selectCorpId = node.attributes.corp.corp_id;
				store.constructor({
					db : {
						alias : "axiom_user.axiom_user_info.select",
						params:[selectCorpId]
					},
					root : "r",
					fields : ['user_id', 'login_name', 'password', 'user_name',
							'birthday','birthplace', 'national', 'telephone', 'fax',
							'email', 'address', 'work_start', 'id_number',
							'education', 'work_experience', 'status',
							'corp_id', 'enable', 'reg_date', 'reg_user_id',
							'memo','polyline']
				});
				store.load({
							params : {
								start : 0,
								limit : Ext.zion.page.limit
							}
						});

					}
				}
			});

	new Ext.Viewport({
				layout : 'border',
				border : false,
				items : [tree, {
							region : 'center',
							layout : 'fit',
							items : [grid]
						}]
			});

	Ext.zion.tree.loadCorpTree(function(corpTree) {
				tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
				tree.getRootNode().childNodes[0].select();
				loadMask.hide();
			});
})
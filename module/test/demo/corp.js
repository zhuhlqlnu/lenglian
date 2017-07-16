Ext.onReady(function() {
	Ext.QuickTips.init();
	var customer_form;
	var sex_combo;
	var position_combo;
	var customer_data = false;
	var selectCorpId = 0;
	var update = false;
	var expandNodes = {};
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});

	loadMask.show();
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "management.corp.select",
			params : []
		},
		root : "r",
		fields : []
	});

	var sm = new Ext.grid.CheckboxSelectionModel();
	var id = []; // 编号
		var grid = new Ext.grid.GridPanel( {
			title : '子集团列表',
			store : store,
			sm : sm,
			columns : [ sm, {
				header : "序号",
				dataIndex : 'corp_id',
				sortable : true
			}, {
				header : "集团名称",
				dataIndex : 'corp_name',
				sortable : true
			}, {
				header : "是否生效",
				dataIndex : 'enable',
				sortable : true,
				renderer : function(is_enable) {
					var reStr = '';
					if (1 == is_enable) {
						reStr = "生效";
					} else if (0 == is_enable) {
						reStr = "没有生效";
					}
					return reStr;

				}
			}, {
				header : "系统名称",
				dataIndex : 'system_name',
				sortable : true
			}, {
				header : "版权信息",
				dataIndex : 'system_copyright',
				sortable : true
			}, {
				header : "备注",
				dataIndex : 'memo',
				sortable : true
			} ],
			tbar : [ {
				id : 'addButton',
				text : '新增',
				icon : Ext.zion.image_base + '/add.gif',
				tooltip : '增加子集团',
				handler : newAddForm,
				scope : this
			},// '-'给工具栏按钮之间添加'|'
					{
						id : 'editButton',
						text : '修改',
						icon : Ext.zion.image_base + '/update.gif',
						tooltip : '修改记录',
						disabled : true,
						handler : updateForm,
						scope : this
					}, {
						text : '删除',
						id : 'deleteButton',
						disabled : true,
						icon : Ext.zion.image_base + '/delete.gif',
						tooltip : '删除记录',
						handler : deleteForm,
						scope : this
					}, {
						text : '刷新',
						icon : Ext.zion.image_base + '/refresh.gif',
						tooltip : '刷新纪录',
						handler : function() {
							grid.store.reload();
							disableButton();
						},
						scope : this
					} ],
			// 第二个toolbar
			listeners : {
				'render' : function() {
					var tbar = new Ext.Toolbar( {
						items : [ '请根据', {
							xtype : 'textfield',
							width : 150,
							id : 'term'
						}, {
							text : '查询',
							tooltip : '查询',
							icon : Ext.zion.image_base + '/select.gif'
						} ]
					})
					// tbar.render(this.tbar);

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

		// ===========================grid记录选择事件==========================
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
		function disableButton() {
			Ext.getCmp('editButton').disable();
			Ext.getCmp('deleteButton').disable();
		}
		// =========================记录选择事件=====================
		grid.addListener('rowdblclick', update_customer_data);
		function update_customer_data(grid, rowIndex, e) {
			customer_data = false;
			updateForm();

		}

		// ===========窗口变量===========
		var win;
		var formPanel;

		function add_from() {
			// ============增加数据form================
			formPanel = new Ext.form.FormPanel( {
				defaultType : 'textfield',
				fileUpload: true,
				items : [ {
					fieldLabel : '集团名称',
					name : 'corp_name',
					id : 'corp_name',
					allowBlank : false,
					blankText : '不能为空'
				}, {
					xtype : "radiogroup",
					fieldLabel : '是否生效',
					items : [ {
						columnWidth : .5,
						checked : true,
						boxLabel : "生效",
						name : "enable",
						inputValue : 1
					}, {
						columnWidth : .5,
						boxLabel : "不生效",
						name : "enable",
						inputValue : 0
					} ]
				}, {
					fieldLabel : '系统名称',
					name : 'system_name',
					id : 'system_name',
					allowBlank : false,
					blankText : '不能为空'
				}, {
					fieldLabel : '版权信息',
					name : 'system_copyright',
					id : 'system_copyright',
					allowBlank : false,
					blankText : '不能为空'
				}, {
					fieldLabel : '备注',
					xtype : 'textarea',
					name : 'memo',
					id : 'memo'
				},{
					xtype: 'fileuploadfield',
					//inputType:'file',
					id: 'file_path',
					emptyText: '选择上传图标',
					fieldLabel: '类型图标',
					name: 'file_path',
					blankText : '请选择上传图标',
					buttonText: '',
					regexText :'支持jpeg,jpg,gif,png的图标上传',
					regex:/^(([a-zA-Z]:)|(\\{2}\w+)\$?)(\\(\w[\w].*))(.JPEG|.jpeg|.JPG|.jpg|.GIF|.gif|.png|.png)$/,
					buttonCfg: {
						iconCls: 'upload-icon'
					}
				}, {
					fieldLabel : 'ID',
					name : 'corp_id',
					id : 'corp_id',
					hideLabel : true,
					hidden : true
				} ]
			})

			// ----window表单----
			win = new Ext.Window( {
				title : '子集团信息',
				closable : true,
				items : [ formPanel ],
				buttons : [ {
					text : '保存',
					handler : addForm
				}, {
					text : '取消',
					handler : function() {
						win.close();
					}
				} ]
			})
			win.show();
		}

		// ===============增加信息表单方法===============
		function addForm() {
			if (formPanel.getForm().isValid() == false) {
				return false;
			} else {
				// 修改操作
				if (update) {
					var sm = grid.getSelectionModel().getSelected();
					var params = [];
					var corp_id = Ext.getCmp("corp_id").getValue();
					params = Ext.zion.form.getParams(formPanel.form, [ 'corp_name', 'enable', 'memo', 'system_name', 'system_copyright', 'corp_id' ]);
					var filePath = formPanel.getForm().findField('file_path').getValue();
					var fileType = filePath.substring(filePath.indexOf('.'),filePath.length);
					var file_name = filePath.substring(filePath.lastIndexOf('\\')+1);
					var path = corp_id+'.jpg';
					var url = '/upload/'+Ext.zion.token+'/corp_poi/'+Zion.util.encodeParam([path]);
					if(formPanel.getForm().findField('file_path').getValue().length>0){
						formPanel.getForm().submit({
							url : url,
							waitTitle: '请稍等...',
							waitMsg : '上传中......',
							success : function(form,action){
								
							},
							failure : function(form,action){
								Ext.zion.db.getJSON("management.corp.update", params, function(data) {
									if (data.r && data != 0) {
										Ext.Msg.alert("提示", "修改成功");
										reloadCorpTree();
										win.close();
										grid.store.reload();
									} else {
										Ext.Msg.alert("提示", "数据修改错误");
									}
								});
							}
						})
					}else{
						Ext.zion.db.getJSON("management.corp.update", params, function(data) {
							if (data.r && data != 0) {
								Ext.Msg.alert("提示", "修改成功");
								reloadCorpTree();
								win.close();
								grid.store.reload();
							} else {
								Ext.Msg.alert("提示", "数据修改错误");
							}
						});
					}
				} else {
					// 增加操作
					var sm = grid.getSelectionModel().getSelected();
					var params = [];
					params = Ext.zion.form.getParams(formPanel.form, [ 'corp_name', 'enable', 'memo', 'system_name', 'system_copyright' ]);
					params.unshift(selectCorpId);
					params.push(0);
					Zion.db.getJSON('management.corp.corp_id.select',null,function(data){
						if(!data.f){
							var corp_id = data.r[0][0];
							params.unshift(corp_id);
							var filePath = formPanel.getForm().findField('file_path').getValue();
							var fileType = filePath.substring(filePath.indexOf('.'),filePath.length);
							var file_name = filePath.substring(filePath.lastIndexOf('\\')+1);
							var path = corp_id+'.jpg';
							var url = '/upload/'+Ext.zion.token+'/corp_poi/'+Zion.util.encodeParam([path]);
							if(formPanel.getForm().findField('file_path').getValue().length>0){
								formPanel.getForm().submit({
									url : url,
									waitTitle: '请稍等...',
									waitMsg : '上传中......',
									success : function(form,action){
										
									},
									failure : function(form,action){
										if(action.result.r == 'ok'){
											Ext.zion.db.getJSON("management.corp.insert", params, function(data) {
												if (data.r == 1) {
													Ext.Msg.alert("提示", "数据添加成功");
													Zion.db.getJSON('management.corp.axiom_info_type.insert',['管线',corp_id,'管线','pipeline','pipe',0],function(data){
														if(data.r){
															
														}
													});
													reloadCorpTree();
													win.close();
													grid.store.reload();
												} else {
													Ext.Msg.alert("提示", "数据添加错误");
												}
											});
										}else{
											Ext.Msg.alert('上传提示','上传图片错误');
											Ext.getCmp('add_attribute').disable();
										}
									}
								})
							}else{
								Ext.zion.db.getJSON("management.corp.insert", params, function(data) {
									if (data.r == 1) {
										Ext.Msg.alert("提示", "数据添加成功");
										Zion.db.getJSON('management.corp.axiom_info_type.insert',['管线',corp_id,'管线','pipeline','pipe',0],function(data){
											if(data.r){
												
											}
										});
										reloadCorpTree();
										win.close();
										grid.store.reload();
									} else {
										Ext.Msg.alert("提示", "数据添加错误");
									}
								});
							}					
						}else{
						
						}
					})
					
				}
			}
		}

		// ----------修改window表单---------
		function updateForm() {
			var sm = grid.getSelectionModel().getSelected();
			var sm_num = grid.selModel.getSelections().length;
			if (sm_num != 1) {
				Ext.Msg.alert("修改操作", "请选择一条修改记录");
			} else {
				update = true;
				add_from();
				formPanel.form.loadRecord(sm);
			}
		}

		// 删除客户信息
		var id = [];
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
									id.push(member.corp_id);
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
				var corp_id = id.pop();
				Zion.db.getJSON('management.corp.axiom_info_type.delete',[corp_id,'pipeline','pipe'],function(data){
					if(data.r){
						Ext.zion.db.getJSON("management.corp.delete", [ corp_id ], function(data) {
							if (data.r != 0 && data.r) {
								Ext.Msg.alert("提示", "删除成功");
							} else {
								Ext.Msg.alert("提示", "删除失败");
							}
							deleNext();
						});
					}
				});
			} else {
				reloadCorpTree();
				grid.store.reload();
			}
		}

		function findCorpNode(node, corpId) {
			if (node.attributes.corp.corp_id == corpId) {
				return node;
			}
			if (node.hasChildNodes()) {
				for ( var i = 0; i < node.childNodes.length; i++) {
					var nd = findCorpNode(node.childNodes[i], corpId);
					if (nd) {
						return nd;
					}
				}
			}
		}

		function selectCorpNode(corpId) {
			var node = tree.getRootNode();
			if (node.hasChildNodes()) {
				for ( var i = 0; i < node.childNodes.length; i++) {
					var tmp = findCorpNode(node.childNodes[i], corpId);
					if (tmp) {
						tmp.select();
					}
					return;
				}
			}
		}

		function reloadCorpTree() {
			disableButton();
			Ext.zion.tree.loadCorpTree(function(corpTree) {
				tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
				selectCorpNode(selectCorpId);
				loadMask.hide();
			}, this);
		}

		function newAddForm() {
			update = false;
			add_from();
		}

		function reloadChildCorp() {
			disableButton();
			store.constructor( {
				db : {
					alias : "management.corp.select",
					params : [ selectCorpId ]
				},
				root : "r",
				fields : [ 'corp_id', 'corp_name', 'enable', 'system_name', 'system_copyright', 'memo' ]
			});
			store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
		}

		// =========显示树和grid列表================
		var tree = new Ext.tree.TreePanel( {
			title : '集团列表',
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
					selectCorpId = node.attributes.corp.corp_id;
					reloadChildCorp();
				},
				expandnode : function(node) {
					if (node.attributes.corp) {
						expandNodes[node.attributes.corp.corp_id] = true;
					}
				},
				collapsenode : function(node) {
					if (node.attributes.corp) {
						expandNodes[node.attributes.corp.corp_id] = false;
					}
				}
			}
		});

		// grid自适应
		new Ext.Viewport( {
			layout : 'border',
			border : false,
			items : [ tree, {
				region : 'center',
				layout : 'fit',
				items : [ grid ]
			} ]
		});

		Zion.user.getInfo(function() {
			selectCorpId = Zion.user.corp_id;
			reloadCorpTree();
			reloadChildCorp();
		});
	})
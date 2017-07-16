Ext.onReady(function() {
	Ext.QuickTips.init();
	var meeting_inform = false;
	var apply_formPanel;
	var formPanel;
	var apply_win;
	var win;
	var after_delete_release_params = [];
	var after_delete_release_alias = '';
	var loadMask;
	var fields = [ 'customer_id', 'customer_name', 'telephone', 'fax', 'email', 'address', 
	'corp_id', 'enable', 'reg_date', 'reg_user_id', 'memo', 'is_delete'  ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "wirelessinfo_customer.select"
		},
		root : "r",
		fields : fields
	});
	var info_fields = [ 'release_id', 'release_num', 'content_type', 'info_class', 'start_time', 'end_time', 'text', 'customer_id', 'customer_name', 'state', 'release_type', 'create_time' , 'release_cost' , 'path', 'path_name'];
	var info_store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "wirelessinfo_release.select"
		},
		root : "r",
		fields : info_fields
	});
	var sm = new Ext.grid.CheckboxSelectionModel({singleSelect : true});
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {Ext.getCmp('editButton').enable();} else {Ext.getCmp('editButton').disable();}
		if (grid.selModel.getSelections().length != 0) {Ext.getCmp('deleteButton').enable();} else {Ext.getCmp('deleteButton').disable();}
	});
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {Ext.getCmp('editButton').enable();} else {Ext.getCmp('editButton').disable();}
		if (grid.selModel.getSelections().length !=0) {Ext.getCmp('deleteButton').enable();} else {Ext.getCmp('deleteButton').disable();}
	});
	var grid = new Ext.grid.GridPanel( {
		title : '客户信息列表',
		store : store,
		sm : sm,
		loadMask:{ msg: '查询中...' },
		flex : 1,
		autoScroll : true,
		columns : [ sm,{header : "序号",dataIndex : 'customer_id',width : 50,sortable : true}, 
			{header : "客户姓名",dataIndex : 'customer_name',width : 120,sortable : true}, 
			{header : "客户电话",width : 120,dataIndex : 'telephone',sortable : true}, 
			{header : "传真",width : 120,dataIndex : 'fax',sortable : true}, 
			{header : "email",width : 120,dataIndex : 'email',sortable : true}, 
			{header : "地址",width : 120,dataIndex : 'address',sortable : true}, 
			{header : "备注",width : 120,dataIndex : 'memo',sortable : true}, 
			{header : "信息发布申请",width : 120,sortable : true,renderer: function (value, meta, record){var formatStr = "<a href='javascript:void({0});' onclick='javscript:return false;' class='apply'>申请</a>";var resultStr = String.format(formatStr, record.get('customer_id'));return "<div class='controlBtn'>" + resultStr + "</div>";}}
		],
		tbar : [ {id : 'addButton',text : '新增',icon : Ext.zion.image_base+'/add.gif',tooltip : '添加新纪录',handler : function() {meeting_inform = true;meeting_inform_show();},scope : this
		}, '-', {id : 'editButton',disabled:true,text : '修改',icon : Ext.zion.image_base+'/update.gif',tooltip : '修改记录',handler : function() {updateForm();},scope : this
		}, '-', {text : '删除',id : 'deleteButton',disabled:true,icon : Ext.zion.image_base+'/delete.gif',tooltip : '删除记录',handler : deleteForm,scope : this
		}, '-', {text : '刷新',icon : Ext.zion.image_base+'/refresh.gif',tooltip : '刷新纪录',handler : function() {grid.store.reload();Ext.getCmp('editButton').disable();Ext.getCmp('deleteButton').disable();},scope : this
		}],
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : ['客户名称',{xtype:'textfield',width:120,id:'customer_name'}, 
						{text : '查询',tooltip : '查询',icon : Ext.zion.image_base+'/select.gif',handler : selectForm} 
					]
				})
				tbar.render(this.tbar);
			}
		},
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		})
	});

	store.load( {params : {start : 0,limit : Ext.zion.page.limit}});

	var info_sm = new Ext.grid.CheckboxSelectionModel();
	info_sm.on('rowselect', function() {
		if (info_grid.selModel.getSelections().length == 1) {Ext.getCmp('info_editButton').enable();} else {Ext.getCmp('info_editButton').disable();}
		if (info_grid.selModel.getSelections().length != 0) {Ext.getCmp('info_deleteButton').enable();} else {Ext.getCmp('info_deleteButton').disable();}
	});
	info_sm.on('rowdeselect', function() {
		if (info_grid.selModel.getSelections().length == 1) {Ext.getCmp('info_editButton').enable();} else {Ext.getCmp('info_editButton').disable();}
		if (info_grid.selModel.getSelections().length !=0) {Ext.getCmp('info_deleteButton').enable();} else {Ext.getCmp('info_deleteButton').disable();}
	});
	var info_grid = new Ext.grid.GridPanel( {
		title : '信息发布申请列表',
		store : info_store,
		sm : info_sm,
		loadMask:{ msg: '查询中...' },
		autoScroll : true,
		flex : 1,
		columns : [ info_sm,{header : "编号",dataIndex : 'release_id',width : 50,sortable : true},
			{header : "信息类型",width:120,dataIndex:'content_type',sortable : true,renderer:function(content_type){if(content_type == 0){return "文本";}else if(content_type == 1){return "音频";}else{return "视频";}}},
			{header : "信息分类",width:120,dataIndex:'info_class',sortable : true,renderer:function(info_class){if(info_class == 0){return "公共信息";}else if(info_class == 1){return "政府公告";}else{return "广告";}}},
			{header : "起始日期",dataIndex : 'start_time',width : 120,sortable : true , renderer:dateFormat},
			{header : "终止日期",dataIndex : 'end_time',width : 120,sortable : true , renderer:dateFormat},
			{header : "信息内容",dataIndex : 'text',width : 120,sortable : true,renderer:function(text,c,r){var sound = r.data["sound"];var video = r.data["video"];if(!sound&& video ){return '<a href="javascript:player('+ video + ');">'+ text + '</a>';}else if(sound && !video){return '<a href="javascript:player('+ sound + ');">'+ text + '</a>';}else{return text;}}},
			{header : "客户名称",dataIndex : 'customer_name',width : 120,sortable : true},
			{header : "状态",dataIndex : 'state',width : 120,sortable : true,renderer:function(state,c,r){var release_id = r.data["release_id"];var release_num = r.data["release_num"]; return ['待审核','审核通过','审核不通过','发布中','已发布','申请停播','过期停播','强行停播'][state];}},
			{header : "申请状态",dataIndex : 'release_type',width : 120,sortable : true,renderer:function(release_type){return ['新增','修改','停播'][release_type];}},
			{header : "创建时间",dataIndex : 'create_time',width : 150,sortable : true,renderer:timeStr},
			{header : "信息费用(￥)",dataIndex : 'release_cost',width : 120,sortable : true}
		],
		tbar : [ {
			id : 'info_editButton',disabled:true,text : '修改',icon : Ext.zion.image_base+'/update.gif',tooltip : '修改记录',
			handler : function() {info_updateForm();},scope : this
		}, '-', {
			text : '停播',id : 'info_deleteButton',disabled:true,icon : Ext.zion.image_base+'/delete.gif',tooltip : '停播记录',handler : info_deleteForm,scope : this
		}],
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : ['信息编号：',{xtype:'textfield',width:120,id:'release_num'
						},'-','时 间：',new Ext.form.DateField({width:120,id:'start_time_search',name : 'start_time_search',format:'Y年m月d日',editable:false,emptyText:'起始日期'}) ,'~',
						new Ext.form.DateField({id:'end_time_search',width:120,name : 'end_time_search',format:'Y年m月d日',editable:false,emptyText:'终止日期'}),
							{text : '查询',tooltip : '查询',icon : Ext.zion.image_base+'/select.gif',handler:function(){select_all();}
						},'-',{text : '清除条件',tooltip : '清除查询条件',icon : Ext.zion.image_base+'/cross.png',handler:function(){Ext.getCmp('release_num').reset();Ext.getCmp('start_time_search').reset();Ext.getCmp('end_time_search').reset();}
						} ]
				});
				tbar.render(this.tbar);
			}
		},
		bbar : new Ext.PagingToolbar( {
			store : info_store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		})
	});
	
	var info_id = [];
	function info_deleteForm(){
		var sm = info_grid.getSelectionModel().getSelections();
		if (sm.length == 0) {
			Ext.Msg.alert("停播操作", "请选择要停播的项");
		} else {
			if (sm.length > 0) {
				Ext.Msg.confirm('停播确认', '你是否确认停播选中的记录？', function(btn) {
					if (btn == 'yes') {
						loadMask = new Ext.LoadMask(Ext.getBody() , {
							msg : "操作中，请稍后 ..."
						});
						loadMask.show();
						info_id = [];
						for ( var i = 0; i < sm.length; i += 1) {
							var member = sm[i].data;
							if (member) {
								info_id.push(member.release_id);
							}
						}
						if (info_id.length > 0) {

							//info_store.remove(sm);
							info_deleNext();
						}
					}
				})
			}
		}
	}

	var info_deleNext = function() {
		if (info_id.length > 0) {
			var info_id_ = info_id.pop();
			Ext.zion.db.getJSON("wirelessinfo_release_op.ref_release_id.select", [ info_id_ ],function(data) {
				if(data.r.length > 0){
					release_select(data);
				}else {
					Ext.zion.db.getJSON("wirelessinfo_release.release_id.select", [ info_id_ ],function(data) {
						if(data.r.length > 0){
							release_select(data);
						}
					});
				}
				/*if (data.r == 1) {
					Ext.Msg.alert("提示", "删除成功");
					Ext.getCmp('editButton').disable();
					Ext.getCmp('deleteButton').disable();
				} else {
					Ext.Msg.alert("提示", "删除失败");
				}
				info_deleNext();*/
			});
		} else {
			info_grid.store.constructor( {
				db : {
					params : after_delete_release_params,
					alias : after_delete_release_alias
				},
				root : "r",
				fields : info_fields
			});
			info_grid.store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
			loadMask.hide();
			Ext.Msg.alert("提示", "删除成功");
			Ext.getCmp('info_editButton').disable();
			Ext.getCmp('info_deleteButton').disable();
		}
	}
	function release_select(data){
		var release_id = data.r[0][0];
		var release_num = data.r[0][1];
		var ref_release_id = release_id;
		var content_type = data.r[0][2]; 
		var text = data.r[0][3];
		var customer_id = data.r[0][6];
		var start_time = data.r[0][7];
		var end_time = data.r[0][8];
		var create_time = parseInt(new Date().getTime()/1000);
		var release_cost = data.r[0][14];
		var path = data.r[0][15];
		var info_class = data.r[0][18];
		var memo = data.r[0][22];
		var params = [content_type, text, customer_id, start_time, end_time, create_time, release_cost, 
			path, info_class, memo, ref_release_id, release_num ];
		Ext.zion.db.getJSON("wirelessinfo_release.modify.delete", [create_time, release_id] ,function(data) {
				Ext.zion.db.getJSON("wirelessinfo_release_op.delete.delete", [create_time, release_id] ,function(data) {
						Ext.zion.db.getJSON("wirelessinfo_release_op_seq_id.nextval", null, function(data) {
							params.push(data.r[0][0]);
								Ext.zion.db.getJSON("wirelessinfo_release_op.delete.insert", params ,function(data) {
									if(data.r == 1){
										info_deleNext();
									} else {
										loadMask.hide();
										Ext.Msg.alert("提示", "删除失败");
									}
								});

						});
				});
		});
	}
    
	function info_updateForm(){
		inform_release = false;
		var sm = info_grid.getSelectionModel().getSelected();
		var sm_num = info_grid.selModel.getSelections().length;
		if (!sm) {
			Ext.Msg.alert("修改操作", "请选择要修改的项");
		} else if (sm_num > 1) {
			Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
		} else {
			var customer_id = sm.get('customer_id');
			var release_id = sm.get('release_id');
			var info_class = sm.get('info_class');
			var path_name = sm.get('path_name');
			applywin_show(customer_id, release_id, info_class, path_name);
			apply_formPanel.form.loadRecord(sm);
			apply_formPanel.get('start_time').setValue(new Date(sm.get('start_time') * 1000));
			apply_formPanel.get('end_time').setValue(new Date(sm.get('end_time') * 1000));
			
			var content_type = Ext.getCmp('content_type').getValue();
			if(content_type == 0){
				Ext.getCmp('text').allowBlank = false;
						Ext.getCmp('text').setDisabled(false);
						Ext.getCmp('form-file').allowBlank = true;
						Ext.getCmp('form-file').setDisabled(true);
						Ext.getCmp('form-file').setValue('');
					}else{
						Ext.getCmp('text').allowBlank = true;
						Ext.getCmp('text').setDisabled(true);
						Ext.getCmp('text').setValue('');
						Ext.getCmp('form-file').allowBlank = false;
						Ext.getCmp('form-file').setDisabled(false);
								
			}
		}
	}

	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		updateForm();
	}
	info_grid.addListener('rowdblclick', updateInfoGridRowClick);
	function updateInfoGridRowClick(grid, rowIndex, e) {
		info_updateForm();
	}
	grid.addListener('rowclick', gridRowClick);
	function gridRowClick(grid, rowIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		var customer_id = record.get('customer_id');
		var paramsA = [customer_id, customer_id];
		info_grid.store.constructor( {
			db : {
				params : paramsA,
				alias : "wirelessinfo_release.select"
			},
			root : "r",
			fields : info_fields
		});
		info_grid.store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
		after_delete_release_params = [ customer_id, customer_id ];
	    after_delete_release_alias = 'wirelessinfo_release.select';

	}
	grid.addListener('cellclick', applyCellclick);
	function applyCellclick(grid, rowIndex, columnIndex, e) {   
		var btn = e.getTarget('.controlBtn');
		if (btn) {
	    	var t = e.getTarget();
	    	var record = grid.getStore().getAt(rowIndex);
	    	var control = t.className;
	    	switch (control) {
		    case 'apply':
				inform_release = true;
				applywin_show(record.get('customer_id'));
		      break;
	    	}
		}   
	}

	function applywin_show(customer_id, release_id, info_class, path_name) {
		if(!path_name){
			path_name = '';
		}
		var contenttype_combo = new Ext.form.ComboBox({
			id: 'content_type',
			name: 'content_type',
			fieldLabel : '信息类型',
			hiddenName : 'value',
			valueField : 'value',
			store : new Ext.data.ArrayStore({
				fields: ['name', 'value'],
				data : [['文本',0],['声音',1],['视频',2]]
			}),
			displayField : 'name',
			editable : false,
			triggerAction : 'all',
			allowBlank : false,
			mode: 'local',
			emptyText : '请选择信息类型...',
			listeners: {
				select : function( combo, record, index ) {
					if(record.data.value == 0){
						Ext.getCmp('text').allowBlank = false;
						Ext.getCmp('text').setDisabled(false);
						Ext.getCmp('form-file').allowBlank = true;
						Ext.getCmp('form-file').setDisabled(true);
						Ext.getCmp('form-file').setValue('');
					}else{
						Ext.getCmp('text').allowBlank = true;
						Ext.getCmp('text').setDisabled(true);
						Ext.getCmp('text').setValue('');
						Ext.getCmp('form-file').allowBlank = false;
						Ext.getCmp('form-file').setDisabled(false);
						
					}
				}
			}
		});

		var infoclass_combo = new Ext.form.ComboBox({
			id: 'info_class',
			name: 'info_class',
			fieldLabel : '信息分类',
			hiddenName : 'value',
			valueField : 'value',
			store : new Ext.data.ArrayStore({
				fields: ['name', 'value'],
				data : [['公共信息',0],['政府公告',1],['广告',2]]
			}),
			displayField : 'name',
			editable : false,
			triggerAction : 'all',
			allowBlank : false,
			mode: 'local',
			emptyText : '请选择信息分类...',
			listeners: {
				select : function( combo, record, index ) {
					if(record.data.value == 2){
						Ext.getCmp('release_cost').setDisabled(false);
						Ext.getCmp('release_cost').reset();
					}else{
						Ext.getCmp('release_cost').setDisabled(true);
						Ext.getCmp('release_cost').setValue(0);
					}
				}
			}
		});

		apply_formPanel = new Ext.form.FormPanel({
			defaultType : 'textfield',
			labelWidth: 60,
			fileUpload: true,
			defaults : {
				width: 170
			},
			items : [ 
				contenttype_combo,
				infoclass_combo,
				new Ext.form.DateField({
					name : 'start_time',
					fieldLabel : '起始日期',
					format : 'Y年m月d日',
					editable: false,
					allowBlank : false,
					id : 'start_time',
					listeners: {
						'select' : function() {
							//if(inform_release){
								var start = Ext.getCmp('start_time').getValue();
								var start_ = start;
								start_.setDate(start_.getDate() + 1);
								Ext.getCmp('end_time').setMinValue(start_);
								var endDate = Ext.getCmp('end_time').getValue();
								if(start > endDate){
									Ext.getCmp('end_time').setValue(start_);
								}
							//}
							
						}
					}
				}), new Ext.form.DateField({
					name : 'end_time',
					fieldLabel : '终止日期',
					format : 'Y年m月d日',
					editable: false,
					allowBlank : false,
					id : 'end_time',
					listeners: {
						'select' : function() {
							//if(inform_release){
								var endDate = Ext.getCmp('end_time').getValue();
								var endDate_ = endDate;
								endDate_.setDate(endDate_.getDate() - 1);
								Ext.getCmp('start_time').setMaxValue(endDate_);
								var start = Ext.getCmp('start_time').getValue();
								if(start > endDate){
									Ext.getCmp('start_time').setValue(endDate_);
								}
							//}
						}
					}
				}),{
					fieldLabel : '信息内容',
					name : 'text',
					id:'text',
					xtype: 'textarea',
					allowBlank : false,
					blankText : '不能为空',
					maxLength : 128
				},{
					xtype: 'fileuploadfield',
					id: 'form-file',
					emptyText: '选择上传文件',
					fieldLabel: '文件',
					name: 'form-file',
					//allowBlank : false,
					blankText : '请选择上传文件',
					buttonText: '',
					disabled: true,
					value: path_name,
					buttonCfg: {
						iconCls: 'upload-icon'
					}
				},{
					fieldLabel : '信息费用',
					xtype: 'numberfield',
					name : 'release_cost',
					id:'release_cost',
					allowBlank : false,
					blankText : '不能为空',
					maxLength : 16,
					value: 0,
					disabled: true
				},{
					xtype: 'hidden',
					name : 'customer_id_apply',
					id:'customer_id_apply'
				},{
					xtype: 'hidden',
					name : 'release_id_apply',
					id:'release_id_apply'
				},{
					xtype: 'hidden',
					name : 'path',
					id:'path'
				}
			]
		});

		// ----window表单----
		apply_win = new Ext.Window( {
			title : '信息发布申请',
			closable : true,
			width: 300,
			items : [ apply_formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					if (inform_release) {
						add_info_form(apply_formPanel.getForm(), apply_win);
					} else {
						update_info_form(apply_formPanel.getForm(), apply_win, path_name)
					}
				}
			}, {
				text : '取消',
				handler : function() {
					apply_formPanel.form.reset();
					apply_win.close();
				}
			} ]
		})
		apply_win.show();
		Ext.getCmp('customer_id_apply').setValue(customer_id);
		if(release_id){
			Ext.getCmp('release_id_apply').setValue(release_id);
		}
		if(info_class && info_class == 2){
			Ext.getCmp('release_cost').setDisabled( false );
		}
	}

	function update_info_form(formPanel, win, path_name){
		if (formPanel.isValid() == false) {
			return false;
		}
		loadMask = new Ext.LoadMask(win.el , {
			msg : "操作中，请稍后 ..."
		});
		loadMask.show();
		var content_type_ = Ext.getCmp('content_type').getValue();
		var file_ = Ext.getCmp('form-file').getValue();
		if(content_type_ == 0 || path_name == file_){
			release_modify(file_, win, apply_formPanel.get('path').getValue());
		}else{
			Ext.zion.db.getJSON("wirelessinfo_media_id.select", null, function(data) {
				var file_ = Ext.getCmp('form-file').getValue();
				file_ = file_.substring(file_.lastIndexOf('\\')+1);
				var suffix_ = file_.substring(file_.lastIndexOf('.'));
				var url_ = '/upload/'+Ext.zion.token+'/wirelessinfo/'+Zion.util.encodeParam([data.r[0][0] + suffix_]);
				formPanel.submit({
					url: url_,
					waitTitle: '请稍等...',
					waitMsg: '上传文件中...',
					success: function(fp, o){
						release_modify(file_, win, data.r[0][0] + suffix_);
					}
				});
			});
		}
	}

	function release_modify(file_, win, db_file){
		Ext.zion.db.getJSON("wirelessinfo_release_op_seq_id.nextval", null, function(data) {
			var params = [];
			var text_ = Ext.getCmp('text').getValue();
			var release_cost_ = Ext.getCmp('release_cost').getValue();
			var customer_id_apply_ = Ext.getCmp('customer_id_apply').getValue();
			var start_time_ = Ext.getCmp('start_time').getValue().getTime()/1000;
			var end_time_ = Ext.getCmp('end_time').getValue().getTime()/1000+24*3600-1;
			var content_type_ = Ext.getCmp('content_type').getValue();
			var info_class_ = Ext.getCmp('info_class').getValue();
			var release_id_ = Ext.getCmp('release_id_apply').getValue();

			params.push(content_type_);
			params.push(text_);
			params.push(customer_id_apply_);
			params.push(start_time_);
			params.push(end_time_);
			params.push(parseInt(new Date().getTime()/1000));
			params.push(release_cost_);
			params.push(info_class_);
			params.push(db_file);
			params.push(data.r[0][0]);
			params.push(release_id_);
			params.push(release_id_);
			params.push(file_);
			
			var paramsD = [];
			paramsD.push(parseInt(new Date().getTime()/1000));
			paramsD.push(release_id_);

			Ext.zion.db.getJSON("wirelessinfo_release_op.modify.delete", paramsD, function(data) {
				if (data) {
					Ext.zion.db.getJSON("wirelessinfo_release.modify.delete", paramsD, function(data) {
						if (data) {
							Ext.zion.db.getJSON("wirelessinfo_release_op.modify.insert", params, function(data) {
								if (data.r == 1) {
									//var customer_id_apply = Ext.getCmp('customer_id_apply').getValue()
									//var paramsA = [customer_id_apply, customer_id_apply];
									info_grid.store.constructor( {
										db : {
											//params : paramsA,
											//alias : "wirelessinfo_release.select"
											params : after_delete_release_params,
											alias : after_delete_release_alias
										},
										root : "r",
										fields : info_fields
									});
									info_grid.store.load( {
										params : {
											start : 0,
											limit : Ext.zion.page.limit
										}
									});
									loadMask.hide();
									win.close();
									Ext.Msg.alert("提示", "数据修改成功");
								} else {
									loadMask.hide();
									Ext.Msg.alert("提示", "数据修改错误");
								}
							});
						}
					});
				}
			});
		});
	}

	function add_info_form(formPanel, win){
		if (formPanel.isValid() == false) {
			return false;
		}
		loadMask = new Ext.LoadMask(win.el , {
			msg : "操作中，请稍后 ..."
		});
		loadMask.show();
		var content_type_ = Ext.getCmp('content_type').getValue();
		if(content_type_ == 0){
			release_insert('', win, '');
		}else{
			Ext.zion.db.getJSON("wirelessinfo_media_id.select", null, function(data) {
				var file_ = Ext.getCmp('form-file').getValue();
				file_ = file_.substring(file_.lastIndexOf('\\')+1);
				var suffix_ = file_.substring(file_.lastIndexOf('.'));
				var url_ = '/upload/'+Ext.zion.token+'/wirelessinfo/'+Zion.util.encodeParam([data.r[0][0] + suffix_]);
				formPanel.submit({
					url: url_,
					waitTitle: '请稍等...',
					waitMsg: '上传文件中...',
					success: function(fp, o){
						release_insert(file_, win, data.r[0][0] + suffix_);
					}
				});
			});
			
		}
	}

	function release_insert(file_, win, db_file){
		Ext.zion.db.getJSON("wirelessinfo_release_op_seq_id.nextval", null, function(data) {
			var params = [];
			var text_ = Ext.getCmp('text').getValue();
			var release_cost_ = Ext.getCmp('release_cost').getValue();
			var customer_id_apply_ = Ext.getCmp('customer_id_apply').getValue();
			var start_time_ = Ext.getCmp('start_time').getValue().getTime()/1000;
			var end_time_ = Ext.getCmp('end_time').getValue().getTime()/1000+24*3600-1;
			var content_type_ = Ext.getCmp('content_type').getValue();
			var info_class_ = Ext.getCmp('info_class').getValue();
			params.push(content_type_);
			params.push(text_);
			params.push(customer_id_apply_);
			params.push(start_time_);
			params.push(end_time_);
			params.push(parseInt(new Date().getTime()/1000));
			params.push(release_cost_);
			params.push(info_class_);
			params.push(db_file);
			params.push(data.r[0][0]);
			params.push(data.r[0][0]);
			params.push(file_);
		
			Zion.db.getJSON("wirelessinfo_release.insert", params, function(data) {
				if (data.r == 1) {
					var customer_id_apply = Ext.getCmp('customer_id_apply').getValue();
					var paramsA = [customer_id_apply, customer_id_apply];
					info_grid.store.constructor( {
						db : {
							params : paramsA,
							alias : "wirelessinfo_release.select"
						},
						root : "r",
						fields : info_fields
					});
					info_grid.store.load( {
						params : {
							start : 0,
							limit : Ext.zion.page.limit
						}
					});
									loadMask.hide();
					win.close();
					Ext.Msg.alert("提示", "数据添加成功");
				} else {
									loadMask.hide();
					Ext.Msg.alert("提示", "数据添加错误");
				}
			});
		});
	}

	function select_all(){
		var release_num = Ext.getCmp('release_num').getValue();
		var start_time = Ext.getCmp('start_time_search').getValue();
		var end_time = Ext.getCmp('end_time_search').getValue();
		var release_num_value;
		var start_time_value;
		var end_time_value;
		if(release_num){
			release_num_value = 0;
		}else{
			release_num_value = 1;
		}
		if(start_time){
			start_time_value = 0;
			start_time = start_time.getTime()/1000;
		}else{
			start_time_value = 1;
		}
		if(end_time){
			end_time_value = 0;
			end_time = end_time.getTime()/1000+24*3600-1;
		}else{
			end_time_value = 1;
		}

		var paramsA = [ release_num, release_num_value, start_time, start_time_value, end_time, end_time_value,
						release_num, release_num_value, start_time, start_time_value, end_time, end_time_value];
		info_grid.store.constructor( {
			db : {
				params : paramsA,
				alias : 'wirelessinfo_release.params.select'
			},
			root : "r",
			fields : info_fields
		});
		info_grid.store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});

		after_delete_release_params = [ release_num, release_num_value, start_time, start_time_value, end_time, end_time_value,
						release_num, release_num_value, start_time, start_time_value, end_time, end_time_value];
	    after_delete_release_alias = 'wirelessinfo_release.params.select';
		Ext.getCmp('info_editButton').disable();
		Ext.getCmp('info_deleteButton').disable();
	}

	function timeStr(n) {
		return new Date(n * 1000).toLocaleString();
	}
	function dateFormat(value) {
		var dt = new Date.parseDate(value, 'U');
		return dt.format('Y年m月d日');
	} 
	function updateForm() {
		meeting_inform = false;
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		if (!sm) {
			Ext.Msg.alert("修改操作", "请选择要修改的项");
		} else if (sm_num > 1) {
			Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
		} else {
			meeting_inform_show();
			formPanel.form.loadRecord(sm);
		}
	}
	function meeting_inform_show() {
		formPanel = new Ext.form.FormPanel({
			defaultType : 'textfield',
			labelWidth:55,
			defaults:{
				width:180
			},
			items : [ {
				fieldLabel : '客户姓名',
				name : 'customer_name',
				allowBlank : false,
				maxLength:24,
				blankText : '不能为空'
			}, {
				fieldLabel : '客户电话',
				maxLength:24,
				name : 'telephone'
			}, {
				fieldLabel : '传真',
				name : 'fax',
				maxLength:24
			}, {
				fieldLabel : 'email',
				name : 'email',
				maxLength:24
			}, {
				fieldLabel : '地址',
				name : 'address',
				maxLength:24
			}, {
				fieldLabel : '备注',
				maxLength:512,
				xtype : 'textarea',
				name : 'memo'
			}, {
				fieldLabel : 'ID',
				name : 'customer_id',
				hideLabel : true,
				hidden : true
			} ]
		})
		// ----window表单----
		win = new Ext.Window( {
			title : '客户信息',
			closable : true,
			width: 300,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					if (meeting_inform) {
						add_meeting_inform(formPanel.getForm(), win);
					} else {
						update_staff_reminded(formPanel.getForm(), win)
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
	function add_meeting_inform(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		loadMask = new Ext.LoadMask(win.el , {
			msg : "操作中，请稍后 ..."
		});
		loadMask.show();
		var params = getParams(formPanel, [  'customer_name', 'telephone', 'fax', 'email', 'address', 'memo' ]);
		params.push(parseInt(new Date().getTime()/1000));
		Ext.zion.db.getJSON("wirelessinfo_customer.insert", params, function(
				data) {
			if (data.r == 1) {
				loadMask.hide();
				Ext.Msg.alert("提示", "数据添加成功");
				win.close();
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			} else {
				loadMask.hide();
				Ext.Msg.alert("提示", "数据添加错误");
			}
		});
	}
	function update_staff_reminded(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		loadMask = new Ext.LoadMask(win.el , {
			msg : "操作中，请稍后 ..."
		});
		loadMask.show();
		var params = getParams(formPanel, [  'customer_name', 'telephone', 'fax', 'email', 'address', 'memo' , 'customer_id']);
		params.unshift(parseInt(new Date().getTime()/1000));
		Ext.zion.db.getJSON("wirelessinfo_customer.update", params, function(
				data) {
			if (data.r == 1) {
				loadMask.hide();
				Ext.Msg.alert("提示", "数据修改成功");
				win.close();
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			} else {
				loadMask.hide();
				Ext.Msg.alert("提示", "数据修改错误");
			}
		});
	}

	function getParams(form, feilds) {
		var values = form.getFieldValues();
		var params = [];
		for ( var i = 0; i < feilds.length; i++) {
			params.push(values[feilds[i]]);
		}
		return params;
	}

	
	// 查询form
	function selectForm() {
		var term = $('#customer_name').val();
		var paramsA = [ term ];
		grid.store.constructor( {
			db : {
				params : paramsA,
				alias : 'wirelessinfo_customer.params.select'
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
		if (sm.length == 0) {
			Ext.Msg.alert("删除操作", "请选择要删除的项");
		} else {
			if (sm.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
					if (btn == 'yes') {
						id = [];
						for ( var i = 0; i < sm.length; i += 1) {
							var member = sm[i].data;
							if (member) {
								id.push(member.customer_id);
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
			Ext.zion.db.getJSON("wirelessinfo_customer.delete", [ id.pop() ],
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
			info_store.removeAll();
			Ext.getCmp('info_editButton').disable();
			Ext.getCmp('info_deleteButton').disable();
		}
	}
	
	// grid自适应
	var view = new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [ {
			margins : '5 0 0 0',
			region : 'center',
			layout : 'vbox',
			layoutConfig : {
				align : 'stretch',
				pack : 'start'
			},
			items : [grid, info_grid]
		} ]
	});
})


		Ext.override(Ext.form.Action.Submit, {
			handleResponse : function(response){
				if(this.form.errorReader){
					var rs = this.form.errorReader.read(response);
					var errors = [];
					if(rs.records){
						for(var i = 0, len = rs.records.length; i < len; i++) {
							var r = rs.records[i];
							errors[i] = r.data;
						}
					}
					if(errors.length < 1){
						errors = null;
					}
					return {
						success : rs.success,
						errors : errors
					};
				}
				return Ext.decode('{success:true}');
			}
		});


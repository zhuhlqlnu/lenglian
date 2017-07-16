Ext.onReady(function() {
	Ext.QuickTips.init();
	var book_add = false;
	var fields = ['id', 'name','sex', 'company', 'post', 'telephone',
				'mobile', 'other_tel', 'email', 'address_company',
				'address', 'memo'];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "address_book.select"
		},
		root : "r",
		fields : fields
	});
	var select_data = [["address_book.select",'所有'],["address_book.query.name",'员工姓名'],["address_book.query.company",'单位名称']];
	var selelct_store =  new Ext.data.SimpleStore( {
		fields : [ 'type', 'name' ],
		data : select_data
	});
	var select_combo = new Ext.form.ComboBox( {
		fieldLabel : '工作表类型',
		hiddenName : 'type',
		valueField : 'type',
		store : selelct_store,
		displayField : 'name',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		anchor : '95%',
		listeners : {
			'select' : function (index){
				var objv = this.getValue();
				if(objv=="address_book.select"){
					Ext.getCmp('term').setValue('');
					Ext.getCmp('term').disable();
				}else{
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
		if (grid.selModel.getSelections().length !=0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	})
	var grid = new Ext.grid.GridPanel({
		store : store,
		sm : sm,
		autoScroll:true,
		columns : [
			sm, {
				header : "编号",
				dataIndex : 'id',
				width:50,
				sortable : true
			}, {
				header : "员工姓名",
				dataIndex : 'name',
				width:100,
				sortable : true
			}, {
				header : "性别",
				dataIndex : 'sex',
				width:100,
				sortable : true,
				renderer:function(value){
					var sex = value == 0?"男":"女";
					return sex;
				}
			}, {
				header : "单位名称",
				width:70,
				dataIndex : 'company',
				sortable : true
			}, {
				header : "职务",
				width:50,
				dataIndex : 'post',
				sortable : true
			}, {
				header : "固定电话",
				width:70,
				dataIndex : 'telephone',
				sortable : true
			}, {
				header : "移动电话",
				dataIndex : 'mobile',
				sortable : true
			}, {
				header : "其他电话",
				dataIndex : 'other_tel',
				sortable : true
			}, {
				header : "邮箱",
				dataIndex : 'email',
				sortable : true
			}, {
				header : "单位地址",
				dataIndex : 'address_company',
				sortable : true
			}, {
				header : "家庭住址",
				dataIndex : 'address',
				sortable : true
			}, {
				header : "备注",
				dataIndex : 'memo',
				sortable : true
			}],
		tbar : [ {
				id : 'addButton',
				text : '新增',
				icon : Ext.zion.image_base+'/add.gif',
				tooltip : '添加新纪录',
				handler : function() {
					book_add = true;
					staff_reminded_show();
				},
				scope : this
			}, '-',
			{
				id : 'editButton',
				disabled:true,
				text : '修改',
				icon : Ext.zion.image_base+'/update.gif',
				tooltip : '修改记录',
				handler : function(){
					updateForm();
				},
				scope : this
			}, '-', {
				id : 'deleteButton',
				disabled:true,
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
					Ext.getCmp('editButton').disable();
					Ext.getCmp('deleteButton').disable();
				},
				scope : this
			},'-', {
				text:'导出报表',
				icon : Ext.zion.image_base+'/report_link.png',
				tooltip : '导出报表',
				handler:function(){
					Ext.Msg.alert("下载报表","<a href='"+Zion.report.getURL('addressbook') + "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");				
				},
				scope : this
			} ],
		// 第二个toolbar
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : [ '请根据',select_combo, {
						xtype : 'textfield',
						width : 150,
						name:'term',
						id : 'term',
						disabled:true
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
			autoFill : true,
			forceFit : true
		} 
	});

	store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	})
		/////////////////////////////////////////////////////////////////////////////////////
		// ----------form表单---------
	function staff_reminded_show(){
		formPanel=new Ext.form.FormPanel({
			    labelWidth : 65,
				frame : true,
				autoHeight : false,
				autoWidth : false,
				bodyStyle : 'padding:5px 5px 0 5px',
				items : [ {
					layout : 'column',
					items : [ {
						columnWidth : .48,
						layout : 'form',
						autoHeight : true,
						defaultType : 'textfield',
						items : [ {
							fieldLabel : '员工姓名',
							name : 'name',
							allowBlank : false,
							blankText : '不能为空',
							maxLength:10,
							anchor : '93%'
						},{
							 xtype:"panel",
					         layout:"column",
					         fieldLabel:'性别',
					         isFormField:true,
					         items:[{
					               columnWidth:.5,
					               xtype:"radio",
					               checked:true,
					               boxLabel:"男",
					               name:"sex",
					               inputValue:0
					         },{
					               columnWidth:.5,
					               xtype:"radio",
					               boxLabel:"女",
					               name:"sex",
					               inputValue:1
					         }]
						}, {
							fieldLabel : '单位名称',
							name : 'company',
							allowBlank : false,
							blankText : '不能为空',
							maxLength:24,
							anchor : '93%'
						},{
							fieldLabel : '职务',
							name : 'post',
							allowBlank : false,
							blankText : '不能为空',
							maxLength:32,
							anchor : '93%'
						},{
							fieldLabel : '固定电话',
							name : 'telephone',
							allowBlank : false,
							blankText : '不能为空',
							regex:/^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/,
							regexText:'电话号码格式不正确',
							maxLength:32,
							anchor : '93%'
						}]
					}, {
						columnWidth : .48,
						layout : 'form',
						autoHeight : true,
						defaultType : 'textfield',
						items : [{
							fieldLabel : '移动电话',
							name : 'mobile',
							regex:/^(1[3-9])\d{9}$/,
							regexText:'手机格式不正确',
							maxLength:12,
							anchor : '93%'
						}, {
							fieldLabel : '其他电话',
							name : 'other_tel',
							maxLength:32,
							anchor : '93%'
						},{
							fieldLabel : '邮箱',
							name : 'email',
							regex:/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/,
							regexText:'邮箱格式不正确',
							maxLength:32,
							anchor : '93%'
						},{
							fieldLabel : '单位地址',
							name : 'address_company',
							maxLength:32,
							anchor : '93%'
						},{
							fieldLabel : '家庭地址',
							name : 'address',
							maxLength:32,
							anchor : '93%'
						},{
			            	fieldLabel: 'ID',
			                name: 'id',
			                hideLabel:true,
			                hidden:true	
						}]
					} ]
				}, {
					layout : 'form',
					items : [ {
						fieldLabel : '备注',
						xtype : 'textarea',
						name : 'memo',
						maxLength:512,
						anchor : '45%'
					} ]
				} ]	 
			})
		// ----window表单----
		win = new Ext.Window({
			title : '通讯录',
			closable : true,
			autoWidth:false,
			autoHeight:false,
			width : 600,
			height : 300,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function(){
					if(book_add){
						add_address_book(formPanel.getForm(),win);
					}else{
						update_address_book(formPanel.getForm(),win)
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
	function getParams(form, feilds) {
		var values = form.getFieldValues();
		var params = [];
		for ( var i = 0; i < feilds.length; i++) {
			params.push(values[feilds[i]]);
		}
		return params;
	}
	function add_address_book(formPanel,win){
		if (formPanel.isValid() == false) {
			return false;
		}
		var name = formPanel.findField("name").getValue();
		var sex = formPanel.findField("sex").getGroupValue();
		var company= formPanel.findField("company").getValue();
		var post= formPanel.findField("post").getValue();
		var telephone= formPanel.findField("telephone").getValue();
		var mobile= formPanel.findField("mobile").getValue();
		var other_tel= formPanel.findField("other_tel").getValue();
		var email= formPanel.findField("email").getValue();
		var address_company= formPanel.findField("address_company").getValue();
		var address= formPanel.findField("address").getValue();
		var memo= formPanel.findField("memo").getValue();
		var params =[name,sex,company,post,telephone,mobile,other_tel,email,address_company,address,memo];
		Ext.zion.db.getJSON("address_book.insert", params, function(data) {
			if (data.r == 1) {
				Ext.Msg.alert("提示", "数据添加成功");
				win.close();
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			} else {
				Ext.Msg.alert("提示", "数据添加错误");
			}
		});	
	}
	function update_address_book(formPanel,win){
		if (formPanel.isValid() == false) {
			return false;
		} 
		var sm = grid.getSelectionModel().getSelected();
		var id = sm.data.id;
		var name = formPanel.findField("name").getValue();
		var sex = formPanel.findField("sex").getGroupValue();
		var company= formPanel.findField("company").getValue();
		var post= formPanel.findField("post").getValue();
		var telephone= formPanel.findField("telephone").getValue();
		var mobile= formPanel.findField("mobile").getValue();
		var other_tel= formPanel.findField("other_tel").getValue();
		var email= formPanel.findField("email").getValue();
		var address_company= formPanel.findField("address_company").getValue();
		var address= formPanel.findField("address").getValue();
		var memo= formPanel.findField("memo").getValue();
		var params =[name,sex,company,post,telephone,mobile,other_tel,email,address_company,address,memo,id];
		Ext.zion.db.getJSON("address_book.update", params,function(data) {
			if (data.r == 1) {
				Ext.Msg.alert("提示", "修改成功");
				win.close();
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			} else {
				Ext.Msg.alert("提示", "数据修改错误");
			}
		});	
	}
	// ----------修改window表单---------
	function updateForm() {
		book_add = false;
		var sm = grid.getSelectionModel().getSelected();
		staff_reminded_show();
		formPanel.form.loadRecord(sm);
	}
	// 查询form
	function selectForm() {
		var type = select_combo.getValue();

		var term = $('#term').val();

		var paramsA;
		if (!Ext.getCmp('term').disabled) {
			paramsA = [term];
		}

		grid.store.constructor({
					db : {
						params : paramsA,
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

	// 删除 form
	var id=[];
	function deleteForm() {
		var sm = grid.getSelectionModel().getSelections();
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
	var deleNext = function() {
		if (id.length > 0) {
			Ext.zion.db.getJSON("address_book.delete", [id.pop()],
					function(data) {
						if (data.r ==1) {
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
		}
	}
	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		updateForm();
	}
	// grid自适应
	var view = new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [ {
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		}]
	});
})
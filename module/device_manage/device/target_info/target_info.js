Ext.onReady(function() {
	Ext.QuickTips.init();
	var d = new Date();
	var t = new Date (d);
	t.setMonth(d.getMonth()+ 1) ;
	if (t.getDate() < d.getDate()){
		t.setDate(0);
	}
	var formPanel;
	var target_add = false;
	var ord_terminal_id;
	var terminal_combo;
	var id = [];
	var id_info = [];
	var store_sql = "axiom_target.target_info.select";
	var fields = [ 'target_id', 'target_name', 'terminal_id', 'terminal_sn', 'enable', 'corp_id' ,
	    'jt_terminal_id', 'target_type_id', 'target_phone', 'if_camera', 'owner_name', 'owner_phone' ,
	    'owner_gender', 'owner_id_card', 'email', 'company', 'address', 'postcode' ,
	    'first_contact', 'first_contact_tel', 'second_contact', 'second_contact_tel', 'start_time', 'expire_time',
	    'update_time', 'valid', 'comm_type', 'province', 'city', 'firm', 'internumber' ,
	    'tonnage', 'road_business_no', 'business_route', 'car_color'
	];
	
	var selectCorpId;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : store_sql,
			params : [ selectCorpId ]
		},
		root : "r",
		fields : fields
	});
	var sm = new Ext.grid.CheckboxSelectionModel();
	sm.on('rowselect', function() {
		var length = grid.selModel.getSelections().length;
		if (length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
		if (length > 0) {
			Ext.getCmp('deleteButton').enable();
			Ext.getCmp('relegateButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
			Ext.getCmp('relegateButton').disable();
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
			Ext.getCmp('relegateButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
			Ext.getCmp('relegateButton').disable();
		}
	})

	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'target_id',
			width : 50,
			sortable : true
		}, {
			header : "名称",
			dataIndex : 'target_name',
			width : 50,
			sortable : true
		}, {
			header : "终端编号",
			dataIndex : 'terminal_sn',
			width : 50,
			sortable : true
		}, {
			header : "是否生效",
			dataIndex : 'enable',
			width : 50,
			sortable : true,
			renderer : function(str) {
				var re_str = '';
				if (1 == str) {
					re_str = '生效';
				} else {
					re_str = '不生效';
				}
				return re_str;

			}
		} ],
		tbar : [ {
			id : 'addButton',
			text : '新增',
			icon : Ext.zion.image_base + '/add.gif',
			tooltip : '添加新纪录',
			handler : function() {
				target_add = true;
				win_show();
			},
			scope : this
		},// '-'给工具栏按钮之间添加'|'
				{
					id : 'editButton',
					disabled : true,
					text : '修改',
					icon : Ext.zion.image_base + '/update.gif',
					tooltip : '修改记录',
					handler : function() {
						update_form();
					},
					scope : this
				}, {
					id : 'deleteButton',
					disabled : true,
					text : '删除',
					icon : Ext.zion.image_base + '/delete.gif',
					tooltip : '删除记录',
					handler : delete_target,
					scope : this
				}, {
					id : 'relegateButton',
					text : '迁移',
					disabled : true,
					icon : Ext.zion.image_base + '/relegate.gif',
					tooltip : '迁移纪录',
					handler : function() {
						var targets = [];
						var sm = grid.getSelectionModel().getSelections();
						for ( var i = 0; i < sm.length; i += 1) {
							targets.push(sm[i].data.target_id);
						}
						relegateTarget(targets, function() {
							grid.store.reload();
							disableButton();
						});
					},
					scope : this
				}, '-', {
					text : '刷新',
					icon : Ext.zion.image_base + '/refresh.gif',
					tooltip : '刷新纪录',
					handler : function() {
						grid.store.reload();
						disableButton();
					},
					scope : this
				} ],
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

	grid.addListener('rowdblclick', updateGridRowClick);

	function updateGridRowClick(grid, rowIndex, e) {
		update_form();
	}

	function win_show(temp_terminal , target_) {
		var terminal_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : [ {
				name : 'terminal_id'
			}, {
				name : 'terminal_sn'
			} ],
			proxy : new Ext.data.ScriptTagProxy( {
				url : ZionSetting.db.url + '/' + Zion.token + '/axiom_terminal_sn.select/' + '[' + selectCorpId + ']'
			})
		});
		terminal_combo = new Ext.form.ComboBox( {
			fieldLabel : '终端编号',
			hiddenName : 'terminal_id',
			valueField : 'terminal_id',
			store : terminal_store,
			displayField : 'terminal_sn',
			editable : false,
			triggerAction : 'all',
			id: 'terminal_id_combo',
			name: 'terminal_id_combo',
			emptyText : '请选择终端编号...'
		});
		if (temp_terminal) {
			terminal_store.loadData( {
				'r' : [ [ temp_terminal[0], temp_terminal[1] ] ]
			});
		}
		
		formPanel = new Ext.form.FormPanel( {
			width: 400,
			defaultType : 'textfield',
			autoScroll : true,
			items : [ {
				fieldLabel : '名称',
				id : 'target_name',
				name : 'target_name',
				allowBlank : false,
				blankText : '不能为空'
			}, terminal_combo, {
				xtype : "radiogroup",
				fieldLabel : '是否生效',
				isFormField : true,
				id : 'enable',
				items : [ {
					columnWidth : .5,
					checked : true,
					xtype : "radio",
					boxLabel : "生效",
					name : "enable",
					inputValue : 1
				}, {
					columnWidth : .5,
					xtype : "radio",
					boxLabel : "不生效",
					name : "enable",
					inputValue : 0
				} ]
			}, {
				fieldLabel : 'target_id',
				hideLabel : true,
				id : 'target_id',
				name : 'target_id',
				hidden : true
			}, {
				fieldLabel : 'corp_id',
				hideLabel : true,
				id : 'corp_id',
				name : 'corp_id',
				value : selectCorpId,
				hidden : true
			},{
	            xtype:'fieldset',
	            title: '车辆信息',
	            collapsible: true,
	            autoScroll : true,
	            defaults: {width: 180},
	            defaultType: 'textfield',
				height:250,
	            collapsed: false,
	            listeners: {
	            	expand : function( p ){
	            		win.setPosition( '150', '0');
	            	},
	            	collapse : function( p ){
	            		win.setPosition( '150', '150');
	            	},
	            },
	            items :[
	                new Ext.form.ComboBox({
	                	fieldLabel: '通讯类型',
		                typeAhead: true,
		                triggerAction: 'all',
		                lazyRender:true,
		                mode: 'local',
		                editable : false,
						allowBlank : false,
		                store: new Ext.data.ArrayStore({
		                    id: 0,
		                    fields: [ 'id', 'name' ],
		                    data: [[1, 'GPRS'], [2, 'CDMA'], [3, 'GPRS+SMS'], [4, 'SMS'], [5, 'CDMA+SMS'], [9, '其他方式']]
		                }),
		                valueField: 'id',
		                displayField: 'name',
		                name: 'commtype',
		                id: 'commtype'
		            }),
		            new Ext.form.ComboBox({
		                store: new Ext.data.SimpleStore({
		                    fields: ["provinceId", "provinceName"],
		                    data:[ [10,'福建省']] 
		                }),
		                valueField :"provinceId",
		                displayField: "provinceName",
		                mode: 'local',
		                forceSelection: true,
						allowBlank : false,
		                blankText:'请选择省份',
		                emptyText:'请选择省份',
		                hiddenName:'provinceName',
		                editable: false,
		                triggerAction: 'all',
		                fieldLabel: '请选择省份',
		                name: 'province',
		                id: 'province'
		            }),
		            new Ext.form.ComboBox({   
		                store: new Ext.data.ArrayStore({ fields: ["cityId",'cityName'], 
		                	data:[ [10,'福州'],[11,'莆田'],[12,'泉州'],[13,'厦门'],
		                	   [14,'漳州'],[15,'龙岩'],[16,'三明'],[17,'南平'],[18,'宁德']                                         
		                	] 
		                }),
		                valueField :"cityId",   
		                displayField: "cityName",   
		                mode: 'local',     
		                forceSelection: true,   
						allowBlank : false,
		                blankText:'选择地区',   
		                emptyText:'选择地区',   
		                hiddenName:'cityName',   
		                editable: false,   
		                triggerAction: 'all',
		                fieldLabel: '选择地区',   
		                name: 'city',
		                id: 'city'
		            }),
		            new Ext.form.ComboBox({
		            	fieldLabel: '厂商(或运营商)',
		                typeAhead: true,
						allowBlank : false,
		                triggerAction: 'all',
		                lazyRender:true,
		                editable : false,
		                mode: 'local',
		                store: new Ext.data.ArrayStore({
		                    id: 0,
		                    fields: [ 'id', 'name' ],
		                    data: [ ['0123', '终端厂商'], ['0123', '运营商'] ]
		                }),
		                valueField: 'id',
		                displayField: 'name',
		                name: 'firm',
		                id: 'firm'
		            }),{
	                    fieldLabel: '内部编号',
	                    name: 'internumber',
	    				allowBlank : false,
		                id: 'internumber'
	                },new Ext.form.ComboBox({
	                	fieldLabel: '车辆类型',
		                typeAhead: true,
		                triggerAction: 'all',
		                lazyRender:true,
	    				allowBlank : false,
		                editable : false,
		                mode: 'local',
		                store: new Ext.data.ArrayStore({
		                    id: 0,
		                    fields: [ 'id', 'name' ],
		                    data: [[11, '省际客运班车'], [12, '市际客运班车'], [13, '旅游客运车辆'], 
		                           [14, '县际客运班车'],
		                           [20, '危险货物运输车辆'], [31, '重型载货汽车'], [32, '半挂牵引车'],
		                           [41, '出租汽车'], [99, '其他']
		                    ]
		                }),
		                valueField: 'id',
		                displayField: 'name',
	                    name: 'target_type_id',
		                id: 'target_type_id'
		            }),{
	                    fieldLabel: '车载电话',
	                    name: 'target_phone',
	    				allowBlank : false,
	                    id: 'target_phone'
	                },{
	    				xtype : "radiogroup",
	    				fieldLabel : '是否支持拍照',
	    				isFormField : true,
	    				id: 'if_camera',
	    				name: 'if_camera',
	    				items : [ {
	    					columnWidth : .5,
	    					xtype : "radio",
	    					boxLabel : "是",
	    					checked: true,
	    					name : "radio1",
	    					inputValue : 1
	    				}, {
	    					columnWidth : .5,
	    					xtype : "radio",
	    					boxLabel : "否",
	    					name : "radio1",
	    					inputValue : 0
	    				} ]
	    			},{
	                    fieldLabel: '车主姓名',
	                    name: 'owner_name',
	                    id: 'owner_name'
	                },{
	                    fieldLabel: '联系电话',
	                    name: 'owner_phone',
	    				allowBlank : false,
	                    id: 'owner_phone'
	                },{
	    				xtype : "radiogroup",
	    				fieldLabel : '性别',
	    				isFormField : true,
	                    name: 'owner_gender',
	                    id: 'owner_gender',
	    				items : [ {
	    					columnWidth : .5,
	    					xtype : "radio",
	    					boxLabel : "男",
	    					name : "radio2",
	    					checked: true,
	    					inputValue : 1
	    				}, {
	    					columnWidth : .5,
	    					xtype : "radio",
	    					boxLabel : "女",
	    					name : "radio2",
	    					inputValue : 0
	    				} ]
	    			},{
	                    fieldLabel: '身份证号',
	                    name: 'owner_id_card',
		                id: 'owner_id_card'
	                },{
	                    fieldLabel: 'email',
	                    name: 'email',
	                    id: 'email'
	                },{
	                    fieldLabel: '工作单位',
	                    name: 'company',
	                    id: 'company'
	                },{
	                    fieldLabel: '地址',
	                    name: 'address',
	                    id: 'address'
	                },{
	                    fieldLabel: '邮编',
	                    name: 'postcode',
	                    id: 'postcode'
	                },{
	                    fieldLabel: '第一联系人',
	                    name: 'first_contact',
	                    id: 'first_contact'
	                },{
	                    fieldLabel: '第一联系人电话',
	                    name: 'first_contact_tel',
	                    id: 'first_contact_tel'
	                },{
	                    fieldLabel: '第二联系人',
	                    name: 'second_contact',
	                    id: 'second_contact'
	                },{
	                    fieldLabel: '第二联系人电话',
	                    name: 'second_contact_tel',
	                    id: 'second_contact_tel'
	                },{
	                	xtype: 'numberfield',
	                    fieldLabel: '吨位',
	    				allowBlank : false,
	                    name: 'tonnage',
	                    id: 'tonnage'
	                },{
	                    fieldLabel: '道路运营证号',
	                    name: 'road_business_no',
	    				allowBlank : false,
	                    id: 'road_business_no'
	                },{
	                    fieldLabel: '运营路线',
	                    name: 'business_route',
	    				allowBlank : false,
	                    id: 'business_route'
	                },{
	                    fieldLabel: '车辆颜色',
	                    name: 'car_color',
	                    id: 'car_color'
	                },{
	                	xtype: 'datefield',
	                    fieldLabel: '服务开始时间',
	                    name: 'start_time',
	                    id: 'start_time',
	                    altFormats: 'Y-m-d',
	                    editable: false,
	                    format: 'Y-m-d',
	                    value: new Date(),
	                    blankText: '请选择服务开始时间',
	                    emptyText: '请选择服务开始时间 ...'
	                },{
	                	xtype: 'datefield',
	                    fieldLabel: '服务到期时间',
	                    name: 'expire_time',
	                    id: 'expire_time',
	                    altFormats: 'Y-m-d',
	                    editable: false,
	                    format: 'Y-m-d',
	                    value: t,
	                    blankText: '请选择服务到期时间',
	                    emptyText: '请选择服务到期时间 ...'
	                }
	            ]
	        } ]
		});
		if(target_){
			set_form(target_);
		}
		// ----window表单----

		var win = new Ext.Window( {
			title : '车辆管理',
			closable : true,
			width: 400,
			resizable: true,
			autoWidth:false,
			autoScroll : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					if (target_add == true) {
						add_target(formPanel.getForm(), win);
					} else {
						update_target(formPanel.getForm(), win);
					}
				}
			}, {
				text : '取消',
				handler : function() {
					win.close();
				}
			} ]
		});
		win.show();
	}
	
	// ----------gird操作---------
	function get_target_info_params(params){
		var commtype_ = Ext.getCmp('commtype').getValue();
		var province_ = Ext.getCmp('province').getValue();
		var city_ = Ext.getCmp('city').getValue();
		var firm_ = Ext.getCmp('firm').getValue();
		var target_type_id_ = Ext.getCmp('target_type_id').getValue();
		
		var params_target_info = [];
		params_target_info.push(trimNull(commtype_)+''+trimNull(province_)+trimNull(city_)+trimNull(firm_)+trimNull(params[3]));//jt_terminal_id commtype province city firm internumber
		params_target_info.push(trimNull(params[0]));//target_name
		params_target_info.push(trimNull(target_type_id_));//target_type_id
		params_target_info.push(trimNull(params[4]));//target_phone
		var if_camera_ = Ext.getCmp('if_camera').getValue();
		params_target_info.push(if_camera_);//if_camera
		params_target_info.push(trimNull(params[5]));//owner_name
		params_target_info.push(trimNull(params[6]));//owner_phone
		var owner_gender_ = Ext.getCmp('owner_gender').getValue();
		params_target_info.push(owner_gender_);//owner_gender
		params_target_info.push(trimNull(params[7]));//owner_id_card
		params_target_info.push(trimNull(params[8]));//email
		params_target_info.push(trimNull(params[9]));//company
		params_target_info.push(trimNull(params[10]));//address
		params_target_info.push(trimNull(params[11]));//postcode
		params_target_info.push(trimNull(params[12]));//first_contact
		params_target_info.push(trimNull(params[13]));//first_contact_tel
		params_target_info.push(trimNull(params[14]));//second_contact
		params_target_info.push(trimNull(params[15]));//second_contact_tel
		if(params[16]){
			params_target_info.push(params[16].getTime()/1000);//start_time
		}else{
			params_target_info.push(null);
		}
		if(params[17]){
			params_target_info.push(params[17].getTime()/1000);//expire_time
		}else{
			params_target_info.push(null);
		}
		params_target_info.push(parseInt(new Date().getTime()/1000));
		params_target_info.push(trimNull(commtype_));
		params_target_info.push(trimNull(province_));
		params_target_info.push(trimNull(city_));
		params_target_info.push(trimNull(firm_));
		params_target_info.push(trimNull(params[3]));
		params_target_info.push(trimNull(params[18]));
		params_target_info.push(trimNull(params[19]));
		params_target_info.push(trimNull(params[20]));
		params_target_info.push(trimNull(params[21]));
		
		return params_target_info;
	}
	function trimNull(val){
		if(!val && val !=0){
			return '';
		}else{
			return val;
		}
	}
	
	function add_target(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		// 增加操作
		var params = Ext.zion.form.getParams(formPanel, [ 
		    'target_name', 'corp_id', 'enable' , 'internumber','target_phone', 
		    'owner_name', 'owner_phone' ,'owner_id_card', 'email', 'company', 
		    'address', 'postcode' ,'first_contact', 'first_contact_tel', 'second_contact', 
		    'second_contact_tel', 'start_time', 'expire_time', 
		    'tonnage', 'road_business_no', 'business_route', 'car_color'
		]);
		var terminal_id_ = terminal_combo.getValue();
		var params_target = [];
		params_target.push(params[0]),params_target.push(terminal_id_),params_target.push(params[1]),params_target.push(Number(params[2]));
		var params_target_info = get_target_info_params(params);
		
		if ('' == terminal_combo.getValue() || null == terminal_combo.getValue()) {
			Ext.zion.db.getJSON("device.targe.get_target_id.query", null, function(data) {
				if (!data.f) {
					params_target.unshift(data.r[0][0]);
					//alert(params_target);
					params_target_info.unshift(data.r[0][0]);
					Ext.zion.db.getJSON("axiom_target.insert", params_target, function(data) {
						if (!data.f) {
							Ext.zion.db.getJSON("axiom_target_info.insert", params_target_info, function(data) {
								if (!data.f) {
									Ext.Msg.alert("提示", "添加成功");
									win.close();
									grid.store.reload();
									disableButton();
								} else {
									Ext.Msg.alert("提示", "数据添加错误");
								}
							});
						} else {
							Ext.Msg.alert("提示", "数据添加错误");
						}
					});
				} else {
					Ext.Msg.alert("提示", "数据添加错误");
				}
			});

		} else {
			var params_up = []
			Ext.zion.db.getJSON("device.targe.get_target_id.query", null, function(data) {
				if (!data.f) {
					params_target.unshift(data.r[0][0]);
					params_up.push(data.r[0][0]);
					params_target_info.unshift(data.r[0][0]);
					params_up.push(terminal_combo.getValue());
					Ext.zion.db.getJSON("axiom_target.insert", params_target, function(data) {
						if (data.r && data.r != 0) {
							Ext.zion.db.getJSON("device.targe.axiom_terminal_new.update", params_up, function(data) {
								if (data.r && data.r != 0) {
									Ext.zion.db.getJSON("axiom_target_info.insert", params_target_info, function(data) {
										if (!data.f) {
											Ext.Msg.alert("提示", "添加成功");
											win.close();
											grid.store.reload();
											disableButton();
										} else {
											Ext.Msg.alert("提示", "数据添加错误");
										}
									});
								} else {
									Ext.Msg.alert("提示", "数据添加错误");
								}
							});
						} else {
							Ext.Msg.alert("提示", "数据添加错误");
						}
					});
				} else {
					Ext.Msg.alert("提示", "数据添加错误");
				}
			});
		}

	}
	// 修改操作
	function update_target(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var params = Ext.zion.form.getParams(formPanel, [ 
		    'target_name', 'corp_id', 'enable' , 'internumber','target_phone', 
		    'owner_name', 'owner_phone' ,'owner_id_card', 'email', 'company', 
		    'address', 'postcode' ,'first_contact', 'first_contact_tel', 'second_contact', 
		    'second_contact_tel', 'start_time', 'expire_time', 'tonnage', 
		    'road_business_no', 'business_route', 'car_color', 'target_id'
		]);
		var terminal_id_ = terminal_combo.getValue();
		var params_target = [];
		params_target.push(params[0]),params_target.push(terminal_id_),params_target.push(Number(params[2])),params_target.push(params[22]);
		var params_target_info = get_target_info_params(params);
		params_target_info.push(Number(params[22]));
		
		var params_up = [];

		if (ord_terminal_id != null && ord_terminal_id != '') {
			Ext.zion.db.getJSON("axiom_target.update", params_target, function(data) {
				if (data.r && data.r != 0) {
					Ext.zion.db.getJSON("device.targe.axiom_terminal.update", [ ord_terminal_id ], function(data) {
						if (data) {
							params_up.push(Ext.getCmp('target_id').getValue());
							params_up.push(terminal_combo.getValue());
							Ext.zion.db.getJSON("device.targe.axiom_terminal_new.update", params_up, function(data) {
								if (data) {
									Ext.zion.db.getJSON("axiom_target_info.select", [params[22]], function(data) {
										if (data.r && data.r.length > 0) {
											Ext.zion.db.getJSON("axiom_target_info.update", params_target_info, function(data) {
												if (data) {
													Ext.Msg.alert("提示", "修改成功");
													win.close();
													grid.store.reload();
													disableButton();
												} else {
													Ext.Msg.alert("提示", "修改失败");
												}
											});
										}else{
											params_target_info.pop();
											params_target_info.unshift(params[22]);
											Ext.zion.db.getJSON("axiom_target_info.insert", params_target_info, function(data) {
												if (data) {
													Ext.Msg.alert("提示", "修改成功");
													win.close();
													grid.store.reload();
													disableButton();
												} else {
													Ext.Msg.alert("提示", "修改失败");
												}
											});
										}
									});
								} else {
									Ext.Msg.alert("提示", "修改失败");
								}
							});
						} else {
							Ext.Msg.alert("提示", "修改失败");
						}
					});
				} else {
					Ext.Msg.alert("提示", "修改失败");
				}
			});
		} else {
			Ext.zion.db.getJSON("axiom_target.update", params_target, function(data) {
				if (data.r && data.r != 0) {
					params_up.push(Number(Ext.getCmp('target_id').getValue()));
					params_up.push(terminal_combo.getValue());
					Ext.zion.db.getJSON("device.targe.axiom_terminal_new.update", params_up, function(data) {
						if (data) {
							Ext.zion.db.getJSON("axiom_target_info.select", [params[22]], function(data) {
								if (data.r && data.r.length > 0) {
									Ext.zion.db.getJSON("axiom_target_info.update", params_target_info, function(data) {
										if (data) {
											Ext.Msg.alert("提示", "修改成功");
											win.close();
											grid.store.reload();
											disableButton();
										} else {
											Ext.Msg.alert("提示", "修改失败");
										}
									});
								}else{
									params_target_info.pop();
									params_target_info.unshift(params[22]);
									Ext.zion.db.getJSON("axiom_target_info.insert", params_target_info, function(data) {
										if (data) {
											Ext.Msg.alert("提示", "修改成功");
											win.close();
											grid.store.reload();
											disableButton();
										} else {
											Ext.Msg.alert("提示", "修改失败");
										}
									});
								}
							});
						} else {
							Ext.Msg.alert("提示", "修改失败");
						}
					});
				} else {
					Ext.Msg.alert("提示", "修改失败");
				}
			});
		}
	}
	
	// ----------修改window表单---------
	function update_form() {
		target_add = false;
		var sm = grid.getSelectionModel().getSelected();
		var temp_terminal = [];
		ord_terminal_id = sm.data.terminal_id;
		temp_terminal.push(sm.data.terminal_id);
		temp_terminal.push(sm.data.terminal_sn);
		win_show(temp_terminal , sm.data);
		//formPanel.form.loadRecord(sm);
	}
	
	function set_form(target_){
		Ext.getCmp('target_id').setValue(target_.target_id);
		Ext.getCmp('target_name').setValue(target_.target_name);
		terminal_combo.setValue(target_.terminal_id);
		Ext.getCmp('enable').setValue(target_.enable);
		Ext.getCmp('commtype').setValue(target_.comm_type);
		Ext.getCmp('province').setValue(target_.province);
		Ext.getCmp('city').setValue(target_.city);
		Ext.getCmp('firm').setValue(target_.firm);
		Ext.getCmp('internumber').setValue(target_.internumber);
		Ext.getCmp('target_type_id').setValue(target_.target_type_id);
		Ext.getCmp('target_phone').setValue(target_.target_phone);
		if(target_.if_camera){
			Ext.getCmp('if_camera').setValue(target_.if_camera);
		}else{
			Ext.getCmp('if_camera').setValue(1);
		}
		Ext.getCmp('owner_name').setValue(target_.owner_name);
		Ext.getCmp('owner_phone').setValue(target_.owner_phone);
		if(target_.owner_gender){
			Ext.getCmp('owner_gender').setValue(target_.owner_gender);
		}else{
			Ext.getCmp('owner_gender').setValue(1);
		}
		Ext.getCmp('owner_id_card').setValue(target_.owner_id_card);
		Ext.getCmp('email').setValue(target_.email);
		Ext.getCmp('company').setValue(target_.company);
		Ext.getCmp('address').setValue(target_.address);
		Ext.getCmp('postcode').setValue(target_.postcode);
		Ext.getCmp('first_contact').setValue(target_.first_contact);
		Ext.getCmp('first_contact_tel').setValue(target_.first_contact_tel);
		Ext.getCmp('second_contact').setValue(target_.second_contact);
		Ext.getCmp('second_contact_tel').setValue(target_.second_contact_tel);
		if(target_.start_time){
			Ext.getCmp('start_time').setValue(new Date(target_.start_time*1000));
		}else{
			var d = new Date();
			d.setMonth(d.getMonth());
			Ext.getCmp('start_time').setValue(d);
		}
		if(target_.expire_time){
			Ext.getCmp('expire_time').setValue(new Date(target_.expire_time*1000));
		}else{
			var d = new Date();
			d.setMonth(d.getMonth()+1);
			Ext.getCmp('expire_time').setValue(d);
		}
		Ext.getCmp('tonnage').setValue(target_.tonnage);
		Ext.getCmp('road_business_no').setValue(target_.road_business_no);
		Ext.getCmp('business_route').setValue(target_.business_route);
		Ext.getCmp('car_color').setValue(target_.car_color);
	}
	var terminal_array = [];
	// 删除 form
	function delete_target() {
		var sm = grid.getSelectionModel().getSelections();
		terminal_array = [];
		if (sm.length == 0) {
			Ext.Msg.alert("删除操作", "请选择要删除的项");
		} else {
			if (sm.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
					if (btn == 'yes') {
						for ( var i = 0; i < sm.length; i += 1) {
							var member = sm[i].data;
							if (member) {
								id.push(member.target_id);
								id_info.push(member.target_id);
								terminal_array.push(member.terminal_id);
							} else {
								store.remove(store.getAt(i));
							}
						}
						if (id.length > 0) {
							deleNext(terminal_array);
						}
					}
				})
			}
		}
	}
	var deleNext = function(terminal_array) {
		if (id.length > 0) {
			Ext.zion.db.getJSON("axiom_target.delete", [ id.pop() ], function(data) {
				if (data.r && data.r != 0) {
					Ext.zion.db.getJSON("device.targe.axiom_terminal.update", [ terminal_array.pop() ], function(data) {
						if (data.r && data.r != 0) {
							Ext.zion.db.getJSON("axiom_target_info.delete", [ id_info.pop() ], function(data) {
								if(data){
									Ext.Msg.alert("提示", "删除成功");
								}
							});
						} else {
							//Ext.Msg.alert("提示", "删除失败");
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

	function relegateTarget(targets, callback, scope) {
		loadMask.show();
		Ext.zion.tree.loadCorpTree(function(tree) {
			var relegateToCorp;
			var corp_tree = new Ext.tree.TreePanel( {
				autoScroll : true,
				width : 250,
				height : 250,
				loader : new Ext.tree.TreeLoader(),
				root : new Ext.tree.AsyncTreeNode(tree),
				rootVisible : false,
				listeners : {
					click : function(node) {
						relegateToCorp = node.attributes.corp.corp_id;
						if (selectCorpId == relegateToCorp) {
							button.disable();
						} else {
							button.enable();
						}
					}
				}
			});

			function relegateTargetToCorp(targets, corp, callback, scope) {
				function doNext() {
					if (targets.length > 0) {
						Ext.zion.db.getJSON("device_manage.device.target.reletage", [ corp, targets.pop() ], function(data) {
							doNext();
						});
					} else {
						if (callback) {
							callback.call(scope || window);
						}
					}
				}
				doNext();
			}

			var button = new Ext.Button( {
				disabled : true,
				text : '保存',
				handler : function() {
					Ext.Msg.confirm('迁移确认', '将同时迁移终端和通讯卡,你是否确认迁移选中的记录?', function(btn) {
						if (btn == 'yes') {
							loadMask.show();
							relegateTargetToCorp(targets, relegateToCorp, function() {
								win.close();
								if (callback) {
									loadMask.hide();
									callback.call(scope || window);
								}
							});
						}
					}, scope);
				}
			});

			var win = new Ext.Window( {
				title : '监控目标迁移',
				closable : true,
				items : [ corp_tree ],
				buttons : [ button, {
					text : '取消',
					handler : function() {
						win.close();
					}
				} ]
			});
			win.show();
			loadMask.hide();
		});

	}

	// ==============tree=================

	function appendCorpNode(corp_list, node, index) {
		var nodeAdd = {};
		nodeAdd.text = corp_list[index][2];
		nodeAdd.expanded = true;
		nodeAdd.corp = {
			corp_id : corp_list[index][0],
			selectCorpId : corp_list[index][1],
			order_by : corp_list[index][3],
			group_id : corp_list[index][4]
		};

		node.children.push(nodeAdd);
		if (corp_list[index].children) {
			nodeAdd.children = [];
			for ( var i = 0; i < corp_list[index].children.length; i++) {
				appendCorpNode(corp_list, nodeAdd, corp_list[index].children[i]);
			}
		} else {
			nodeAdd.leaf = true;
		}
	}

	function createCorpTree(corp_list) {
		var tree = {
			children : []
		};

		for ( var i = 0; i < corp_list.length; i++) {
			for ( var j = 0; j < corp_list.length; j++) {
				if (corp_list[j][0] == corp_list[i][1]) {
					if (!corp_list[j].children) {
						corp_list[j].children = [];
					}
					corp_list[j].children.push(i);
					corp_list[i].child = true;
				}
			}
		}

		for ( var i = 0; i < corp_list.length; i++) {
			if (!corp_list[i].child) {
				appendCorpNode(corp_list, tree, i);
			}
		}

		return tree;
	}

	function loadCorpTree(callback, scope) {
		Zion.db.getJSON('tree.user_corp', null, function(data) {
			if ((data) && (data.r)) {
				if (callback) {
					callback.call(scope || window, createCorpTree(data.r));
				}

			}
		});
	}

	// ==============tree=================
	// =========集团树显示和列表================

	var corp_tree = new Ext.tree.TreePanel( {
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
				store.constructor( {
					db : {
						alias : store_sql,
						params : [ selectCorpId ]
					},
					root : "r",
					fields : fields
				});
				store.load( {
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				});

			}
		}
	});
	// ============集团树显示和列表=======================
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
		Ext.getCmp('relegateButton').disable();
	}
	// ==============获得客户信息==============

	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;

		loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
			loadMask.hide();
		});

		store.constructor( {
			db : {
				alias : store_sql,
				params : [ Zion.user.corp_id ]
			},
			root : "r",
			fields : fields
		});
		store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
	});

	// grid自适应
	new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [ corp_tree, {
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		} ]
	});

})
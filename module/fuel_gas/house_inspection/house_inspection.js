Ext.onReady(function() {
	Ext.QuickTips.init();
	var selectCorpId;
	var add_or_update = false;
	var id = [];
	var fields = ['inspection_id','uptown_name','building_name','unit_name','house_name','owner_name','telphone','gas_name','left_right','gas_bottom','steel_grade','population','inspection_type_id','begin_time','use_gas','surplus_gas','is_leakage','is_sealed_card','is_trouble','end_time','memo','reg_date','user_name'];
	var store_sql = "house_inspection.select";
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	var name_value = {};
	var uptown_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['uptown_id', 'uptown_name'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/house_uptown_name.select/['+selectCorpId+']'
		})
	});

	uptown_store.on('load',function(){
		var uptown_all = new uptown_store.recordType({
			uptown_id : 0,
			uptown_name:'所有'
		});
		uptown_store.insert(0,uptown_all);
	});

	var uptown_combo = new Ext.form.ComboBox({
		hiddenName : 'uptown_id',
		valueField : 'uptown_id',
		store : uptown_store,
		displayField : 'uptown_name',
		width:130,
		editable : false,
		triggerAction : 'all',
		listeners : {
			'expand':function(this_){
				uptown_store.removeAll();
				setTimeout(function(){
					uptown_store.load();
				},0);
			},
			'select' : function(this_, record, index){
				building_combo.setValue("所有");
				house_combo.setValue("所有");
				unit_combo.setValue("所有");
				unit_combo.disable();
				house_combo.disable();
				var uptown_id = record.data["uptown_id"];
				if(uptown_id == 0){
					building_combo.disable();	
					var alias = store_sql;
					var params = selectCorpId;
				}else{
					building_combo.enable();
					var alias = 'house_inspection.by_uptown_id.select';
					var params = uptown_id;
				}
				reload_store(alias,params);
			}				
		}
	});

	var building_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['building_id', 'building_name'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/house_building_name.select/['+uptown_combo.getValue()+','+selectCorpId+']'
		})
	});

	building_store.on('load',function(){
		var building_all = new building_store.recordType({
			building_id : 0,
			building_name:'所有'
		});
		building_store.insert(0,building_all);
	});

	var building_combo = new Ext.form.ComboBox({
		disabled:true,
		hiddenName : 'building_id',
		valueField : 'building_id',
		store : building_store,
		displayField : 'building_name',
		width:130,
		editable : false,
		triggerAction : 'all',
		listeners : {
			'expand':function(this_){
				building_store.removeAll();
				var uptown_id = uptown_combo.getValue();
				setTimeout(function(){
					if(uptown_id == 0 || uptown_id == ""){
						var building_name_url = '/house_building_name_all.select/['+selectCorpId+']';
					}else{
						var building_name_url = '/house_building_name.select/['+uptown_combo.getValue()+','+selectCorpId+']';
					}
					building_store.constructor({
						root : 'r',
						fields : ['building_id', 'building_name'],
						proxy : new Ext.data.ScriptTagProxy({
							url : ZionSetting.db.url + '/' + Zion.token
									+ building_name_url
						})
					});
					building_store.load();
				},0);
			},
			'select' : function(this_, record, index){
				unit_combo.setValue("所有");
				house_combo.setValue("所有");
				house_combo.disable();
				var uptown_id = uptown_combo.getValue();
				var building_id = record.data["building_id"];
				if(uptown_id == 0){
					unit_combo.disable();
					var alias = store_sql;
					var params = selectCorpId;
				}else{
					if(building_id == 0){
						var alias = 'house_inspection.by_uptown_id.select';
						var params = uptown_id;
						unit_combo.disable();
					}else{
						unit_combo.enable();
						var alias = 'house_inspection.by_building_id.select';
						var params = building_id;
					}
				}
				reload_store(alias,params);
			}				
		}
	});

	var unit_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['unit_id', 'unit_name'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/house_unit_name.select/['+building_combo.getValue()+','+selectCorpId+']'
		})
	});

	unit_store.on('load',function(){
		var unit_all = new unit_store.recordType({
			unit_id : 0,
			unit_name:'所有'
		});
		unit_store.insert(0,unit_all);
	});

	var unit_combo = new Ext.form.ComboBox({
		disabled:true,
		hiddenName : 'unit_id',
		valueField : 'unit_id',
		store : unit_store,
		displayField : 'unit_name',
		width:130,
		editable : false,
		triggerAction : 'all',
		listeners : {
			'expand':function(this_){
				unit_store.removeAll();
				var building_id = building_combo.getValue();
				var uptown_id = uptown_combo.getValue();
				setTimeout(function(){
					if(building_id == 0 || building_id == ""){
						var unit_name_url = '/house_unit_name_all.select/['+selectCorpId+','+uptown_id+']';
					}else{
						var unit_name_url = '/house_unit_name.select/['+building_combo.getValue()+']';
					}
					unit_store.constructor({
						root : 'r',
						fields : ['unit_id', 'unit_name'],
						proxy : new Ext.data.ScriptTagProxy({
							url : ZionSetting.db.url + '/' + Zion.token
									+ unit_name_url
						})
					});
					unit_store.load();
				},0);
			},
			'select' : function(this_, record, index){
				var unit_id = record.data["unit_id"];
				var building_id = building_combo.getValue();
				var uptown_id = uptown_combo.getValue();
				house_combo.setValue("所有");
				if(unit_id == 0 || unit_id == ""){
					house_combo.disable();
					var alias = 'house_inspection.by_building_id.select';
					var params = building_id;
				}else{
					house_combo.enable();
					var alias = 'house_inspection.by_unit_id.select';
					var params = unit_id;
				}
				reload_store(alias,params);
			}				
		}
	});

	var house_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['house_id', 'house_name'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/house_house_name.select/['+unit_combo.getValue()+','+selectCorpId+']'
		})
	});

	house_store.on('load',function(){
		var house_all = new house_store.recordType({
			house_id : 0,
			house_name:'所有'
		});
		house_store.insert(0,house_all);
	});

	var house_combo = new Ext.form.ComboBox({
		disabled:true,
		hiddenName : 'house_id',
		valueField : 'house_id',
		store : house_store,
		displayField : 'house_name',
		width:130,
		editable : false,
		triggerAction : 'all',
		listeners : {
			'expand':function(this_){
				house_store.removeAll();
				var unit_id = unit_combo.getValue();
				setTimeout(function(){
					if(unit_id == 0 || unit_id == ""){
						var house_name_url = '/house_house_name_all.select/['+building_combo.getValue()+']';
					}else{
						var house_name_url = '/house_house_name.select/['+unit_combo.getValue()+']';
					}
					house_store.constructor({
						root : 'r',
						fields : ['house_id', 'house_name'],
						proxy : new Ext.data.ScriptTagProxy({
							url : ZionSetting.db.url + '/' + Zion.token
									+ house_name_url
						})
					});
					house_store.load();
				},0);
			},
			'select' : function(this_, record, index){
				var unit_id = unit_combo.getValue();
				var house_id = record.data["house_id"];
				if(uptown_id == 0){
					unit_combo.disable();
					var alias = store_sql;
					var params = selectCorpId;
				}else{
					if(house_id == 0){
						var alias = 'house_inspection.by_unit_id.select';
						var params = unit_id;
					}else{
						var alias = 'house_inspection.by_house_id.select';
						var params = house_id;
					}
				}
				reload_store(alias,params);
			}				
		}
	});

	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : store_sql
		},
		root : "r",
		fields : fields
	});

	var sm = new Ext.grid.CheckboxSelectionModel();
	var grid = new Ext.grid.GridPanel( {
		title : '巡检列表',
		store : store,
		loadMask:'查询中...',
		columns : [{
			header : "序号",
			dataIndex : 'inspection_id',
			sortable : true,
			width: 50
		}, {
			header : "图片",
			dataIndex : 'inspection_id',
			sortable : true,
			width: 200,
			renderer:function(inspection_id){
				if(inspection_id == ""){
					return "";
				}
				return "<a href=# onclick='show_win("+inspection_id+")'>"+inspection_id+".jpg</a>";//<img width='100' height ='100' src='/uploaded/house_inspection/"+inspection_id+".jpg'>
			}
		}, {
			header : "小区",
			dataIndex : 'uptown_name',
			sortable : true,
			width: 120
		}, {
			header : "楼号",
			dataIndex : 'building_name',
			sortable : true,
			width: 120
		}, {
			header : "单元",
			dataIndex : 'unit_name',
			sortable : true,
			width: 120
		}, {
			header : "门牌",
			dataIndex : 'house_name',
			sortable : true,
			width: 120
		}, {
			header : "户主",
			dataIndex : 'owner_name',
			sortable : true,
			width: 120
		}, {
			header : "联系电话",
			dataIndex : 'telphone',
			sortable : true,
			width: 120
		}, {
			header : "常驻人口",
			dataIndex : 'population',
			sortable : true,
			width: 80
		}, {
			header : "燃气表",
			dataIndex : 'gas_name',
			sortable : true,
			width: 80
		}, {
			header : "进气方式",
			dataIndex : 'left_right',
			sortable : true,
			width: 80
		}, {
			header : "表底",
			dataIndex : 'gas_bottom',
			sortable : true,
			width: 150
		}, {
			header : "钢号",
			dataIndex : 'steel_grade',
			sortable : true,
			width: 150
		}, {
			header : "入户时间",
			dataIndex : 'begin_time',
			sortable : true,
			width: 150
		}, {
			header : "隐患类型",
			dataIndex : 'inspection_type_id',
			sortable : true,
			width: 150,
			renderer:function(inspection_type_id){
				if(inspection_type_id == ""){ 
					return "";
				}else{
					var arr = [];
					var inspection_type = inspection_type_id.split(',');
					for(var j = 0;j< inspection_type.length; j++){
						arr.push(name_value[inspection_type[j]]);
					}
					return arr;
				}
			}
		},/* {
			header : "使用气量",
			dataIndex : 'use_gas',
			sortable : true,
			width: 150
		}, {
			header : "剩余气量",
			dataIndex : 'surplus_gas',
			sortable : true,
			width: 150
		}, {
			header : "是否泄漏",
			dataIndex : 'is_leakage',
			sortable : true,
			width: 150,
			renderer:is_true	
		}, {
			header : "装防拆卡",
			dataIndex : 'is_sealed_card',
			sortable : true,
			width: 150,
			renderer:is_true
		}, {
			header : "有无隐患",
			dataIndex : 'is_trouble',
			sortable : true,
			width: 150,
			renderer:function(is_trouble){
				if(is_trouble == 1){
					return "有";
				}else if(is_trouble == 0){
					return "无";
				}else{
					return "";
				}
			}
		}, */ {
			header : "完成时间",
			dataIndex : 'end_time',
			sortable : true,
			width: 150
		}, {
			header : "操作人",
			dataIndex : 'user_name',
			sortable : true,
			width: 150
		}, {
			header : "备注",
			dataIndex : 'memo',
			sortable : true,
			width: 195
		}, {
			header : "创建日期",
			dataIndex : 'reg_date',
			sortable : true,
			width: 170
		}],
		tbar : ['小区：',uptown_combo,' 楼号：',building_combo,' 单元：',unit_combo,' 门牌：',house_combo],
		listeners:{
			'render': function() {
				var tbar = new Ext.Toolbar({
					items:['开始日期：', {
						xtype : 'datefield',
						disabled : false,
						width : 140,
						id : 'star_date',
						format : 'Y-m-d',
						value : new Date(),
						listeners : {
							'select' : function(this_, record, index){
								time_reload_store();
							}				
						}
					}, '结束日期：', {
						xtype : 'datefield',
						disabled : false,
						width : 140,
						id : 'end_date',
						format : 'Y-m-d',
						value : new Date(),
						listeners : {
							'select' : function(this_, record, index){
								time_reload_store();
							}				
						}
					}]
				});
				tbar.render(this.tbar);
				
			}
		},
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		})
	});
	
	grid.on('rowdblclick',function(){
		var formPanel = new Ext.form.FormPanel( {
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
					items : [{
						fieldLabel : '图片',
						xtype : 'box', 
						width : 100,  
						name : 'inspection_id',
						autoEl : {  
							height : 100,
							tag : 'img', 
							id:'img_value'
						}
					},{
						fieldLabel : '小区',
						name : 'uptown_name',
						anchor : '95%'
					}, {
						fieldLabel : '楼号',
						blankText : '不能为空',
						name : 'building_name',
						anchor : '95%'
					}, {
						fieldLabel : '单元',
						name : 'unit_name',
						anchor : '95%'
					}, {
						fieldLabel : '门牌',
						name : 'house_name',
						anchor : '95%'
					}, {
						fieldLabel : '户主',
						name : 'owner_name',
						anchor : '95%'
					}, {
						fieldLabel : '联系电话',
						name : 'telphone',
						anchor : '95%'
					},{
						fieldLabel : '常住人口',
						name : 'population',
						anchor : '95%'
					}, {
						fieldLabel : '燃气表',
						name : 'gas_name',
						anchor : '95%'
					}, {
						fieldLabel : '进气方式',
						name : 'left_right',
						anchor : '95%'
					},{
						fieldLabel : '表底',
						name : 'gas_bottom',
						anchor : '95%'
					}, {
						fieldLabel : '钢号',
						name : 'steel_grade',
						anchor : '95%'
					}]
				}, {
					columnWidth : .48,
					layout : 'form',
					defaultType : 'textfield',
					defaults : {
						width : 180
					},
					items : [ {
						fieldLabel : '入户时间',
						name : 'begin_time',
						anchor : '95%'
					}/*, {
						fieldLabel : '使用气量',
						name : 'use_gas',
						anchor : '95%'
					}*/, {
						fieldLabel : '隐患类型',
						name : 'inspection_type_id',
						xtype:'textarea',
						anchor : '95%'
					}/*,{
						fieldLabel : '剩余气量',
						name : 'surplus_gas',
						anchor : '95%'
					}, {
						fieldLabel : '是否泄漏',
						name : 'is_leakage',
						anchor : '95%'
					}, {
						fieldLabel : '装防拆卡',
						name : 'is_sealed_card',
						anchor : '95%'
					}, {
						fieldLabel : '有无隐患',
						name : 'is_trouble',
						anchor : '95%'
					}*/, {
						fieldLabel : '备注',
						name : 'memo',
						xtype:'textarea',
						anchor : '95%'
					}, {
						fieldLabel : '完成时间',
						name : 'end_time',
						anchor : '95%'
					}, {
						fieldLabel : '操作人',
						name : 'user_name',
						anchor : '95%'
					}, {
						fieldLabel : '创建日期',
						name : 'reg_date',
						anchor : '95%'
					}]
				} ]
			} ]
		});
		var inspection_win = new Ext.Window({
			title: '信息',
			closable:true,
			constrainHeader:true,  
			width : 540,
			items : [ formPanel ],
			buttons : [ {
				text : '关闭',
				id : 'cancel',
				handler : function() {
					try{
						inspection_win.close();
					}catch(e){
						inspection_win.close();
					}
				}
			} ]
		});
		inspection_win.show();

		function find_field(formPanel,value){
			return formPanel.getForm().findField(value);
		}

		if(inspection_win){
			inspection_win.center();
			var sm = grid.getSelectionModel().getSelected();
			formPanel.form.loadRecord(sm);
			var form_field = formPanel.getForm().findField();
			$("#img_value").attr('src','/uploaded/house_inspection/'+sm.data.inspection_id+'.jpg');
			/*if(find_field(formPanel,"is_leakage").getValue() == 1){
				find_field(formPanel,"is_leakage").setValue("是");
			}else if(find_field(formPanel,"is_leakage").getValue() == 0){
				find_field(formPanel,"is_leakage").setValue("否");
			}else{
				find_field(formPanel,"is_leakage").setValue("");
			}
			if(find_field(formPanel,"is_sealed_card").getValue() == 1){
				find_field(formPanel,"is_sealed_card").setValue("是");
			}else if(find_field(formPanel,"is_sealed_card").getValue() == 0){
				find_field(formPanel,"is_sealed_card").setValue("否");
			}else{
				find_field(formPanel,"is_sealed_card").setValue("");
			}
			if(find_field(formPanel,"is_trouble").getValue() == 1){
				find_field(formPanel,"is_trouble").setValue("有");
			}else if(find_field(formPanel,"is_trouble").getValue() == 0){
				find_field(formPanel,"is_trouble").setValue("无");
			}else{
				find_field(formPanel,"is_trouble").setValue("");
			}*/
			if(find_field(formPanel,"inspection_type_id").getValue() == ""){ 
				return "";
			}else{
				var arr = [];
				var inspection_type = find_field(formPanel,"inspection_type_id").getValue().split(',');
				for(var j = 0;j< inspection_type.length; j++){
					arr.push(name_value[inspection_type[j]]);
				}
				find_field(formPanel,"inspection_type_id").setValue(arr.join("\r\n"));
			}
			
		}
	});

	function is_true(val){
		var value;
		if(val == 1){
			value = "是";
		}else if(value == 0){
			value = "否";
		}else{
			value = "";
		}
		return value;
	}

	show_win = function(id){
    	 var new_win = new Ext.Window({
    		 xtype:'window',
    		 title: '图片',
    		 autoWidth:false,
    		 autoHeight:true,
			 tbar:[{
				id : 'rotleft',
				width:35,
				text : '左转',
				icon:Ext.zion.image_base +'/arrow_rotate_clockwise.png',
				handler:function(){
					$('#rotImg').rotateRight(-90);
					new_win.setWidth($("#rotImg").width()+14);
					new_win.setHeight($("#rotImg").height()+60);
				}
			},{
				id : 'rotright',
				width:35,
				text : '右转',
				icon:Ext.zion.image_base +'/arrow_rotate_anticlockwise.png',
				handler:function(){
					$('#rotImg').rotateRight(90);
					new_win.setWidth($("#rotImg").width()+14);
					new_win.setHeight($("#rotImg").height()+60);
				}
			}],
    		 html:'<span><img id="rotImg" onload="return resize_show_win(this)" src="/uploaded/house_inspection/'+id+'.jpg"/></span>'
    	 })
		new_win.show();
		window.image_win = new_win;
     }

	window.resize_show_win = function(img){
		image_win.setHeight($("#rotImg").height());
		image_win.setWidth($("#rotImg").width());
		image_win.center();
	};

	var corp_tree = new Ext.tree.TreePanel( {
		id : 'tree_id',
		autoScroll : true,
		region : 'west',
		width : 250,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				building_combo.disable();
				load_inspection_type();
				unit_combo.disable();
				selectCorpId = node.attributes.corp.corp_id;
				reload_store(store_sql,selectCorpId);
				uptown_combo.reset();
				building_combo.reset();
				uptown_store.removeAll();
				building_combo.setValue("所有");
				uptown_store.constructor({
					root : 'r',
					fields : ['uptown_id', 'uptown_name'],
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/house_uptown_name.select/['+selectCorpId+']'
					})
				});
				uptown_store.load();
			}
		}
	});

	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			loadMask.hide();
			corp_tree.getRootNode().childNodes[0].select();			
		});
		reload_store(store_sql,selectCorpId);
		uptown_store.constructor({
			root : 'r',
			fields : ['uptown_id', 'uptown_name'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/house_uptown_name.select/['+selectCorpId+']'
			})
		});
		uptown_store.load();
		uptown_combo.setValue("所有");
		building_combo.setValue("所有");
		unit_combo.setValue("所有");
		house_combo.setValue("所有");
		load_inspection_type();
	});
	function load_inspection_type(){
		Zion.db.getJSON('house_inspection.inspection_type.select',[selectCorpId],function(data){
			if(data.r){
				var data_value = data.r;
				for(var i = 0; i < data_value.length; i++){
					name_value[data_value[i][0]] = data_value[i][1];					
				}
			}
		});
	}

	function time_reload_store(){
		var building_id = building_combo.getValue();
		var house_id = house_combo.getValue();
		var unit_id = unit_combo.getValue();
		var uptown_id = uptown_combo.getValue();
		
		if(house_id!="所有" && house_id!=0){
			var alias = 'house_inspection.by_house_id.select';
			var params = house_id;
		}else if(unit_id != 0 && unit_id!="所有"){
			var alias = 'house_inspection.by_unit_id.select';
			var params = unit_id;
		}else if(building_id != 0 && building_id!="所有"){
			var alias = 'house_inspection.by_building_id.select';
			var params = building_id;
		}else if(uptown_id != 0 && uptown_id!="所有"){
			var alias = 'house_inspection.by_uptown_id.select';
					var params = uptown_id;
		}else{
			var alias = store_sql;
			var params = selectCorpId;
		}
		reload_store(alias,params);
	}
	function reload_store(alias,param){
		var startTime = Ext.getCmp('star_date').getValue();
		startTime.setHours(0);startTime.setMinutes(0);startTime.setSeconds(0);
		var endTime = Ext.getCmp('end_date').getValue();
		endTime.setHours(23);endTime.setMinutes(59);endTime.setSeconds(59);
		var startTime = startTime.getTime() / 1000;
		var endTime = endTime.getTime() / 1000;
		var params = [ param,startTime,endTime ];
		store.constructor( {
			db : {
				alias : alias,
				params : params
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

	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [{
			width:250,
			split:true,
			region : 'west',
			layout : 'fit',
			collapsible : true,
			title : '集团列表',
			items :[corp_tree]
		},{
			region : 'center',
			layout : 'fit',
			items : [grid]
		}]
	});
})
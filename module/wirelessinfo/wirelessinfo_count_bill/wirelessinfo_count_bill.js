function dateFormat(value) {
    var dt = new Date.parseDate(value, 'U');
     return dt.format('Y年m月d日');
} 
Ext.onReady(function() {
	Ext.QuickTips.init();
	
	var customer_fields = ['customer_id', 'customer_name', 'telephone', 'fax', 'email', 'address', 
	'corp_id', 'enable', 'reg_date', 'reg_user_id', 'memo', 'is_delete'];
	var customer_store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "wirelessinfo_customer.select"
		},
		root : "r",
		fields : customer_fields
	});
	var customer_grid = new Ext.grid.GridPanel( {
		title : '客户信息列表',
		store : customer_store,
		loadMask:{ msg: '查询中...' },
		flex : 1,
		autoScroll : true,
		columns : [{header : "序号",dataIndex : 'customer_id',width : 50,sortable : true}, 
			{header : "客户姓名",dataIndex : 'customer_name',width : 120,sortable : true}, 
			{header : "客户电话",width : 120,dataIndex : 'telephone',sortable : true}, 
			{header : "传真",width : 120,dataIndex : 'fax',sortable : true}, 
			{header : "email",width : 120,dataIndex : 'email',sortable : true}, 
			{header : "地址",width : 120,dataIndex : 'address',sortable : true}, 
			{header : "备注",width : 120,dataIndex : 'memo',sortable : true}],
		tbar:['客户名称',{xtype:'textfield',width:120,id:'customer_name'}, 
						{text : '查询',tooltip : '查询',icon : Ext.zion.image_base+'/select.gif',handler : select_customer}],
		bbar : new Ext.PagingToolbar( {
			store : customer_store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});
	customer_store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
	
	var wireless_fields = ['release_id','release_num','content_type','start_time','end_time','text','customer_id','state','create_time','cost','info_class', 'release_type','reg_user_id','release_cost', 'path', 'ref_release_id', 'corp_id','isdelete','customer_name','group_name','target_count'];
	var wireless_sm = new Ext.grid.CheckboxSelectionModel();
	var wireless_store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "wirelessinfo.wirelessinfo_count_bill.wirelessinfo_group_target.select"
				},
				root : "r",
				fields : wireless_fields
			});
				
	var wireless_grid = new Ext.grid.GridPanel( {
		title:'客户信息计费列表',
		store : wireless_store,
		loadMask:{ msg: '查询中...' },
		sm : wireless_sm,
		flex : 1,
		autoScroll : true,
		columns : [ wireless_sm,{
			header : "信息编号",
			dataIndex : 'release_num',
			width : 50,
			sortable : true
		},{
			header : "客户名称",
			dataIndex : 'customer_name',
			width : 120,
			sortable : true
		},{
			header : "信息费用(￥)",
			dataIndex : 'release_cost',
			width : 120,
			sortable : true
		},{
			header : "信息类型",
			width:120,
			dataIndex:'content_type',
			sortable : true,
			renderer:function(content_type){
				if(content_type == 0){
					return "文本";
				}else if(content_type == 1){
					return "音频";
				}else{
					return "视频";
				}
			}
		},{
			header : "信息分类",
			width:120,
			dataIndex:'info_class',
			sortable : true,
			renderer:function(info_class){
				if(info_class == 0){
					return "公共信息";
				}else if(info_class == 1){
					return "政府公告";
				}else{
					return "广告";
				}
			}
		},{
			header : "信息内容",
			dataIndex : 'text',
			width : 120,
			sortable : true
		},{
			header : "车辆组名",
			dataIndex : 'group_name',
			width : 200,
			sortable : true,
			renderer:function(group_name,c,r){
				return group_name+"(车辆数："+r.data["target_count"]+")";
			}
		},{
			header : "起始日期",
			dataIndex : 'start_time',
			width : 120,
			sortable : true,
			renderer:dateFormat
		},{
			header : "终止日期",
			dataIndex : 'end_time',
			width : 120,
			sortable : true,
			renderer:dateFormat
		},{
			header : "状态",
			dataIndex : 'state',
			width : 120,
			sortable : true,
			renderer:function(state,c,r){
				var release_id = r.data["release_id"];
				var release_num = r.data["release_num"];
				var release_type = r.data["release_type"];
				var release_type_text;
				if(release_type == 0){
					release_type_text = "新增申请";
				}else if(release_type == 1){
					release_type_text =  "修改申请";
				}else{
					release_type_text = "停播申请";
				}
				if(state == 1){
					return '审核通过';
				}else if(state == 3){
					return '发布中';
				}else if(state == 4){
					return '已发布';			
				}else if(state == 6){
					return '过期停播';
				}else{
					return '已停播';
				}
			}
		}],
		tbar : ['信息编号：',{
					xtype:'textfield',
					width:120,
					id:'release_num'
				},'-','时 间：',new Ext.form.DateField({
					width:120,
					id:'start_time',
					name : 'start_time',
					format:'Y年m月d日',
					editable:false,
					emptyText:'起始日期'
			}) ,'~',
			new Ext.form.DateField({
				id:'end_time',
				width:120,
				name : 'end_time',
				format:'Y年m月d日',
				editable:false,
				emptyText:'终止日期'
			}),{
				text : '查询',
				tooltip : '查询',
				icon : Ext.zion.image_base+'/select.gif',
				handler:function(){
					select_all();
				}
			}, '-',{
				text : '刷新',
				tooltip : '刷新',
				icon : Ext.zion.image_base+'/refresh.gif',
				handler:function(){
					wireless_grid.store.reload();
				}
			}, '-',  {
				text : '清除条件',
				tooltip : '清除查询条件',
				icon : Ext.zion.image_base + '/cross.png',
				handler : function() {
					Ext.getCmp('release_num').reset();
					Ext.getCmp('start_time').reset();
					Ext.getCmp('end_time').reset();
				}
			}
		],
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : ['信息总费用：',{xtype:'textfield',width:110,id:'release_cost_total',readOnly:true}]
				});
				tbar.render(this.tbar);
			}
		},
		bbar : new Ext.PagingToolbar( {
			store : wireless_store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			//autoFill : true,
			//forceFit : true
		}
	});
    
	function select_customer() {
		var term = $('#customer_name').val();
		var paramsA = [ term ];
		customer_grid.store.constructor( {
			db : {
				params : paramsA,
				alias : 'wirelessinfo_customer.params.select'
			},
			root : "r",
			fields : customer_fields
		});
		customer_grid.store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		})
	}
	customer_grid.addListener('rowclick', wireless_gridRowClick);
	function wireless_gridRowClick(grid, rowIndex, e) {
		Ext.getCmp('release_num').reset();
		Ext.getCmp('start_time').reset();
		Ext.getCmp('end_time').reset();
		var record = grid.getStore().getAt(rowIndex);
		var customer_id = record.get('customer_id');
		var params = [customer_id];
		wireless_grid.store.constructor( {
			db : {
				params : params,
				alias : "wirelessinfo.wirelessinfo_count_bill.wirelessinfo_group_target.wirelessinfo_customer.customer_id.select"
			},
			root : "r",
			fields : wireless_fields
		});
		wireless_grid.store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
		Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_count_bill.wirelessinfo_group_target.wirelessinfo_release_op.release_cost_total.select',[customer_id],function(data){
			if(!data.f){
				if(data.r == ""){
					Ext.getCmp("release_cost_total").setValue('');
				}else{
					Ext.getCmp("release_cost_total").setValue('￥'+data.r);
				}
			}
		})
	}
	
	function select_all(){ 
		var release_num = Ext.getCmp("release_num").getValue();
		var start_time = utc_to_timestamp(Ext.util.Format.date(Ext.getCmp("start_time").getValue(), 'Y-m-d H:i:s'));
		var end_time = utc_to_timestamp(Ext.util.Format.date(Ext.getCmp("end_time").getValue(), 'Y-m-d H:i:s'))+ 23 * 3600 + 3599;
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
		}else{
			start_time_value = 1;
		}
		if(end_time){
			end_time_value = 0;
		}else{
			end_time_value = 1;
		}
		var params = [release_num,release_num_value,start_time,start_time_value,end_time,end_time_value];
		wireless_grid.store.constructor({
					db : {
						params : params,
						alias : 'wirelessinfo.wirelessinfo_count_bill.wirelessinfo_group_target.conditions.select'
					},
					root : "r",
					fields : wireless_fields
				});
		wireless_grid.store.load({
			params : {
				start : 0,
				limit :  Ext.zion.page.limit
			}
		})
		Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_count_bill.wirelessinfo_group_target.conditions.wirelessinfo_release_op.release_cost_total.select',params,function(data){
			if(!data.f){
				if(data.r == ""){
					Ext.getCmp("release_cost_total").setValue('');
				}else{
					Ext.getCmp("release_cost_total").setValue('￥'+data.r);
				}
			}
		})
	}
	
	/** 时间转换时间戳* */
	function utc_to_timestamp(val) {
		var text_time = val.replace(/:/g, '-');
		time_str = text_time.replace(/ /g, '-');
		var time_arr = time_str.split("-");
		var time_datum = new Date(Date.UTC(time_arr[0], time_arr[1] - 1,
				time_arr[2], time_arr[3] - 8, time_arr[4], time_arr[5]));
		var new_time = time_datum.getTime() / 1000;
		return new_time;
	}
	
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
			items : [customer_grid, wireless_grid]
		} ]
	});
})

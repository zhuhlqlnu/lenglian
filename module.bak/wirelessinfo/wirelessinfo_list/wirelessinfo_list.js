function dateFormat(value) {
    var dt = new Date.parseDate(value, 'U');
     return dt.format('Y年m月d日');
} 

Ext.onReady(function() {
	Ext.QuickTips.init();
	
	var fields = ['release_id','release_num','content_type','start_time','end_time','play_start_time','play_end_time','text','customer_id','state','create_time','cost','info_class', 'release_type','reg_user_id','release_cost', 'path', 'ref_release_id', 'corp_id','isdelete','customer_name','path_name'];
	var sm = new Ext.grid.CheckboxSelectionModel();
	var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "wirelessinfo.wirelessinfo_list.select"
				},
				root : "r",
				fields : fields
			});
				
	grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		loadMask:{ msg: '查询中...' },
		autoScroll : true,
		columns : [ sm,{
			header : "编号",
			dataIndex : 'release_num',
			width : 50,
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
		},/*{
			header : "信息播放起始日期",
			dataIndex : 'play_start_time',
			width : 75,
			sortable : true,
			renderer:timeStr
		},{
			header : "信息播放停止日期",
			dataIndex : 'play_end_time',
			width : 75,
			sortable : true,
			renderer:timeStr
		},*/{
			header : "信息内容",
			dataIndex : 'text',
			width : 120,
			sortable : true,
			renderer:function(text,c,r){
				var sound = r.data["sound"];
				var video = r.data["video"];
				if(!sound&& video ){
					return '<a href="javascript:player('+ video + ');">'+ text + '</a>';
				}else if(sound && !video){
					return '<a href="javascript:player('+ sound + ');">'+ text + '</a>';
				}else{
					return text;
				}
			}
		},{
			header : "路径播放",
			dataIndex : 'path',
			width : 120,
			sortable : true,
			renderer:function(path,c,r){
				if(r.data['path_name'] == "" || r.data['path_name'] == null){
					return "";
				}else{
					return "<a href='javascript:player_path(\""+path+"\");'>"+r.data['path_name']+"</a>";
					//return path;
				}
			}
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
				if(state == 0){
					return '<a href="javascript:published_update('+release_id+','+release_num+');">待审核('+release_type_text+')</a>';
				}else if(state == 1){
					return '审核通过';
				}else if(state == 2){
					return '审核不通过';
				}else if(state == 3){
					return '发布中';
				}else if(state == 4){
					return '已发布';			
				}else if(state == 5){
					return '申请停播';
				}else if(state == 6){
					return '过期停播';
				}else{
					return '强行停播';
				}
			}
		},{
			header : "创建时间",
			dataIndex : 'create_time',
			width : 150,
			sortable : true,
			renderer:function(create_time){
				return new Date(create_time * 1000).toLocaleString();
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
					grid.store.reload();
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
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			//autoFill : true,
			//forceFit : true
		}
	});
	reward_system_data = {};
	store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
	
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
		grid.store.constructor({
					db : {
						params : params,
						alias : 'wirelessinfo.wirelessinfo_list.conditions.select'
					},
					root : "r",
					fields : fields
				});
		grid.store.load({
					params : {
						start : 0,
						limit :  Ext.zion.page.limit
					}
				})
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
});

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
	
function published_update(release_id,release_num){
	var published_player = new Ext.Button({
		text:'通过',
		handler:function(){					
			var sm = grid.getSelectionModel().getSelected();
			var release_num = sm.data.release_num;
			var content_type = sm.data.content_type;
			var text = sm.data.text;
			var customer_id = sm.data.customer_id;
			var start_time = sm.data.start_time;
			var end_time = sm.data.end_time;
			var play_start_time = sm.data.play_start_time;
			var play_end_time = sm.data.play_end_time;
			var isdelete = sm.data.isdelete;
			var cost = sm.data.cost;
			var create_time = sm.data.create_time;
			var release_cost = sm.data.release_cost;
			var path = sm.data.path;
			var ref_release_id = sm.data.ref_release_id;
			var states = sm.data.states;
			var info_class = sm.data.info_class;
			var release_type = sm.data.release_type;
			var reg_user_id = sm.data.reg_user_id;
			var corp_id = sm.data.corp_id;
			var params = [release_num, content_type, text, customer_id, start_time, end_time, play_start_time, play_end_time, isdelete, cost, create_time, release_cost, path, release_id, info_class, release_type, reg_user_id, corp_id];
			if(release_type == 0 || release_type == 1 || release_type == 2){
				Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_list_op.isdelete.update',[release_id],function(data){
					if(!data.f){
						Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_list_op.wirelessinfo_release_op.isdelete.update',[release_id],function(data){
							if(!data.f){
								Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_list_op.wirelessinfo_release_op.ref_release_id.update',[ref_release_id,release_id],function(data){
									if(!data.f){
										if(release_type == 2){
											Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_list.state.update',[7,ref_release_id],function(data){
												if(!data.f){
													Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_list.wirelessinfo_release_op.state.update',[7,release_num],function(data){		
														if(!data.f){
															grid.store.reload();
															Ext.Msg.alert('审核提示','编号'+release_num+'当前状态为审核通过');
															published_win.close();
														}
													})
												}else{
													Ext.Msg.alert('审核提示','信息修改错误');
													published_win.close();
												}
											})
										}else{			
											Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_list_op.insert',params,function(data){
												if(!data.f){
													Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_list.state.update',[1,release_id],function(data){
														if(!data.f){
															grid.store.reload();
															Ext.Msg.alert('审核提示','编号'+release_num+'当前状态为审核通过');
															published_win.close();
														}else{
															Ext.Msg.alert('审核提示','信息修改错误');
															published_win.close();
														}
													})
												}
											})
										}
									}else{
										Ext.Msg.alert('审核提示','信息修改错误');
										return;
									}
								})
							}else{
								Ext.Msg.alert('审核提示','信息修改错误');
								return;
							}
						})
						
					}else{
						Ext.Msg.alert('审核提示','信息修改错误');
						return;
					}
				})
			}	
		}
	})
	var stop_player = new Ext.Button({
		text:'不通过',
		handler:function(){
			Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_list.state.update',[2,release_id],function(data){
				if(!data.f){
					grid.store.reload();
					Ext.Msg.alert('审核提示','编号'+release_num+'当前状态为审核不通过');
					published_win.close();
				}else{
					Ext.Msg.alert('审核提示','信息修改错误');
					published_win.close();
				}
			})
		}
	})
	var cancle_player = new Ext.Button({
		text:'取消',
		handler:function(){
			published_win.close();
		}
	});

	var published_win = new Ext.Window({
		title:'审核状态修改',
		width:270,
		autoHeight:false,
		buttonAlign : 'right',
		closable : true,
		closeAction : 'close',
		constrainHeader : true,
		border:false,
		buttons:[published_player,stop_player,cancle_player]
	})
	published_win.show();
}

function player_path(path){
	Ext.Msg.alert("打开链接","<a href='/data/upload/wirelessinfo/"+path+"' target='_blank' onclick='Ext.Msg.hide() '>点击此链接打开</a>");
}
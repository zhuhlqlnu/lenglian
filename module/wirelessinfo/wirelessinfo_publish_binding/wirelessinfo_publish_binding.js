function dateFormat(value) {
    var dt = new Date.parseDate(value, 'U');
     return dt.format('Y年m月d日');
} 

Ext.onReady(function() {
	Ext.QuickTips.init();
	var fields = ['release_id','release_num','content_type','start_time','end_time','play_start_time','play_end_time','text','customer_id','state','create_time','cost','info_class', 'release_type','reg_user_id','release_cost', 'path', 'ref_release_id', 'corp_id','isdelete','customer_name'];
	var sm = new Ext.grid.CheckboxSelectionModel();
	var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "wirelessinfo.wirelessinfo_publish_binding.select"
				},
				root : "r",
				fields : fields
			});
	
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {Ext.getCmp('binding_button').enable();} else {Ext.getCmp('binding_button').disable();}
	});
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {Ext.getCmp('binding_button').enable();} else {Ext.getCmp('binding_button').disable();}
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
			renderer:dateFormat
		},{
			header : "信息播放停止日期",
			dataIndex : 'play_end_time',
			width : 75,
			sortable : true,
			renderer:dateFormat
		},*/{
			header : "信息内容",
			dataIndex : 'text',
			width : 120,
			sortable : true
		},{
			header : "客户名称",
			dataIndex : 'customer_name',
			width : 120,
			sortable : true
		},{
			header : "状态",
			dataIndex : 'state',
			width : 120,
			sortable : true,
			renderer:function(state,c,r){
				if(state == 1){
					return '审核通过';
				}else if(state == 3){
					return '发布中';
				}else if(state == 4){
					return '已发布';			
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
				text : '绑定',
				tooltip : '绑定',
				id:'binding_button',
				disabled:true,
				icon : Ext.zion.image_base+'/chart_organisation.png',
				handler:function(){
					updateTargetReleaseClick();
				}
			}, '-', {
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
						alias : 'wirelessinfo.wirelessinfo_publish_binding.conditions.select'
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
	
	grid.addListener('rowdblclick', updateTargetReleaseClick);
	function updateTargetReleaseClick() {
		var groups_id = [];
		var sm = grid.getSelectionModel().getSelected();
		if(!sm){
			return;
		}
		var release_id = sm.data.release_id;
	     var cancle_button = new Ext.Button({
			text:'关闭',
			handler:function(){
				targetReleaseWin.close();
			}
	    })
	    
		var groupFields = ['group_id','group_name','enable','memo','target_count'];
		var groupSm = new Ext.grid.CheckboxSelectionModel();
		var groupStore = new Ext.zion.db.ArrayStore( {
				db : {
					params:[release_id],
					alias : "wirelessinfo.wirelessinfo_publish_binding.wirelessinfo_group.not_binding.select"
				},
				root : "r",
				fields : groupFields
			});
				
		var groupGrid = new Ext.grid.GridPanel({
			store:groupStore,
			sm:groupSm,
			loadMask:{ msg: '查询中...' },
			width:300,
			height:300,
			autoScroll : true,
			columns : [ groupSm,{
				header : "组编号",
				dataIndex : 'group_id',
				width : 45,
				sortable : true
			},{
				header : "组名字",
				dataIndex : 'group_name',
				width : 55,
				sortable : true
			},{
				header : "备注",
				dataIndex : 'memo',
				width : 55,
				sortable : true
			},{
				header : "车辆数",
				dataIndex : 'target_count',
				width : 55,
				sortable : true
			}],
			bbar : new Ext.PagingToolbar( {
				store : groupStore,
				pageSize : Ext.zion.page.limit,
				displayInfo : false
			}),
			viewConfig : {
				autoFill : true,
				forceFit : true
			}
		})
		
		var bindingGroupFields = ['binding_group_id','binding_group_name','binding_enable','binding_memo','binding_target_count','group_start_time','group_end_time'];
		var bindingGroupSm = new Ext.grid.CheckboxSelectionModel();
		var bindingGroupStore = new Ext.zion.db.ArrayStore( {
				db : {
					params:[release_id,release_id],
					alias : "wirelessinfo.wirelessinfo_publish_binding.wirelessinfo_group.binding.select"
				},
				root : "r",
				fields : bindingGroupFields
			});
		var bindingGroupGrid = new Ext.grid.GridPanel({
			store:bindingGroupStore,
			sm:bindingGroupSm,
			loadMask:{ msg: '查询中...' },
			width:300,
			height:300,
			autoScroll : true,
			columns : [ groupSm,{
				header : "组编号",
				dataIndex : 'binding_group_id',
				width : 45,
				sortable : true
			},{
				header : "组名字",
				dataIndex : 'binding_group_name',
				width : 55,
				sortable : true
			},{
				header : "备注",
				dataIndex : 'binding_memo',
				width : 55,
				sortable : true
			},{
				header : "车辆数",
				dataIndex : 'binding_target_count',
				width : 55,
				sortable : true
			},{
				header : "开始时间",
				dataIndex : 'group_start_time',
				width : 55,
				sortable : true
			},{
				header : "结束时间",
				dataIndex : 'group_end_time',
				width : 55,
				sortable : true
			}],
			bbar : new Ext.PagingToolbar( {
				store : bindingGroupStore,
				pageSize : Ext.zion.page.limit,
				displayInfo : false
			}),
			viewConfig : {
				autoFill : true,
				forceFit : true
			}
		})
		
		var center_panel = new Ext.Panel({
			layout : 'absolute',
			frame:true,
			defaults:{
				xtype:'button',
				width:40,
				x:0
			},
			items:[{
				y:'28%',
				tooltip : '增加绑定',
				icon:Ext.zion.image_base+'/right.png',
				handler:function(){
					var insert_group_form = new Ext.form.FormPanel({
						width : 240,
						height : 150,
						autoHeight:false,
						defaults:{
							width:80,
							labelWidth:55
						},
						items : [{
							fieldLabel:'起始时间',
							xtype : 'timefield',
							allowBlank : false,
							editable : false,
							format : 'H:i',
							id : 'group_start_time',
							increment : 1,
							value : '08:00'
						}, {
							fieldLabel:'终止时间',
							xtype : 'timefield',
							allowBlank : false,
							editable : false,
							format : 'H:i',
							id : 'group_end_time',
							increment : 1,
							value : '09:00'
						}]
					});
					
					var insert_group_win = new Ext.Window({
						title:'绑定时间',
						width:240,
						height:150,
						autoHeight:false,
						closable : true,
						closeAction : 'close',
						constrainHeader : true,
						items:[insert_group_form],
						buttons:[{
							text:'确定',
							id:'save_button',
							handler:function(){
								loadMask.show();
								insert_group_win.hide();
								var group_start_time = Ext.getCmp("group_start_time").getValue();
								var group_end_time = Ext.getCmp("group_end_time").getValue();
								if(group_end_time <= group_start_time){
									Ext.Msg.alert('提示','终止时间要大于起始时间');
									loadMask.hide();
									return;
								}
								for(var i = 0; i< group_sm.length; i++){
									var remember = group_sm[i].data.group_id;
									if(remember){
										group_ids.push(remember);
									}
								}
								if(group_ids.length>0){
									insertGroupNext(release_id,group_ids,group_start_time,group_end_time,insert_group_win);
								}
							}
						},{
							text:'取消',
							handler:function(){
								insert_group_win.close();
							}
						}]
					});
								
					var group_sm = groupGrid.getSelectionModel().getSelections();
					var group_ids = [];
					if(group_sm != ""){
						insert_group_win.show();
						
					}else{
						Ext.Msg.alert('提示','请选择所绑定的列');
					}
				}
			},{
				y:'64%',
				tooltip : '取消绑定',
				icon:Ext.zion.image_base+'/left.png',
				handler:function(){
					var binding_group_sm = bindingGroupGrid.getSelectionModel().getSelections();
					var binding_group_ids = [];
					if(binding_group_sm != ""){
						Ext.Msg.confirm('取消绑定确认', '你是否确认取消绑定选中的记录？', function(btn) {
							if (btn == 'yes') {
								not_binding_loadMask.show();
								for(var i = 0; i< binding_group_sm.length; i++){
									var remember = binding_group_sm[i].data.binding_group_id;
									if(remember){
										binding_group_ids.push(remember);
									}
								}
								if(binding_group_ids.length>0){
									deleteBindingGroupNext(release_id,binding_group_ids);
								}
							}
						})
					}else{
						Ext.Msg.alert('提示','请选择所要取消绑定的列');
					}
				}
			}]
		});
		
		var win_panel = new Ext.Panel({
			layout : 'border',
			border : false,
			items : [{
				layout : 'border',
				region : 'west',
				border : false,
				width : 400,
				items : [{
					region : 'center',
					layout : 'fit',
					title : '未绑定组列表',
					items : [groupGrid]
				}, {
					region : 'east',
					width : 55,
					layout : 'fit',
					items : [center_panel]
				}]
			}, {
				region : 'center',
				title : '绑定组列表',
				layout : 'fit',
				items : [bindingGroupGrid]
			}]
		});
			
		var targetReleaseWin = new Ext.Window({
			title:'车辆组列表发布',
			width:800,
			height:300,
			autoHeight:false,
			closable : true,
			closeAction : 'close',
			constrainHeader : true,
			items:[win_panel],
			buttons:[cancle_button]
		});
		targetReleaseWin.show();
		
		groupStore.load({
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				})
		bindingGroupStore.load({
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				})
		
		var not_binding_loadMask = new Ext.LoadMask(targetReleaseWin.el, {
				msg : "取消绑定中..."
			});
			
		var loadMask = new Ext.LoadMask(targetReleaseWin.el, {
			msg : "绑定中..."
		});
		
		insertGroupNext = function(release_id,groups_id,group_start_time,group_end_time,insert_group_win){
			if(groups_id.length > 0){
				var group_id = groups_id.pop();
				Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_publish_binding.wirelessinfo_release_target.insert',[release_id,group_id,group_start_time,group_end_time],function(data){
					if(!data.f){
						insertGroupNext(release_id,groups_id,group_start_time,group_end_time,insert_group_win);
					}else{
						loadMask.hide();
						Ext.Msg.alert('提示','绑定失败');
						insert_group_win.close();
						bindingGroupGrid.store.reload();
						groupGrid.store.reload();
						grid.store.reload();
						return;
					}
				})
			}else{
				Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_publish_binding.wirelessinfo_release_op.states.update',[3,release_id],function(data){
					if(!data.f){
						loadMask.hide();
						Ext.Msg.alert('提示','绑定成功');
						insert_group_win.close();
						bindingGroupGrid.store.reload();
						groupGrid.store.reload();
						grid.store.reload();
					}else{
					}
				})
			}
		}
		
		deleteBindingGroupNext = function(release_id,binding_group_ids){
			if(binding_group_ids.length>0){
				var binding_group_id = binding_group_ids.pop();
				Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_publish_binding.wirelessinfo_release_target.delete',[release_id,binding_group_id],function(data){
					if(!data.f){
						deleteBindingGroupNext(release_id,binding_group_ids);
					}else{
						not_binding_loadMask.hide();
						Ext.Msg.alert('提示','取消绑定失败');
						bindingGroupGrid.store.reload();
						groupGrid.store.reload();
						grid.store.reload();
						return;
					}
				})
			}else{
				Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_publish_binding.wirelessinfo_group.value.select',[release_id,release_id],function(data){
					if(!data.f){
						if(data.r == "" || data.r == null){
							Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_publish_binding.wirelessinfo_release_op.states.update',[1,release_id],function(data){
								if(!data.f){
									not_binding_loadMask.hide();
									Ext.Msg.alert('提示','取消绑定成功');
									bindingGroupGrid.store.reload();
									groupGrid.store.reload();
									grid.store.reload();
								}
							})
						}else{
							not_binding_loadMask.hide();
							Ext.Msg.alert('提示','取消绑定成功');
							bindingGroupGrid.store.reload();
							groupGrid.store.reload();
							grid.store.reload();
						}
					}
				})
				
			}
		}
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
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		} ]
	});
})

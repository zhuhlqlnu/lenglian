function timeStr(n) {
	return new Date(n * 1000).toLocaleString();
}
Ext.onReady(function() {
	Ext.QuickTips.init();
	var params_search = [-1, 9999999999];
	var type_alias = "bc.model.count_time_search";

//	var select_target_store = new Ext.data.SimpleStore({
//		root : 'r',
//		fields : ['target_id', 'target_name'],
//		proxy : new Ext.data.ScriptTagProxy({
//					url : ZionSetting.db.url
//							+ '/'
//							+ Zion.token
//							+ '/bc.model.statistical_analysis.count_time.target_id_get'
//				})
//	});
//	var select_target_comboVP = new Ext.form.ComboBox({
//				fieldLabel : '目标选择',
//				width : 120,
//				valueField : 'target_id',
//				store : select_target_store,
//				hiddenName : 'target_id',
//				displayField : 'target_name',
//				editable : false,
//				allowBlank : true,
//				triggerAction : 'all',
//				emptyText : '请选择...'
//			})
	// ==========tttttt==========

	var select_target_combo = new Ext.form.ComboBox({
				fieldLabel : '分类名称',
				width : 140,
				hiddenName : 'target_id',// 传递到后台的参数
				store : new Ext.data.SimpleStore({
							autoLoad : true,
							root : 'r',
							fields : ['target_id', 'target_name'],
							proxy : new Ext.data.ScriptTagProxy({
										url : ZionSetting.db.url
												+ '/'
												+ Zion.token
												+ '/bc.model.statistical_analysis.count_time.target_id_get'
									})
						}),
				valueField : 'target_id',// 域的值,对应于store里的fields
				displayField : 'target_name',// 显示的域,对应于store里的fields
				typeAhead : true,// 设置true，完成自动提示
				mode : 'local', // 设置local，combox将从本地加载数据
				triggerAction : 'all',// 触发此表单域时,查询所有
				selectOnFocus : true,
				forceSelection : true
			});

	// ==========tttttt==========
	/**
	 * page grid ok
	 */
	var fields = [/**/'target_id', /**/'target_name', /**/
			'terminal_type_name',
			/**/'work_time',/**/'address',/**/'number_plates',/**/
			'customer'];
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : "bc.model.count_time"
				},
				root : "r",
				fields : fields
			});
	var sm = new Ext.grid.CheckboxSelectionModel();

	var grid = new Ext.grid.GridPanel({
		title : '工作计时统计',
		id : 'grid',
		store : store,
		sm : sm,
		autoScroll : true,
		columns : [sm, {
					header : "序号",
					dataIndex : 'target_id',
					width : 40,
					sortable : true
				}, {
					header : "车辆编号",
					dataIndex : 'number_plates',
					// width : 75,
					sortable : true
				}, {
					header : "终端编号",
					dataIndex : 'target_name',
					// width : 75,
					sortable : true
				}, {
					header : "通讯地址",
					dataIndex : 'address',
					// width :100,
					sortable : true
				}, {
					header : "顾客",
					dataIndex : 'customer',
					// width : 75,
					sortable : true
				}, {
					header : "机型",
					dataIndex : 'terminal_type_name',
					// width : 100,
					sortable : true
				}, {
					header : "工作计时",
					// width : 75,
					dataIndex : 'work_time',
					sortable : true
				}],
		tbar : ['选择车辆', select_target_combo, '回传时间:', '从-', {
					fieldLabel : '开始时间',
					allowBlank : false,
					editable : false,
					id : 'startdttrack',
					width : 100,
					format : 'Y-m-d',
					xtype : 'datefield',
					value : new Date()
				}, {
					xtype : 'timefield',
					allowBlank : false,
					editable : false,
					format : 'H:i',
					id : 'starttftrack',
					width : 100,
					increment : 1,
					value : '08:00'
				}, '到-', {
					fieldLabel : '结束时间',
					allowBlank : false,
					editable : false,
					id : 'enddttrack',
					width : 100,
					format : 'Y-m-d',
					xtype : 'datefield',
					value : new Date()
				}, {
					xtype : 'timefield',
					allowBlank : false,
					editable : false,
					format : 'H:i',
					id : 'endtftrack',
					width : 100,
					increment : 1,
					value : '18:00'
				}, {
					text : '查询',
					tooltip : '查询',
					icon : Ext.zion.image_base + '/select.gif',
					handler : select_form
				}],
		bbar : new Ext.PagingToolbar({
					store : store,
					pageSize : Ext.zion.page.limit,
					displayInfo : true
				}),
		buttonAlign : 'left',
		buttons : [{
			text : '下载文件',
			id : 'download',
			handler : function() {
				Ext.Msg
						.alert(
								"下载报表",
								"<a href='"
										+ Zion.report.getURL(type_alias,
												params_search)
										+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
			}
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		},
		listeners : {
			render : function() {
				Ext.getCmp("grid").setHeight(Ext.getBody().getHeight());
			}
		}
	})
	store.load({
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});

	function select_form() {
		params_search = [];

		if (select_target_combo.getValue() == ''
				|| select_target_combo.getValue() == null) {
			type_alias = 'bc.model.count_time_search';

		} else {
			params_search.push(select_target_combo.getValue());
			type_alias = 'bc.model.count_time_search_by_target';
		}
		var s = Ext.getCmp('startdttrack').getRawValue() + ' '
				+ Ext.getCmp('starttftrack').getValue() + ':00';
		var std = new Date(Date.parse(s.replace(/-/g, "/")));
		std = Ext.util.Format.date(std, 'Y-m-d H:i:s');
		std = utc_to_timestamp(std);
		// s = "2010-05-23 20:00:00";
		var e = Ext.getCmp('enddttrack').getRawValue() + ' '
				+ Ext.getCmp('endtftrack').getValue() + ':00';
		var end = new Date(Date.parse(e.replace(/-/g, "/")));
		end = Ext.util.Format.date(end, 'Y-m-d H:i:s');
		end = utc_to_timestamp(end);
		// alert('Start::'+std);
		// alert('End::'+end);
		// return;
		params_search.push(std);
		params_search.push(end);

		grid.store.constructor({
					db : {
						params : params_search,
						alias : type_alias
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

	var view = new Ext.Viewport({
				layout : 'border',
				border : false,
				items : [{
							region : 'center',
							layout : 'fit',
							items : grid
						}]
			});
})
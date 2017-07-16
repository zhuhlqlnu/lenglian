/*!
 * Ext JS Library 3.2.1
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.onReady(function() {
//    data = [],
	Ext.QuickTips.init();

    var firstGroupRow = [{
             header: "无线业务部各月成本支出明细",
             colspan: 62,
             align: 'center'
   	
    	}];
    var secondGroupRow = [{
             header: "&nbsp;",
             colspan: 1,
             align: 'center'
   	
    	},{
             header: "&nbsp;",
             colspan: 1,
             align: 'center'
   	
    	},{
             header: "&nbsp;",
             colspan: 1,
             align: 'center'
   	
    	},{
             header: "&nbsp;",
             colspan: 1,
             align: 'center'
   	
    	},{
             header: "经营销售",
             colspan: 1,
             align: 'center'
   	
    	},{
             header: "小灵通售机",
             colspan: 3,
             align: 'center'
   	
    	},{
             header: "虚拟运营成本",
             colspan: 5,
             align: 'center'
   	
    	},{
             header: "无线数传业务",
             colspan: 1,
             align: 'center'
   	
    },{
             header: "机卡联动业务",
             colspan: 2,
             align: 'center'
   	
    },{
             header: "GPS成本;",
             colspan: 4,
             align: 'center'
   	
    },{
             header: "卫星电话成本",
             colspan: 1,
             align: 'center'
   	
    },{
             header: "工资性支出",
             colspan: 5,
             align: 'center'
   	
    },{
             header: "折旧费",
             colspan: 1,
             align: 'center'
   	
    },{
             header: "其他成本",
             colspan: 27,
             align: 'center'
   	
    },{
             header: "&nbsp;",
             colspan: 1,
             align: 'center'
   	
    },{
             header: "&nbsp;",
             colspan: 1,
             align: 'center'
   	
    },{
             header: "&nbsp;",
             colspan: 1,
             align: 'center'
   	
    },{
             header: "&nbsp;",
             colspan: 1,
             align: 'center'
   	
    },{
             header: "&nbsp;",
             colspan: 1,
             align: 'center'
   	
    	},{
             header: "&nbsp;",
             colspan: 1,
             align: 'center'
   	
    },{
             header: "&nbsp;",
             colspan: 1,
             align: 'center'
   	
    },{
             header: "合计",
             colspan: 1,
             align: 'center'
   	
    }];

	var in_office_store = new Ext.data.SimpleStore( {
		fields : [ 'in_office', 'name' ],
		data : [['',''],['1','局内'],['0','局外']]
	});

    
    var editor_combo_comp = new Ext.form.ComboBox({
    	id : 'in_office_id',
		hiddenName : 'in_office',
		valueField : 'in_office',
		store : in_office_store,
		displayField : 'name',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		listeners: {
			select : function(combo,record,index){
				Ext.getCmp('editor_date_id').setValue('');
			}
		}
    	
    });
    var editor_date_comp = new Ext.form.DateField({
    	format : 'Y-m',
    	id : 'editor_date_id',
    	allowBlank : false,
    	blankText : '请选择月份',
    	listeners : {
    		select : function(this_,date){
    			var in_officeV = Ext.getCmp('in_office_id').getValue();
    			if(in_officeV==null||in_officeV==''){
    				Ext.Msg.alert('提示','请先选择局内/局外');
    				Ext.getCmp('in_office_id').setValue('');
    				this_.setValue('');
    				return false;
    			
    			}
    			var sqlAlias = 'wealth_account.wealth_report.costdefray_count_judge';
				Ext.zion.db.getJSON(sqlAlias, [date,date,in_officeV],
					function(data) {
						if (!data.f) {
							if(data.r[0][0]>=1){
								this_.setValue('');
								Ext.Msg.alert("提示", "所在局本月内已有记录!");
								return false;
							}
						} else {
					}
				});

    			
    		}
    	}
    });
    
    
    columns = [
    	{header : '序号',dataIndex:'id'},
    	{header : '局内/局外',dataIndex:'in_office', editor: editor_combo_comp,renderer : transStrOffice},
    	{header : '月份',dataIndex:'month', editor: editor_date_comp, renderer : dateToString},//, renderer : Ext.util.Format.dateRenderer('Y-m')
    	{header : '工程结算',dataIndex:'project_count', editor: new Ext.form.TextField({})},
    	{header : '小灵通及卡出库',dataIndex:'manager_phs_sail', editor: new Ext.form.TextField({})},
    	{header : '维修配件',dataIndex:'phs_repire_fit', editor: new Ext.form.TextField({})},
    	{header : '维修费',dataIndex:'phs_repire', editor: new Ext.form.TextField({})},
    	{header : '短信费',dataIndex:'phs_msg', editor: new Ext.form.TextField({})},
    	{header : '联通卡出库',dataIndex:'virtual_union_card_out', editor: new Ext.form.TextField({})},
    	{header : '联通充值卡出库',dataIndex:'vir_union_pay_out', editor: new Ext.form.TextField({})},
    	{header : '移动充值卡出库',dataIndex:'vir_mobile_pay_out', editor: new Ext.form.TextField({})},
    	{header : '电信充值卡出库',dataIndex:'vir_tele_pay_out', editor: new Ext.form.TextField({})},
    	{header : '手机出库',dataIndex:'vir_mobile_phone', editor: new Ext.form.TextField({})},
    	{header : '上网卡费',dataIndex:'wless_online_cost', editor: new Ext.form.TextField({})},
    	{header : '联动卡费',dataIndex:'union_card_cost', editor: new Ext.form.TextField({})},
    	{header : '联动线路租用费',dataIndex:'union_line_rent', editor: new Ext.form.TextField({})},
    	{header : 'gps终端',dataIndex:'gps_terminal', editor: new Ext.form.TextField({})},
    	{header : 'gps线路租用费',dataIndex:'gps_line_rent', editor: new Ext.form.TextField({})},
    	{header : 'gps卡费',dataIndex:'gps_card', editor: new Ext.form.TextField({})},
    	{header : 'gps手持机',dataIndex:'gps_navigator', editor: new Ext.form.TextField({})},
    	{header : '海事卫星支出',dataIndex:'moon_phone', editor: new Ext.form.TextField({})},
    	{header : '公积金',dataIndex:'pay_public', editor: new Ext.form.TextField({})},
    	{header : '工资',dataIndex:'pay_pay', editor: new Ext.form.TextField({})},
    	{header : '工会经费',dataIndex:'pay_union', editor: new Ext.form.TextField({})},
    	{header : '教育经费',dataIndex:'pay_study', editor: new Ext.form.TextField({})},
    	{header : '劳动保护费',dataIndex:'pay_work_project', editor: new Ext.form.TextField({})},
    	{header : '折旧费',dataIndex:'use_cost', editor: new Ext.form.TextField({})},
    	{header : '材料费',dataIndex:'other_stuff', editor: new Ext.form.TextField({})},
    	{header : '燃料费',dataIndex:'other_fuel', editor: new Ext.form.TextField({})},
    	{header : '差旅费',dataIndex:'other_travel', editor: new Ext.form.TextField({})},
    	{header : '通讯费',dataIndex:'other_com', editor: new Ext.form.TextField({})},
    	{header : '邮资费',dataIndex:'other_postage', editor: new Ext.form.TextField({})},
    	{header : '过桥费',dataIndex:'other_pass_bidge', editor: new Ext.form.TextField({})},
    	{header : '资料费',dataIndex:'other_datum', editor: new Ext.form.TextField({})},
    	{header : '公杂费',dataIndex:'other_mixed', editor: new Ext.form.TextField({})},
    	{header : '运费',dataIndex:'other_transport', editor: new Ext.form.TextField({})},
    	{header : '业务招待费',dataIndex:'other_busy_fete', editor: new Ext.form.TextField({})},
    	{header : '电子地图费',dataIndex:'other_tele_map', editor: new Ext.form.TextField({})},
    	{header : '防暑降温费',dataIndex:'other_cooling', editor: new Ext.form.TextField({})},
    	{header : '独身子女费',dataIndex:'other_sigle_child', editor: new Ext.form.TextField({})},
    	{header : '其他',dataIndex:'other_other', editor: new Ext.form.TextField({})},
    	{header : '误餐费',dataIndex:'other_delay_meat', editor: new Ext.form.TextField({})},
    	{header : '代理费',dataIndex:'other_proxy', editor: new Ext.form.TextField({})},
    	{header : '保险费',dataIndex:'other_safe', editor: new Ext.form.TextField({})},
    	{header : '水电费',dataIndex:'other_water_tele', editor: new Ext.form.TextField({})},
    	{header : '短信费',dataIndex:'other_msg', editor: new Ext.form.TextField({})},
    	{header : '广告费',dataIndex:'other_ad', editor: new Ext.form.TextField({})},
    	{header : '北京信联出库',dataIndex:'other_bj_true_out', editor: new Ext.form.TextField({})},
    	{header : '走帐招待费',dataIndex:'other_for_fete', editor: new Ext.form.TextField({})},
    	{header : '房租费',dataIndex:'other_rent', editor: new Ext.form.TextField({})},
    	{header : '软件费',dataIndex:'other_soft', editor: new Ext.form.TextField({})},
    	{header : '营业室转成本',dataIndex:'other_busy_cost', editor: new Ext.form.TextField({})},
    	{header : '供应站转材料',dataIndex:'other_provide_stuff', editor: new Ext.form.TextField({})},
    	{header : '霸州移动话费',dataIndex:'other_state_mobile', editor: new Ext.form.TextField({})},
    	{header : '其他业务支出',dataIndex:'other_busy', editor: new Ext.form.TextField({})},
    	{header : '经营税金及附加',dataIndex:'trade_taxtation_and', editor: new Ext.form.TextField({})},
    	{header : '其他税金及附加',dataIndex:'busy_taxtation_and', editor: new Ext.form.TextField({})},
    	{header : '工程结算税金',dataIndex:'project_count_tax', editor: new Ext.form.TextField({})},
    	{header : '财务费用',dataIndex:'wealth_fare', editor: new Ext.form.TextField({})},
    	{header : '投资收益',dataIndex:'invest_incre', editor: new Ext.form.TextField({})},
    	{header : '经营销售利润',dataIndex:'manage_sail_gain', editor: new Ext.form.TextField({})},
    	{header : '金额合计',dataIndex:'all_total'}
    	
    ];
    
        
    
    /*
     * continentGroupRow at this point is:
     * [
     *     {header: 'Asia', colspan: 4, align: 'center'},
     *     {header: 'Europe', colspan: 6, align: 'center'}
     * ]
     * 
     * cityGroupRow at this point is:
     * [
     *     {header: 'Beijing', colspan: 2, align: 'center'},
     *     {header: 'Tokyo', colspan: 2, align: 'center'},
     *     {header: 'Berlin', colspan: 2, align: 'center'},
     *     {header: 'London', colspan: 2, align: 'center'},
     *     {header: 'Paris', colspan: 2, align: 'center'}
     * ]
     */

	var fields = [ "id", "in_office", "month", "project_count", "manager_phs_sail", "phs_repire_fit",
		"phs_repire", "phs_msg", "phs_total", "virtual_union_card_out", "vir_union_pay_out", "vir_mobile_pay_out",
		"vir_tele_pay_out", "vir_mobile_phone", "vir_total", "wless_online_cost", "union_card_cost", "union_line_rent",
		"union_total", "gps_terminal", "gps_line_rent", "gps_card", "gps_navigator", "gps_total", "moon_phone",
		"pay_public", "pay_pay", "pay_union", "pay_study", "pay_work_project", "pay_total", "use_cost", "other_stuff",
		"other_fuel", "other_travel", "other_com", "other_postage", "other_pass_bidge", "other_datum", "other_mixed",
		"other_transport", "other_busy_fete", "other_tele_map", "other_cooling", "other_sigle_child", "other_other",
		"other_delay_meat", "other_proxy", "other_safe", "other_water_tele", "other_msg", "other_ad", "other_bj_true_out",
		"other_for_fete", "other_rent", "other_soft", "other_busy_cost", "other_provide_stuff", "other_state_mobile",
		"other_total", "other_busy", "trade_taxtation_and", "busy_taxtation_and", "project_count_tax", "wealth_fare",
		"invest_incre", "manage_sail_gain", "all_total", "approvel", "memo", "using", "user_id", "create_date" ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "wealth_account.wealth_report.cost_defray_query"
		},
		root : "r",
		fields : fields
	});


	var group = new Ext.ux.grid.ColumnHeaderGroup({
        rows: [firstGroupRow, secondGroupRow]
    });
    var editor = new Ext.ux.grid.RowEditor({
        saveText: '修改',
        cancelText: '取消',
	    commitChangesText: '你需要保存或取消你的修改...',
	    errorText: '警告',
	    listeners : {
	    	afteredit : function(this_,changes,record,this_row){
	    		if(record.data.id==null||record.data.id==''){
	    			insertCostdefray(record);
	    		}else{
	    			updateCostdefray(record);
	    		}
	    		
	    	},
	    	canceledit : function(this_,savaChanges){
	    		gridRefresh();
	    	}
	    }
    });

    
    var grid = new Ext.grid.GridPanel({
//        renderTo: 'column-group-grid',
        title: '无线业务显示表单',
        width: 1000,
        height: 400,
        store: store,
        columns: columns,
        viewConfig: {
            forceFit: false
        },
        plugins: [group,editor],
        tbar: [{
            text: '增加',
            icon: Ext.zion.image_base+'/add.gif',
            handler: onAdd
        }, '-', {
            text: '删除',
            icon: Ext.zion.image_base+ '/delete.gif',
            handler: onDelete
        }, '-' ,{
            text: '刷新',
            icon: Ext.zion.image_base+ '/refresh.gif',
            handler: gridRefresh
        }, '-'],
   			bbar:new Ext.PagingToolbar({
				store: store,
				pageSize: Ext.zion.page.limit,
				displayInfo : true 
			}),


		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		})
    });
	store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
    new Ext.Viewport({
    		layout:'border',    
			border:false,  
			items:[{  
				region:'center',  
				layout:'fit',  
				items:[grid]  
			}]  

    });
    
    function recordToParams(record, names){
    	var params = [];
    	for(var i = 0; i < names.length; i++){
    		parmas.push(record.data[names[i]]);
    	}
    	return params;
    }
    
// ============新增数据=================   
    function insertCostdefray(record){
    	var sqlAlias = 'wealth_account.wealth_report.costdefray_insert';
//    	var params = recordToParams(record, ['in_office', 'month']);
    	var params = [];
    	params.push(record.data.in_office);
    	params.push(record.data.month);
    	params.push(record.data.project_count);
    	params.push(record.data.manager_phs_sail);
    	params.push(record.data.phs_repire_fit);
    	params.push(record.data.phs_repire);
    	params.push(record.data.phs_msg);
    	params.push(record.data.virtual_union_card_out);
    	params.push(record.data.vir_union_pay_out);
    	params.push(record.data.vir_mobile_pay_out);
    	params.push(record.data.vir_tele_pay_out);
    	params.push(record.data.vir_mobile_phone);
    	params.push(record.data.wless_online_cost);
    	params.push(record.data.union_card_cost);
    	params.push(record.data.union_line_rent);
    	params.push(record.data.gps_terminal);
    	params.push(record.data.gps_line_rent);
    	params.push(record.data.gps_card);
    	params.push(record.data.gps_navigator);
    	params.push(record.data.moon_phone);
    	params.push(record.data.pay_public);
    	params.push(record.data.pay_pay);
    	params.push(record.data.pay_union);
    	params.push(record.data.pay_study);
    	params.push(record.data.pay_work_project);
    	params.push(record.data.use_cost);
    	params.push(record.data.other_stuff);
    	params.push(record.data.other_fuel);
    	params.push(record.data.other_travel);
    	params.push(record.data.other_com);
    	params.push(record.data.other_postage);
    	params.push(record.data.other_pass_bidge);
    	params.push(record.data.other_datum);
    	params.push(record.data.other_mixed);
    	params.push(record.data.other_transport);
    	params.push(record.data.other_busy_fete);
    	params.push(record.data.other_tele_map);
    	params.push(record.data.other_cooling);
    	params.push(record.data.other_sigle_child);
    	params.push(record.data.other_other);
    	params.push(record.data.other_delay_meat);
    	params.push(record.data.other_proxy);
    	params.push(record.data.other_safe);
    	params.push(record.data.other_water_tele);
    	params.push(record.data.other_msg);
    	params.push(record.data.other_ad);
    	params.push(record.data.other_bj_true_out);
    	params.push(record.data.other_for_fete);
    	params.push(record.data.other_rent);
    	params.push(record.data.other_soft);
    	params.push(record.data.other_busy_cost);
    	params.push(record.data.other_provide_stuff);
    	params.push(record.data.other_state_mobile);
    	params.push(record.data.other_busy);
    	params.push(record.data.trade_taxtation_and);
    	params.push(record.data.busy_taxtation_and);
    	params.push(record.data.project_count_tax);
    	params.push(record.data.wealth_fare);
    	params.push(record.data.invest_incre);
    	params.push(record.data.manage_sail_gain);
    	
    	var all_totalV = 0;
    	for(var i = 2;i<(params.length) ; i++){
    		if(params[i]==''||params[i]==null||isNaN(params[i])){
    			params[i] = 0;
    		}
    		all_totalV = parseFloat(all_totalV) + parseFloat(params[i]);
    	}
    	params.push(all_totalV);
    	alert("vvvp:::"+params);

		Ext.zion.db.getJSON(sqlAlias, params,
			function(data) {
				if (!data.f && data.r>0) {
					Ext.Msg.alert("提示", "修改成功");
					grid.store.reload();
				} else {
					Ext.Msg.alert("提示", "数据修改错误");
			}
		});

    }
// ============修改数据=================   
    function updateCostdefray(record){
    	var sqlAlias = 'wealth_account.wealth_report.costdefray_update';

    	var params = [];
    	params.push(record.data.in_office);
    	params.push(record.data.month);
    	params.push(record.data.project_count);
    	params.push(record.data.manager_phs_sail);
    	params.push(record.data.phs_repire_fit);
    	params.push(record.data.phs_repire);
    	params.push(record.data.phs_msg);
    	params.push(record.data.virtual_union_card_out);
    	params.push(record.data.vir_union_pay_out);
    	params.push(record.data.vir_mobile_pay_out);
    	params.push(record.data.vir_tele_pay_out);
    	params.push(record.data.vir_mobile_phone);
    	params.push(record.data.wless_online_cost);
    	params.push(record.data.union_card_cost);
    	params.push(record.data.union_line_rent);
    	params.push(record.data.gps_terminal);
    	params.push(record.data.gps_line_rent);
    	params.push(record.data.gps_card);
    	params.push(record.data.gps_navigator);
    	params.push(record.data.moon_phone);
    	params.push(record.data.pay_public);
    	params.push(record.data.pay_pay);
    	params.push(record.data.pay_union);
    	params.push(record.data.pay_study);
    	params.push(record.data.pay_work_project);
    	params.push(record.data.use_cost);
    	params.push(record.data.other_stuff);
    	params.push(record.data.other_fuel);
    	params.push(record.data.other_travel);
    	params.push(record.data.other_com);
    	params.push(record.data.other_postage);
    	params.push(record.data.other_pass_bidge);
    	params.push(record.data.other_datum);
    	params.push(record.data.other_mixed);
    	params.push(record.data.other_transport);
    	params.push(record.data.other_busy_fete);
    	params.push(record.data.other_tele_map);
    	params.push(record.data.other_cooling);
    	params.push(record.data.other_sigle_child);
    	params.push(record.data.other_other);
    	params.push(record.data.other_delay_meat);
    	params.push(record.data.other_proxy);
    	params.push(record.data.other_safe);
    	params.push(record.data.other_water_tele);
    	params.push(record.data.other_msg);
    	params.push(record.data.other_ad);
    	params.push(record.data.other_bj_true_out);
    	params.push(record.data.other_for_fete);
    	params.push(record.data.other_rent);
    	params.push(record.data.other_soft);
    	params.push(record.data.other_busy_cost);
    	params.push(record.data.other_provide_stuff);
    	params.push(record.data.other_state_mobile);
    	params.push(record.data.other_busy);
    	params.push(record.data.trade_taxtation_and);
    	params.push(record.data.busy_taxtation_and);
    	params.push(record.data.project_count_tax);
    	params.push(record.data.wealth_fare);
    	params.push(record.data.invest_incre);
    	params.push(record.data.manage_sail_gain);
    	var all_totalV = 0;
    	for(var i = 2;i<(params.length) ; i++){
    		if(params[i]==''||params[i]==null||isNaN(params[i])){
    			params[i] = 0;
    		}
    		all_totalV = parseFloat(all_totalV) + parseFloat(params[i]);
    	}
    	params.push(all_totalV);
    	params.push(record.data.id);

		Ext.zion.db.getJSON(sqlAlias, params,
			function(data) {
				if (!data.f) {
					Ext.Msg.alert("提示", "修改成功");
					grid.store.reload();
				} else {
					Ext.Msg.alert("提示", "数据修改错误");
			}
		});

    }
    
    /**
     * add deleteCostdefray record
     */
    function deleteCostdefray(id_str){
    	var sqlAlias = 'wealth_account.wealth_report.costdefray_delete';
		Ext.zion.db.getJSON(sqlAlias, [id_str],
			function(data) {
				if (!data.f && data.r>0) {
					Ext.Msg.alert("提示", "成功删除！");
					grid.store.reload();
				} else {
					Ext.Msg.alert("提示", "数据修改错误");
			}
		});
    }
    
    
// =============刷新grid数据===========
    function gridRefresh(){
    	grid.store.reload();
    
    }
    /**
     * onAdd
     */
    function onAdd(btn, ev) {

        var u = new grid.store.recordType({
            first : '',
            last: '',
            email : ''
        });
        editor.stopEditing();
        grid.store.insert(0, u);
        editor.startEditing(0);
    }
    /**
     * onDelete
     */
    function onDelete() {
        var rec = grid.getSelectionModel().getSelected();
        var id = rec.get('id');
        if (!id) {
            return false;
        }
        deleteCostdefray(id);
        gridRefresh();
//        grid.store.remove(rec);
    }
    
    /**
     *  string transtation
     */
    function transStrOffice(strV){
    	if(strV==1){
    		return '局内';
    	}else if(strV==0){
    		return '局外';
    	}
    }
    /**
     * add date to string yyyy-mm
     */
    function dateToString(value){ 
		if(value instanceof Date){ 
			return new Date(value).format("Y-m"); 
			}else if(value!=''&&value!=null){ 
			return value.substring(0,7); 
		} 
	}

});
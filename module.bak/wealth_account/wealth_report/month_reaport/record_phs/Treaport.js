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
             header: "小灵通业务",
             colspan: 5,
             align: 'center'
   	
    },{
             header: "虚拟运营业务",
             colspan: 4,
             align: 'center'
   	
    },{
             header: "无线数传业务",
             colspan: 11,
             align: 'center'
   	
    },{
             header: "GPS业务",
             colspan: 5,
             align: 'center'
   	
    },{
             header: "卫星电话业务",
             colspan: 3,
             align: 'center'
   	
    },{
             header: "大屏幕业务",
             colspan: 1,
             align: 'center'
   	
    },{
             header: "手机业务",
             colspan: 1,
             align: 'center'
   	
    },{
             header: "其他业务",
             colspan: 4,
             align: 'center'
   	
    },{
             header: "金额合计",
             colspan: 1,
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
             header: "售机收入",
             colspan: 3,
             align: 'center'
   	
    	},{
             header: "银行代收",
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
             header: "油田应用无线数传销售收入",
             colspan: 5,
             align: 'center'
   	
    },{
             header: "机卡联动业务销售收入",
             colspan: 6,
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
             header: "金额合计",
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
    			var sqlAlias = 'wealth_account.wealth_report.income_date_judge';
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
    	{header : '功能费',dataIndex:'phs_count_function', editor: new Ext.form.TextField({})},
    	{header : '月租费',dataIndex:'phs_count_month', editor: new Ext.form.TextField({})},
    	{header : '维修费',dataIndex:'phs_count_repire', editor: new Ext.form.TextField({})},
    	{header : '短信费',dataIndex:'phs_count_msg', editor: new Ext.form.TextField({})},
    	{header : '预存话费',dataIndex:'phs_count_store', editor: new Ext.form.TextField({})},
    	{header : '联通卡售卡',dataIndex:'virtual_union_card', editor: new Ext.form.TextField({})},
    	{header : '联通话费',dataIndex:'virtual_union_fee', editor: new Ext.form.TextField({})},
    	{header : '充值卡收入',dataIndex:'virtual_rechange_card', editor: new Ext.form.TextField({})},
    	{header : '充值卡代理',dataIndex:'virtual_card_proxy', editor: new Ext.form.TextField({})},
    	{header : '办公用卡销售',dataIndex:'wireless_office_card', editor: new Ext.form.TextField({})},
    	{header : 'ORWAS用卡销售',dataIndex:'wireless_orwas_card', editor: new Ext.form.TextField({})},
    	{header : 'GPS移动代理费',dataIndex:'wireless_gps_proxy', editor: new Ext.form.TextField({})},
    	{header : '无线移动代理费',dataIndex:'wireless_proxy_card', editor: new Ext.form.TextField({})},
    	{header : '无线电信代理费',dataIndex:'wireless_proxy_tele', editor: new Ext.form.TextField({})},
    	{header : '无线办公用卡',dataIndex:'wire_un_office_card', editor: new Ext.form.TextField({})},
    	{header : '加油站POSS用卡',dataIndex:'wire_un_poss_card', editor: new Ext.form.TextField({})},
    	{header : '加油站数传用卡',dataIndex:'wire_un_data_card', editor: new Ext.form.TextField({})},
    	{header : '无线电信代理费',dataIndex:'wire_un_tele_proxy', editor: new Ext.form.TextField({})},
    	{header : '加油站POSS移动代理费',dataIndex:'wire_un_poss_proxy', editor: new Ext.form.TextField({})},
    	{header : '加油站数传电信代理费',dataIndex:'wire_un_data_proxy', editor: new Ext.form.TextField({})},
    	{header : 'GPS车载终端收入',dataIndex:'gps_car', editor: new Ext.form.TextField({})},
    	{header : 'GPS服务费收入',dataIndex:'gps_service', editor: new Ext.form.TextField({})},
    	{header : '导航仪销售收入',dataIndex:'gps_device', editor: new Ext.form.TextField({})},
    	{header : 'GPS手持机销售收入',dataIndex:'gps_mobile', editor: new Ext.form.TextField({})},
    	{header : '其他新业务收入',dataIndex:'gps_new', editor: new Ext.form.TextField({})},
    	{header : '卫星电话销售收入',dataIndex:'satellite_phone', editor: new Ext.form.TextField({})},
    	{header : '卫星电话话费收入',dataIndex:'satellite_phone_fee', editor: new Ext.form.TextField({})},
    	{header : '卫星电话话费分成收入',dataIndex:'satellite_fee_part', editor: new Ext.form.TextField({})},
    	{header : '销售收入',dataIndex:'screen_sail', editor: new Ext.form.TextField({})},
    	{header : '销售收入',dataIndex:'phone_sail', editor: new Ext.form.TextField({})},
    	{header : '电脑收入',dataIndex:'other_pc', editor: new Ext.form.TextField({})},
    	{header : '走帐收入',dataIndex:'other_acount', editor: new Ext.form.TextField({})},
    	{header : '霸县话费收入',dataIndex:'other_phone_fee', editor: new Ext.form.TextField({})},
    	{header : '其他收入',dataIndex:'other_other_acount', editor: new Ext.form.TextField({})},
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

	var fields = [ 'id', 'in_office', 'month', 'phs_count_function',
			'phs_count_month', 'phs_count_repire', 'phs_count_msg',
			'phs_count_store', 'virtual_union_card', 'virtual_union_fee',
			'virtual_rechange_card', 'virtual_card_proxy',
			'wireless_office_card', 'wireless_orwas_card',
			'wireless_gps_proxy', 'wireless_proxy_card', 'wireless_proxy_tele',
			'wire_un_office_card', 'wire_un_poss_card', 'wire_un_data_card',
			'wire_un_tele_proxy', 'wire_un_poss_proxy', 'wire_un_data_proxy',
			'gps_car', 'gps_service', 'gps_device', 'gps_mobile', 'gps_new',
			'satellite_phone', 'satellite_phone_fee', 'satellite_fee_part',
			'screen_sail', 'phone_sail', 'other_pc', 'other_acount',
			'other_phone_fee', 'other_other_acount','all_total' ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "wealth_account.wealth_report.income.select"
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
//	    		if(changes.length()){
//	    			return null;
//	    		
//	    		}
	    		if(record.data.id==null||record.data.id==''){
	    			insertIncome(record);
	    		}else{
	    			updateIncome(record);
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
    function insertIncome(record){
    	var sqlAlias = 'wealth_account.wealth_report.income_insert';
//    	var params = recordToParams(record, ['in_office', 'month']);
    	var params = [];
    	params.push(record.data.in_office);
    	params.push(record.data.month);
    	params.push(record.data.phs_count_function);
    	params.push(record.data.phs_count_month);
    	params.push(record.data.phs_count_repire);
    	params.push(record.data.phs_count_msg);
    	params.push(record.data.phs_count_store);
    	params.push(record.data.virtual_union_card);
    	params.push(record.data.virtual_union_fee);
    	params.push(record.data.virtual_rechange_card);
    	params.push(record.data.virtual_card_proxy);
    	params.push(record.data.wireless_office_card);
    	params.push(record.data.wireless_orwas_card);
    	params.push(record.data.wireless_gps_proxy);
    	params.push(record.data.wireless_proxy_card);
    	params.push(record.data.wireless_proxy_tele);
    	params.push(record.data.wire_un_office_card);
    	params.push(record.data.wire_un_poss_card);
    	params.push(record.data.wire_un_data_card);
    	params.push(record.data.wire_un_tele_proxy);
    	params.push(record.data.wire_un_poss_proxy);
    	params.push(record.data.wire_un_data_proxy);
    	params.push(record.data.gps_car);
    	params.push(record.data.gps_service);
    	params.push(record.data.gps_device);
    	params.push(record.data.gps_mobile);
    	params.push(record.data.gps_new);
    	params.push(record.data.satellite_phone);
    	params.push(record.data.satellite_phone_fee);
    	params.push(record.data.satellite_fee_part);
    	params.push(record.data.screen_sail);
    	params.push(record.data.phone_sail);
    	params.push(record.data.other_pc);
    	params.push(record.data.other_acount);
    	params.push(record.data.other_phone_fee);
    	params.push(record.data.other_other_acount);
    	var all_totalV = 0;
    	for(var i = 2;i<(params.length) ; i++){
    		if(params[i]==''||params[i]==null||isNaN(params[i])){
    			params[i] = 0;
    		}
    		all_totalV = parseFloat(all_totalV) + parseFloat(params[i]);
    	}
    	params.push(all_totalV);

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
// ============修改数据=================   
    function updateIncome(record){
    	var sqlAlias = 'wealth_account.wealth_report.income_update';

    	var params = [];
    	params.push(record.data.in_office);
    	params.push(record.data.month);
    	params.push(record.data.phs_count_function);
    	params.push(record.data.phs_count_month);
    	params.push(record.data.phs_count_repire);
    	params.push(record.data.phs_count_msg);
    	params.push(record.data.phs_count_store);
    	params.push(record.data.virtual_union_card);
    	params.push(record.data.virtual_union_fee);
    	params.push(record.data.virtual_rechange_card);
    	params.push(record.data.virtual_card_proxy);
    	params.push(record.data.wireless_office_card);
    	params.push(record.data.wireless_orwas_card);
    	params.push(record.data.wireless_gps_proxy);
    	params.push(record.data.wireless_proxy_card);
    	params.push(record.data.wireless_proxy_tele);
    	params.push(record.data.wire_un_office_card);
    	params.push(record.data.wire_un_poss_card);
    	params.push(record.data.wire_un_data_card);
    	params.push(record.data.wire_un_tele_proxy);
    	params.push(record.data.wire_un_poss_proxy);
    	params.push(record.data.wire_un_data_proxy);
    	params.push(record.data.gps_car);
    	params.push(record.data.gps_service);
    	params.push(record.data.gps_device);
    	params.push(record.data.gps_mobile);
    	params.push(record.data.gps_new);
    	params.push(record.data.satellite_phone);
    	params.push(record.data.satellite_phone_fee);
    	params.push(record.data.satellite_fee_part);
    	params.push(record.data.screen_sail);
    	params.push(record.data.phone_sail);
    	params.push(record.data.other_pc);
    	params.push(record.data.other_acount);
    	params.push(record.data.other_phone_fee);
    	params.push(record.data.other_other_acount);
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
     * add deleteIncome record
     */
    function deleteIncome(id_str){
    	var sqlAlias = 'wealth_account.wealth_report.income_delete';
		Ext.zion.db.getJSON(sqlAlias, [id_str],
			function(data) {
				if (!data.f) {
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
        deleteIncome(id);
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
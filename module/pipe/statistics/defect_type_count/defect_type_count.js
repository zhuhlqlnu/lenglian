Ext.onReady(function(){
	Ext.QuickTips.init();
	var formPanel;
	var terminal_add = false;
	var old_id;
	var selectCorpId;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	
	var store = new Ext.data.SimpleStore( {
		root : 'r',
		fields : ['name','defect_count'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/pipe.statistics.defect_type_count.select/['+selectCorpId+']'
		})
	});

	var grid = new Ext.grid.GridPanel({  
		 store: store,  
		 columns: [  
			 {header: "缺陷类型名称", dataIndex: 'name', width:250, sortable: true},  
			 {header: "缺陷数量", dataIndex: 'defect_count', width:250, sortable: true}
		 ],  
		 tbar:[{
			xtype:'label',
			text:'开始时间:'
		},{
			xtype:'datefield',
			id:'startDate',
			value: new Date(),
			format:'Y-m',
			width:100
		},{
			xtype:'label',
			text:'结束时间:'
		},{
			xtype:'datefield',
			id:'endDate',
			value: new Date(),
			format:'Y-m',
			width:100
		},{
			text:'查询',
			icon :   Ext.zion.image_base + '/select.gif',
			handler:function(){
				load_data(selectCorpId);
			}
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	}); 
	
	var pic_chart = new Ext.chart.PieChart({
		store:store,
		dataField: 'defect_count',
		categoryField: 'name',
		extraStyle:{
			legend:{
				display: 'left',
				width: 30,
				padding: 5,
				font:{
					family: 'Tahoma',
					size: 13
				}
			}
		}
	});

	var pic_chart_panel = new Ext.Panel({
		items:[pic_chart]
	});
	

	var line_chart_store = new Ext.data.SimpleStore({
			root : 'r',
			fields : ['name','defect_count','month']
		});

	var line_chart_panel = new Ext.Panel({
		items: [{
			id:'line_chart',
			xtype: 'linechart',
			store: line_chart_store,
			url:'/api/ext/resources/charts.swf',
			xField: 'month',
			series: [{
				type: 'line', 
				displayName: '月',
				yField: ["标志桩损坏"],
				style: {
				  color:0x00BB00
				}
			}]       
		}]
	});
	
	var tree = new Ext.tree.TreePanel( {
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
				selectCorpId = node.attributes.corp.corp_id;
				load_data(selectCorpId);
			}
		}
	});
	
	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(corpTree) {
			tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
			tree.getRootNode().childNodes[0].select();
			loadMask.hide();
		});
		load_data(selectCorpId);
	});
	
	function trans_to_chart_data(data_value){
		var names = {};
		var month_max = null;
		var month_min = null;
		for(var i = 0; i < data_value.length; i++){
			names[data_value[i][0]] = 0;
			var tmp = data_value[i][2].split("-");
			data_value[i].push(tmp[0] * 12 + tmp[1]*1);
			if(i == 0){
				month_max = month_min = data_value[i][3];
			}else{
				month_max = Math.max(month_max, data_value[i][3]);
				month_min = Math.min(month_min, data_value[i][3]);
			}
		}
		
		var chart_datas = [];
		for(var i = month_min; i <= month_max; i++){
			var chart_data = [];
			var month = i % 12;
			if(month < 10){
				chart_data.push(parseInt(i / 12) + "-0" + month);
			}else{
				chart_data.push(parseInt(i / 12) + "-" + month);
			}
			for(var e in names){
				var is_found = false;
				for(var j = 0; j < data_value.length; j++){
					if((data_value[j][0] == e) && (i == data_value[j][3])){
						chart_data.push(data_value[j][1]);
						is_found = true;
						break;
					}
				}
				if(!is_found){
					chart_data.push(0);
				}
			}
			chart_datas.push(chart_data);
		}
		var fields = ['month'];
		for(var e in names){
			fields.push(e);
		}
		return [chart_datas,fields];
	}
	

	function diagram_select(selectCorpId,std_,end_){
		Zion.db.getJSON('pipe.statistics.defect_type_count.month.select',[selectCorpId,std_,end_],function(data){
			if(data.r){
				var chart_datas = trans_to_chart_data(data.r);
				line_chart_store.constructor({
					fields : chart_datas[1]//,
					//data:chart_datas[0]
				});;
				var series = [];
				for(var i=1;i<chart_datas[1].length;i++){
					var newSeries = new Ext.chart.LineSeries({
							type: 'line',
							displayName: chart_datas[1][i],
							yField: chart_datas[1][i]
					});
					series.push(newSeries);
				}
				Ext.getCmp("line_chart").series = series;
				line_chart_store.loadData(chart_datas[0])
			}
		});
		
	}

	function end_day(e_y,e_m){
		return new Date(e_y,e_m,0).getDate(); 
	}
	
	function load_data(selectCorpId){
		var s = Ext.util.Format.date(Ext.getCmp('startDate').getValue(),'Y-m')+'-01 00:00:00';
		var std_ = (new Date(Date.parse(s.replace(/-/g, "/")))).getTime()/1000;
		var e_y = Ext.util.Format.date(Ext.getCmp('endDate').getValue(),'Y');
		var e_m = Ext.util.Format.date(Ext.getCmp('endDate').getValue(),'m');
		var e_d = end_day(e_y,e_m);
		var e = e_y+'-'+e_m+'-'+e_d+' 23:59:59'
		var end_ = (new Date(Date.parse(e.replace(/-/g, "/")))).getTime()/1000;
		store.constructor( {
			root : 'r',
			fields : ['name','defect_count'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/pipe.statistics.defect_type_count.select/['+selectCorpId+','+std_+','+end_+']'
			})
		});
		store.load();		
		diagram_select(selectCorpId,std_,end_);
	}
// grid自适应
	var view=new Ext.Viewport({  
		layout:'border',  
		border:false,  
		items:[tree,{  
			region:'center',  
			layout:'fit',  
			items:[{
				layout:'border',  
				border:false,
				items:[{
					title:'统计',
					layout:'fit',
					region:'north',  
					height:300,
					split:true,
					items:[grid]
				},{
					region:'center',  
					layout:'fit',
					items:[{
						layout:'border',  
						border:false,
						items:[{
							title:'饼状图',
							region:'center',
							layout:'fit',
							width:'30%',
							split:true,
							items:[pic_chart_panel]
						},{
							title:'月对比',
							region:'east',
							layout:'fit',
							split:true,
							width:'70%',
							items:[line_chart_panel]
						}]
					}]
				}]
			}]  
		}]  
	});	 
})
					
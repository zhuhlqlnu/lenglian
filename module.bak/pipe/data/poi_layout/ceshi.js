Ext.onReady(function(){
var attribute_fields =  [ 'overlay_attribute_id','overlay_attribute_name','memo','attribute_type_name','attribute_type_memo'];
var attribute_fields_default = {'image':'图片','text':'','number':0};

var p_source;
var p_source_value;
/*Zion.db.getJSON('poi_layout.type_attribute.type.search',[3],function(data){
	if(!data.f){
		var data_value = data.r;
		for(var i = 0; i < data_value.length; i++){
			var overlay_attribute_id = data_value[i][0];
			var overlay_attribute_name = data_value[i][1];
			var memo = data_value[i][2];
			var attribute_type_name = data_value[i][3];
			var attribute_type_memo =data_value[i][4];
		}		
	}
})*/

function get_attribute_fields_default_value(attribute_fields_type){
	var default_value = attribute_fields_default[attribute_fields_type];
	if(default_value){
		return default_value;
	}else{
		return '';
	}
}

var attribute_store = new Ext.data.SimpleStore({
	proxy : new Ext.data.ScriptTagProxy({
		url : ZionSetting.db.url + '/' + Zion.token
				+ '/poi_layout.type_attribute.select'
	}),
	root : "r", 
	fields :  attribute_fields,
	listeners:{
		'load':  {
			fn : function(store, records,options) {
				var propGrid = Ext.getCmp('propGrid');
				if (propGrid) {
					p_source = {}; 
					p_source_value = [];
					for(var i = 0; i < records.length; i++){
						var attribute_type_memo = get_attribute_fields_default_value(records[i].get('attribute_type_name'));
						p_source[records[i].get('overlay_attribute_name')] = attribute_type_memo;
						p_source_value[i] = [records[i].get('overlay_attribute_id'),records[i].get('attribute_type_name'),records[i].get('attribute_type_memo')];
			        } 
			        Ext.Msg.alert('',Ext.util.JSON.encode(p_source_value));
			        attribute_grid.setSource(p_source);
				}
             } 
		}
	}
});
var attribute_grid = new Ext.grid.PropertyGrid({
		title:'属性填写',
		flex:2,
		layout:'fit',
		id:'propGrid',
//		store:attribute_store,
		source:	{
			
		},
		tbar:[{
			text : '新增',
			handler: function(){
				//alert(p_source_value);
				for(var i= 0; i< p_source_value.length;i++){
					alert(Ext.getCmp('propGrid').getSource()[p_source_value[i][1]]+"=="+p_source_value[i][0]);
				}
				
			}
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});
	attribute_store.load();

    // grid自适应
	new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [ {
			region : 'center',
			layout : 'fit',
			items : [attribute_grid]
		} ]
	});

});
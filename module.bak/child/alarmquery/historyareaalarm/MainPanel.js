/*!
 * Ext JS Library 3.1.1
 * Copyright(c) 2006-2010 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
MainPanel = function(){
    this.preview = new Ext.Panel({
        id: 'preview',
        region: 'south',
        cls:'preview',
        layout : 'fit',
        contentEl : 'map_canvas',
		cmargins : '5 0 0 0',
		listeners : {
			bodyresize : function(p, width, height) {
				document.getElementById("map_canvas").style.width = width;
				document.getElementById("map_canvas").style.height = height;
				if (map) {
					map.checkResize();
				}
			}
		}
    });

    this.grid = new FeedGrid(this, {
    	autoScroll: true,
    	enableColumnHide : false,
        tbar:[
        {
            //split:true,
        	id: 'showHid_map',
            text:'显示地图',
            tooltip: {title:'显示或隐藏地图'},
            iconCls: 'preview-bottom',
            handler: this.movePreview
        }]
    });

    MainPanel.superclass.constructor.call(this, {
        id:'main-tabs',
        region:'center',
        margins:'0 5 5 0',
        hideMode:'offsets',
        layout:'border',
        items:[
                this.grid, {
                id:'bottom-preview',
                layout:'fit',
                items:this.preview,
                height: 250,
                split: true,
                border:false,
                region:'south'
            }]
    });

};

Ext.extend(MainPanel, Ext.Panel, {

    movePreview : function(m, pressed){
        if(pressed){
            switch(m.text){
                case '显示地图':
                	mainPanel.showMap();
                    break;
                case '隐藏地图':
                	mainPanel.hideMap();
                    break;
            }
        }
    },
    showMap: function(){
    	var bot = Ext.getCmp('bottom-preview');
    	var m = Ext.getCmp('showHid_map');
		m.setText('隐藏地图');
        bot.add(mainPanel.preview);
        bot.show();
        bot.ownerCt.doLayout();
	},
	hideMap: function(){
		var m = Ext.getCmp('showHid_map');
		m.setText('显示地图');
        mainPanel.preview.ownerCt.hide();
        mainPanel.preview.ownerCt.ownerCt.doLayout();
	}
});

Ext.reg('appmainpanel', MainPanel);
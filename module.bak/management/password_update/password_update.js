Ext.onReady(function(){
	Ext.QuickTips.init();
	var username;
	var password = '';

	var update_button = new Ext.Button({
		text:'修改密码',
		width:60,
		handler:function(){
			var username = Ext.getCmp("username").text;
			var old_password = form.getForm().findField("old_password").getValue();
			var new_password = form.getForm().findField("new_password").getValue();
			var re_new_password = form.getForm().findField("re_new_password").getValue();
			//var params_update=[new_password,username];
			
			if(password != old_password){
				Ext.Msg.alert("提示","旧密码输入错误");
				return;
			}
			if(new_password!=re_new_password){
				Ext.Msg.alert("提示","两次新密码输入不一致");
				return;
			}
			if(!new_password){
				Ext.Msg.alert("提示","新密码不能为空");
				return;
			}
			
			var params = [];
			
			params.push(Ext.getCmp('login_namefrm').text);
			params.push(Ext.getCmp('new_password').getValue());
			params.push(Ext.getCmp('username').text);
			params.push(Ext.getCmp('telephone').getValue());
			params.push(Ext.getCmp('fax').getValue());
			params.push(Ext.getCmp('email').getValue());
			params.push(Ext.getCmp('address').getValue());
			params.push(Ext.getCmp('statusf').getValue());
			params.push(Ext.getCmp('enable').getValue());
			params.push(Ext.getCmp('memo').getValue());
			params.push(Ext.getCmp('user_idfrm').getValue());
			params.push(Ext.getCmp('corp_id').getValue());

		    var alias;
		    if(params[8] == 1){
		    	alias = 'axiom_user.update';
		    }else{
		        alias = 'axiom_user.update_disable';
		    }
		    Ext.zion.db.getJSON(alias, params, function(data) {
		    	if (data.r != 0 && data.r) {
					Ext.Msg.alert("提示", "密码修改成功");
					form.getForm().findField("old_password").setValue('');
					form.getForm().findField("new_password").setValue('');
					form.getForm().findField("re_new_password").setValue('');
				}else{
					Ext.Msg.alert("提示", "密码修改失败");
				}
		    });
			    
			}
	});
	
	var form = new Ext.form.FormPanel({
		autoWidth:true,
		autoHeight:false,
		height:7000,
		labelWidth:65,
		defaultType : 'textfield',
		items : [{
			fieldLabel : '用户',
			name : 'username',
			xtype:'label',
			id:'username',
			readOnly:true
		},{
			fieldLabel : '登录名',
			name : 'login_namefrm',
			xtype:'label',
			id:'login_namefrm',
			readOnly:true
		},{
			fieldLabel : '创建时间',
			name : 'reg_datefrm',
			xtype:'label',
			id:'reg_datefrm',
			readOnly:true
		},{
			fieldLabel : '所属集团',
			name : 'corp_namefrm',
			xtype:'label',
			id:'corp_namefrm',
			readOnly:true
		},{
			fieldLabel : '旧密码',
			inputType : 'password',
			name : 'old_password',
			id : 'old_password'
		},{
			fieldLabel : '新密码',
			name : 'new_password',	
			id : 'new_password',	
			inputType : 'password'
		},{
			fieldLabel : '重输新密码',
			name : 're_new_password',
			id : 're_new_password',
			inputType : 'password'
		},
			update_button,
			new Ext.form.Hidden({
				id: 'user_idfrm'
			}),
			new Ext.form.Hidden({
				id: 'telephone'
			}),
			new Ext.form.Hidden({
				id: 'fax'
			}),
			new Ext.form.Hidden({
				id: 'email'
			}),
			new Ext.form.Hidden({
				id: 'address'
			}),
			new Ext.form.Hidden({
				id: 'statusf'
			}),
			new Ext.form.Hidden({
				id: 'enable'
			}),
			new Ext.form.Hidden({
				id: 'memo'
			}),
			new Ext.form.Hidden({
				id: 'corp_id'
			})
		],
		listeners:{
			afterrender : function(component){
			Zion.user.getInfo(function() {
				Ext.zion.db.getJSON("module.password_update.username.select",null, function(data) {
					if(data.r&&!data.f){
						user_id = data.r[0][0];
						Ext.getCmp('user_idfrm').setValue(user_id);
						login_name = data.r[0][1];
						Ext.getCmp('login_namefrm').setText(login_name);
						user_name = data.r[0][2];
						Ext.getCmp('username').setText(user_name);
						password = data.r[0][3];
						//Ext.getCmp('password').setValue(password);
						reg_date = data.r[0][4];
						if(reg_date == "" || reg_date == null){
							reg_date = "";
						}
						Ext.getCmp('reg_datefrm').setText(reg_date);
						corp_name = data.r[0][5];
						Ext.getCmp('corp_namefrm').setText(corp_name);
						telephone = data.r[0][6];
						Ext.getCmp('telephone').setValue(telephone);
						fax = data.r[0][7];
						Ext.getCmp('fax').setValue(fax);
						email = data.r[0][8];
						Ext.getCmp('email').setValue(email);
						address = data.r[0][9];
						Ext.getCmp('address').setValue(address);
						statusf = data.r[0][10];
						Ext.getCmp('statusf').setValue(statusf);

						enable = data.r[0][11];
						Ext.getCmp('enable').setValue(enable);
						memo = data.r[0][12];
						Ext.getCmp('memo').setValue(memo);
						corp_id = data.r[0][13];
						Ext.getCmp('corp_id').setValue(corp_id);
					}
				});
			});
		}
	}
	});
	new Ext.Viewport({
		border : false,
		layout:'border',
		items : [ {
			region : 'center',
			items : form
		}]
	});
})
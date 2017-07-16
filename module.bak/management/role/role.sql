sql.management.role.module.select =  main,select distinct am.module_id, am.module_path, am.module_name, am.order_by from axiom_module am, axiom_corp_role acr, axiom_role_module arm where acr.corp_id = ? and acr.role_id = arm.role_id and arm.module_id = am.module_id order by am.order_by
 

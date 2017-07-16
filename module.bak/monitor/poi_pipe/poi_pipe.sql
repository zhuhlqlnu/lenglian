sql.axiom_poi =  main,select poi_id, x,y, name,type,info,memo from axiom_poi
sql.axiom_poi.insert =  main,insert into axiom_poi (poi_id, type, name, x, y, memo, corp_id, reg_date, reg_user_id) values (axiom_seq_poi.nextval, ?, ?, ?, ?, ?, ${corp_id}, ?, ${user_id})
sql.axiom_poi.select.count =  main,select count(*) from axiom_poi
sql.axiom_poi.select.page =  main,select * from(select a.*, rownum row_num from(select poi_id, x,y, name,type,info,memo from axiom_poi order by name, type ) a) b where  b.row_num between ? and ?
sql.axiom_poi.delete =  main,delete axiom_poi where poi_id = ?
sql.axiom_poi.update = main,update axiom_poi set type = ?, name = ?, x = ?, y = ?, memo = ?, corp_id = ${corp_id}, reg_date = ?, reg_user_id = ${user_id} where poi_id = ?



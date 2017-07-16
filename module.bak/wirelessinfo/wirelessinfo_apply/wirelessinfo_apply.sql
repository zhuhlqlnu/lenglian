sql.wirelessinfo_customer.select.count = main,select count(*) from wirelessinfo_customer where corp_id  = ${corp_id} and reg_user_id = ${user_id} and is_delete = 0
sql.wirelessinfo_customer.select.page = main,select * from (select a.*,rownum row_num from (select customer_id, customer_name, telephone, fax, email, address, corp_id, enable, reg_date, reg_user_id, memo, is_delete from wirelessinfo_customer where corp_id  = ${corp_id} and reg_user_id = ${user_id} and is_delete = 0 order by reg_date desc ) a ) b where  b.row_num between ? and ?

sql.wirelessinfo_customer.params.select.count = main,select count(*) from wirelessinfo_customer where corp_id  = ${corp_id} and reg_user_id = ${user_id} and is_delete = 0 and customer_name like '%' ||?|| '%'
sql.wirelessinfo_customer.params.select.page = main,select * from (select a.*,rownum row_num from (select customer_id, customer_name, telephone, fax, email, address, corp_id, enable, reg_date, reg_user_id, memo, is_delete from wirelessinfo_customer where corp_id  = ${corp_id} and reg_user_id = ${user_id} and is_delete = 0 and customer_name like '%' ||?|| '%' order by reg_date desc ) a ) b where  b.row_num between ? and ?

sql.wirelessinfo_customer.insert = main,insert into wirelessinfo_customer (customer_id, customer_name, telephone, fax, email, address, memo, reg_date, corp_id, enable, reg_user_id, is_delete) values (WIRELESSINFO_SEQ_CUSTOMER_ID.Nextval, ?, ?, ?, ?, ?, ?, ?, ${corp_id}, 1, ${user_id}, 0)

sql.wirelessinfo_customer.update =  main,update wirelessinfo_customer set  reg_date = ?, customer_name = ?, telephone = ?, fax = ?, email = ?, address = ?, memo = ?, corp_id = ${corp_id}, reg_user_id = ${user_id} where customer_id = ?


sql.wirelessinfo_release_op_seq_id.nextval = main,select wirelessinfo_release_op_seq_id.nextval from dual

sql.wirelessinfo_customer.delete = main,update wirelessinfo_customer set is_delete = 1 where customer_id = ?

sql.wirelessinfo_release.params.select.count = main,select count(*) from ( select r.release_id from wirelessinfo_release r, wirelessinfo_customer c where (upper(r.release_num)like '%' ||upper(?)|| '%' or 1=?)and (r.start_time>=? or 1=?) and (r.end_time<=? or 1=?) and r.reg_user_id = ${user_id} and r.corp_id = ${corp_id} and r.customer_id = c.customer_id and r.isdelete = 0 and c.is_delete = 0 union  select r.release_id from wirelessinfo_release_op r, wirelessinfo_customer c where (upper(r.release_num)like '%' ||upper(?)|| '%' or 1=?)and (r.start_time>=? or 1=?) and (r.end_time<=? or 1=?) and r.reg_user_id = ${user_id} and r.corp_id = ${corp_id} and r.customer_id = c.customer_id and r.isdelete = 0 and c.is_delete = 0)
sql.wirelessinfo_release.params.select.page = main,select * from (select a.*,rownum row_num from ( select r.release_id, r.release_num, r.content_type, r.info_class, r.start_time, r.end_time end_time, r.text, r.customer_id, c.customer_name, r.states, r.release_type, r.create_time , r.release_cost, r.path from wirelessinfo_release r, wirelessinfo_customer c where (upper(r.release_num)like '%' ||upper(?)|| '%' or 1=?)and (r.start_time>=? or 1=?) and (r.end_time<=? or 1=?) and r.reg_user_id = ${user_id} and r.corp_id = ${corp_id} and r.customer_id = c.customer_id and r.isdelete = 0  and c.is_delete = 0  union select r.ref_release_id as release_id, r.release_num, r.content_type, r.info_class, r.start_time, r.end_time, r.text, r.customer_id, c.customer_name, r.states, r.release_type, r.create_time , r.release_cost , r.path from wirelessinfo_release_op r, wirelessinfo_customer c where (upper(r.release_num)like '%' ||upper(?)|| '%' or 1=?)and (r.start_time>=? or 1=?) and (r.end_time<=? or 1=?) and r.reg_user_id = ${user_id} and r.corp_id = ${corp_id} and r.customer_id = c.customer_id and r.isdelete = 0 and c.is_delete = 0 ) a order by a.create_time desc) b where  b.row_num between ? and ?


sql.wirelessinfo_release.modify.delete =main,update wirelessinfo_release set isdelete = 1, create_time = ?, reg_user_id = ${user_id}, corp_id = ${corp_id} where release_id = ?

sql.wirelessinfo_release_op.modify.delete = main,update wirelessinfo_release_op set  isdelete = 1, create_time = ?, reg_user_id = ${user_id}, corp_id = ${corp_id} where ref_release_id = ?

sql.wirelessinfo_release.select.count = main,select count(*) from ( select r.release_id from wirelessinfo_release r, wirelessinfo_customer c where r.customer_id = ? and r.reg_user_id = ${user_id} and r.corp_id = ${corp_id} and r.customer_id = c.customer_id and r.isdelete = 0 and c.is_delete = 0 union select r.ref_release_id from wirelessinfo_release_op r, wirelessinfo_customer c where r.customer_id = ? and r.reg_user_id = ${user_id} and r.corp_id = ${corp_id} and r.customer_id = c.customer_id and r.isdelete = 0 and c.is_delete = 0 )
sql.wirelessinfo_release.select.page = main,select * from (select a.*,rownum row_num from ( select r.release_id, r.release_num, r.content_type, r.info_class, r.start_time, r.end_time, r.text, r.customer_id, c.customer_name, r.states, r.release_type, r.create_time , r.release_cost , r.path, r.path_name from wirelessinfo_release r, wirelessinfo_customer c where r.customer_id = ? and r.reg_user_id = ${user_id} and r.corp_id = ${corp_id} and r.customer_id = c.customer_id and r.isdelete = 0 and c.is_delete = 0 union select r.ref_release_id as release_id, r.release_num, r.content_type, r.info_class, r.start_time, r.end_time, r.text, r.customer_id, c.customer_name, r.states, r.release_type, r.create_time , r.release_cost , r.path, r.path_name from wirelessinfo_release_op r, wirelessinfo_customer c where r.customer_id = ? and r.reg_user_id = ${user_id} and r.corp_id = ${corp_id} and r.customer_id = c.customer_id and r.isdelete = 0 and c.is_delete = 0 ) a order by a.create_time desc ) b where  b.row_num between ? and ?


sql.wirelessinfo_release.release_id.select = main,select release_id, release_num, content_type, text, sound, video, customer_id, start_time, end_time, play_start_time, play_end_time, isdelete, cost, create_time, release_cost, path, ref_release_id, states, info_class, release_type, reg_user_id, corp_id, memo from wirelessinfo_release where release_id = ?

sql.wirelessinfo_release_op.ref_release_id.select = main,select release_id, release_num, content_type, text, sound, video, customer_id, start_time, end_time, play_start_time, play_end_time, isdelete, cost, create_time, release_cost, path, ref_release_id, states, info_class, release_type, reg_user_id, corp_id, memo from wirelessinfo_release_op where ref_release_id = ? and isdelete = 0


sql.wirelessinfo_release_op.delete.insert =main,insert into wirelessinfo_release_op (content_type, text, customer_id, start_time, end_time, isdelete, create_time, release_cost, path, states, info_class, release_type, memo, reg_user_id, corp_id, ref_release_id, release_num, release_id ) values (?, ?, ?, ?, ?, 0, ?, ?, ?, 0, ?, 2, ?, ${user_id}, ${corp_id}, ?, ?, ?)


sql.wirelessinfo_release_op.delete.delete = main,update wirelessinfo_release_op set  isdelete = 1, create_time = ?, reg_user_id = ${user_id}, corp_id = ${corp_id} where release_id = ?

sql.wirelessinfo_media_id.select = main,select WIRELESSINFO_SEQ_MEDIA_ID.nextval from dual

sql.wirelessinfo_release.insert = main,insert into wirelessinfo_release (content_type, text, customer_id, start_time, end_time, isdelete, create_time, release_cost, states, info_class, path, release_type, reg_user_id, corp_id, release_id, release_num, path_name) values (?, ?, ?, ?, ?, 0, ?, ?, 0, ?, ?, 0, ${user_id}, ${corp_id}, ?, ?, ?)

sql.wirelessinfo_release_op.modify.insert =main,insert into wirelessinfo_release_op (content_type, text, customer_id, start_time, end_time, isdelete, create_time, release_cost, states, info_class, path, release_type, reg_user_id, corp_id, release_id, release_num, ref_release_id, path_name) values (?, ?, ?, ?, ?, 0, ?, ?, 0, ?, ?, 1, ${user_id}, ${corp_id}, ?, ?, ? ,?)

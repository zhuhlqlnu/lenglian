
sql.wirelessinfo.wirelessinfo_target_list.select =  main,select wg.group_id, wg.group_name,count(wgt.target_id) from wirelessinfo_group wg,wirelessinfo_group_target wgt where corp_id =${corp_id} and wgt.group_id(+)=wg.group_id and wg.enable=1 group by (wg.group_id, wg.group_name)

sql.wirelessinfo.wirelessinfo_target_list.by_group_id.select.count =  main,select count(*) from wirelessinfo_release_op wro,wirelessinfo_release_target wgt where wgt.release_id = wro.release_id and wro.isdelete=0 and wgt.group_id =? and wro.corp_id=${corp_id}
sql.wirelessinfo.wirelessinfo_target_list.by_group_id.select.page =  main,select * from (select a.* ,rownum row_num from (select wr.release_id,wr.release_num,wr.content_type,wr.start_time,wr.end_time,wr.play_start_time,wr.play_end_time,wr.text,wr.customer_id,wr.states,wr.create_time,wr.cost,wr.info_class, wr.release_type,wr.reg_user_id,wr.release_cost, wr.path, wr.ref_release_id,wr.corp_id,wr.isdelete,wc.customer_name, wrt.start_time as hour_start_time,wrt.end_time as hour_end_time from wirelessinfo_release_op wr,wirelessinfo_customer wc,wirelessinfo_release_target wrt where wc.customer_id(+)=wr.customer_id and wr.release_id=wrt.release_id and wrt.group_id=? and wr.isdelete=0 and wr.corp_id=${corp_id} order by wr.release_id asc)a ) b where  b.row_num between ? and ?



sql.wirelessinfo.wirelessinfo_target_list.wirelessinfo_release_target.delete = main,delete from wirelessinfo_release_target wrt where wrt.release_id=? and wrt.group_id=?





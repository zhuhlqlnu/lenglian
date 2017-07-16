sql.script
sql.sales_goods_record.select.count = main,select count(*) from sales_goods g ,sales_goods_record gr, axiom_user u where g.goods_sn = gr.goods_sn and u.user_id = gr.user_id and gr.recv_time > ? and gr.recv_time < ?
sql.sales_goods_record.select.page =  main,select * from ( select a.*,rownum row_num from ( select g.goods_id,g.goods_sn,g.goods_name,g.goods_type,u.user_name,gr.recv_time, gr.goods_quantity,goods_price*gr.goods_quantity as goods_price from sales_goods g ,sales_goods_record gr, axiom_user u where g.goods_sn = gr.goods_sn and u.user_id = gr.user_id and gr.recv_time>? and gr.recv_time<? order by gr.recv_time,g.goods_sn ) a ) b where  b.row_num between ? and ?
sql.sales_goods_record.select =  main,select g.goods_id,g.goods_sn,g.goods_name,g.goods_type,u.user_name,gr.recv_time, gr.goods_quantity,goods_price*gr.goods_quantity as goods_price from sales_goods g ,sales_goods_record gr, axiom_user u  where g.goods_sn = gr.goods_sn and u.user_id = gr.user_id and gr.recv_time>? and gr.recv_time<? order by gr.recv_time,g.goods_sn 


http.report
report.sales_goods_record.select.head =  实时销售额(查询),商品编号,商品名称,商品类别,日期,销售数量,销售额
//不使用report.sales_goods_record.select.sql =  main,select g.goods_sn,g.goods_name,g.goods_type,gr.recv_time, gr.goods_quantity,goods_price*gr.goods_quantity as goods_price from sales_goods g ,sales_goods_record gr, axiom_user u where g.goods_sn = gr.goods_sn and u.user_id = gr.user_id and gr.recv_time>? and gr.recv_time<? order by gr.recv_time,g.goods_sn
report.sales_goods_record.select.sql =  main,select * from table(report_SALES_GOODS_RECORD(?, ?))

//sql.script 手机sql
sql.market.type =  main,select  goods_sn, goods_name from sales_goods
sql.market.upload =  main,insert into sales_goods_record (record_id, goods_sn, user_id, recv_time, goods_quantity, corp_id) values (seq_sales_goods_record_id.nextval, ?, ${user_id}, axiom_date_to_utc(sysdate), ?, ${corp_id})


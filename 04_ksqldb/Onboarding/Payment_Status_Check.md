# Financial services use case: Payment Status check (steps for Confluent Cloud)

- We are going to build data pipeline which should look like this:
  ![Financial Services Use cases as flow](img/financial_datapipeline.png)

## 1. First Steps

- Login to Confluent Cloud.
- Select environment "ksqldb-workshop" and then select your Cluster.
- From the left panel select "ksqlDB" to display all apps.
- Select your ksqlDB cluster to display the ksqlDB Editor.

![Start Screen](img/payments_start.png)

Check the properties set for ksqlDB.

```
show properties;
```

## 2. Create Topics

- Click the **Topics** in the navigation menu. The Topics page appears.
- If there aren’t any topics created yet, click **Create topic**. Otherwise, click **Add a topic**.

![Topics_Page](img/topics_page.png)

- Specify your topic details and click **Create with defaults**.
- Create the following topics:

  1. Topic name: `Payment_Instruction` , Partitions: 1

     ![Create_Topic](img/create_topic.png)

  2. Topic name: `AML_Status`, Partitions: 1
  3. Topic name: `Funds_Status`, Partitions: 1
  4. Topic name: `CUSTOMERS_FLAT`, Partitions: 1

- Go to **ksqlDB** from the navigation menu and verify the created topics with the following command:

```
show topics;
```

## 2. Create Streams and Table

Please set the following query property:

- `auto.offset.reset` to 'Earliest'

```
create stream payments(PAYMENT_ID INTEGER KEY, CUSTID INTEGER, ACCOUNTID INTEGER, AMOUNT INTEGER, BANK VARCHAR) with(kafka_topic='Payment_Instruction', value_format='json');
```

Check your creation with describe and select:

```
describe payments;
```

Create the other streams:

```
create stream aml_status(PAYMENT_ID INTEGER, BANK VARCHAR, STATUS VARCHAR) with(kafka_topic='AML_Status', value_format='json');
```

```
create stream funds_status (PAYMENT_ID INTEGER, REASON_CODE VARCHAR, STATUS VARCHAR) with(kafka_topic='Funds_Status', value_format='json');
```

Verify the created streams with the following command:

```
list streams;
```

Create table:

```
create table customers (
          ID INTEGER PRIMARY KEY,
          FIRST_NAME VARCHAR,
          LAST_NAME VARCHAR,
          EMAIL VARCHAR,
          GENDER VARCHAR,
          STATUS360 VARCHAR)
          WITH(kafka_topic='CUSTOMERS_FLAT', value_format='JSON');
```

```
list tables;
```

## 3. Load Data to Streams and Table

In the ksqlDB Editor use `INSERT INTO` to add some mock data to your streams.

Customer Data:

```
INSERT INTO customers (id, FIRST_NAME, LAST_NAME, EMAIL, GENDER, STATUS360) values (10,'Brena','Tollerton','btollerton9@furl.net','Female','silver');
INSERT INTO customers (id, FIRST_NAME, LAST_NAME, EMAIL, GENDER, STATUS360) values (9,'Even','Tinham','etinham8@facebook.com','Male','silver');
INSERT INTO customers (id, FIRST_NAME, LAST_NAME, EMAIL, GENDER, STATUS360) values (8,'Patti','Rosten','prosten7@ihg.com','Female','silver');
INSERT INTO customers (id, FIRST_NAME, LAST_NAME, EMAIL, GENDER, STATUS360) values (7,'Fay','Huc','fhuc6@quantcast.com','Female','bronze');
INSERT INTO customers (id, FIRST_NAME, LAST_NAME, EMAIL, GENDER, STATUS360) values (6,'Robinet','Leheude','rleheude5@reddit.com','Female','platinum');
INSERT INTO customers (id, FIRST_NAME, LAST_NAME, EMAIL, GENDER, STATUS360) values (5,'Hansiain','Coda','hcoda4@senate.gov','Male','platinum');
INSERT INTO customers (id, FIRST_NAME, LAST_NAME, EMAIL, GENDER, STATUS360) values (4,'Hashim','Rumke','hrumke3@sohu.com','Male','platinum');
INSERT INTO customers (id, FIRST_NAME, LAST_NAME, EMAIL, GENDER, STATUS360) values (3,'Mariejeanne','Cocci','mcocci2@techcrunch.com','Female','bronze');
INSERT INTO customers (id, FIRST_NAME, LAST_NAME, EMAIL, GENDER, STATUS360) values (2,'Ruthie','Brockherst','rbrockherst1@ow.ly','Female','platinum');
INSERT INTO customers (id, FIRST_NAME, LAST_NAME, EMAIL, GENDER, STATUS360) values (1,'Rica','Blaisdell','rblaisdell0@rambler.ru','Female','bronze');
```

Payment Instruction Data

```
insert into payments (PAYMENT_ID, CUSTID, ACCOUNTID, AMOUNT, BANK) values (1,1,1234000,100,'DBS');
insert into payments (PAYMENT_ID, CUSTID, ACCOUNTID, AMOUNT, BANK) values (3,2,1234100,200,'Barclays Bank');
insert into payments (PAYMENT_ID, CUSTID, ACCOUNTID, AMOUNT, BANK) values (5,3,1234200,300,'BNP Paribas');
insert into payments (PAYMENT_ID, CUSTID, ACCOUNTID, AMOUNT, BANK) values (7,4,1234300,400,'Wells Fargo');
insert into payments (PAYMENT_ID, CUSTID, ACCOUNTID, AMOUNT, BANK) values (9,5,1234400,500,'DBS');
insert into payments (PAYMENT_ID, CUSTID, ACCOUNTID, AMOUNT, BANK) values (11,6,1234500,600,'Royal Bank of Canada');
insert into payments (PAYMENT_ID, CUSTID, ACCOUNTID, AMOUNT, BANK) values (13,7,1234600,700,'DBS');
insert into payments (PAYMENT_ID, CUSTID, ACCOUNTID, AMOUNT, BANK) values (15,8,1234700,800,'DBS');
insert into payments (PAYMENT_ID, CUSTID, ACCOUNTID, AMOUNT, BANK) values (17,9,1234800,900,'DBS');
insert into payments (PAYMENT_ID, CUSTID, ACCOUNTID, AMOUNT, BANK) values (19,10,1234900,1000,'United Overseas Bank');
```

ALM Status Data

```
insert into aml_status(PAYMENT_ID,BANK,STATUS) values (1,'Wells Fargo','OK');
insert into aml_status(PAYMENT_ID,BANK,STATUS) values (3,'Commonwealth Bank of Australia','OK');
insert into aml_status(PAYMENT_ID,BANK,STATUS) values (5,'Deutsche Bank','OK');
insert into aml_status(PAYMENT_ID,BANK,STATUS) values (7,'DBS','OK');
insert into aml_status(PAYMENT_ID,BANK,STATUS) values (9,'United Overseas Bank','OK');
insert into aml_status(PAYMENT_ID,BANK,STATUS) values (11,'Citi','OK');
insert into aml_status(PAYMENT_ID,BANK,STATUS) values (13,'Commonwealth Bank of Australia','OK');
insert into aml_status(PAYMENT_ID,BANK,STATUS) values (15,'Barclays Bank','OK');
insert into aml_status(PAYMENT_ID,BANK,STATUS) values (17,'United Overseas Bank','OK');
insert into aml_status(PAYMENT_ID,BANK,STATUS) values (19,'Royal Bank of Canada','OK');
```

Funds Status Data

```
insert into funds_status(PAYMENT_ID,REASON_CODE,STATUS) values (1,'00','OK');
insert into funds_status(PAYMENT_ID,REASON_CODE,STATUS) values (3,'99','OK');
insert into funds_status(PAYMENT_ID,REASON_CODE,STATUS) values (5,'30','OK');
insert into funds_status(PAYMENT_ID,REASON_CODE,STATUS) values (7,'00','OK');
insert into funds_status(PAYMENT_ID,REASON_CODE,STATUS) values (9,'00','OK');
insert into funds_status(PAYMENT_ID,REASON_CODE,STATUS) values (11,'00','NOT OK');
insert into funds_status(PAYMENT_ID,REASON_CODE,STATUS) values (13,'30','OK');
insert into funds_status(PAYMENT_ID,REASON_CODE,STATUS) values (15,'00','OK');
insert into funds_status(PAYMENT_ID,REASON_CODE,STATUS) values (17,'10','OK');
insert into funds_status(PAYMENT_ID,REASON_CODE,STATUS) values (19,'10','OK');
```

## 4. Verify the entered data

Please set the following query properties to query your streams and table:

- `auto.offset.reset` to 'Earliest'
- `commit.interval.ms` to '1000'

![Needed Properties](img/payments_properties.png)

```bash
select * from customers emit changes;
```

```bash
select * from customers where id=1 emit changes;
```

```bash
select * from payments emit changes;
```

```bash
select * from aml_status emit changes;
```

```bash
select * from funds_status emit changes;
```

Create a table that allows both push and pull queries:

```bash
CREATE TABLE QUERYABLE_CUSTOMERS AS SELECT * FROM CUSTOMERS;
```

- Push query:

```bash
select * from QUERYABLE_CUSTOMERS emit changes;
```

- Pull query:

```bash
select * from QUERYABLE_CUSTOMERS where id = 1;
```

## 5. Enrich Payments stream with Customers table

```
create stream enriched_payments as select
p.payment_id as payment_id,
p.custid as customer_id,
p.accountid,
p.amount,
p.bank,
c.first_name,
c.last_name,
c.email,
c.status360
from payments p left join customers c on p.custid = c.id;
```

```
describe enriched_payments;
```

```bash
select * from enriched_payments emit changes;
```

Now check in Confluent Cloud UI:

- check in ksqlDB Cluster - the persistent queries. Take a look in the details (SINK: and SOURCE:) of the running queries.
- check performance tab if _Query Saturation_ and _Disk Usage_ graphs are displaying activity.
- check in ksqlDB cluster the flow to follow the expansion easier. If it is not visible refresh the webpage in browser.

![Persistent Queries](img/payments_pq.png)

## 6. Merge the status streams

```
CREATE STREAM payment_statuses AS SELECT payment_id, status, 'AML' as source_system FROM aml_status;
```

```
INSERT INTO payment_statuses SELECT payment_id, status, 'FUNDS' as source_system FROM funds_status;
```

```
describe payment_statuses;
```

```bash
select * from payment_statuses emit changes;
```

This is the standard way to merge streams into one. Please also check this sample from our [devloper page](https://developer.confluent.io/tutorials/merge-many-streams-into-one-stream/ksql.html).

Combine payment and status events in 1 hour window. Why we need a timing window for stream-stream join? Please follow the documentation [here](https://docs.ksqldb.io/en/latest/developer-guide/joins/join-streams-and-tables/#join-capabilities) to answer this question.

```
CREATE STREAM payments_with_status AS SELECT
  ep.payment_id as payment_id,
  ep.accountid,
  ep.amount,
  ep.bank,
  ep.first_name,
  ep.last_name,
  ep.email,
  ep.status360,
  ps.status,
  ps.source_system
  FROM enriched_payments ep LEFT JOIN payment_statuses ps WITHIN 1 HOURS GRACE PERIOD 15 MINUTES ON ep.payment_id = ps.payment_id ;
```

```
describe payments_with_status;
```

```bash
select * from payments_with_status emit changes;
```

## 7. Aggregate data to the final table

Aggregate into consolidated records:

```
CREATE TABLE payments_final AS SELECT
  payment_id,
  histogram(status) as status_counts,
  collect_list('{ "system" : "' + source_system + '", "status" : "' + STATUS + '"}') as service_status_list
  from payments_with_status
  where status is not null
  group by payment_id;
```

```
describe PAYMENTS_FINAL ;
```

```bash
select * from payments_final emit changes;
```

![Payments Final Table](img/payments_final_result.png)

Pull queries, check value for a specific payment (snapshot lookup). Pull Query is a Preview feature.

```
select * from payments_final where payment_id=1;
```

## 8. Query by REST Call (Optional activity)

Get the REST Endpoint from the Settings menu and execute query with your credentials copies from properties File

![ksqlDB App Settings](img/payments_settings.png)

Test REST API access

```
curl -u KEY:SECRET https://yourserver.gcp.confluent.cloud:443/info
```

List streams via curl

```
curl -X "POST" "https://yourserver.europe-west1.gcp.confluent.cloud:443/ksql" \
     -u KEY:SECRET \
     -H "Content-Type: application/vnd.ksql.v1+json; charset=utf-8" \
     -d $'{"ksql": "LIST STREAMS;","streamsProperties": {}}' | jq
```

Try Select query via REST API

```
curl -X "POST" "https://yourserver.europe-west1.gcp.confluent.cloud:443/query-stream" \
     -u KEY:SECRET \
     -H "Content-Type: application/vnd.ksql.v1+json; charset=utf-8" \
     -d $'{"sql": "select * from payments_final where payment_id=1;","streamsProperties": {}}' | jq
```

Final table with payment statuses
![Financial Services Final Result](img/payments_final_status.png)

END of Payment Status Check Lab.

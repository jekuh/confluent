# Internet of Things Use Case: Temperature Alerting System (Confluent Cloud)

We are going to build data pipeline which should look like this:
![ Temperature Alerting System Flow](img_alerting_system_program/datapipeline.png)

## 1. Setup Confluent Cloud KSQLDB Server

- Login to Confluent Cloud.
- Select environment "ksqldb-workshop"
- Create new cluster or select an existing one.
- From the left panel select "ksqlDB" to display all apps.
- Select your ksqlDB cluster to display the ksqlDB Editor.

![Start Screen](img_temperature_alerting_system/ksqlDB_Start.png)

## 2. Test Script

[1a] Create Stream(S1)

```

CREATE STREAM S1 (
`MessageHeader` STRUCT<`MessageName` VARCHAR, `TimeStamp` VARCHAR>,
`ProcessData` STRUCT<`ip0` VARCHAR, `date` STRING, `last step row` INTEGER, `total time` DOUBLE,
`tightening steps` ARRAY<STRUCT<`row` VARCHAR, `column` VARCHAR, `name` VARCHAR,
`graph` STRUCT<`angle values` ARRAY<DOUBLE>, `torque values` ARRAY<DOUBLE>,`gradient values` ARRAY<DOUBLE>, `time values` ARRAY<DOUBLE>
)
WITH (KAFKA_TOPIC='ae-q-mfg.webscada-event.rexrodt-sen-wujp-vcu-raw', PARTITION=1, VALUE_FORMAT='JSON');

```

[1a] Create unique ID

```

CREATE OR REPLACE STREAM S2 WITH (KAFKA_TOPIC='t2',VALUE_FORMAT='JSON', KEY_FORMAT='KAFKA', PARTITIONS='2' ) as
select UUID() as PROCESS_EVENT_UID, \*
from S1 emit changes;

```

[2] explode process steps

```

CREATE OR REPLACE STREAM S3 WITH (KAFKA_TOPIC='t3',VALUE_FORMAT='JSON', KEY_FORMAT='KAFKA', PARTITIONS='2' ) as
select UUID() as PROCESS_EVENT_UID, `ProcessData`->`date` as PROCESS_DATE, EXPLODE(`ProcessData`->`tightening steps`) as PROCESS_STEP
from S2 emit changes;

```

[3] simple transformations + synthetic index

```

CREATE OR REPLACE STREAM S4 WITH (KAFKA_TOPIC='t4',VALUE_FORMAT='JSON', KEY_FORMAT='KAFKA', PARTITIONS='2' ) as
select PROCESS_EVENT_UID, PROCESS_DATE, STRINGTOTIMESTAMP(PROCESS_DATE,'yyyy-MM-dd HH:mm:ss') AS PROCESS_TIMESTAMP, (PROCESS_STEP->`row`+PROCESS_STEP->`column`) as STEP_ID, PROCESS_STEP->`name` as STEP_NAME,
PROCESS_STEP->`graph`->`angle values`,
PROCESS_STEP->`graph`->`torque values`,
PROCESS_STEP->`graph`->`gradient values`,
PROCESS_STEP->`graph`->`time values`,
GENERATE_SERIES(0,ARRAY_LENGTH(PROCESS_STEP->`graph`->`angle values`)) AS PROCESS_STEP_SERIE_INDEX
from S3 emit changes;

```

[4] explode time series

```

CREATE OR REPLACE STREAM S5 WITH (KAFKA_TOPIC='t5',VALUE_FORMAT='JSON', KEY_FORMAT='KAFKA', PARTITIONS='2' ) as
select PROCESS_EVENT_UID, PROCESS_DATE, PROCESS_TIMESTAMP, STEP_ID, STEP_NAME,
EXPLODE(`angle values`) as SERIE_VALUE_ANGLE,
EXPLODE(`torque values`) as SERIE_VALUE_TORQUE,
EXPLODE(`gradient values`) as SERIE_VALUE_GRADIENT,
EXPLODE(`time values`) as SERIE_VALUE_TIME,
EXPLODE(PROCESS_STEP_SERIE_INDEX) AS SERIE_INDEX
from S4 emit changes;

```

[5] create timeseries timestamp

```

CREATE OR REPLACE STREAM S6 WITH (KAFKA_TOPIC='t6',VALUE_FORMAT='JSON', KEY_FORMAT='KAFKA', PARTITIONS='2' ) as
select PROCESS_EVENT_UID, PROCESS_DATE, PROCESS_TIMESTAMP, STEP_ID, STEP_NAME,
SERIE_VALUE_ANGLE, SERIE_VALUE_TORQUE, SERIE_VALUE_GRADIENT, SERIE_VALUE_TIME,
CAST(PROCESS_TIMESTAMP+1000.*SERIE_VALUE_TIME AS BIGINT) AS SERIE_TIMESTAMP,
TIMESTAMPTOSTRING(CAST(PROCESS_TIMESTAMP+1000.*SERIE_VALUE_TIME AS BIGINT),'yyyy-MM-dd HH:mm:ss:SSS','UTC') AS SERIE_TIMESTAMP_UTC,
SERIE_INDEX
from S5 emit changes;

```

The final topic 't6' holds data like
{
"PROCESS_EVENT_UID": "c1b11a22-0ef4-4577-869d-043203a9205e",
"PROCESS_DATE": "2021-04-27 16:16:42",
"PROCESS_TIMESTAMP": 1619533002000,
"STEP_ID": "5A",
"STEP_NAME": "Gradient suchen",
"SERIE_VALUE_ANGLE": 2130.75,
"SERIE_VALUE_TORQUE": 0.032,
"SERIE_VALUE_GRADIENT": 0.0001,
"SERIE_VALUE_TIME": 1.986,
"SERIE_TIMESTAMP": 1619533003986,
"SERIE_TIMESTAMP_UTC": "2021-04-27 14:16:43:986",
"SERIE_INDEX": 64
}

END Bosch PoC Lab.

[Back](../README.md#Agenda) to Agenda.

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

[1] define stream for data of interest
CREATE STREAM WELL_ESP_SENSOR_READINGS_RAW (
`MessageHeader` STRUCT<`MessageName` VARCHAR, `TimeStamp` VARCHAR>, \
`ProcessData` STRUCT<`reservoir_code` VARCHAR, `equipment_type` VARCHAR, `date` STRING, \
`wells` ARRAY<STRUCT<`well_name` VARCHAR, `equipment_nr` VARCHAR, `equipment_installation_depth` INT, \
`sensor_readings` STRUCT<`bottomhole_pressure` ARRAY<INT>, `bottomhole_temp` ARRAY<DOUBLE>,`motor_current` ARRAY<DOUBLE>, `motor_speed` ARRAY<DOUBLE>, `time_values` ARRAY<DOUBLE>>>>>
) WITH (KAFKA_TOPIC='well.equipment.esp.sensor.readings-raw', VALUE_FORMAT='JSON');

[1a] create unique ID

```
CREATE OR REPLACE STREAM WELL_ESP_SENSOR_READINGS_KEYED WITH (KAFKA_TOPIC='well.equipment.esp.sensor.readings-keyed', VALUE_FORMAT='JSON', KEY_FORMAT='KAFKA', PARTITIONS='2' ) as \
select UUID() as PROCESS_EVENT_UID, * \
from WELL_ESP_SENSOR_READINGS_RAW emit changes;
```

[2] explode process steps

```
CREATE OR REPLACE STREAM WELL_ESP_SENSOR_READINGS_WELL_LEVEL WITH (KAFKA_TOPIC='well.equipment.esp.sensor.readings-per-well',VALUE_FORMAT='JSON', KEY_FORMAT='KAFKA', PARTITIONS='2' ) as \
select UUID() as PROCESS_EVENT_UID, `ProcessData`->`date` as PROCESS_DATE, EXPLODE(`ProcessData`->`wells`) as WELL \
from WELL_ESP_SENSOR_READINGS_KEYED emit changes;
```

[3] simple transformations + synthetic index

```
CREATE OR REPLACE STREAM WELL_ESP_SENSOR_READINGS_WELL_TRANSFORMED WITH (KAFKA_TOPIC='well.equipment.esp.sensor.readings-well-transformed',VALUE_FORMAT='JSON', KEY_FORMAT='KAFKA', PARTITIONS='2' ) as \
select PROCESS_EVENT_UID, PROCESS_DATE, STRINGTOTIMESTAMP(PROCESS_DATE,'yyyy-MM-dd HH:mm:ss') AS PROCESS_TIMESTAMP,
wELL->`well_name` as WELL_NAME, wELL->`euipment_nr` as EQUIPMENT_ID, \
WELL->`sensor_readings`->`bottomhole_pressure`, \
WELL->`sensor_readings`->`bottomhole_temp`, \
WELL->`sensor_readings`->`motor_current`, \
WELL->`sensor_readings`->`motor_speed`, \
WELL->`sensor_readings`->`time_values`, \
GENERATE_SERIES(0,ARRAY_LENGTH(WELL->`sensor_readings`->`bottomhole_pressure`)) AS SENSOR_READING_SERIE_INDEX \
from WELL_ESP_SENSOR_READINGS_WELL_LEVEL emit changes;
```

[4] explode time series

```
CREATE OR REPLACE STREAM WELL_ESP_SENSOR_READINGS_SENSOR_LEVEL WITH (KAFKA_TOPIC='well.equipment.esp.sensor.readings-sensor-level',VALUE_FORMAT='JSON', KEY_FORMAT='KAFKA', PARTITIONS='2' ) as \
select PROCESS_EVENT_UID, PROCESS_DATE, PROCESS_TIMESTAMP, WELL_NAME, EQUIPMENT_ID \
EXPLODE(`bottomhole_pressure`) as MEASUREMENT_BOTTOMHOLE_PRESSURE, \
EXPLODE(`bottomhole_temp`) as MEASUREMENT_BOTTOMHOLE_TEMP, \
EXPLODE(`motor_current`) as MEASUREMENT_MOTOR_CURRENT, \
EXPLODE(`motor_speed`) as MEASUREMENT_MOTOR_SPEED, \
EXPLODE(`time_values`) as SERIE_VALUE_TIME, \
EXPLODE(SENSOR_READING_SERIE_INDEX) AS MEASUREMENT_INDEX \
from WELL_ESP_SENSOR_READINGS_WELL_TRANSFORMED emit changes;
```

[5] create timeseries timestamp

```
CREATE OR REPLACE STREAM WELL_ESP_SENSOR_READINGS_SENSOR_MEASUREMENT WITH (KAFKA_TOPIC='well.equipment.esp.sensor.readings-measurement-timestamp',VALUE_FORMAT='JSON', KEY_FORMAT='KAFKA', PARTITIONS='2' ) as \
select PROCESS_EVENT_UID, PROCESS_DATE, PROCESS_TIMESTAMP, WELL_NAME, EQUIPMENT_ID, \
(EQUIPMENT_ID+"-"+CAST(MEASUREMENT_INDEX AS STRING)) as MEASUREMENT_ID, \
MEASUREMENT_BOTTOMHOLE_PRESSURE, MEASUREMENT_BOTTOMHOLE_TEMP, MEASUREMENT_MOTOR_CURRENT, MEASUREMENT_MOTOR_SPEED, SERIE_VALUE_TIME, \
CAST(PROCESS_TIMESTAMP+1000.*SERIE_VALUE_TIME AS BIGINT) AS MEASUREMENT_TIMESTAMP, \
TIMESTAMPTOSTRING(CAST(PROCESS_TIMESTAMP+1000.*SERIE_VALUE_TIME AS BIGINT),'yyyy-MM-dd HH:mm:ss:SSS','UTC') AS MEASUREMENT_TIMESTAMP_UTC, \
MEASUREMENT_INDEX \
from WELL_ESP_SENSOR_READINGS_SENSOR_LEVEL_emit changes;
```

The final topic 'well.equipment.esp.sensor.readings-measurement-timestamp' holds data like

```
{ "PROCESS_EVENT_UID": "c1b11a22-0ef4-4577-869d-043203a9205e", "PROCESS_DATE": "2022-09-18 16:27:07", "PROCESS_TIMESTAMP": 1619533002000, in I'll"WELL_NAME": "FGHN-21", "EQUIPMENT_ID": "10968", "MEASUREMENT_ID":"10968-1", "MEASUREMENT_BOTTOMHOLE_PRESSURE": 920, "MEASUREMENT_BOTTOMHOLE_TEMP": 265.0, "MEASUREMENT_MOTOR_CURRENT": 5.48, "MEASUREMENT_MOTOR_SPEED": 31, "MEASUREMENT_TIMESTAMP": 1619533002002, "MEASUREMENT_TIMESTAMP_UTC": "2022-09-18 16:27:07:002", "MEASUREMENT_INDEX": 1}

```

END Plant Machine Data Lab.

[Back](../README.md#Agenda) to Agenda.

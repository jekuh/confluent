# Schema Registry - Lab

## 1. What is SR and how to set up

### Naming Strategy : Topic vs Record Example.


###  What is Stream Governace: - Essential vs Advance Package

###  [Stream Governace API :](https://psrc-ldg31.us-east-2.aws.confluent.cloud)

1. Log in to your cluster using the confluent login command with the cluster URL specified.
confluent login


2. Set the Confluent Cloud environment and cluster
confluent environment use env-nzv1k


confluent kafka cluster use lkc-o3ddro


3. If you don't have a Kafka API key, generate one and set it to use (replacing <API_KEY> with generated key) from the CLI
confluent api-key create --resource lkc-o3ddro


confluent api-key use <API_KEY> --resource lkc-o3ddro


4. Produce a message using your schema (replace <PATH_TO_SCHEMA_FILE> with your local path to the schema file)
confluent kafka topic produce users --value-format protobuf --schema <PATH_TO_SCHEMA_FILE>


Enter the Schema Registry API key and secret created previously. Then, produce a message formatted accordingly to the schema created for the topic "users".
{"orderId":2122453, "orderTime": 1607641868, "orderAddress":"899 W Evelyn Ave, Mountain View, CA 94041"}


5. Consume the message you just produced by retrieving the schema from the Schema Registry (ctrl+C to stop the produce command from previous step or open a new terminal)
confluent kafka topic consume users --value-format protobuf --from-beginning
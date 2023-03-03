#include <iostream>
#include <cstring>
#include <MQTTClient.h>

#define ADDRESS     "broker.hivemq.com:1883"
#define CLIENTID    "idYfkajsF"
#define TOPIC       "uea/danilo/valor"
#define QOS         1
#define TIMEOUT     10000L

int main(int argc, char* argv[]) {
    MQTTClient client;
    MQTTClient_connectOptions conn_opts = MQTTClient_connectOptions_initializer;
    MQTTClient_deliveryToken token;
    int rc;

    MQTTClient_create(&client, ADDRESS, CLIENTID, MQTTCLIENT_PERSISTENCE_NONE, NULL);

    conn_opts.keepAliveInterval = 20;
    conn_opts.cleansession = 1;

    if ((rc = MQTTClient_connect(client, &conn_opts)) != MQTTCLIENT_SUCCESS) {
        std::cout << "Failed to connect, return code " << rc << std::endl;
        return 1;
    }
    std::cout << "Connected to server '" << ADDRESS << "'" << std::endl;

    char* payload = (char*)"Hello, world!";
    int payloadlen = strlen(payload);

    MQTTClient_message pubmsg = MQTTClient_message_initializer;
    pubmsg.payload = payload;
    pubmsg.payloadlen = payloadlen;
    pubmsg.qos = QOS;
    pubmsg.retained = 0;
    MQTTClient_publishMessage(client, TOPIC, &pubmsg, &token);
    std::cout << "Waiting for publication of message with token value " << token << std::endl;
    MQTTClient_waitForCompletion(client, token, TIMEOUT);
    std::cout << "Message with token value " << token << " delivered" << std::endl;

    MQTTClient_disconnect(client, 10000);
    MQTTClient_destroy(&client);
    return rc;
}

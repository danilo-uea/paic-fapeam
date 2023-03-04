#include <iostream>
#include <cstring>
#include <MQTTClient.h>
#include <unistd.h>

#define ADDRESS     "broker.hivemq.com:1883"
#define CLIENTID    "idYfkajsF"
#define TOPIC       "uea/danilo/valor"
#define QOS         1
#define TIMEOUT     10000L

// Definindo a estrutura TDadosLora
typedef struct {
    int contador;
    int hora;
    int minuto;
    int segundo;
    int dia;
    int mes;
    int ano;
    float f_latitude;
    float f_longitude;
    float temperatura;
    float umidade;
} TDadosLora;

int main(int argc, char* argv[]) {
    MQTTClient client;
    MQTTClient_connectOptions conn_opts = MQTTClient_connectOptions_initializer;
    MQTTClient_message pubmsg = MQTTClient_message_initializer;
    MQTTClient_deliveryToken token;
    int rc;

    MQTTClient_create(&client, ADDRESS, CLIENTID, MQTTCLIENT_PERSISTENCE_NONE, NULL);

    conn_opts.keepAliveInterval = 20;
    conn_opts.cleansession = 1;

    if ((rc = MQTTClient_connect(client, &conn_opts)) != MQTTCLIENT_SUCCESS) {
        std::cout << "Falha ao conectar, código de retorno: " << rc << std::endl;
        return 1;
    }
    std::cout << "Conectado ao servidor '" << ADDRESS << "'" << std::endl;

    TDadosLora dados;
    
    int cont = 0;
    while (cont < 6) {
        std::cout << cont << " ";
        // Criando a estrutura TDadosLora e convertendo para um buffer de bytes
        dados = {cont, 15, 30, 0, 31, 4, 2023, -3.046401f, -60.254929f, 32.4f, 71.1f};
        const char* payload = reinterpret_cast<const char*>(&dados);
        
        // Criando a mensagem a ser publicada
        pubmsg.payload = const_cast<char*>(payload);
        pubmsg.payloadlen = sizeof(dados);
        pubmsg.qos = QOS;
        pubmsg.retained = 0;

        // Publicando a mensagem
        if ((rc = MQTTClient_publishMessage(client, TOPIC, &pubmsg, &token)) != MQTTCLIENT_SUCCESS) {
            std::cerr << "Falha ao publicar a mensagem, código de retorno: " << rc << std::endl;
            return 1;
        }
        
        // Esperando a entrega da mensagem
        MQTTClient_waitForCompletion(client, token, TIMEOUT);
        std::cout << "mensagem entregue!" << std::endl;

        cont++;
        sleep(1);
    }

    MQTTClient_disconnect(client, 10000);
    MQTTClient_destroy(&client);
    return rc;
}

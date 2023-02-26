import random
import time

from paho.mqtt import client as mqtt_client


broker = 'broker.hivemq.com'
port = 1883
topic = "uea/danilo/valor"
# generate client ID with pub prefix randomly
client_id = f'python-mqtt-{random.randint(0, 1000)}'
# username = 'emqx'
# password = 'public'


def connect_mqtt():
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("MQTT Broker foi conectado!")
        else:
            print("Falha na conexão, código retornado: %d\n", rc)

    client = mqtt_client.Client(client_id)
    # client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.connect(broker, port)

    return client


def publish(client):
    msg_count = 0
    while True:
        time.sleep(2)
        msg = f"Valor: {msg_count}"
        result = client.publish(topic, msg)
        # result: [0, 1]
        status = result[0]
        if status == 0:
            print(f"Enviando: `{msg}`")
        else:
            print(f"Falha no envio da mensagem para o tópico: {topic}")
        msg_count += 1


def run():
    client = connect_mqtt()
    client.loop_start()
    publish(client)


if __name__ == '__main__':
    run()

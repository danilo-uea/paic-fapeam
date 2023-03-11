import random
import struct
from paho.mqtt import client as mqtt_client

broker = 'broker.hivemq.com'
port = 1883
topic = "uea/danilo/valor"
# generate client ID with pub prefix randomly
client_id = f'python-mqtt-{random.randint(0, 100)}'
# username = 'emqx'
# password = 'public'

def connect_mqtt() -> mqtt_client:
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

def subscribe(client: mqtt_client):
    def on_message(client, userdata, message):
        payload = message.payload
        dados = struct.unpack('iiiiiiiffff', payload)
        print(f"Contador: {dados[0]}")
        print(f"Hora: {dados[1]}, Minuto: {dados[2]}, Segundo: {dados[3]}")
        print(f"Dia: {dados[4]}, Mês: {dados[5]}, Ano: {dados[6]}")
        print(f"Latitude: {round(dados[7], 6)}, Longitude: {round(dados[8], 6)}")
        print(f"Temperatura: {round(dados[9], 1)}, Umidade: {round(dados[10], 1)}\n")

    client.subscribe(topic)
    client.on_message = on_message

def run():
    client = connect_mqtt()
    subscribe(client)
    client.loop_forever()

if __name__ == '__main__':
    run()
import random
import time
import struct
from paho.mqtt import client as mqtt_client

broker = 'broker.hivemq.com'
port = 1883
topic = "uea/danilo/valor"
client_id = f'python-mqtt-{random.randint(0, 1000)}' # generate client ID with pub prefix randomly
# username = 'seu_username'
# password = 'sua_senha'

# estrutura para os dados
class TDadosLora:
    def __init__(self, contador, hora, minuto, segundo, dia, mes, ano, f_latitude, f_longitude, temperatura, umidade):        
        self.contador = contador
        self.hora = hora
        self.minuto = minuto
        self.segundo = segundo
        self.dia = dia
        self.mes = mes
        self.ano = ano
        self.f_latitude = f_latitude
        self.f_longitude = f_longitude
        self.temperatura = temperatura
        self.umidade = umidade

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
    dados = TDadosLora(0, 15, 30, 0, 31, 4, 2023, -3.046401, -60.254929, 32.4, 71.1)
    while True:
        time.sleep(2)
        payload = struct.pack(
            'iiiiiiiffff',
            dados.contador,
            dados.hora,
            dados.minuto,
            dados.segundo,
            dados.dia,
            dados.mes,
            dados.ano,
            dados.f_latitude,
            dados.f_longitude,
            dados.temperatura, 
            dados.umidade,
        )
        result = client.publish(topic, payload)
        status = result[0]
        if status == 0:
            print(f"Publicando: {dados.contador}")
        else:
            print(f"Falha no envio da mensagem para o tópico: {topic}")
        
        dados.contador += 1

def run():
    client = connect_mqtt()
    client.loop_start()
    publish(client)

if __name__ == '__main__':
    run()

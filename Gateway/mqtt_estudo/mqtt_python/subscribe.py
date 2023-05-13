import random
import struct
import psycopg2
from paho.mqtt import client as mqtt_client

broker = 'broker.hivemq.com'
port = 1883
topic = "uea/danilo/valor"
client_id = f'python-mqtt-{random.randint(0, 100)}'
qos_value = 0
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

def subscribe(client: mqtt_client, conn, cur):
    def on_message(client, userdata, message):
        payload = message.payload
        dados = struct.unpack('iiiiiiiffffii', payload)
        print(f"Contador: {dados[0]}")
        print(f"Hora: {dados[1]}, Minuto: {dados[2]}, Segundo: {dados[3]}")
        print(f"Dia: {dados[4]}, Mês: {dados[5]}, Ano: {dados[6]}")
        print(f"Latitude: {round(dados[7], 6)}, Longitude: {round(dados[8], 6)}")
        print(f"Temperatura: {round(dados[9], 1)}, Umidade: {round(dados[10], 1)}")
        print(f"Tamanho: {dados[11]}, RSSI: {dados[12]}")
        
        try:
            cur.execute(f"""insert into mensagem (valores) values 
            ('{dados[0]};{dados[1]};{dados[2]};{dados[3]};{dados[4]};{dados[5]};{dados[6]};{dados[7]};{dados[8]};{dados[9]};{dados[10]};{dados[11]};{dados[12]}');
            """)
            conn.commit()
            print("Registro inserido\n")
        except Exception as e:
            print(f"Falha ao inserir registro: {e}\n")

    client.subscribe(topic, qos=qos_value)
    client.on_message = on_message

def on_disconnect(client, userdata, rc):
    print("Conexão com o broker perdida. Tentando reconectar...")
    client.reconnect()

def run():
    try:
        conn = psycopg2.connect(
            host='localhost',
            database='lora',
            user='postgres',
            password='postgres'
        )
        print("Conectado com o db")
    except:
        print("Não foi possível conectar ao db")

    cur = conn.cursor()

    client = connect_mqtt()
    subscribe(client, conn, cur)
    client.loop_forever()
    client.on_disconnect = on_disconnect
    conn.close()

if __name__ == '__main__':
    run()

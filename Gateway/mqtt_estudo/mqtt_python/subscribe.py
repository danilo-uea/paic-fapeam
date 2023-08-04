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
        d_0 = dados[0]
        d_1 = dados[1]
        d_2 = dados[2]
        d_3 = dados[3]
        d_4 = dados[4]
        d_5 = dados[5]
        d_6 = dados[6]
        d_7 = round(dados[7], 6)
        d_8 = round(dados[8], 6)
        d_9 = round(dados[9], 1)
        d_10 = round(dados[10], 1)
        d_11 = dados[11]
        d_12 = dados[12]
        print(f"Contador: {d_0}")
        print(f"Hora: {d_1}, Minuto: {d_2}, Segundo: {d_3}")
        print(f"Dia: {d_4}, Mês: {d_5}, Ano: {d_6}")
        print(f"Latitude: {d_7}, Longitude: {d_8}")
        print(f"Temperatura: {d_9}, Umidade: {d_10}")
        print(f"Tamanho: {d_11}, RSSI: {d_12}")
        
        try:
            cur.execute(f"""insert into mensagem (valores) values 
            ('{d_0};{d_1};{d_2};{d_3};{d_4};{d_5};{d_6};{d_7};{d_8};{d_9};{d_10};{d_11};{d_12}');
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

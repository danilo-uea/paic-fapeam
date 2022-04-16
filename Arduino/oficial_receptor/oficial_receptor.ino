/* Bibliotecas para o Display OLED*/
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

/* Bibliotecas para comunicação LoRa */
#include <LoRa.h>
#include <SPI.h>

/* Bibliotecas Bluetooth BLE */
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

/* Pinagem para o Display Oled */
#define OLED_SDA 4
#define OLED_SCL 15
#define OLED_RST 16
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

/* Pinagem para comunicação com radio LoRa */
#define SCK_LORA           5
#define MISO_LORA          19
#define MOSI_LORA          27
#define RESET_PIN_LORA     14
#define SS_PIN_LORA        18
#define HIGH_GAIN_LORA     20 /* dBm */
#define BAND               915E6 /* 915MHz de frequencia */

/* Bluetooth BLE UUID */
#define SERVICE_UUID           "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID_TX "6d68efe5-04b6-4a85-abc4-c2670b7bf7fd"

/* Pinagem para o fator de espalhamento */
int fatorE = 7;     /* Valor do fator de espalhamento */
int fatorE_ant = 7; /* Valor do fator de espalhamento anterior */
int pinoPOT = 13;   /* Potenciômetro do fator de espalhamento */

/* Definicões do Display OLED */
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RST);

/* Bluetooth BLE */
BLECharacteristic *pCharacteristic; /* Característica */
bool deviceConnected = false; /* Status de conexão */

/* Bluetooth BLE Classe*/
class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  };

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
  }
};

/* Estrutura do pacote de dados */
typedef struct __attribute__((__packed__))  
{
  int contador;
  byte hora;
  byte minuto;
  byte segundo;
  byte dia;
  byte mes;
  int ano;
  float f_latitude;
  float f_longitude;
} TDadosLora;

void StartBluetoothBle();
void aguardando_dados_display();
void escreve_medicoes_display(TDadosLora dados_lora, int lora_rssi);
void envia_medicoes_serial(TDadosLora dados_lora, int lora_rssi, int tam_pacote);
bool init_comunicacao_lora(void);

void StartBluetoothBle(){
  /* Criar o BLE Device */
  BLEDevice::init("ESP32");

  /* Criar o BLE Server */
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  /* Criar o BLE Service */
  BLEService *pService = pServer->createService(SERVICE_UUID);

  /* Criar o BLE Characteristic */
  pCharacteristic =pService->createCharacteristic(CHARACTERISTIC_UUID_TX, BLECharacteristic::PROPERTY_NOTIFY);

  /* BLE2902 precisa notificar */
  pCharacteristic->addDescriptor(new BLE2902());

  /* Iniciar o serviço */
  pService->start();

  /* Começar a anunciar */
  pServer->getAdvertising()->start();

  Serial.println("BLE iniciado");
}

void aguardando_dados_display() {
  /* Imprimir mensagem dizendo para esperar a chegada dos dados */
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Aguardando dados...");
  display.setCursor(0, 10);
  display.print("F.E.: ");
  display.println(fatorE);
  display.display();
  
  delay(200);
}

void escreve_medicoes_display(TDadosLora dados_lora, int lora_rssi)
{
  char str_rssi[11];
  char str_flat[11];
  char str_flon[11];

  memset(str_rssi,0,sizeof(str_rssi));
  memset(str_flat,0,sizeof(str_flat));
  memset(str_flon,0,sizeof(str_flon));
  
  sprintf(str_rssi, "%d", lora_rssi);
  sprintf(str_flat, "%.6f", dados_lora.f_latitude);
  sprintf(str_flon, "%.6f", dados_lora.f_longitude);
      
  display.clearDisplay();

  display.setCursor(0, 0);
  display.print("Cont: ");
  display.println(dados_lora.contador);

  display.setCursor(0, 10);
  display.print("F.E.: ");
  display.println(fatorE);
  
  display.setCursor(0, 20);
  display.print("RSSI: ");
  display.println(str_rssi);
  
  display.setCursor(0, 30);
  display.print("Lat: ");
  display.println(str_flat);

  display.setCursor(0, 40);
  display.print("Lon: ");
  display.println(str_flon);

  if (deviceConnected){
    display.setCursor(0, 50);
    display.println("Status Ble: enviando");
  } else {
    display.setCursor(0, 50);
    display.println("Status Ble: sem conexão");
  }
  
  display.display();
}

void envia_medicoes_serial(TDadosLora dados_lora, int lora_rssi, int tam_pacote) 
{
  char mensagem[80];
  
  memset(mensagem,0,sizeof(mensagem));
  sprintf(mensagem,"%d;%d;%d;%d;%02d:%02d:%02d;%d;%d;%d;%.6f;%.6f", 
    dados_lora.contador, 
    dados_lora.dia, 
    dados_lora.mes, 
    dados_lora.ano, 
    dados_lora.hora, 
    dados_lora.minuto, 
    dados_lora.segundo, 
    fatorE, 
    lora_rssi, 
    tam_pacote, 
    dados_lora.f_latitude, 
    dados_lora.f_longitude);
    
  Serial.println(mensagem);

  if (deviceConnected){
    Serial.println("Status Ble:enviando");
    
    /* Definindo o valor para a característica */
    pCharacteristic->setValue(mensagem);

    /* Notificar o cliente conectado */
    pCharacteristic->notify();
  } else {
    Serial.println("Status Ble: sem conexão");
  }
}

bool init_comunicacao_lora(void)
{
    bool status_init = false;
    //Serial.println("[LoRa Receptor] Tentando iniciar comunicacao com o radio LoRa...");
    SPI.begin(SCK_LORA, MISO_LORA, MOSI_LORA, SS_PIN_LORA);
    LoRa.setPins(SS_PIN_LORA, RESET_PIN_LORA, LORA_DEFAULT_DIO0_PIN);
        
    if (!LoRa.begin(BAND)) {
      status_init = false;
      
      //Serial.println("[LoRa Receptor] Comunicacao com o radio LoRa falhou. Nova tentativa em 1 segundo...");        
      
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Radio LoRa");
      display.setCursor(0, 10);
      display.println("Status: Conectando...");
      display.setCursor(0, 20);
      display.println("Tentativas: Cada 1s");
      display.display();

      delay(1000);
    } else {
      status_init = true;
      LoRa.setTxPower(HIGH_GAIN_LORA); /* Configura o ganho do receptor LoRa para 20dBm, o maior ganho possível (visando maior alcance possível) */ 
      LoRa.setSignalBandwidth(125E3);  /* Largura de banda fixa de 125 kHz *//* Suporta valores: 7.8E3, 10.4E3, 15.6E3, 20.8E3, 31.25E3, 41.7E3, 62.5E3, 125E3, 250E3 e 500E3 */
      LoRa.setCodingRate4(5);          /* Taxa de código - Suporta valores entre 5 e 8 */
    }

    return status_init;
}

void setup()
{
  /* Monitor Serial */
  Serial.begin(115200);

  /* Iniciando Bluetooth BLE */
  StartBluetoothBle();

  /* Preparando a inicialização do display OLED */
  pinMode(OLED_RST, OUTPUT);
  digitalWrite(OLED_RST, LOW);
  delay(20);
  digitalWrite(OLED_RST, HIGH);

  /* Inicialização do display OLED */
  Wire.begin(OLED_SDA, OLED_SCL);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3c, false, false)) { /* Endereço 0x3C para 128 x 32 */
    Serial.println(F("Falha no Display OLED"));
    for(;;); /* Loop infinito */
  } else {
    display.clearDisplay();
    display.setTextColor(WHITE);
    display.setTextSize(1);
  }

  while(init_comunicacao_lora() == false); /* Tenta, até obter sucesso na comunicacao com o chip LoRa */

  /* Imprimir mensagem dizendo para esperar a chegada dos dados */
  Serial.println("Aguardando dados...");
  aguardando_dados_display();
  
  /* Pino de entrada do potenciômetro */
  pinMode(pinoPOT, INPUT);
}

void loop()
{ 
  TDadosLora dados_lora;
  char byte_recebido;
  int tam_pacote = 0;
  int lora_rssi = 0;
  char * ptInformaraoRecebida = NULL;
  unsigned long idade;
  bool newData = false;

  /* Fator de Espalhamento */
  fatorE = analogRead(pinoPOT);
  fatorE = map(fatorE, 0, 4095, 7, 12);
  if (fatorE != fatorE_ant) {
    aguardando_dados_display();
  }
  fatorE_ant =  fatorE;

  /* Fator de Espalhamento */
  LoRa.setSpreadingFactor(fatorE);

  tam_pacote = LoRa.parsePacket(); /* Verifica se chegou alguma informação do tamanho esperado */

  if (tam_pacote == sizeof(TDadosLora)) {               
    ptInformaraoRecebida = (char *)&dados_lora; /* Recebe os dados conforme protocolo */
    while (LoRa.available()) 
    {
        byte_recebido = (char)LoRa.read();
        *ptInformaraoRecebida = byte_recebido;
        ptInformaraoRecebida++;
    }
    
    lora_rssi = LoRa.packetRssi(); /* Escreve RSSI de recepção e informação recebida */

    envia_medicoes_serial(dados_lora, lora_rssi, tam_pacote);
    escreve_medicoes_display(dados_lora, lora_rssi);
  }
}

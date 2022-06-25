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

/* Header-file com as funções utilizadas para manipulação da partição NVS */
#include "nvs_flash.h"  

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

/* Chave atribuida ao valor a ser escrito e lido da partição NVS */
#define CHAVE_NVS  "teste"

/* Pinagem para o fator de espalhamento */
uint32_t fatorE = 7;     /* Valor do fator de espalhamento */
int pinoBotao = 0;  /* Valor do pino do botão */

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
void grava_dado_nvs(uint32_t dado);
uint32_t le_dado_nvs(void);

void StartBluetoothBle(){
  /* Criar o BLE Device */
  BLEDevice::init("ESP32");

  uint16_t mtu = 128;
  BLEDevice::setMTU(mtu);

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
  Serial.print("Aguardando dados... F.E: ");
  Serial.println(fatorE);
  
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

  /* Conexão Bluetooth BLE */
  if (deviceConnected){
    display.setCursor(0, 50);
    display.println("Ble enviando");
  } else {
    display.setCursor(0, 50);
    display.println("Ble sem conexao");
  }
  
  display.display();
}

void envia_medicoes_serial(TDadosLora dados_lora, int lora_rssi, int tam_pacote) 
{
  char mensagem[80];
  
  memset(mensagem,0,sizeof(mensagem));
  sprintf(mensagem,"%d;%d-%02d-%02d %02d:%02d:%02d;%d;%d;%d;%.6f;%.6f;0;0", 
    dados_lora.contador, 
    dados_lora.ano,
    dados_lora.mes,
    dados_lora.dia, 
    dados_lora.hora, 
    dados_lora.minuto, 
    dados_lora.segundo, 
    fatorE, 
    lora_rssi, 
    tam_pacote, 
    dados_lora.f_latitude, 
    dados_lora.f_longitude);

  Serial.print(mensagem);

  /* Conexão Bluetooth BLE */
  if (deviceConnected) {
    Serial.println(" (enviando)");
    
    pCharacteristic->setValue(mensagem); /* Definindo o valor para a característica */
    pCharacteristic->notify();           /* Notificar o cliente conectado */
  } else {
    Serial.println(" (sem conexão)");
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
      
      Serial.println("[LoRa Receptor] Comunicacao com o radio LoRa falhou. Nova tentativa em 1 segundo...");        
      
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
      LoRa.setSpreadingFactor(fatorE); /* Fator de Espalhamento */
      LoRa.setTxPower(HIGH_GAIN_LORA); /* Configura o ganho do receptor LoRa para 20dBm, o maior ganho possível (visando maior alcance possível) */ 
      LoRa.setSignalBandwidth(125E3);  /* Largura de banda fixa de 125 kHz *//* Suporta valores: 7.8E3, 10.4E3, 15.6E3, 20.8E3, 31.25E3, 41.7E3, 62.5E3, 125E3, 250E3 e 500E3 */
      LoRa.setCodingRate4(5);          /* Taxa de código - Suporta valores entre 5 e 8 */
      LoRa.setSyncWord(0x55);          /* Palavra de sincronização. Deve ser a mesma no transmissor e receptor */
    }

    return status_init;
}

/* Função: grava na NVS um dado do tipo interio 32-bits sem sinal, na chave definida em CHAVE_NVS */
void grava_dado_nvs(uint32_t dado)
{
    nvs_handle handler_particao_nvs;
    esp_err_t err;
    
    err = nvs_flash_init_partition("nvs");
     
    if (err != ESP_OK)
    {
        Serial.println("[ERRO] Falha ao iniciar partição NVS.");           
        return;
    }
 
    err = nvs_open_from_partition("nvs", "ns_nvs", NVS_READWRITE, &handler_particao_nvs);
    if (err != ESP_OK)
    {
        Serial.println("[ERRO] Falha ao abrir NVS como escrita/leitura"); 
        return;
    }
 
    /* Atualiza valor do horimetro total */
    err = nvs_set_u32(handler_particao_nvs, CHAVE_NVS, dado);
 
    if (err != ESP_OK)
    {
        Serial.println("[ERRO] Erro ao gravar horimetro");                   
        nvs_close(handler_particao_nvs);
        return;
    }
    else
    {
        Serial.println("Dado gravado com sucesso!");     
        nvs_commit(handler_particao_nvs);    
        nvs_close(handler_particao_nvs);      
    }
}

/* Função: le da NVS um dado do tipo interio 32-bits sem sinal, contido na chave definida em CHAVE_NVS */
uint32_t le_dado_nvs(void)
{
    nvs_handle handler_particao_nvs;
    esp_err_t err;
    uint32_t dado_lido;
     
    err = nvs_flash_init_partition("nvs");
     
    if (err != ESP_OK)
    {
        Serial.println("[ERRO] Falha ao iniciar partição NVS.");         
        return 0;
    }
 
    err = nvs_open_from_partition("nvs", "ns_nvs", NVS_READWRITE, &handler_particao_nvs);
    if (err != ESP_OK)
    {
        Serial.println("[ERRO] Falha ao abrir NVS como escrita/leitura");         
        return 0;
    }
 
    /* Faz a leitura do dado associado a chave definida em CHAVE_NVS */
    err = nvs_get_u32(handler_particao_nvs, CHAVE_NVS, &dado_lido);
     
    if (err != ESP_OK)
    {
        Serial.println("[ERRO] Falha ao fazer leitura do dado");         
        return 0;
    }
    else
    {
        Serial.println("Dado lido com sucesso!");  
        nvs_close(handler_particao_nvs);   
        return dado_lido;
    }
}

void setup()
{
  /* Monitor Serial */
  Serial.begin(115200);
  
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

  /* Leitura da memória flash que guarda o valor do Fator de Espalhamento */
  uint32_t dado_lido = le_dado_nvs();

  /* Lendo ou gravando o Fator de Espalhamento na memória flash do Esp32 */
  if (dado_lido < 7 || 12 < dado_lido){
    grava_dado_nvs(fatorE);
  } else {
    fatorE = dado_lido;
  }

  while(init_comunicacao_lora() == false); /* Tenta, até obter sucesso na comunicacao com o chip LoRa */

  /* Iniciando Bluetooth BLE */
  StartBluetoothBle();

  /* Pino de entrada do botão */
  pinMode(pinoBotao, INPUT);

  /* Imprimir mensagem dizendo para esperar a chegada dos dados */
  aguardando_dados_display();
}

unsigned long tempoAntes = millis();
unsigned long tempoRecepcao = millis();
bool canRestart = false;

void loop()
{ 
  TDadosLora dados_lora;
  char byte_recebido;
  int tam_pacote = 0;
  int lora_rssi = 0;
  char * ptInformaraoRecebida = NULL;
  unsigned long idade;
  bool newData = false;

  /* Executar a cada 20 milisegundos devido a uma oscilação do pino ao ligar o dispositivo */
  if (millis() - tempoAntes > 20)
  {
    /* Mudando o fator de espalhamento */
    if (digitalRead(pinoBotao) == LOW) {
      fatorE = fatorE +1;
      
      if (fatorE < 7 || 12 < fatorE) {
        fatorE = 7;
      }
      
      grava_dado_nvs(fatorE);          /* Gravando o Fator de Espalhamento na memória flash do Esp32 */
      LoRa.setSpreadingFactor(fatorE); /* Configurando o Fator de Espalhamento */
      aguardando_dados_display();
    }
    tempoAntes = millis();

    /* Verifica se é necessário reiniciar. Caso passe mais de 10 segundos sem receber dados */
    if(millis() - tempoRecepcao > 20000) {
      if (canRestart) {
        Serial.println("Reiniciando ESP32");
        ESP.restart();
      }
    }
  }
  
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

    /* Tratamento para reiniciar o dispositivo */
    tempoRecepcao = millis();
    canRestart = true;
  }
}

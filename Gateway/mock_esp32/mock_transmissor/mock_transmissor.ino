/*
* Projeto: emissor - comunicação LoRa ponto-a-ponto
* Autor: Pedro Bertoleti
*/
#include <LoRa.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

/* Definicoes para comunicação com radio LoRa */
#define SCK_LORA           5
#define MISO_LORA          19
#define MOSI_LORA          27
#define RESET_PIN_LORA     14
#define SS_PIN_LORA        18

#define HIGH_GAIN_LORA     13  /* dBm */
#define BAND               915E6  /* 915MHz de frequencia */

/* Definicoes do OLED */
#define OLED_SDA_PIN    4
#define OLED_SCL_PIN    15
#define SCREEN_WIDTH    128 
#define SCREEN_HEIGHT   64  
#define OLED_ADDR       0x3C 
#define OLED_RESET      16

/* Offset de linhas no display OLED */
#define OLED_LINE1     0
#define OLED_LINE2     10
#define OLED_LINE3     20
#define OLED_LINE4     30
#define OLED_LINE5     40
#define OLED_LINE6     50

/* Definicoes gerais */
#define DEBUG_SERIAL_BAUDRATE    115200

/* Variaveis e objetos globais */
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

typedef struct __attribute__((__packed__))  
{
  long xxxx;
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

/* Variaveis globais */
long informacao_a_ser_enviada = 0;

/* Local prototypes */
bool init_comunicacao_lora(void);

/* Funcao: inicia comunicação com chip LoRa
 * Parametros: nenhum
 * Retorno: true: comunicacao ok
 *          false: falha na comunicacao
*/
bool init_comunicacao_lora(void)
{
    bool status_init = false;
    Serial.println("[LoRa Sender] Tentando iniciar comunicacao com o radio LoRa...");
    SPI.begin(SCK_LORA, MISO_LORA, MOSI_LORA, SS_PIN_LORA);
    LoRa.setPins(SS_PIN_LORA, RESET_PIN_LORA, LORA_DEFAULT_DIO0_PIN);
    
    if (!LoRa.begin(BAND)) 
    {
        Serial.println("[LoRa Sender] Comunicacao com o radio LoRa falhou. Nova tentativa em 1 segundo...");        
        delay(1000);
        status_init = false;
    }
    else
    {
        /* Configura o ganho do receptor LoRa para 20dBm, o maior ganho possível (visando maior alcance possível) */ 
        LoRa.setTxPower(HIGH_GAIN_LORA); 
        Serial.println("[LoRa Sender] Comunicacao com o radio LoRa ok");
        status_init = true;
    }

    return status_init;
}

void display_init(void);

/* Funcao: inicializa comunicacao com o display OLED
 * Parametros: nenhnum
 * Retorno: nenhnum
*/ 
void display_init(void)
{
    if(!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) 
    {
        Serial.println("[LoRa Receiver] Falha ao inicializar comunicacao com OLED");        
    }
    else
    {
        Serial.println("[LoRa Receiver] Comunicacao com OLED inicializada com sucesso");
    
        /* Limpa display e configura tamanho de fonte */
        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(WHITE);
    }
}

/* Funcao de setup */
void setup() 
{
    /* Preparando a inicialização do display OLED */
    pinMode(OLED_RESET, OUTPUT);
    digitalWrite(OLED_RESET, LOW);
    delay(20);
    digitalWrite(OLED_RESET, HIGH);
    /* Configuracao para o display OLED */
    Wire.begin(OLED_SDA_PIN, OLED_SCL_PIN);
    display_init();
    display.clearDisplay();    
    display.setCursor(0, OLED_LINE1);
    display.print("Pronto para enviar");
    display.display();
    delay(1000);
    
    Serial.begin(DEBUG_SERIAL_BAUDRATE);
    while (!Serial);

    /* Tenta, até obter sucesso, comunicacao com o chip LoRa */
    while(init_comunicacao_lora() == false);       
}

long xxxx = 0;
int contador = 0;
byte hora = 1;
byte minuto = 2;
byte segundo = 3;
byte dia = 4;
byte mes = 5;
int ano = 6;
float f_latitude = 7;
float f_longitude = 8;
float temperatura = 9;
float umidade = 10;

/* Programa principal */
void loop()
{
    /* Envia a informação */
    TDadosLora dados_lora;
    dados_lora.xxxx = xxxx;
    dados_lora.contador = contador;
    dados_lora.hora = hora;
    dados_lora.minuto = minuto;
    dados_lora.segundo = segundo;
    dados_lora.dia = dia;
    dados_lora.mes = mes;
    dados_lora.ano = ano;
    dados_lora.f_latitude = f_latitude;
    dados_lora.f_longitude = f_longitude;
    dados_lora.temperatura = temperatura;
    dados_lora.umidade = umidade;

    LoRa.beginPacket();
    LoRa.write((unsigned char *)&dados_lora, sizeof(TDadosLora));
    LoRa.endPacket();
    Serial.println(dados_lora.contador);

    display.clearDisplay();   
    display.setCursor(0, OLED_LINE1);
    display.println("TRANSMISSOR");
    display.setCursor(0, OLED_LINE2);
    display.print("Cont: ");
    display.println(dados_lora.contador);
    display.setCursor(0, OLED_LINE3);
    display.print("Tamanho: ");
    display.println(sizeof(TDadosLora));
    display.display();
    
    /* Incrementa a informação para o próximo envio e aguarda 
       1 segundo até enviar a próxima informação */
    contador++;
    delay(1000);
    
}

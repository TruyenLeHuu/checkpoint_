#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>

/**
 * FreeRTOS
 */

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"
#include "freertos/event_groups.h"

/**
 * Drivers;
 */
#include "driver/gpio.h"
#include "driver/adc.h"
#include "esp_adc_cal.h"
/**
 * GPIOs Config;
 */
#include "app.h"

/**
 * Standard configurations loaded
 */
#include "sys_config.h"

/**
 * Logs;
 */
#include "esp_log.h"

/**
 * Rede mesh;
 */
#include "esp_mesh.h"
#include "esp_mesh_internal.h"

/**
 * Lwip
 */
#include "lwip/err.h"
#include "lwip/sys.h"
#include <lwip/sockets.h>

/**
* Json
*/
#include "cJSON.h"

// interaction with public mqtt broker
void mqtt_app_start(void);
void mqtt_app_publish(char* topic, char *publish_string);
/**
 * Gloabal Variables; 
 */
static esp_adc_cal_characteristics_t adc1_chars;
extern EventGroupHandle_t wifi_event_group;
extern const int CONNECTED_BIT;
extern mesh_addr_t route_table[];
extern char mac_address_root_str[];
extern int max_range;
extern uint16_t range;
nodeEsp activeNode[30];
int lengthOfActiveNode = 0;
/**
 * Constants;
 */
static const char *TAG = "app: ";

#define RX_SIZE          (200)
static uint8_t rx_buf[RX_SIZE] = { 0, };

#define TX_SIZE          (200)
static uint8_t tx_buf[TX_SIZE] = { 0, };

/**
 * Configure the ESP32 gpios (lLED & button );
 */
void led_on(){
    gpio_set_level( LED_BUILDING, 1 ); 
}
void led_off(){
    gpio_set_level( LED_BUILDING, 0 ); 
}
void gpios_setup( void )
{
  
        
    gpio_pad_select_gpio(BUTTON_PIN);
    gpio_set_direction(BUTTON_PIN, GPIO_MODE_INPUT);
    /**
     * Configure the GPIO LED BUILDING
     */
    gpio_reset_pin(LED_BUILDING);
    /* Set the GPIO as a push/pull output */
    gpio_set_direction(LED_BUILDING, GPIO_MODE_OUTPUT);
    gpio_set_level( LED_BUILDING, 0 ); 
}
    /* Function to send child*/
void send_mesh(char* data_t){
       
    mesh_data_t data;
    int route_table_size;
    data.data = tx_buf;
    data.size = TX_SIZE;   
    data.proto = MESH_PROTO_JSON;
    snprintf( (char*)tx_buf, TX_SIZE, data_t); 
    data.size = strlen((char*)tx_buf) + 1;

    esp_mesh_get_routing_table((mesh_addr_t *) &route_table,
                        CONFIG_MESH_ROUTE_TABLE_SIZE * 6, &route_table_size);
    char mac_str[30];
    for( int i = 0; i < route_table_size; i++ ) 
    {
        sprintf(mac_str, MACSTR, MAC2STR(route_table[i].addr));
        if( strcmp( mac_address_root_str, mac_str) != 0 )
        {   esp_err_t err; 
            err = esp_mesh_send(&route_table[i], &data, MESH_DATA_P2P, NULL, 0);
            if (err) 
            {
                #if DEBUG 
                    ESP_LOGI( TAG, "ERROR : Sending Message!\r\n" ); 
                #endif
            } else {
                #if DEBUG 
                        ESP_LOGI( TAG, "ROOT (%s) sends (%s) to NON-ROOT (%s)\r\n", mac_address_root_str, tx_buf, mac_str );                         
                #endif
            }
            vTaskDelay(200);
        }
    }
}
void send_sensor_msg(){
    char mac_str[30]; 
    esp_err_t err;
    mesh_data_t data;
    data.data = tx_buf;
    data.size = TX_SIZE;
    data.proto = MESH_PROTO_JSON;
    if(esp_mesh_is_root()){
        mqtt_app_publish("ESP-send", NODE_ID); 
    } else {
        cJSON *root;
        root=cJSON_CreateObject();
        cJSON_AddStringToObject(root, "Topic", "Send-Data");
        cJSON_AddStringToObject(root, "Data", NODE_ID);
        char *rendered=cJSON_Print(root);       
        snprintf( (char*)tx_buf, TX_SIZE,  rendered ); 
        data.size = strlen((char*)tx_buf) + 1;
        err = esp_mesh_send(NULL, &data, MESH_DATA_P2P, NULL, 0);   
        if (err) 
        {
            ESP_LOGI( TAG, "ERROR : Sending Message!\r\n" );   
        } else {
                uint8_t chipid[20];
                esp_efuse_mac_get_default(chipid);
                snprintf( mac_str, sizeof( mac_str ), ""MACSTR"", MAC2STR( chipid ) );
                #if DEBUG 
                ESP_LOGI( TAG, "\r\nNON-ROOT sends (%s) (%s) to ROOT (%s)\r\n", mac_str, tx_buf, mac_address_root_str );      
                #endif                   
        }
    }
}
    /*Respond mqtt msg Root to Nonroot*/
void send_setup_msg(char * topic, char * data){
    cJSON *root;
    if(strcmp(topic,"range")==0){
    root = cJSON_Parse(data);
    char* ID = cJSON_GetObjectItem(root,"node")->valuestring;
    if (strcmp(ID, NODE_ID)==0){
        max_range = cJSON_GetObjectItem(root,"range")->valueint;
        #if DEBUG 
        ESP_LOGI( TAG, "%d", max_range );   
        #endif
        #if DEBUG 
        ESP_LOGI(TAG,"It root");
        #endif
    } else {
        cJSON_AddStringToObject(root, "Topic", topic);
        char *rendered = cJSON_Print(root);   
        send_mesh(rendered);
    }
    } else if(strcmp(topic,"refresh")==0){
        mqtt_app_publish("ESP-connect", NODE_ID);
        root = cJSON_CreateObject();  
        cJSON_AddStringToObject(root, "Topic", topic);
        char *rendered = cJSON_Print(root);   
        send_mesh(rendered);
    }
}
void send_disconnect_msg(char* macID){    
    #if SEND_DISCONNECT
    if (esp_mesh_is_root()){
        for (int i = 0; i < lengthOfActiveNode; i++){
            if (strcmp(macID, activeNode[i].mac)==0){
                mqtt_app_publish("ESP-disconnect", activeNode[i].id);
            }
        }
    } else {
        uint8_t chipid[20];
        char mac_str[30];
        esp_efuse_mac_get_default(chipid);
        snprintf( mac_str, sizeof( mac_str ), ""MACSTR"", MAC2STR( chipid ) );
        cJSON *root;
        root = cJSON_CreateObject();
        cJSON_AddStringToObject(root, "Topic", "Disconnect-Mesh");
        cJSON_AddStringToObject(root, "MAC", macID);
        char *rendered = cJSON_Print(root);
        snprintf( (char*)tx_buf, TX_SIZE,  rendered ); 
        
        mesh_data_t data;
        data.data = tx_buf;
        data.size = strlen((char*)tx_buf) + 1;
        esp_err_t err = esp_mesh_send(NULL, &data, MESH_DATA_P2P, NULL, 0);
        if (err) 
        {   
            #if DEBUG 
                ESP_LOGI( TAG, "ERROR : Sending Message!\r\n" ); 
            #endif
        } else {
            #if DEBUG 
                ESP_LOGI( TAG, "\r\nNON-ROOT sends (%s) (%s) to ROOT (%s)\r\n", mac_str, tx_buf, mac_address_root_str );                         
            #endif
        }
        
    } 
    #endif
}
bool send_connect_msg()
{   
    if (esp_mesh_is_root()){
        mqtt_app_publish("ESP-connect", NODE_ID);
        return true;
    } else {
    uint8_t chipid[20];
    char mac_str[30];
    esp_efuse_mac_get_default(chipid);
    snprintf( mac_str, sizeof( mac_str ), ""MACSTR"", MAC2STR( chipid ) );
    
    cJSON *root;
    root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "Topic", "Connect-Mesh");
    cJSON_AddStringToObject(root, "ID", NODE_ID);
    cJSON_AddStringToObject(root, "MAC", mac_str);
    char *rendered = cJSON_Print(root);
    snprintf( (char*)tx_buf, TX_SIZE,  rendered ); 
    
    mesh_data_t data;
    data.data = tx_buf;
    data.size = strlen((char*)tx_buf) + 1;
    esp_err_t err = esp_mesh_send(NULL, &data, MESH_DATA_P2P, NULL, 0);
    if (err) 
    {   return false;
        #if DEBUG 
            ESP_LOGI( TAG, "ERROR : Sending Message!\r\n" ); 
        #endif
    } else {
        return true;
        #if DEBUG 
            ESP_LOGI( TAG, "\r\nNON-ROOT sends (%s) (%s) to ROOT (%s)\r\n", mac_str, tx_buf, mac_address_root_str );                         
        #endif
    }
    return false;
    }
}
/**
 * Button Manipulation Task
 */
void task_mesh_rx ( void *pvParameter )
{
    esp_err_t err;
    mesh_addr_t from;

    mesh_data_t data;
    data.data = rx_buf;
    data.size = RX_SIZE;

    char mac_address_str[30];
    int flag = 0;

    for( ;; )
    {
        data.size = RX_SIZE;
        if( esp_mesh_is_root() )
        {   //Is it root node? Then turn on the led building
            gpio_set_level( LED_BUILDING, 1 );        
        }
       /**
        * Waits for message reception
        */
        err = esp_mesh_recv( &from, &data, portMAX_DELAY, &flag, NULL, 0 );
        if( err != ESP_OK || !data.size ) 
        {
            #if DEBUG 
                ESP_LOGI( TAG, "err:0x%x, size:%d", err, data.size );
            #endif
            continue;
        }
        char myJson[100];
        snprintf(myJson, 100, (char*) data.data);
        
        cJSON *root = cJSON_Parse(myJson);
        char* topic = cJSON_GetObjectItem(root,"Topic")->valuestring;
        /**
         * Is it routed for ROOT Node?
         */
        if( esp_mesh_is_root() ) 
        {
            //**ROOT handle message
            if (strcmp(topic,"Send-Data")==0){
                char* nodeData = cJSON_GetObjectItem(root,"Data")->valuestring;
                mqtt_app_publish("ESP-send", nodeData); 
                #if DEBUG
                ESP_LOGI(TAG, "NON-ROOT(MAC:%s)- Node %s: %s, ", mac_address_str, topic, nodeData);  
                ESP_LOGI(TAG, "Tried to publish %s", nodeData);  
                #endif
            } else
            if (strcmp(topic,"Connect-Mesh")==0){
                char* id = cJSON_GetObjectItem(root,"ID")->valuestring;
                mqtt_app_publish("ESP-connect", id); 
                #if SEND_DISCONNECT
                char* mac = cJSON_GetObjectItem(root,"MAC")->valuestring;
                for (int i = 0; i <= lengthOfActiveNode; i++){
                    if (i == lengthOfActiveNode){
                        activeNode[lengthOfActiveNode].id = id;
                        activeNode[lengthOfActiveNode++].mac = mac;
                        break;}
                    if (lengthOfActiveNode != 0)
                        if (strcmp(mac,activeNode[i].mac)==0) {
                            activeNode[i].id = id;
                            break;}
                            // ESP_LOGI(TAG, "Active node HERE");   
                }
                #endif
                snprintf( mac_address_str, sizeof(mac_address_str), ""MACSTR"", MAC2STR(from.addr) );
                #if DEBUG
                ESP_LOGI(TAG, "Active node%s",activeNode[0].mac);
                ESP_LOGI(TAG, "NON-ROOT(MAC:%s)- Node %s: %s, ", mac_address_str, topic, id);  
                ESP_LOGI(TAG, "Tried to publish %s", id);  
                #endif               
            } else
            if (strcmp(topic,"Send-pin-layer")==0){
                char* ID = cJSON_GetObjectItem(root,"node")->valuestring;
                int voltage = cJSON_GetObjectItem(root,"pin")->valueint;
                int layer = cJSON_GetObjectItem(root,"layer")->valueint;  
                send_pincap_layer(voltage, layer, ID);
            }
            #if SEND_DISCONNECT
            else
            if (strcmp(topic,"Disconnect-Mesh")==0){
                char* macID = cJSON_GetObjectItem(root,"MAC")->valuestring;
                #if DEBUG
                ESP_LOGI(TAG, "NON-ROOT(MAC:%s)- Node %s: %s, ", mac_address_str, topic, macID);  
                ESP_LOGI(TAG, "Tried to publish %s", macID);  
                #endif
                send_disconnect_msg(macID);
            }
            #endif
            #if DEBUG 
                ESP_LOGI( TAG,"ROOT(MAC:%s) - Msg: %s, ", mac_address_root_str, data.data );
                ESP_LOGI( TAG, "send by NON-ROOT: %s\r\n", mac_address_str );
            #endif
        } 

        else 
        {   
            uint8_t mac_address[10];
            esp_efuse_mac_get_default( mac_address );
            snprintf( mac_address_str, sizeof( mac_address_str ), ""MACSTR"", MAC2STR( mac_address ) );
            if (strcmp(topic,"range")==0){
                max_range = cJSON_GetObjectItem(root,"range")->valueint;
                #if DEBUG 
                ESP_LOGI(TAG, "MQTT send %s", myJson);  
                #endif
            } else if (strcmp(topic,"refresh")==0){
                while (!send_connect_msg()){
                    vTaskDelay(200/portTICK_PERIOD_MS);
                }
            }
            #if DEBUG 
                ESP_LOGI( TAG, "NON-ROOT(MAC:%s)- Msg: %s, ", mac_address_str, (char*)data.data );  
                snprintf( mac_address_str, sizeof(mac_address_str), ""MACSTR"", MAC2STR(from.addr) );
                ESP_LOGI( TAG, "send by ROOT: %s\r\n", mac_address_str );
            #endif  
        }
        vTaskDelay( 50/portTICK_PERIOD_MS );   
    }
    vTaskDelete(NULL);
}
bool send_pincap_layer(int voltage, int layer, char* ID){
    char mac_str[30]; 
    esp_err_t err;
    mesh_data_t data;
    data.data = tx_buf;
    data.size = TX_SIZE;
    data.proto = MESH_PROTO_JSON;   
    cJSON *root;
    root=cJSON_CreateObject();
    cJSON_AddNumberToObject(root, "pin", voltage);
    cJSON_AddNumberToObject(root, "layer", layer);
    cJSON_AddStringToObject(root, "node", ID);
    if(esp_mesh_is_root()){ 
        char *rendered=cJSON_Print(root);       
        mqtt_app_publish("ESP-cap-layer", rendered); 
        return 1;
    } else {
        cJSON_AddStringToObject(root, "Topic", "Send-pin-layer");
        char *rendered=cJSON_Print(root);       
        snprintf( (char*)tx_buf, TX_SIZE,  rendered ); 
        data.size = strlen((char*)tx_buf) + 1;
        err = esp_mesh_send(NULL, &data, MESH_DATA_P2P, NULL, 0);   
        if (err) 
        {   
            return 0;
            ESP_LOGI( TAG, "ERROR : Sending Message!\r\n" );       
        } else {
                uint8_t chipid[20];
                esp_efuse_mac_get_default(chipid);
                snprintf( mac_str, sizeof( mac_str ), ""MACSTR"", MAC2STR( chipid ) );
                #if DEBUG 
                ESP_LOGI( TAG, "\r\nNON-ROOT sends (%s) (%s) to ROOT (%s)\r\n", mac_str, tx_buf, mac_address_root_str );      
                #endif        
                return 1;           
        }
        return 0;
    }
}
void task_send_bat_capacity ( void *pvParameter )
{   
    esp_adc_cal_characterize(ADC_UNIT_2, ADC_ATTEN_DB_11, ADC_WIDTH_12Bit, 0, &adc1_chars);
    adc2_config_channel_atten(ADC2_CHANNEL_0, ADC_ATTEN_DB_11);
    uint32_t voltage;
    while (1) 
    {   
        int adc_value, adc = 0;
        for (int i = 0; i <64; i++) {
        adc2_get_raw(ADC2_CHANNEL_0, ADC_WIDTH_BIT_DEFAULT, &adc_value);
        adc += adc_value;
        }
        adc = adc / 64;
        voltage = esp_adc_cal_raw_to_voltage(adc, &adc1_chars);
        // printf("Raw: %d, voltage: %d mV\n", adc*2, voltage*2);
        while (!send_pincap_layer(voltage*2, esp_mesh_get_layer(), NODE_ID)){
            vTaskDelay(1000/ portTICK_PERIOD_MS); 
        }
        vTaskDelay(600000/ portTICK_PERIOD_MS);
    }
}
void mqtt_start(){
    mqtt_app_start();
}

void task_app_create( void )
{   
    #if DEBUG
    ESP_LOGI( TAG, "task_app_create() called" );
    if( esp_mesh_is_root() )
    {     
        ESP_LOGI( TAG, "ROOT NODE\r\n");     
    }
    else
    {   
        ESP_LOGI( TAG, "CHILD NODE\r\n");         
    }
    #endif
    /**
     * Creates a Task to receive message;
     */
    if( xTaskCreatePinnedToCore( task_mesh_rx, "task_mesh_rx", 1024 * 5, NULL, 2, NULL, 0) != pdPASS )
    {
        #if DEBUG
        ESP_LOGI( TAG, "ERROR - task_mesh_rx NOT ALLOCATED :/\r\n" );  
        #endif
        return;   
    }
    // if( xTaskCreate( task_send_bat_capacity, "task_send_bat_capacity", 1024 * 5, NULL, 1, NULL) != pdPASS )
    // {
    //     #if DEBUG
    //     ESP_LOGI( TAG, "ERROR - task_mesh_rx NOT ALLOCATED :/\r\n" );  
    //     #endif
    //     return;   
    // }

    /**
     *  Creates a Task to transfer message;
     */    
}

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <stdarg.h>

/**
 * FreeRTOS
 */
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "freertos/event_groups.h"

/**
 * WiFi
 */
#include "esp_wifi.h"

/**
 * Logs
 */
#include "esp_log.h"

/**
 * Callback
 */
#include "esp_event.h"

/**
 * Drivers
 */
#include "nvs_flash.h"

/**
 * Aplications (App);
 */
extern "C" {
#include "app.h"

/**
 * Mesh APP
 */
 #include "mesh.h"

}
/**
 * PINOUT; 
 */
#include "sys_config.h"
#include "vl53l0x.h"
#include "i2c.h"
/**
 * Constants;
 */
 static const char *TAG = "main: ";

/**
 * Prototypes Functions;
 */
// void app_main( void );
extern "C" {
void app_main(void);
}
VL53L0X sensor;
int max_range = 100;
uint16_t range;
/**
 * Program begins here:)
 */
void sensor_task(void *pvParameter){
    bool flag = 1;
    int filter =0;
    while (1) {
        range = sensor.readRangeSingleMillimeters();
        // ESP_LOGI( TAG, "Range: %d\r\n", range );  
        while (range <= max_range && range > 20 ){
            if (++filter > 3){
                if (flag) {
                    send_sensor_msg();
                    flag = 0;
                }
                led_on();
                vTaskDelay(50 / portTICK_RATE_MS);
                range = sensor.readRangeSingleMillimeters();
            }
            vTaskDelay(50 / portTICK_RATE_MS);
        }
        filter = 0;
        if (!flag){
            led_off();
            vTaskDelay(1000 / portTICK_RATE_MS);
        }
        flag = 1;
        if (sensor.timeoutOccurred()) {
            ESP_LOGI( TAG, "TIMEOUT\r\n" );  
        }
        vTaskDelay(50 / portTICK_RATE_MS);
    }
}
void sensor_start(){
    i2c.init();
    sensor.setTimeout(500);
    if (!sensor.init()) {
        ESP_LOGI( TAG, "Failed to detect and initialize sensor!\r\n" );  
        return;
        while (1) {
            vTaskDelay(10 / portTICK_RATE_MS);
        }
    }
    sensor.setMeasurementTimingBudget(40000);
    sensor.setSignalRateLimit(0.3);
    #if defined LONG_RANGE
        // lower the return signal rate limit (default is 0.25 MCPS)
        sensor.setSignalRateLimit(0.1);
        // increase laser pulse periods (defaults are 14 and 10 PCLKs)
        sensor.setVcselPulsePeriod(VL53L0X::VcselPeriodPreRange, 18);
        sensor.setVcselPulsePeriod(VL53L0X::VcselPeriodFinalRange, 14);
    #endif

    #if defined HIGH_SPEED
        // reduce timing budget to 20 ms (default is about 33 ms)
        sensor.setMeasurementTimingBudget(20000);
    #elif defined HIGH_ACCURACY
        // increase timing budget to 200 ms
        sensor.setMeasurementTimingBudget(200000);
    #endif
    vTaskDelay(2000 / portTICK_RATE_MS);
    if( xTaskCreatePinnedToCore( sensor_task, "sensor_task", 1024 * 8, NULL, 2, NULL, 1 ) != pdPASS )
    {
        #if DEBUG
        ESP_LOGI( TAG, "ERROR - sensor_task NOT ALLOCATED :/\r\n" );  
        #endif
        return;   
    }   
}
void app_main( void )
{
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES) {
      ESP_ERROR_CHECK(nvs_flash_erase());
      ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
    // Batcap init();
    create_task_send_bat_capacity();
    /**
     * Initial GPIOs;
     */
	gpios_setup();
    /**
     * Initial reset ssid and password button;
     */
    start_btn_task();
    /**
     * Initial of stack mesh;
     */
    wifi_mesh_start();
    /**
     * Initial of task sensor
     */
    sensor_start();
}

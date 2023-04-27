#include "gpio_handler.h"

#include "sys_config.h"

#include "driver/gpio.h"


/**
 * Configure the ESP32 gpios (LED & button );
 */
void led_on(){
    gpio_set_level( LED_BUILDING, 1 ); 
}
void led_off(){
    gpio_set_level( LED_BUILDING, 0 ); 
}
void gpios_setup()
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
#ifndef _SYSCONFIG__H
#define _SYSCONFIG__H

/**
 * Debugger?
 */
#define DEBUG 0
#define SEND_DISCONNECT 1
/**
 * NODE_ID
 */


#define NODE_ID "7"

#define END_NODE 0

#define STOP_STATION_NODE 1
/**
 * GPIOs defs
 */
// #define LED_BUILDING         ( 2 ) 
#define LED_BUILDING         ( 27 ) 
#define GPIO_OUTPUT_PIN_SEL  ( 1ULL<<LED_BUILDING )

#define BUTTON_PIN               ( 0 )
#define GPIO_INPUT_PIN_SEL   ( 1ULL<<BUTTON )

/**
 * Info wifi your ssid & passwd
 */
#define WIFI_SSID       "1111"
#define WIFI_PASSWORD   "01245678"

/**
 * Net config
 */
#define FIXED_IP 0
#define IP_ADDRESS 		"192.168.0.80"
#define GATEWAY_ADDRESS "192.168.0.1"
#define NETMASK_ADDRESS "255.255.255.0"

/**
 * Globals defs
 */
#define TRUE  1
#define FALSE 0

#define WIFI_CONNECTED_BIT BIT0
#define WIFI_FAIL_BIT      BIT1
#endif 
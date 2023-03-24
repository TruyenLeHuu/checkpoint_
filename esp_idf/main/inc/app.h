#ifndef __APPS_H__
#define __APPS_H__
typedef struct 
{
    char* id;
    char* mac;
} nodeEsp;
void task_getStick();
void getStick();
void create_task_send_bat_capacity();
void send_setup_msg(char*, char*);
void mqtt_start();
void send_disconnect_msg(char* );
bool send_connect_msg();
void send_sensor_msg();
void send_last_sensor_msg(int );
bool send_pincap_layer(int , int, char*);
void led_on();
void led_off();
void gpios_setup( void );
void task_mesh_rx ( void *pvParameter );
void task_send_bat_capacity ( void *pvParameter );
void task_app_create( void );

#endif
#ifndef __MESH_H__
#define __MESH_H__

void mesh_app_start( void ); 
void wifi_mesh_start(void);
void start_btn_task();
void set_ip(char *);
unsigned long IRAM_ATTR millis();

#endif
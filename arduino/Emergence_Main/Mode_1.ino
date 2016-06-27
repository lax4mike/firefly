  /*****************************     MODE 1: BLUE   *****************************/
  // changes blink rate if detections occur within second half of last cycle (RED)
  // maintains blink rate if detections occur within first half of last cycle (green)
  // does nothing if no detections (BLUE)

long last_flash_time;
int time_between_flashes = 1500;
int new_pulse_offset = 0;
int ave_pulse_offset = 0;
int local_color = BLUE;

int synchronizing_step_size = 25;              //Synchronizing step
boolean corrected_already = 0;

//**********************************************************************
void mode1_in_the_light(){
  
}

//**********************************************************************
void mode1_in_the_dark(){

    if(time_to_blink()){

      last_flash_time = millis();

      blink(1, 1, 50, 50, local_color);

      Serial.println("blinking");

      num_pulses = 0;
      corrected_already = 0;
      local_color = BLUE;

    }


    if(pulse_detected){

      handle_pulse();

      new_pulse_offset = millis() - last_flash_time;

      ave_pulse_offset = update_average(ave_pulse_offset, num_pulses, new_pulse_offset);

    }


    if(new_pulse_offset){

      if(ave_pulse_offset <= (time_between_flashes/2/clock_prescaler)){
        if(ave_pulse_offset > synchronizing_step_size / clock_prescaler + charge_delay){
          local_color = GREEN;
        }
      }

      if(ave_pulse_offset > (time_between_flashes/2/clock_prescaler) && !corrected_already){
        last_flash_time = last_flash_time - synchronizing_step_size/clock_prescaler;
        corrected_already = 1;

        if(ave_pulse_offset < (time_between_flashes - synchronizing_step_size)/clock_prescaler){
          local_color = RED;
        }

      }

      new_pulse_offset = 0;

    }

    while(!almost_time_to_blink() && !pulse_detected){
      go_into_low_power(15);
    }

  
}

//**********************************************************************
boolean time_to_blink(){
  return (millis() > last_flash_time + time_between_flashes/clock_prescaler);
}

//**********************************************************************
boolean almost_time_to_blink(){
  return (millis() > last_flash_time + time_between_flashes/clock_prescaler - 15);
}

//**********************************************************************
int update_average(long current_value, int weight, int new_value){
  return (current_value * (weight - 1) + new_value) / weight;
}



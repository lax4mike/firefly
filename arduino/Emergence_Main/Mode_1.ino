  /*****************************     MODE 1     *****************************/
  // changes blink rate if detections occur within second half of last cycle (RED)
  // maintains blink rate if detections occur within first half of last cycle (green)
  // does nothing if no detections (BLUE)

void mode1_in_the_light(){
  
}


void mode1_in_the_dark(){

  //digitalWrite(test_pin, HIGH);


    if(millis() > last_flash_time + time_between_flashes/clock_prescaler){

      last_flash_time = millis();

      blink(1, 1, 50, 50, local_color);

      //Serial.println("blinking");

      num_pulses = 0;
      corrected_already = 0;
      local_color = BLUE;

    }

    //digitalWrite(test_pin, LOW);

    if(pulse_detected){
      digitalWrite(test_pin, LOW);

      pulse_offset = millis() - last_flash_time;

      delayMicroseconds(100 / clock_prescaler);

      num_pulses++;

      pulse_detected = 0;
    }

    //digitalWrite(test_pin, HIGH);

    //check_for_mode_gun();

    //digitalWrite(test_pin, LOW);

    if(pulse_offset){

      if(pulse_offset <= (time_between_flashes/2/clock_prescaler)){
        if(pulse_offset > synchronizing_step_size / clock_prescaler + charge_delay){
          local_color = GREEN;
        }
      }

      if(pulse_offset > (time_between_flashes/2/clock_prescaler) && !corrected_already){
        last_flash_time = last_flash_time - synchronizing_step_size/clock_prescaler;
        corrected_already = 1;

        if(pulse_offset < (time_between_flashes - synchronizing_step_size)/clock_prescaler){
          local_color = RED;
        }

      }

      pulse_offset = 0;

    }

//    while(!pulse_detected && millis() < last_flash_time + time_between_flashes/clock_prescaler - 30 / clock_prescaler){//change 30 if changing SLEEP_30MS
//      LowPower.idle(SLEEP_30MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
//    }

  
}


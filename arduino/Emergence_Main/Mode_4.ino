void initialize_mode_4(){
  Serial.println("");
  
}

void mode_4(){

  int time_in = millis();

    if(pulse_detected){
      while(millis() < time_in + 1500 / clock_prescaler){
        if(pulse_detected){
          delayMicroseconds(100 / clock_prescaler);
          num_pulses++;
          pulse_detected = 0;
        }

      }
    }

    if(num_pulses){
      local_color = num_pulses / 10;

      Serial.print("num_pulses: ");
      Serial.println(num_pulses);

      blink(1, 1, 30, 60, local_color);

      num_pulses = 0;

    }

  
}

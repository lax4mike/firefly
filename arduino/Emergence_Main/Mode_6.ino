// MODE 6 - YELLOW

long last_pulse_time_m6 = 0;

const int random_range = 8000;


void mode6_in_the_light(){

  int rand_number = mode_gun_last_cleared % 25;

  //Serial.println("Entering darkness");

  //Serial.println(rand_number);

  for(int n = 0; n < rand_number; n++){
    int garbage = random(random_range);
  }

  blink_and_pulse();

}

//*********************************************************************

void mode6_in_the_dark(){

  go_into_low_power(60);

  if(random(random_range) == 42){   // this is the answer to the ultimate question
    blink_and_pulse();
  }

  if(pulse_detected){

    if(random(5) == 1){
      blink_and_pulse();
    }
  }

}

//*********************************************************************

void blink_and_pulse(){

  // only if it's been at least 1.5 sec since the last transmit:

  if(millis() > last_pulse_time_m6 + 3000 / clock_prescaler){
    low_power_delay(0, 128);    // 128 for propagation delay
    last_pulse_time_m6 = millis();
    blink(1,0, 100, 100, YELLOW);
    low_power_delay(0, 256);
  }
}

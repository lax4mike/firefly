


void mode6_in_the_light(){
  
}

void mode6_in_the_dark(){

  low_power_delay(0, 64);

  int rand_number = random(100);

  if(rand_number == 1){
    blink(1,0, 100,100, YELLOW);
    low_power_delay(1, 1000);
  }

  if(pulse_detected){
    handle_pulse();
    low_power_delay(1, 256);
    rand_number = random(10);
    if(true){
      blink(1,0, 100, 100, YELLOW);
      low_power_delay(1, 1000);
    }
    
  }

  
}

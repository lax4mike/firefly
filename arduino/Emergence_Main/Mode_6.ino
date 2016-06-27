// MODE 6 - YELLOW


void mode6_in_the_light(){
  
  int rand_number = mode_gun_last_cleared % 25;

  Serial.println("Entering darkness");

  Serial.println(rand_number);

  for(int n = 0; n < rand_number; n++){
    int garbage = random(500);
  }

  blink_and_pulse();

  
}

//*********************************************************************

void mode6_in_the_dark(){

  low_power_delay(0, 64);

  int rand_number = random(156);  // one should fire every ~10 s... multiply 156 by the number of bugs

  Serial.println(rand_number);

  if(rand_number == 42){   // this is the answer to the ultimate question
    blink_and_pulse();
  }

  if(pulse_detected){
    handle_pulse();
    low_power_delay(1, 64);    // 64 for propagation delay
    
    rand_number = random(10);
    
    if(rand_number > 3){
      blink_and_pulse();
    }
    
  }

}

//*********************************************************************

void blink_and_pulse(){
  mode_gun_last_cleared = millis();
  blink(1,0, 100, 100, YELLOW);

  low_power_delay(1, 512);
 
}


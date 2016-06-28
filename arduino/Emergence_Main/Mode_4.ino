/** MODE 4: ORANGE
 * Follow the flashlight and pulse to the neighbors and blink through colors
 */
bool was_in_the_light_m4;
int STEP_MODE4;
int can_blink_m4;
int should_blink_m4;

void mode4_in_the_light(){
  was_in_the_light_m4 = true;
  STEP_MODE4 = 32;
  can_blink_m4 = 1;
  should_blink_m4 = 0;
 // Serial.println("mode4 - light loop!");
}


void mode4_in_the_dark(){

//  Serial.println("mode4 - Dark loop");

  while(!light_is_on() && !pulse_detected){
    go_into_low_power(250);
  }

  if (can_blink_m4 && (was_in_the_light_m4 || pulse_detected)){

    should_blink_m4 = 1;
  }

  // if the flashlight just went away
  if (should_blink_m4){

    should_blink_m4 = 0;
    pulse_detected = 0;
    was_in_the_light_m4 = false;
    
    // reset the modegun timer so it doesn't clear itself after all these delays
    //mode_gun_last_cleared = millis();

    // delay for a short amount of time before transmitting
    low_power_delay(0, 250);

    // tell the others!
    blink(1, 1, 250, 250, ORANGE);

    low_power_delay(0, 400);

    mode_gun_last_cleared = millis();

    // using this while loop to delay 1s, but exit if the light turns on
    long time_in = millis();
    while(millis() < 1000 / clock_prescaler + time_in && !light_is_on()){
      go_into_low_power(30);
      handle_pulse();
    }

    can_blink_m4 = 1;
    pulse_detected = 0;
  }



}

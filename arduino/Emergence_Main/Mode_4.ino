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

    if (pulse_detected){
      Serial.println("pulse_detected_m4");
    }
    if (was_in_the_light_m4){
      Serial.println("was_in_the_light_m4");
    }

    should_blink_m4 = 1;
  }

  // if the flashlight just went away
  if (should_blink_m4){

    should_blink_m4 = 0;
    pulse_detected = 0;
    was_in_the_light_m4 = false;

    Serial.println("blink!");
    
    // reset the modegun timer so it doesn't clear itself after all these delays
    mode_gun_last_cleared = millis();

    // delay for a short amount of time before transmitting
    low_power_delay(1, 100);

    // tell the others!
    transmit_pulse();

    // delay a bit before the flash sequence
    low_power_delay(1, 400);

    long time_start = millis();

    blink(0, 1, 250, 250, ORANGE);

    Serial.println("end blink");

    // wait some time
    // i'm not sure if we need this, because we're delaying 400ms after the
    // transmit + 700ms for the blink sequence
    //low_power_delay(1, 1000);
    can_blink_m4 = 1;
    pulse_detected = 0;
  }



}

/** MODE 4: ORANGE
 * Follow the flashlight and pulse to the neighbors and blink through colors
 */
boolean was_in_the_light_m4;
int STEP_MODE4;
boolean can_blink_m4;
boolean should_blink_m4;
boolean should_pulse_m4;
long last_pulse_time_m4;

void mode4_in_the_light(){
  was_in_the_light_m4 = true;
  STEP_MODE4 = 32;
  can_blink_m4 = true;
  should_blink_m4 = false;
  should_pulse_m4 = false;
 // Serial.println("mode4 - light loop!");
}


void mode4_in_the_dark(){

  go_into_low_power(30);


  // if the flashlight just went away
  if ((was_in_the_light_m4 || pulse_detected) && (millis() > last_pulse_time_m4 + 3000 / clock_prescaler)){

        // delay for a short amount of time before transmitting
    low_power_delay(0, 200);

    // tell the others!
    blink(1, 1, 100, 125, ORANGE);
    last_pulse_time_m4 = millis();

    low_power_delay(0, 300);

    //clear mode gun timer so we have enough time to accumulate pulses once we leave this if statement
    mode_gun_last_cleared = millis();

    was_in_the_light_m4 = false;
    
  }

}

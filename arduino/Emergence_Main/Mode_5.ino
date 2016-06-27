/** MODE5: PURPLE
 * Follow the flashlight and blink through colors
 */
bool was_in_the_light_m5;
int STEP_MODE5;

void mode5_in_the_light(){
  was_in_the_light_m5 = true;
  STEP_MODE5 = 32;

  Serial.println("argg!, mode5 the light!");
}


void mode5_in_the_dark(){

  // if the flashlight just went away
  if (was_in_the_light_m5){

    was_in_the_light_m5 = false;

    Serial.println("GO!");

    // reset the modegun timer so it doesn't clear itself after all these delays
    mode_gun_last_cleared = millis();

    // delay a bit before the flash sequence
    low_power_delay(1, 500);

    long flashlight_gone = millis();

    while(time_since(flashlight_gone) < STEP_MODE5*7){

      Serial.print(time_since(flashlight_gone));
      Serial.print(" " );
      Serial.println(STEP_MODE5);

      if (time_since(flashlight_gone) < STEP_MODE5){
        blink(0, 1, 30, 60, BLUE);
      }
      else if (time_since(flashlight_gone) < STEP_MODE5*2){
          blink(0, 1, 30, 60, BLUE_GREEN);
      }
      else if (time_since(flashlight_gone) < STEP_MODE5*3){
          blink(0, 1, 30, 60, GREEN);
      }
      else if (time_since(flashlight_gone) < STEP_MODE5*4){
          blink(0, 1, 30, 60, GREEN_YELLOW);
      }
      else if (time_since(flashlight_gone) < STEP_MODE5*5){
          blink(0, 1, 30, 60, YELLOW);
      }
      else if (time_since(flashlight_gone) < STEP_MODE5*6){
          blink(0, 1, 30, 60, ORANGE);
      }
      else if (time_since(flashlight_gone) < STEP_MODE5*7){
          blink(0, 1, 30, 60, RED);
      }
      else {
          blink(0, 1, 30, 60, PURPLE);
      }

    }
    
  }

  go_into_low_power(30);

}

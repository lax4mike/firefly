/** MODE5: PURPLE
 * Follow the flashlight and blink through colors
 */
bool was_in_the_light_m5;


void mode5_in_the_light(){
  was_in_the_light_m5 = true;
}


void mode5_in_the_dark(){

  // if the flashlight just went away
  if (was_in_the_light_m5){

    was_in_the_light_m5 = false;

    //Serial.println("GO!");

    // reset the modegun timer so it doesn't clear itself after all these delays
    mode_gun_last_cleared = millis();

    // delay a bit before the flash sequence
    low_power_delay(1, 500);

    for(int n = BLUE; n <= PURPLE; n++){
      blink(0, 0, 64, 60, n);
      while(BLINKING){
        if(light_is_on()){
          return;
        }
      }
    }    
  }

  go_into_low_power(30);

}

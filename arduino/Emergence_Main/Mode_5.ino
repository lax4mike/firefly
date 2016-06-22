bool was_in_the_light_mode5;
int STEP_MODE5;

void initialize_mode_5(){
  was_in_the_light_mode5 = true;
  STEP_MODE5 = 32;

  Serial.println("argg!, the light!");
}


void mode_5(){

  //  check_for_mode_gun();


  // if the flashlight just went away
  if (was_in_the_light_mode5){

    was_in_the_light_mode5 = false;

    Serial.println("GO!");

    // delay a bit before the flash sequence
    delay(500/clock_prescaler);

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

    was_in_the_light = false;
  }

  
}

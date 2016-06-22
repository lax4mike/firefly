bool was_in_the_light_m4;
int STEP_MODE4;
int can_blink_m4;
int should_blink_m4;

void initialize_mode_4(){
  was_in_the_light_m4 = true;
  STEP_MODE4 = 32;
  can_blink_m4 = 1;
  should_blink_m4 = 0;
  Serial.println("argg!, the light!");
}


void mode_4(){

  Serial.println("mode4");

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

    // delay for a short amount of time before transmitting
    delay(100/clock_prescaler);

    // tell the others!
    transmit_pulse();

    // delay a bit before the flash sequence
    delay(400/clock_prescaler);

    long time_start = millis();

    while(time_since(time_start) < STEP_MODE4*7){

      Serial.print(time_since(time_start));
      Serial.print(" " );
      Serial.println(STEP_MODE4);

      if (time_since(time_start) < STEP_MODE4){
          blink(0, 0, 30, 60, BLUE);
      }
      else if (time_since(time_start) < STEP_MODE4*2){
          blink(0, 0, 30, 60, BLUE_GREEN);
      }
      else if (time_since(time_start) < STEP_MODE4*3){
          blink(0, 0, 30, 60, GREEN);
      }
      else if (time_since(time_start) < STEP_MODE4*4){
          blink(0, 0, 30, 60, GREEN_YELLOW);
      }
      else if (time_since(time_start) < STEP_MODE4*5){
          blink(0, 0, 30, 60, YELLOW);
      }
      else if (time_since(time_start) < STEP_MODE4*6){
          blink(0, 0, 30, 60, ORANGE);
      }
      else if (time_since(time_start) < STEP_MODE4*7){
          blink(0, 0, 30, 60, RED);
      }
      else {
          blink(0, 0, 30, 60, PURPLE);
      }

    }

    Serial.println("end blink");

    // wait some time
    delay(1000/clock_prescaler);
    can_blink_m4 = 1;
    pulse_detected = 0;
  }

}

int phi;
int phi_tick;
int phi_threshold;
int SYNC_THRESHOLD;
float alpha;
bool was_in_the_light;
int furthest_pulse;

void initialize_mode_3(){
  
  phi = 0;
  phi_tick = 8;
  phi_threshold = 2048;
  SYNC_THRESHOLD = phi_threshold/16;
  alpha = 1.1191;
  was_in_the_light = true;
  furthest_pulse = 0; // time to the pulse that is furthest from the blink
    
}

void mode_3(){



  //  check_for_mode_gun();
    
  // blink immediately if the flashlight just went away
  if (was_in_the_light){
    blink(1, 1, 30, 60, GREEN);
    was_in_the_light = false;
  }


  // delay for phi_tick ms in low power mode
  
  low_power_delay(0, 64);

  if (pulse_detected){

    handle_pulse();

    // calculate how far from the blink this pulse is
    int distance_before = min(abs(0 - phi), abs(phi_threshold - phi));
    // int distance_after = min(abs(0 - phi*alpha), abs(phi_threshold - phi*alpha));

    // keep the one that is furthest away
    furthest_pulse = max(furthest_pulse, distance_before);


    // jump phi based on the alpha multiplier
    phi = phi * alpha;

  }
  else {
    // increment phi a constant amount
    phi = phi + phi_tick;
  }

  // blink when phi goes over the threshold
  if (phi > phi_threshold){

    // reset phi
    phi = 0;

    // change the color based on how many times it pulsed since the last blink
    // blink_color = num_pulses;

    Serial.println("phi has gone over the edge...");

    int color = (furthest_pulse < SYNC_THRESHOLD*1) ? BLUE
              : (furthest_pulse < SYNC_THRESHOLD*2) ? PURPLE
              : (furthest_pulse < SYNC_THRESHOLD*3) ? YELLOW
              : (furthest_pulse < SYNC_THRESHOLD*4) ? ORANGE
              : RED;

    Serial.print(furthest_pulse);
    Serial.print(" ");
    Serial.println(color);

    // reset
    furthest_pulse = 0;

    blink(1, 1, 30, 60, color);
  }

}

/**
 * Phi syncronizing algorithm
 */

int phi;
int phi_tick;
int phi_threshold;
int SYNC_THRESHOLD;
bool was_in_the_light;
int furthest_pulse;
// int closest_pulse;
boolean interrupt_attached;

void phi_in_the_light() {

  phi = 0;
  phi_tick = 64;
  phi_threshold = 2048;
  SYNC_THRESHOLD = phi_threshold / 16;
  was_in_the_light = true;
  furthest_pulse = 0; // time to the pulse that is furthest from the blink
  // closest_pulse = phi_threshold;
  interrupt_attached = true;

//  Serial.println("arrg! the light!!");
}

// alpha = 1.1191;
void phi_in_the_dark(float alpha) {
//  Serial.print("phi in the dark ");

  // blink immediately if the flashlight just went away
  if (was_in_the_light) {
    blink(1, 1, 30, 60, GREEN);
    was_in_the_light = false;
//    Serial.println("blink green");
  }


  // delay for phi_tick ms in low power mode

    if(!interrupt_attached && !BLINKING){
      attachInterrupt(0, pulse_detect, RISING);
      pulse_detected = 0;
      interrupt_attached = true;
    }

    low_power_delay(0, phi_tick);
//  delay(phi_tick / clock_prescaler);

  if (pulse_detected) {

    handle_pulse();

    // calculate how far from the blink this pulse is
    int distance_before = min(abs(0 - phi), abs(phi_threshold - phi));
    // int distance_after = min(abs(0 - phi*alpha), abs(phi_threshold - phi*alpha));

    // keep the one that is furthest away
    furthest_pulse = max(furthest_pulse, distance_before);
    // closest_pulse = min(closest_pulse, distance_after);


    // jump phi based on the alpha multiplier
    phi = phi * alpha;

//    Serial.println("pulse detected");

  }
  else {
    // increment phi a constant amount
    phi = phi + phi_tick;
  }

  // blink when phi goes over the threshold
  if (phi > phi_threshold) {

    // reset phi
    phi = 0;

    // change the color based on how many times it pulsed since the last blink
    // blink_color = num_pulses;

//    Serial.println("phi has gone over the edge...");

    int color = (furthest_pulse < SYNC_THRESHOLD * 1) ? BLUE
                : (furthest_pulse < SYNC_THRESHOLD * 3) ? PURPLE
                : (furthest_pulse < SYNC_THRESHOLD * 5) ? YELLOW
                : (furthest_pulse < SYNC_THRESHOLD * 7) ? ORANGE
                : RED;

//    Serial.print(furthest_pulse);
//    Serial.print(" ");
//    Serial.println(color);

    // reset
    furthest_pulse = 0;

    detachInterrupt(0);
    interrupt_attached = false;

    blink(1, 1, 30, 60, color);

  }

}

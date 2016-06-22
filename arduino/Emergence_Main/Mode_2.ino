void initialize_mode_2(){

}

void mode_2(){
  Serial.println("MODE 2");

  setup_timer2();


  for(int n = BLUE; n <= PURPLE; n++){

    blink_color = n;

    blink(0, 0, 100, 100, n);

//      noInterrupts();
//      OCR2A = color_array[blink_color][LED1_VALUE];
//      OCR2B = color_array[blink_color][LED2_VALUE];
//      interrupts();

    int time_in = millis();

    while(millis() < time_in + 500 / clock_prescaler){
      if(pulse_detected){
        num_pulses++;
        pulse_detected = 0;
      }

    }

    check_for_mode_gun();
  }

  num_pulses = 0;

  
}

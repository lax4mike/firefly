int phi_threshold = 2000;
long next_flashtime = 0;
float alpha = 1.1191;
float last_flashtime = 0;



float end_time = 1000;

void setup() {

  Serial.begin(9600);
  
  next_flashtime = millis() + phi_threshold;
  last_flashtime = millis();


  end_time = end_time * alpha;
  Serial.print("end_time: ");
  Serial.println(end_time);
  

}

void loop() {
  last_flashtime = millis();
  next_flashtime = millis() + phi_threshold;
  delay(1000);
  next_flashtime = next_flashtime - (((float) millis() - (float) last_flashtime) * alpha);
  Serial.print("last_flashtime: ");
  Serial.println(last_flashtime);
  Serial.print("next_flashtime: ");
  Serial.println(next_flashtime);
    
}

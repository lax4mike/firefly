
int charge_gate_pin = 11;
int pulse_gate_pin = 12;
int led_pin = 13;
int pulse_detect_pin = 2;
byte red_pin = 13;
byte green_pin = A1;
byte blue_pin = A2;
int photo_pin = A0;
byte test_pin = A3;

int time_between_flashes = 1000;
int led_on_time = 100;
int charge_delay = 3;
int pulse_offset;

volatile boolean pulse_detected = 0;
int num_pulses = 0;


volatile int charge_state = 0;
volatile long charge_counter = 0;

int charge_cycles = 35;
int frequency = 10000; // Hz

//**********************************************************************

void setup() {
  Serial.begin(115200);

  pinMode(photo_pin, INPUT);

  pinMode(led_pin, OUTPUT);
  pinMode(test_pin, OUTPUT);
  pinMode(red_pin, OUTPUT);
  pinMode(green_pin, OUTPUT);
  pinMode(blue_pin, OUTPUT);
  
  pinMode(charge_gate_pin, OUTPUT);
  digitalWrite(charge_gate_pin, LOW);
  
  pinMode(pulse_gate_pin, OUTPUT);
  digitalWrite(pulse_gate_pin, LOW);

  pinMode(pulse_detect_pin, INPUT);


  TCCR1A = 0;// set entire TCCR1A register to 0
  TCCR1B = 0;// same for TCCR1B
  TCNT1  = 0;//initialize counter value to 0
  // set compare match register for 1hz increments
  OCR1A = 16000000/8/frequency; // must be <65536 for this timer
  // turn on CTC mode
  TCCR1B |= (1 << WGM12);
  // Set CS11 bits for prescaler 8
  TCCR1B |= (1 << CS11); //  
  // enable timer compare interrupt
  TIMSK1 |= (1 << OCIE1A);


  Serial.println("Setup finished");

}

//**********************************************************************

void loop() {

  if(Serial.available()){
    delay(5);
    int value = Serial.parseInt();

    int counter = 0;

    for(int n = 0; n < value * 10; n++){
      charge_state = 1;
      delay(charge_delay);
      digitalWrite(pulse_gate_pin, HIGH);
      delayMicroseconds(200);
      digitalWrite(pulse_gate_pin, LOW);

      counter++;

      Serial.println(counter);
    }

    



    
  }
  
  
  /*
  
  for(int i = 0; i < 8 ; i++){
    for(int n = 0; n < i * 10; n++){
      charge_state = 1;
      delay(charge_delay);
      digitalWrite(pulse_gate_pin, HIGH);
      delayMicroseconds(200);
      digitalWrite(pulse_gate_pin, LOW);

      Serial.println(i);
    }

    delay(1750);
  }

  */
}
  

  

//**********************************************************************

ISR(TIMER1_COMPA_vect){
  if(charge_state){
    if(charge_counter < charge_cycles * 2){
      charge_counter++;
      digitalWrite(charge_gate_pin, digitalRead(charge_gate_pin)^1);
    }
    else{
      charge_counter = 0;
      charge_state = 0;
      digitalWrite(charge_gate_pin, LOW);
    }
  }
}



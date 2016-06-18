#include <LowPower.h>


int charge_gate_pin = 11;
int pulse_gate_pin = 12;
int trigger_interrupt_pin = 2;
int trigger_pin = 3;
byte red_pin = 13;
byte green_pin = A1;
byte blue_pin = A2;
int button_pin = A0;
byte test_pin = A3;

int charge_delay = 3;


volatile boolean triggered = 0;
boolean trigger_state = 0;
int trigger_debounce_counter = 0;
int trigger_debounce_threshold = 50;

boolean button_state = 0;
int button_debounce_counter = 0;
int button_debounce_threshold = 50;

volatile int charge_state = 0;
volatile long charge_counter = 0;

int clock_prescaler = 1;
int charge_cycles = 35;
int frequency = 10000; // Hz

unsigned long time_awoken;
int time_awake = 10000;
int MODE = 1;
int num_modes = 5;

//**********************************************************************

void setup() {
  Serial.begin(115200);

  pinMode(button_pin, INPUT_PULLUP);
  pinMode(test_pin, OUTPUT);
  pinMode(red_pin, OUTPUT);
  pinMode(green_pin, OUTPUT);
  pinMode(blue_pin, OUTPUT);
  
  pinMode(charge_gate_pin, OUTPUT);
  digitalWrite(charge_gate_pin, LOW);
  
  pinMode(pulse_gate_pin, OUTPUT);
  digitalWrite(pulse_gate_pin, LOW);

  pinMode(trigger_interrupt_pin, INPUT);
  pinMode(trigger_pin, INPUT);

  attachInterrupt(0, trigger_pulled, RISING);

  Serial.println("Setup finished");

}

//**********************************************************************

void loop() {

  //LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF);
  Serial.println("falling asleep");

  if(triggered){

    triggered = 0;
    
    time_awoken = millis();
        
    Serial.println("triggered");
    Serial.println(digitalRead(trigger_pin));

    while(millis() < time_awoken + time_awake){

      debounce_trigger();
      delay(1);

      if(trigger_state){

        Serial.println("triggered");

        int counter = 0;

        for(int n = 0; n < MODE * 10; n++){
          charge_state = 1;
          delay(charge_delay);
          digitalWrite(pulse_gate_pin, HIGH);
          delayMicroseconds(200);
          digitalWrite(pulse_gate_pin, LOW);
    
          counter++;
    
          Serial.println(counter);
        }

        Serial.println("shots fired");

        while(trigger_state){
          debounce_trigger();
          delay(1);
          Serial.println(digitalRead(trigger_pin));
        }

        Serial.println("trigger released");
      }

      debounce_button();

      //Serial.print("button state: ");
      //Serial.println(button_state);

      if(button_state){

        MODE++;
        if(MODE > num_modes){
          MODE = 1;
        }

        Serial.print("MODE: ");
        Serial.println(MODE);

        for(int n = 1; n <= MODE; n++){
          if(n % 2){
            digitalWrite(red_pin, HIGH);
            delay(250);
            digitalWrite(red_pin, LOW);
            delay(250);
          }
          else{
            digitalWrite(green_pin, HIGH);
            delay(250);
            digitalWrite(green_pin, LOW);
            delay(250);
          }
        }


        while(button_state){
          debounce_button();
          delay(1);
        }

        time_awoken = millis();

        Serial.println("button released");
      }

      

    }

    
    
  }







  
  /*
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

  Serial.println(digitalRead(button_pin));
  delay(250);
  
  if(trigger_state){
    Serial.println("Trigger Pulled");
    trigger_state = 0;
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

void debounce_trigger(){
  
  if(digitalRead(trigger_pin)){
    trigger_debounce_counter++;
    if(trigger_debounce_counter > trigger_debounce_threshold){
      trigger_debounce_counter = trigger_debounce_threshold;
      trigger_state = 1;
    }
  }
  else{
    trigger_debounce_counter--;
    if(trigger_debounce_counter < 0){
      trigger_debounce_counter = 0;
      trigger_state = 0;
    }
  }
}

//**********************************************************************

void debounce_button(){
  
  if(!digitalRead(button_pin)){
    button_debounce_counter++;
    if(button_debounce_counter > button_debounce_threshold){
      button_debounce_counter = button_debounce_threshold;
      button_state = 1;
    }
  }
  else{
    button_debounce_counter--;
    if(button_debounce_counter < 0){
      button_debounce_counter = 0;
      button_state = 0;
    }
  }
}

//**********************************************************************

void setup_timer1(){

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

//**********************************************************************

void trigger_pulled(){
  triggered = 1;
  
}



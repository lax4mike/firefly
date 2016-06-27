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

int charge_delay = 16;


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
int num_modes = 6;

//********************************************************************* COLOR AND BLINKING

byte blink_color;

byte BLUE = 0;
byte BLUE_GREEN = 1;
byte GREEN = 2;
byte GREEN_YELLOW = 3;
byte YELLOW = 4;
byte ORANGE = 5;
byte RED = 6;
byte PURPLE = 7;

byte LED1_PIN = 0;
byte LED2_PIN = 1;
byte LED1_VALUE = 2;
byte LED2_VALUE = 3;

byte color_array[8][4] = {

  // NOTES: Stay safely away from 0 and 255 (10 away seems to work fine)

  { blue_pin, green_pin, 200, 10 },     //  0  blue
  { blue_pin, green_pin, 80, 100 },    //  1  blue_green
  { blue_pin, green_pin, 10, 200 },     //  2  green
  { red_pin, green_pin, 75, 200 },     //  3  green / yellow
  { red_pin, green_pin, 200, 200 },    //  4  yellow
  { red_pin, green_pin, 200, 75 },     //  5  orange
  { red_pin, green_pin, 200, 10 },      //  6  red
  { red_pin, blue_pin, 128, 128},      //  7  purple

};


int led_on_steps;
int led_fade_steps;   // length of blink ~= (led_fade_steps + led_on_steps) * 4
volatile unsigned int led_on_counter;
volatile unsigned int led_fade_counter;
volatile unsigned int OCR2A_calculated;
volatile unsigned int OCR2B_calculated;
volatile boolean FADING = 0;
volatile boolean FADE = 0;
volatile boolean BLINKING = 0;


//**********************************************************************

byte mode_color_array[7] = { 0 , BLUE, GREEN_YELLOW, GREEN, RED, PURPLE, YELLOW };


//**********************************************************************

void setup() {
  Serial.begin(9600);

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

  setup_timer1();

  Serial.println("Setup finished");

}

//**********************************************************************

void loop() {

  //Serial.println("falling asleep");

  LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF);
  
  if(triggered){
    
    for(int n = 0; n < 5; n++){
      blink(0,0,25,25,BLUE);
      delay(200);
    }

    setup_timer1();
    setup_timer2();

    triggered = 0;
    
    time_awoken = millis();
    int first_press = true;
        
    //Serial.println("triggered");
    //Serial.println(digitalRead(trigger_pin));

    while(millis() < time_awoken + time_awake){

      debounce_trigger();
      delay(1);

      if(trigger_state){

        send_messages();

        // use the debounce to properly clear the trigger
        while(trigger_state) {
          debounce_trigger();
          delay(1);
          //Serial.println(digitalRead(trigger_pin));
        }

        time_awoken = millis();

        //Serial.println("trigger released");
      }

      debounce_button();

      if(button_state){

        if(!first_press){

          MODE++;
          if(MODE > num_modes){
            MODE = 1;
          }
        }
        else first_press = false;

        //Serial.print("MODE: ");
        //Serial.println(MODE);

        for(int n = 1; n <= MODE; n++){

          if(n == MODE){
            blink(0,0,100,25, mode_color_array[MODE]);
            delay(750);
          }
          else {
            blink(0,0,25,25,mode_color_array[MODE]);
            delay(300);
          }

        }



        while(button_state){
          debounce_button();
          delay(1);
        }

        time_awoken = millis();

        //Serial.println("button released");
      }
      
    }
   
  }

}

//**********************************************************************

void send_messages(){

  unsigned long time_in = millis();     // capture start time

  for(int n = 0; n < 20; n++){          // transmit a flood of pulses (~1000 ms)
    transmit_pulse();
    delay(48);
  }

  if(millis() > 429496000){          // handle millis() overflow
    delay(2000);
    time_in = millis();
  }

                                           
  while(millis() < time_in + 6000){  // blink the mode color and wait ~6 seconds
    blink(0,0,25,25, mode_color_array[MODE]);
    delay(200);
  }

  for(int n = 0; n < MODE; n++){      // transmit the actual data
    transmit_pulse();
    delay(48);
  }   
  
}

//**********************************************************************

void transmit_pulse(){
  
  charge_state = 1;

  delay(charge_delay);

  digitalWrite(pulse_gate_pin, HIGH);
  delayMicroseconds(48 / clock_prescaler);
  digitalWrite(pulse_gate_pin, LOW);
  delayMicroseconds(48 / clock_prescaler);

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
    triggered = 0;
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
void blink(boolean _pulse, boolean _fade, int _led_on_steps, int _led_fade_steps, int _color) {

  setup_timer2();

  if (_pulse) {
    transmit_pulse();
  }

  noInterrupts();

  blink_color = _color;
  led_on_steps = _led_on_steps;
  led_fade_steps = _led_fade_steps;
  led_on_counter = led_on_steps;
  led_fade_counter = led_fade_steps;

  FADE = _fade;

  FADING = 0;
  BLINKING = 1;

  OCR2A = color_array[blink_color][LED1_VALUE];
  OCR2B = color_array[blink_color][LED2_VALUE];

  interrupts();

}

//**********************************************************************

void setup_timer1(){

  TCCR1A = 0;// set entire TCCR1A register to 0
  TCCR1B = 0;// same for TCCR1B
  TCNT1  = 0;//initialize counter value to 0
  // set compare match register for 1hz increments
  OCR1A = 300; // must be <65536 for this timer
  // turn on CTC mode
  TCCR1B |= (1 << WGM12);
  // Set CS11 bits for prescaler 8
  TCCR1B |= (1 << CS11); //  
  // enable timer compare interrupt
  TIMSK1 |= (1 << OCIE1A);
}
  
//**********************************************************************

void setup_timer2() {   // 8-bit timer (0-255)

  TCCR2A = 0;  // clear any previous settings
  TCCR2B = 0;

  TCNT2  = 0;  // clear counter register

  OCR2A = 10; // set compare value
  OCR2B = 10;

  TCCR2A |= (1 << WGM21) | (1 << WGM20); // set mode to fast PWM

  TCCR2B |= (1 << CS22) | (1 << CS21); // set prescaler 128, which, makes:

  //  16000000 / 128 / 256 = overflow 244 times per second, or once per 4 ms

  // CS22   CS21   CS20   Prescaler
  //  0      0      0     Timer OFF
  //  0      0      1     1
  //  0      1      0     8
  //  0      1      1     32
  //  1      0      0     64
  //  1      0      1     128
  //  1      1      0     256
  //  1      1      1     1024


  TIMSK2 |= (1 << OCIE2A); // sets interrupt flag A (ISR(TIMER2_COMPA_vect))
  TIMSK2 |= (1 << OCIE2B); // sets interrupt flag B (ISR(TIMER2_COMPB_vect))
  TIMSK2 |= (1 << TOIE2); // sets interrupt flag at top (ISR(TIMER2_OVF_vect))

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

ISR(TIMER2_OVF_vect) {     // Turns on PWM for led1 and led2 pins.

  if (OCR2A > 10) {
    digitalWrite(color_array[blink_color][LED1_PIN], HIGH);

    if (FADING) {
      OCR2A_calculated = led_fade_counter * color_array[blink_color][LED1_VALUE] / led_fade_steps;
      OCR2A = OCR2A_calculated;
    }
  }
  else {
    OCR2A = 10;
  }

  if (OCR2B > 10) {
    digitalWrite(color_array[blink_color][LED2_PIN], HIGH);

    if (FADING) {
      OCR2B_calculated = led_fade_counter * color_array[blink_color][LED2_VALUE] / led_fade_steps;
      OCR2B = OCR2B_calculated;
    }
  }
  else {
    OCR2B = 10;

  }

  if (led_on_counter) led_on_counter--;

  if (!led_on_counter && FADE) {
    FADING = 1;
  }

  if (!led_on_counter && !FADE) {
    OCR2A = 10;
    OCR2B = 10;
    BLINKING = 0;
  }

  if (FADING) led_fade_counter--;

  if (OCR2A == 10 && OCR2B == 10) {
    FADING = 0;
    BLINKING = 0;
  }

}



//**********************************************************************

ISR(TIMER2_COMPA_vect) {

  digitalWrite(color_array[blink_color][LED1_PIN], LOW);


}

//**********************************************************************

ISR(TIMER2_COMPB_vect) {


  digitalWrite(color_array[blink_color][LED2_PIN], LOW);

}

//**********************************************************************

void trigger_pulled(){
  triggered = 1;
  
}



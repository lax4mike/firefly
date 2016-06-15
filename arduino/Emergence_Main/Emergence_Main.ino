#include <LowPower.h>
#include <prescaler.h>

long frequency = 160000; // Hz

int charge_gate_pin = 11;
int pulse_gate_pin = 12;
int led_pin = 13;
int pulse_detect_pin = 2;
byte red_pin = 13;
byte green_pin = A1;
byte blue_pin = A2;
int photo_pin = A0;
byte test_pin = A3;


int photo_threshold = 500;                    //Photo Threshold



long last_flash_time;
int time_between_flashes = 1500;
int pulse_offset;
int synchronizing_step_size = 25;              //Synchronizing step
volatile boolean pulse_detected = 0;
boolean corrected_already = 0;
int num_pulses = 0;

int charge_delay = 3;
volatile int charge_state = 0;
volatile long charge_counter = 0;
int charge_cycles = 35;

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

byte clock_prescaler;

unsigned long millis_offset = 0;

int blink_steps = 60;   // length of blink ~= blink_steps * 4
int led_counter = blink_steps;
volatile unsigned int OCR2A_calculated;
volatile unsigned int OCR2B_calculated;
volatile boolean FADE = 0;

int MODE = 4;

int phi = 0;
int phi_threshold = 2000;
float alpha = 1.1191;



//**********************************************************************

void setup() {

  setClockPrescaler(3);
  clock_prescaler = 8;

  Serial.begin(76800); // 9600 * clock_prescaler

  pinMode(test_pin, OUTPUT);

  pinMode(photo_pin, INPUT);
  pinMode(led_pin, OUTPUT);
  pinMode(red_pin, OUTPUT);
  pinMode(green_pin, OUTPUT);
  pinMode(blue_pin, OUTPUT);
  pinMode(charge_gate_pin, OUTPUT);
  pinMode(pulse_gate_pin, OUTPUT);

  digitalWrite(charge_gate_pin, LOW);
  digitalWrite(pulse_gate_pin, LOW);

  pinMode(pulse_detect_pin, INPUT);
  attachInterrupt(0, pulse_detect, FALLING);

  setup_timer1();

  startup_routine();

}

//**********************************************************************

void loop() {

  last_flash_time = millis();

  //  **************************************      MODE 1     *****************
  while(analogRead(photo_pin) < photo_threshold && MODE == 1){   

    if(millis() > last_flash_time + time_between_flashes/8){

      Serial.println(analogRead(photo_pin));

      last_flash_time = millis();

      blink();

      blink_color = BLUE;

      Serial.println("blinking");
    }

    if(pulse_detected){

      pulse_offset = millis() - last_flash_time;

      pulse_detected = 0;

      Serial.println("pulse detected");
    }

    if(pulse_offset){

      if(pulse_offset <= (time_between_flashes/2/clock_prescaler)){
        if(pulse_offset > synchronizing_step_size / clock_prescaler + charge_delay){
          blink_color = GREEN;
        }
      }

      if(pulse_offset > (time_between_flashes/2/clock_prescaler) && !corrected_already){
        last_flash_time = last_flash_time - synchronizing_step_size/clock_prescaler;
        corrected_already = 1;

        if(pulse_offset < (time_between_flashes - synchronizing_step_size)/clock_prescaler){
          blink_color = RED;
        }

      }

      pulse_offset = 0;

    }

    while(!pulse_detected && millis() < last_flash_time + time_between_flashes/clock_prescaler - 30 / clock_prescaler){//change 30 if changing SLEEP_30MS
      //LowPower.idle(SLEEP_30MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
    }

  }

  //*****************************************     MODE 2      *************************/
  while(analogRead(photo_pin) < photo_threshold && MODE == 2){  

    setup_timer2();


    for(int n = BLUE; n <= PURPLE; n++){

      blink_color = n;

      noInterrupts();
      OCR2A = color_array[blink_color][LED1_VALUE];
      OCR2B = color_array[blink_color][LED2_VALUE];
      interrupts();

      delay(500 / clock_prescaler);

    }

  }

  
  //*****************************************     MODE 3      *************************/
  while(analogRead(photo_pin) < photo_threshold && MODE == 3){

    // only run every 64 ms
    delay(64/clock_prescaler);

    if (pulse_detected){
      phi = phi * alpha;
      Serial.println("pulse detected");
      pulse_detected = 0;
    }
    else {
      phi = phi + 64;
    }

    // blink when phi goes over the threshold
    if(phi > phi_threshold){

      // reset phi
      phi = 0;

      // change the color based on how many times it pulsed since the last blink
      blink_color = num_pulses;

      blink();

      Serial.println("blinking");
    }

    Serial.println(phi);

//    while(!pulse_detected && millis() < last_flash_time + time_between_flashes/clock_prescaler - 30 / clock_prescaler){//change 30 if changing SLEEP_30MS
//      //LowPower.idle(SLEEP_30MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
//    }

  }

   //*****************************************     MODE 4      *************************/
  while(MODE == 4){

    int time_in = millis();

    if(pulse_detected){
      while(millis() < time_in + 1500 / clock_prescaler){
        if(pulse_detected){
          delayMicroseconds(100 / clock_prescaler);
          num_pulses++;
          pulse_detected = 0;
        }
        
      }
    }

    if(num_pulses){
      blink_color = num_pulses / 10;

      Serial.print("num_pulses: ");
      Serial.println(num_pulses);

      blink();

      num_pulses = 0;
        
    }
  }


}



//**********************************************************************
void blink(){

  setup_timer2();

  charge_state = 1;



  delay(charge_delay);             //// make this a function of frequency and cycles

  led_counter = blink_steps;

  noInterrupts();

  FADE = 1;

  OCR2A = color_array[blink_color][LED1_VALUE];
  OCR2B = color_array[blink_color][LED2_VALUE];

  interrupts();


  digitalWrite(pulse_gate_pin, HIGH);
  delayMicroseconds(50 / clock_prescaler);
  digitalWrite(pulse_gate_pin, LOW);

  pulse_detected = 0;                  // Clear the false detections from the pulse cycle
  num_pulses = 0;
  corrected_already = 0;

  while(FADE){
    if(pulse_detected){
      pulse_offset = millis() - last_flash_time;
//      pulse_detected = 0; THIS IS NEEDED FOR MODE 1
    }
  }

  led_counter = blink_steps;

}

//**********************************************************************

void startup_routine(){
  for(int n = 0; n < 3; n++){
    digitalWrite(red_pin, HIGH);
    delay(100 / clock_prescaler);
    digitalWrite(red_pin, LOW);
    digitalWrite(green_pin, HIGH);
    delay(100 / clock_prescaler);
    digitalWrite(green_pin, LOW);
    digitalWrite(blue_pin, HIGH);
    delay(100 / clock_prescaler);
    digitalWrite(blue_pin, LOW);
  }

  blink_color = BLUE;
}

//**********************************************************************

void setup_timer1(){
  TCCR1A = 0;// set entire TCCR1A register to 0
  TCCR1B = 0;// same for TCCR1B
  TCNT1  = 0;//initialize counter value to 0
  // set compare match register for 1hz increments
  OCR1A = 16000000/clock_prescaler/frequency; // must be <65536 for this timer
  // turn on CTC mode
  TCCR1B |= (1 << WGM12);
  // Set CS11 bits for prescaler 8
  TCCR1B |= (1 << CS11); //
  // enable timer compare interrupt
  TIMSK1 |= (1 << OCIE1A);
}

//**********************************************************************

void setup_timer2(){    // 8-bit timer (0-255)

  TCCR2A = 0;  // clear any previous settings
  TCCR2B = 0;

  TCNT2  = 0;  // clear counter register

  OCR2A = 10; // set compare value
  OCR2B = 10;

  TCCR2A |= (1 << WGM21)|(1 << WGM20); // set mode to fast PWM

  TCCR2B |= (1 << CS21)|(1 << CS20); // set prescaler 32, which, in addition to clock_prescaler makes:

  //  16000 / 8 / 32 /256 = overflow 244 times per second, or once per 4 ms

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

ISR(TIMER2_OVF_vect){      // Turns on PWM for led1 and led2 pins.

  if(OCR2A > 10){
    digitalWrite(color_array[blink_color][LED1_PIN], HIGH);

    if(FADE){
      OCR2A_calculated = led_counter * color_array[blink_color][LED1_VALUE] / blink_steps;
      OCR2A = OCR2A_calculated;
    }
  }

  else{
    OCR2A = 10;
  }

  if(OCR2B > 10){
    digitalWrite(color_array[blink_color][LED2_PIN], HIGH);

    if(FADE){
      OCR2B_calculated = led_counter * color_array[blink_color][LED2_VALUE] / blink_steps;
      OCR2B = OCR2B_calculated;
    }
  }
  else{
    OCR2B = 10;

  }

  if(FADE) led_counter--;

  if(OCR2A == 10 && OCR2B == 10){
    FADE = 0;
  }

}

//**********************************************************************

ISR(TIMER2_COMPA_vect){

  digitalWrite(color_array[blink_color][LED1_PIN], LOW);


}

//**********************************************************************

ISR(TIMER2_COMPB_vect){


  digitalWrite(color_array[blink_color][LED2_PIN], LOW);

}

//**********************************************************************

void pulse_detect(){
   pulse_detected = 1;
   //num_pulses++;
}

#include <LowPower.h>
#include <prescaler.h>


long frequency = 160000; // Hz

int charge_gate_pin = 11;
int pulse_gate_pin = 12;
int pulse_detect_pin = 2;
byte red_pin = 13;
byte green_pin = A1;
byte blue_pin = A2;
int photo_pin = A0;
byte test_pin = 9;


int photo_threshold = 500;                    //Photo Threshold



long last_flash_time;
int time_between_flashes = 1500;
int pulse_offset;
int synchronizing_step_size = 25;              //Synchronizing step
volatile boolean pulse_detected = 0;
boolean corrected_already = 0;

int num_pulses = 0;
int num_pulses_max = 9;

int charge_delay = 16 / 8;
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

int led_on_steps;
int led_fade_steps;   // length of blink ~= (led_fade_steps + led_on_steps) * 4
volatile unsigned int led_on_counter;
volatile unsigned int led_fade_counter;
volatile unsigned int OCR2A_calculated;
volatile unsigned int OCR2B_calculated;
volatile boolean FADING = 0;
volatile boolean FADE = 0;
volatile boolean BLINKING = 0;

int local_color = BLUE;

int num_modes = 6;
int MODE = 3;



//**********************************************************************

void setup() {

  set_clock_prescaler(8);

  //Serial.begin(76800); // 9600 * clock_prescaler

  pinMode(test_pin, OUTPUT);

  pinMode(photo_pin, INPUT);
  pinMode(red_pin, OUTPUT);
  pinMode(green_pin, OUTPUT);
  pinMode(blue_pin, OUTPUT);
  pinMode(charge_gate_pin, OUTPUT);
  pinMode(pulse_gate_pin, OUTPUT);

  digitalWrite(charge_gate_pin, LOW);
  digitalWrite(pulse_gate_pin, LOW);

  pinMode(pulse_detect_pin, INPUT);
  attachInterrupt(0, pulse_detect, RISING);

  setup_timer1();

  startup_routine();

}

//**********************************************************************

void loop() {
//
//  Serial.print("Main Loop - Mode is: ");
//  Serial.println(MODE);
//
//  Serial.print("dark? ");
//  Serial.println(is_in_the_dark());


  //last_flash_time = millis();

  //While in the dark
  //while(is_in_the_dark()){

  if (MODE == 1) {
    mode1_in_the_light();
    while (is_in_the_dark()) {
      mode1_in_the_dark();
      check_for_mode_gun();
    }
  }
  else if (MODE == 2) {
    mode2_in_the_light();
    while (is_in_the_dark()) {
      mode2_in_the_dark();
      check_for_mode_gun();
    }
  }
  else if (MODE == 3) {
   mode3_in_the_light();
    while (is_in_the_dark()) {
      mode3_in_the_dark();
      check_for_mode_gun();
    }
  }
  else if (MODE == 4) {
   mode4_in_the_light();
    while (is_in_the_dark()) {
      mode4_in_the_dark();
      check_for_mode_gun();
    }
  }
  else if (MODE == 5) {
   mode5_in_the_light();
    while (is_in_the_dark()) {
      mode5_in_the_dark();
      check_for_mode_gun();
    }
  }
  else if (MODE == 6) {
   mode6_in_the_light();
    while (is_in_the_dark()) {
      mode6_in_the_dark();
      check_for_mode_gun();
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

void transmit_pulse() {

  setup_timer1();

  detachInterrupt(0);

  digitalWrite(test_pin, LOW);

  charge_state = 1;

  delay(charge_delay);

  digitalWrite(pulse_gate_pin, HIGH);
  delayMicroseconds(20 / clock_prescaler);
  digitalWrite(pulse_gate_pin, LOW);

  attachInterrupt(0, pulse_detect, RISING);

  pulse_detected = 0;                  // Clear the false detections from the pulse cycle

  digitalWrite(test_pin, LOW);
}

//**********************************************************************
long mode_gun_last_cleared = millis();

void check_for_mode_gun() {

  handle_pulse();

  //Serial.println(num_pulses);
  // clear num_pulses if it's been more than 1.5 seconds
  if (millis() < mode_gun_last_cleared + 1500 / clock_prescaler) {
    Serial.println("clearing!");
    num_pulses = 0;
  }

  if (num_pulses > num_pulses_max) {

    //set_clock_prescaler(1);
    //delay(10);

    //Serial.println("made it to mode change");
    //delay(500/clock_prescaler);                 // wait for incoming flood to finish

    for (int n = 0; n < 20; n++) {             // transmit a flood of pulses (~500 ms)
      transmit_pulse();
      delay(48 / clock_prescaler);
    }

    digitalWrite(test_pin, HIGH);

    delay(2500 / clock_prescaler);             // delay to ignore ajdacent floods

    digitalWrite(test_pin, LOW);

    pulse_detected = 0;
    num_pulses = 0;

    long time_in = millis();
    int time_out_delay = 10000 / clock_prescaler;



    while (!pulse_detected && millis() < time_in + time_out_delay) { // wait up to 10 s for data

    }

    if (pulse_detected) {                               //handle the first piece of data
      //digitalWrite(test_pin, LOW);
      //Serial.println("pulse detected");
      time_in = millis();
      time_out_delay = 640 / clock_prescaler;
      delay(40 / clock_prescaler);
      num_pulses++;
      pulse_detected = 0;

    }

    while (millis() < time_in + time_out_delay) {

      if (pulse_detected) {
        digitalWrite(test_pin, LOW);
        num_pulses++;
        delay(48 / clock_prescaler);
        pulse_detected = 0;

      }
    }

    //Serial.print("num pulses: "); Serial.println(num_pulses);

    if (num_pulses) {
      for (int n = 0; n < num_pulses; n++) {
        transmit_pulse();
        delay(48 / clock_prescaler);
      }

      blink(0, 0, 100, 100, num_pulses);
    }


    delay(400);

    if (num_pulses <= num_modes) {
      MODE = num_pulses;
    }

    pulse_detected = 0;
    num_pulses = 0;
    digitalWrite(test_pin, LOW);

    //set_clock_prescaler(8);

  }
}

//**********************************************************************

void low_power_delay(boolean _handle_pulses, int _delay_time) {

  long time_in = millis();
  int did_handle_pulse = false;

  while (millis() < time_in + _delay_time / clock_prescaler && BLINKING) {
    if (_handle_pulses) {
      handle_pulse();
      did_handle_pulse = true;
    }
  }

  while (millis() < time_in + _delay_time / clock_prescaler - 15 / clock_prescaler) {
    LowPower.idle(SLEEP_15MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
    if (_handle_pulses) {
      handle_pulse();
      did_handle_pulse = true;
    }
  }

  while (millis() < time_in + _delay_time / clock_prescaler) {
    if (_handle_pulses) {
      handle_pulse();
      did_handle_pulse = true;
    }
  }

  // only reset the timers if we did something
  if (did_handle_pulse){
    setup_timer1();
    setup_timer2();
  }

}

//**********************************************************************

void handle_pulse() {
  if (pulse_detected) {
    delayMicroseconds(104 / clock_prescaler);
    num_pulses++;
    pulse_detected = 0;
  }
}

//**********************************************************************

void go_into_low_power(int _sleep_time) {

  long _time_in = millis();
  int _time_out = 500 / clock_prescaler;

  while (BLINKING) {
    if (millis() > _time_in + _time_out) {
      return;
    }
  }

  if (_sleep_time == 15) {
    LowPower.idle(SLEEP_15MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
  }
  else if (_sleep_time == 30) {
    LowPower.idle(SLEEP_30MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
  }
  else if (_sleep_time == 60) {
    LowPower.idle(SLEEP_60MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
  }
  else if (_sleep_time == 120) {
    LowPower.idle(SLEEP_120MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
  }
  else if (_sleep_time == 250) {
    LowPower.idle(SLEEP_250MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
  }
  else return;
}

//**********************************************************************

void startup_routine() {
  for (int n = 0; n < 3; n++) {
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

void set_clock_prescaler(int value) {
  if (value = 1) {
    setClockPrescaler(0);
    clock_prescaler = 1;
    setup_timer1();
    Serial.begin(9600);
  }
  if (value = 8) {
    setClockPrescaler(3);
    clock_prescaler = 8;
    setup_timer1();
    Serial.begin(76800);
  }
}

//**********************************************************************
long time_since(long timestamp) {
  return millis() - timestamp;
}

//**********************************************************************
int test;
void setup_timer1() {

  //cli();

  TCCR1A = 0;// set entire TCCR1A register to 0
  TCCR1B = 0;// same for TCCR1B
  TCNT1  = 0;//initialize counter value to 0
  // set compare match register for 1hz increments
  OCR1A = 2400 / clock_prescaler; // this is about the limit of how fast this will work.
  // turn on CTC mode
  TCCR1B |= (1 << WGM12);
  // Set CS11 bits for 1 prescaler
  TCCR1B |= (1 << CS10);
  // enable timer compare interrupt
  TIMSK1 |= (1 << OCIE1A);

  //sei();
}

//**********************************************************************

void setup_timer2() {   // 8-bit timer (0-255)

  TCCR2A = 0;  // clear any previous settings
  TCCR2B = 0;

  TCNT2  = 0;  // clear counter register

  OCR2A = 10; // set compare value
  OCR2B = 10;

  TCCR2A |= (1 << WGM21) | (1 << WGM20); // set mode to fast PWM

  TCCR2B |= (1 << CS21) | (1 << CS20); // set prescaler 32, which, in addition to clock_prescaler makes:

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

ISR(TIMER1_COMPA_vect) {

  //digitalWrite(test_pin, digitalRead(test_pin)^1);


  if (charge_state) {
    if (charge_counter < charge_cycles * 2) {
      charge_counter++;
      digitalWrite(charge_gate_pin, digitalRead(charge_gate_pin) ^ 1);
    }
    else {
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

void pulse_detect() {
  //  if (pulse_detected) {
  //    return;
  //  }
  pulse_detected = 1;
  //digitalWrite(test_pin, HIGH);
  //  num_pulses++;
  //  Serial.println("pulse detected");
}


//Returnes true if the bug is still in teh dark
boolean is_in_the_dark() {
  return analogRead(photo_pin) < photo_threshold;
}

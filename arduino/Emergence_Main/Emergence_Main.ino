#include <LowPower.h>
#include <prescaler.h>

byte clock_prescaler;
long frequency = 160000; // Hz

int charge_gate_pin = 11;
int pulse_gate_pin = 12;
int pulse_detect_pin = 2;
byte red_pin = 13;
byte green_pin = A1;
byte blue_pin = A2;
int photo_pin = A0;
byte test_pin = 9;

int photo_threshold = 500;                                                //PHOTO THRESHOLD

volatile boolean pulse_detected = 0;

int num_pulses = 0;
int num_pulses_max = 9;

int charge_delay = 16 / 8;
volatile int charge_state = 0;
volatile long charge_counter = 0;
int charge_cycles = 35;

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
volatile boolean FADING = 0;
volatile boolean FADE = 0;
volatile boolean BLINKING = 0;
byte led_minimum = 10;


//********************************************************************** MODE DECLARATIONS

//                                 1         2         3     4      5       6
byte mode_color_array[7] = { 0 , BLUE, GREEN_YELLOW, GREEN, ORANGE, PURPLE, YELLOW };
int num_modes = 6;
byte default_mode = 3;
int MODE = default_mode;

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


  long light_on_time = millis();

  if(light_is_on()){


    while(light_is_on() && millis() <= light_on_time + 60000 / clock_prescaler){
      go_into_low_power(15);
      check_for_mode_gun();
    }

    while(light_is_on() && millis() > light_on_time + 60000 / clock_prescaler){
      MODE = default_mode;
      LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF);
      check_for_mode_gun();
    }
    // clear num_pulses after it's been in the light (modes 4 and 5 could otherwise
    // recieve to many pulses if someone waves the light really fast
    num_pulses = 0;
  }



  if (MODE == 1) {
    mode1_in_the_light();
    while (!light_is_on() && MODE == 1) {
      mode1_in_the_dark();
      check_for_mode_gun();
    }
  }
  else if (MODE == 2) {
    phi_in_the_light();
    while (!light_is_on() && MODE == 2) {
      phi_in_the_dark(1.04);
      check_for_mode_gun();
    }
  }
  else if (MODE == 3) {
   phi_in_the_light();
    while (!light_is_on() && MODE == 3) {
      phi_in_the_dark(1.1191);
      check_for_mode_gun();
    }
  }
  else if (MODE == 4) {
   mode4_in_the_light();
    while (!light_is_on() && MODE == 4) {
      mode4_in_the_dark();
      check_for_mode_gun();
    }
  }
  else if (MODE == 5) {
   mode5_in_the_light();
    while (!light_is_on() && MODE == 5) {
      mode5_in_the_dark();
      check_for_mode_gun();
    }
  }
  else if (MODE == 6) {
   mode6_in_the_light();
    while (!light_is_on() && MODE == 6) {
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

//   Serial.print("Mode is: ");
//   Serial.println(MODE);

  handle_pulse();

  //Serial.println(num_pulses);
  // clear num_pulses if it's been more than 1.5 seconds
  // ie. the num_pulses_max need to happen within this 1.5 seconds
  if (millis() > mode_gun_last_cleared + 1500 / clock_prescaler) {
    //Serial.println("clearing!");
    num_pulses = 0;
    mode_gun_last_cleared = millis();
  }

  if (num_pulses > num_pulses_max) {

    //set_clock_prescaler(1);
    //delay(10);

    //delay(500/clock_prescaler);                 // wait for incoming flood to finish

    // transmit a flood of pulses (~960 ms)
    blink(0, 0, 100, 100, mode_color_array[MODE]);
    for (int n = 0; n < 20; n++) {
      transmit_pulse();
      delay(48 / clock_prescaler);
    }

    digitalWrite(test_pin, HIGH);

    // delay to ignore adjacent floods (2.5s)
    delay(2500 / clock_prescaler);

    digitalWrite(test_pin, LOW);

    pulse_detected = 0;
    num_pulses = 0;

    long time_in = millis();
    int time_out_delay = 10000 / clock_prescaler;

    // wait up to 10 s for data
    while (!pulse_detected && (millis() < time_in + time_out_delay)) {

    }

    // handle the first piece of data
    if (pulse_detected) {
      //digitalWrite(test_pin, LOW);
      //Serial.println("pulse detected");
      time_in = millis();
      time_out_delay = 640 / clock_prescaler;
      delay(40 / clock_prescaler);
      num_pulses++;
      pulse_detected = 0;

      while (millis() < time_in + time_out_delay) {

        if (pulse_detected) {
          digitalWrite(test_pin, LOW);
          num_pulses++;
          delay(48 / clock_prescaler);
          pulse_detected = 0;
        }
      }

    }

    // if we got some pulses (from the gun, or our neighbors)
    // check to see if it's real
    // rebroadcast them
    if (num_pulses) {

      boolean mode_is_real = false;

      if (num_pulses <= 0 || num_pulses > num_modes) {
        MODE = default_mode;
      }
      else {
        MODE = num_pulses;
        mode_is_real = true;
      }

      blink(0, 0, 100, 100, mode_color_array[MODE]);

      if(mode_is_real){
        for (int n = 0; n < MODE; n++) {
          transmit_pulse();
          delay(48 / clock_prescaler);
        }
      }
    }


    delay(400);

    // if we didn't get any data, default to MODE 3

    pulse_detected = 0;
    num_pulses = 0;
    digitalWrite(test_pin, LOW);

    // reset the modegun timeout clock
    mode_gun_last_cleared = millis();

    //set_clock_prescaler(8);

  }
}

//**********************************************************************

void low_power_delay(boolean _handle_pulses, int _delay_time) {

  long time_in = millis();
  int went_to_sleep = false;

  while (millis() < time_in + _delay_time / clock_prescaler && BLINKING) {
    if (_handle_pulses) {
      handle_pulse();
    }
  }

  while (millis() < time_in + _delay_time / clock_prescaler - 15 / clock_prescaler) {
    LowPower.idle(SLEEP_15MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
    went_to_sleep = 1;
    if (_handle_pulses) {
      handle_pulse();
    }
  }

  while (millis() < time_in + _delay_time / clock_prescaler) {
    if (_handle_pulses) {
      handle_pulse();
    }
  }

  // only reset the timers if we did something
  if (went_to_sleep){
    setup_timer1();
    setup_timer2();
  }

}

//**********************************************************************

void handle_pulse() {
  if (pulse_detected) {
    // TODO to debounce so we don't get double pulses
    delayMicroseconds(104 / clock_prescaler);
    num_pulses++;
    pulse_detected = 0;
  }
}

//**********************************************************************

void go_into_low_power(int _sleep_time) {

  long _time_in = millis();
  int _time_out = 500 / clock_prescaler;
  boolean went_to_sleep = false;

  while (BLINKING) {
    if (millis() > _time_in + _time_out) {
      return;
    }
  }

  if (_sleep_time == 15) {
    LowPower.idle(SLEEP_15MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
    went_to_sleep = 1;
  }
  else if (_sleep_time == 30) {
    LowPower.idle(SLEEP_30MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
    went_to_sleep = 1;
  }
  else if (_sleep_time == 60) {
    LowPower.idle(SLEEP_60MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
    went_to_sleep = 1;
  }
  else if (_sleep_time == 120) {
    LowPower.idle(SLEEP_120MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
    went_to_sleep = 1;
  }
  else if (_sleep_time == 250) {
    LowPower.idle(SLEEP_250MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_ON, SPI_OFF, USART0_OFF, TWI_OFF);
    went_to_sleep = 1;
  }
  else return;

  if(went_to_sleep){
    setup_timer1();
    setup_timer2();
  }

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
boolean light_is_on() {
  return analogRead(photo_pin) > photo_threshold;
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

  //  16000000 / 8 / 32 /256 = overflow 244 times per second, or once per 4 ms

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

  if (OCR2A > led_minimum) {
    digitalWrite(color_array[blink_color][LED1_PIN], HIGH);

    if (FADING) {
      OCR2A = led_fade_counter * color_array[blink_color][LED1_VALUE] / led_fade_steps;
    }
  }
  else {
    OCR2A = led_minimum;
  }

  if (OCR2B > led_minimum) {
    digitalWrite(color_array[blink_color][LED2_PIN], HIGH);

    if (FADING) {
      OCR2B = led_fade_counter * color_array[blink_color][LED2_VALUE] / led_fade_steps;
    }
  }
  else {
    OCR2B = led_minimum;
  }

  if (led_on_counter) led_on_counter--;

  if (!led_on_counter && FADE) {
    FADING = 1;
  }

  if (!led_on_counter && !FADE) {
    OCR2A = led_minimum;
    OCR2B = led_minimum;
    BLINKING = 0;
    digitalWrite(color_array[blink_color][LED1_PIN], LOW);
    digitalWrite(color_array[blink_color][LED2_PIN], LOW);
  }

  if (FADING) led_fade_counter--;

  if (OCR2A == led_minimum && OCR2B == led_minimum) {
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


////Returnes true if the bug is still in teh dark
//boolean is_in_the_dark() {
//  return analogRead(photo_pin) < photo_threshold;
//}

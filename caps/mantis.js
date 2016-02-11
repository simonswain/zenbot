module.exports = { 
  "cloud": {
    "rest": "https://device.zentri.com",
    "ws": "wss://device.zentri.com"
  },
  "functions": [
    {
      stream: 'temperature',
      title: 'Temperature 17',
      schema: 'float',
      panel: 'chart',
      hook: 'z_http_adc',
      interval: 60000,
      opts: {
        url: 'http://mantis.local',
        gpio: 17,
        dp: 1,
        lut: 'therm_celsius_lut.csv'
      }
    }, {
      stream: 'button_1_gpio_22',
      title: 'Read Button 1 GPIO 22',
      schema: 'boolean',
      panel: 'led',
      hook: 'z_http_gpio_get',
      interval: 1000,
      opts: {
        url: 'http://mantis.local',
        gpio: 22
      }
    }, {
      stream: 'led_18',
      title: 'LED 18',
      schema: 'boolean',
      panel: 'toggle',
      hook: 'z_http_gpio_set',
      opts: {
        url: 'http://mantis.local',
        gpio: 18
      }
    }, {
      stream: 'led_19',
      title: 'LED 10',
      schema: 'boolean',
      panel: 'toggle',
      hook: 'z_http_gpio_set',
      opts: {
        url: 'http://mantis.local',
        gpio: 19
      }
    }
  ]
};

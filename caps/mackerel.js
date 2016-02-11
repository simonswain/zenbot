module.exports = { 
  "cloud": {
    "rest": "https://device.zentri.com",
    "ws": "wss://device.zentri.com"
  },
  "functions": [
    {
      stream: 'temperature',
      title: 'Temperature',
      schema: 'float',
      panel: 'chart',
      hook: 'z_http_adc',
      interval: 60000,
      opts: {
        url: 'http://mackerel.local',
        gpio: 9,
        dp: 1,
        lut: 'therm_celsius_lut.csv'
      }
    }, {
      stream: 'button_1_gpio_0',
      title: 'Read Button 1 GPIO 0',
      schema: 'boolean',
      panel: 'led',
      hook: 'z_http_gpio_get',
      interval: 1000,
      opts: {
        url: 'http://mackerel.local',
        gpio: 0
      }
    }, {
      stream: 'button_2_gpio 11',
      title: 'Read Button 2 GPIO 11',
      schema: 'boolean',
      panel: 'led',
      hook: 'z_http_gpio_get',
      interval: 1000,
      opts: {
        url: 'http://mackerel.local',
        gpio: 11
      }
    }, {
      stream: 'led_1',
      title: 'LED 1',
      schema: 'boolean',
      panel: 'toggle',
      hook: 'z_http_gpio_set',
      opts: {
        url: 'http://mackerel.local',
        gpio: 22
      }
    }, {
      stream: 'led_2',
      title: 'LED 2',
      schema: 'boolean',
      panel: 'toggle',
      hook: 'z_http_gpio_set',
      opts: {
        url: 'http://mackerel.local',
        gpio: 21
      }
    }
  ]
};

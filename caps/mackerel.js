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
        //lut: 'thermistor.csv'
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

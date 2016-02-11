module.exports = {
  "cloud": {
    "rest": "https://device.zentri.com",
    "ws": "wss://device.zentri.com"
  },
  "functions": [
    {
      "stream": "switch_mode",
      "title": "Switch Mode",
      "schema": "control",
      "panel": "zeroonetwo",
      "hook": "set_value"
    }, {
      "stream": "random_value",
      "title": "Random Value",
      "schema": "float",
      "panel": "chart",
      "hook": "random_value",
      "interval": 10000
    }, {
      "stream": "status_led",
      "title": "Status LED",
      "schema": "boolean",
      "panel": "toggle",
      "hook": "set_value"
    }, {
      "stream": "key_press",
      "title": "Key Press",
      "schema": "boolean",
      "panel": "toggle",
      "hook": "key_toggle",
      "opts": {
        "key": ' '
      }
    }
  ]
}

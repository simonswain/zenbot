module.exports = {
  "cloud": {
    "rest": "http://localhost:4102",
    "ws": "ws://localhost:4102"
  },
  "functions": [{
    "stream": "status_led",
    "title": "Status LED",
    "schema": "control",
    "panel": "zeroonetwo",
    "hook": "set_value"
  },
  {
    "stream": "key_press",
    "title": "Key Press",
    "schema": "message",
    "panel": "message",
    "hook": "key_press",
    "opts": {
      "key": "1"
    }
  },
  {
    "stream": "keypress_toggle",
    "title": "Key Press Toggle",
    "schema": "boolean",
    "panel": "boolean",
    "hook": "key_toggle",
    "opts": {
      "key": "2"
    }
  }]
};
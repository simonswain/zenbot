module.exports = {
  "cloud": {
    "rest": "http://localhost:4102",
    "ws": "ws://localhost:4102"
  },
  "functions": [{
    "stream": "status_led",
    "title": "Status LED",
    "schema": "boolean",
    "panel": "toggle",
    "hook": "set_value"
  },
  {
    "stream": "key_press",
    "title": "Key Press",
    "schema": "boolean",
    "panel": "toggle",
    "hook": "key_toggle",
    "opts": {
      "key": ' '
    }
  }]
};

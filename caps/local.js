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
    "hook": "set_value",
    "norepeat": true
  }, {
    "stream": "random_value",
    "title": "Random Value",
    "schema": "float",
    "panel": "chart",
    "hook": "random_value",
    "norepeat": true,
    "interval": 5000
  }, {
    "stream": "key_press",
    "title": "Key Press",
    "schema": "boolean",
    "panel": "toggle",
    "hook": "key_toggle",
    "norepeat": true,
    "opts": {
      "key": ' '
    }
  }, {
    "stream": "cpu_temp",
    "title": "CPU Temperature",
    "schema": "float",
    "panel": "chart",
    "hook": "read_cpu_temp",
    "interval": 15000,
    "norepeat": true
  }]
};

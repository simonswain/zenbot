module.exports = {
  "cloud": {
    "rest": "http://localhost:4102",
    "ws": "ws://localhost:4102"
  },
  "functions": [
    {
      "stream": "status_led",
      "title": "Status LED",
      "schema": "control",
      "panel": "zeroonetwo",
      "hook": "set_value"
    }, {
      "stream": "random_value",
      "title": "Random Value",
      "schema": "float",
      "panel": "chart",
      "hook": "random_value",
      "interval": 5000
    }
  ]
}

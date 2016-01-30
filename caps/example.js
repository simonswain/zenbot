module.exports = {
  "cloud": {
    "rest": "https://device.zentri.com",
    "ws": "wss://device.zentri.com"
  },
  "functions": [
    {
      "slug": "status_led",
      "title": "Status LED",
      "schema": "control",
      "panel": "zeroonetwo",
      "hook": "set_value"
    }, {
      "slug": "random_value",
      "title": "Random Value",
      "schema": "value",
      "panel": "chart",
      "hook": "random_value",
      "interval": 5000
    }
  ]
}

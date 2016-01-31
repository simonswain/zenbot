module.exports = {
  "cloud": {
    "rest": "https://device.zentri.com",
    "ws": "wss://device.zentri.com"
  },
  "functions": [
    {
      "stream": "cpu_temp",
      "title": "CPU Temperature",
      "schema": "float",
      "panel": "chart",
      "hook": "read_cpu_temp",
      "interval": 15000
    }
  ]
}

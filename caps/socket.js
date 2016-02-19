module.exports = { 
  "cloud": {
    "rest": "http://127.0.0.1:4102",
    "ws": "ws://127.0.0.1:4102"
  },
  "functions": [
    {
      hook: 'z_ws_listener',
      norepeat: true,
      opts: {
        url: 'ws://mackerel.local/zapstreams',
      }
    }, {
      stream: 'button1',
      title: 'Button 1',
      schema: 'boolean',
      panel: 'led'
    }, {
      stream: 'button2',
      title: 'Button 2',
      schema: 'boolean',
      panel: 'led'
    }
  ]
};

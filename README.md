# Zenbot node.js API client

This is a virtual device that can connect to [Zentri
Cloud](http://cloud.zentri.com). It emulates how a hardware device
would talk to the cloud. You can use it either to test concepts for a
hardware device, or as a client in it's own right.

Zenbot has hooks that do things. Hooks listen for events or messages
then perform their action. You can have hooks automatically run
periocically too.

To extend Zenbot you can write your own hooks, doing anything you can
with Node.

You define your Soft Device's capabilities with a json `caps` file.

Each devices has somes streams.

Hooks listen to or send messages to streams. A sensor would send a
message to the cloud. A LED would receive a message from the cloud. A
toggle button with a light could send and receive, showing the correct
state at both ends.

A typical Zenbot would be running this on a Raspberry PI that has
connected hardware.

## Usage

### Install the code:

Node.js is required. It's recommended you use
[nvm](https://github.com/simonswain/zenbot) to install Node.

```bash
git clone git@github.com:simonswain/zenbot.git
cd zenbot
npm install
```

Sign in to [cloud.zentri.com](https://cloud.zentri.com) and create a new Device.

Copy the Token for that device,

Start Zenbot. Observe, Interact -- either on the console or in the cloud.

Browse the `caps` folder for some examples..

```javascript
node run <caps> <token>
```

Example output.

```
simon@simon-x220:~/zenbot$ node run example xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Cloud REST https://device.zentri.com
Cloud WS   wss://device.zentri.com
device Zenbot Test
code   ZENBOT
owner  simon@zentri.com
* control /switch_mode "Switch Mode"
* float /random_value "Random Value"
* boolean /status_led "Status LED"
* boolean /key_press "Key Press"
hook bind key_toggle
hook init key_toggle
running.
calling hook random_value > random_value
hook get random_value > random_value 40.93
ws to cloud   < {"action":"stream:message","stream":"random_value","message":{"at":1455163473918,"value":40.93}}
ws from cloud > streams/random_value {"at":1455163473918,"value":40.93}
```

## Caps File

```javascript
module.exports = {
  "cloud": {
    "rest": "https://device.zentri.com",
    "ws": "wss://device.zentri.com"
  },
  "functions": [
    {
      // run periodically to emit messages. eg sensor
      "stream": "random_value",
      "title": "Random Value",
      "schema": "float",
      "panel": "chart",
      "hook": "random_value",
      "interval": 10000
    }, {
      // control from web gui. hook sets state of hardware
      "stream": "switch_mode",
      "title": "Switch Mode",
      "schema": "control",
      "panel": "zeroonetwo",
      "hook": "set_value"
    }, {
      // toggle from web gui. hook sets state of hardware
      "stream": "status_led",
      "title": "Status LED",
      "schema": "boolean",
      "panel": "toggle",
      "hook": "set_value"
    }, {
      // press spacebar in terminal or use web gui to toggle
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
```

## Streams

Streams, Schemas and Panels are a free-form

They don't have to have a 1:1 relationship to the hardware on the
device. Design the right thing for your application.

Schemas are simply an agreement about what kind of message to emit or
consume. The message structure isn't enforced. Message handlers should
deal with this safely.

Messages are limited to 1kB. This is the maximum size of a stringified
JSON representation of the message..

You choose the panel based on the intended use of the stream, eg on
the GUI, the led panel shows the state of the stream, so it will
always act as a message sink. You could use this to mirror the state
of an indicator LED on the device or to represent the value of a
register on the device (e.g. something that gets toggled on or off by
a button push)

The button panel is dual use -- is displays current state, and allows
you to set state. This is good for having a control surface both on
the device and in the cloud. You can control via either end.

Panels are matched up to the streams/schemas they work with. They are
designed to represent and/or control based on the data type of the
schema

There is also a default panel for each schema -- if no panel is
provided, or an incompatible one, the default panel (the panel with
the name the same as the schema) is used.

These are the the basic schemas and panels. More to come. Make your
own and PR then if you like.:

### boolean

0 or 1 value

Panels: boolean (shows 0 and 1 buttons, allows change state), led
(displays state), toggle (displays and allows change state, press to
toggle)

### float

Floating point value. Default float panel displays the value. The
zeroonetwo panel has buttons for 0, 1 and 2.

### json

Arbitrary JSON. GUI just displays message.

### command

Send a message from GUI to stream {value: 'command'} where command is
selected from a menu. Device should interpret and act on this
message. This needs some fleshing out to allow caps to define possible
commands

### message

Stream message is like {value: 'some text'}.

Default message panel just displays the value. textbox panel allows
entering text in gui and pressing Send to put that {value:'text'} down
the stream

### state

Displays stringy state. Default state panel shows 'on' or 'off', but
stream can use any string. Needs fleshing out to provide for possible
states to display in GUI via caps options.

tristate panel provides for on, off and auto states (e.g. like a
thermostat)

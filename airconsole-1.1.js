/*

 AirConsole. Copyright 2015 by N-Dream AG, Switzerland.

 Getting started with game development
 -------------------------------------

 Create a screen.html and a controller.html file and include:
   http://www.airconsole.com/api/airconsole-1.0.js

 The screen.html is for the gameconsole's screen.
 The controller.html are for the gameconsole's controllers (gamepads).

 Here is simple example where the a controller sends "How are you?" to the
 screen and the screen replies with "Full of pixels!"

 controller.html:
   ...
   var gameconsole = new AirConsole();
   gameconsole.message(AirConsole.SCREEN, "How are you?")
   ...


 screen.html:
   ...
   var gameconsole = new AirConsole();
   gameconsole.onMessage = function(sender, data) {
     gameconsole.message(sender, "Full of pixels!");
   }
   ...

 To test your game, you just need to host it somewhere accessible by all the
 devices you want to use. In this example we will host the two files on:
   http://192.168.0.1:8080/game/screen.html
   http://192.168.0.1:8080/game/controller.html

 To run the game, go with the browser that should act as the screen to:
   http://www.airconsole.com/#http://192.168.0.1:8080/game/
 NOTE: there is NO screen.html at the end!
 Game controllers can join as usual over www.airconsole.com.

 If you develop locally and you can also use the developers console to test:
   http://www.airconsole.com/developers/

 Here is a simple pong example:
   http://pong.airconsole-games.appspot.com/screen.html
   http://pong.airconsole-games.appspot.com/controller.html
 To test it, go with the browser that should act as the screen to:
   http://www.airconsole.com/#http://pong.airconsole-games.appspot.com/

 Now just read the documentation in this file.

 Questions can be sent to:
   hello@n-dream.com

*/

/**
 * An object containing information about a device in this session.
 * @typedef {object} AirConsole~DeviceState
 * @property {string} uid - The globally unique ID of the user.
 * @property {string|undefined} custom - Custom device data that this API can set.
 * @property {string|undefined} nickname - The nickname of the user.
 * @property {string|undefined} thumbnail - The url to a 40x40 px thumbnail of the user.
 * @property {boolean|undefined} slow_connection - If the user has a high server latency.
 */

/**
 * An object containing information about a device in this session.
 * @typedef {object} AirConsole~Config
 * @property {string} orientation - AirConsole.ORIENTATION_PORTRAIT or
 *           AirConsole.ORIENTATION_LANDSCAPE.
 * @property {boolean|undefined} synchronize_time - If set to true, you can
 *           call getServerTime() to get the time on the game server.
 *           Default is false.
 * @property {boolean|undefiend} setup_document - Sets up the document so
 *           nothing is selectable, zoom is fixed to 1 and scrolling is
 *           disabled (iOS 8 clients drop out of fullscreen when scrolling).
 *           Default: true
 */

/**
 * Your gateway object to the N-Dream Game Console.
 * @constructor
 * @property {Array.<AirConsole~DeviceState>} devices - An array of the device
 *           data of all devices. The position is equal to the device ID of
 *           that device (The first element is the screen).
 *           An element can be undefined if the has left.
 * @property {number} server_time_offset - The difference between this devices
 *           time and the time on the gameserver. Only correct if the opts
 *           param has "synchronize_time" set to true and onReady was called.
 * @param {AirConsole~Config} opts - Constructor config.
 */
function AirConsole(opts) {
  opts = opts || {};
  var me = this;
  var device_id;
  me.devices = [];
  me.server_time_offset = opts.synchronize_time ? 0 : false;
  window.addEventListener(
      "message",
      function (event) {
        var data = event.data;
        if (data.action == "message") {
          me.onMessage(data.from, data.data);
        } else if (data.action == "update") {
          me.devices[data.device_id] = data.device_data;
          me.onDeviceStateChange(data.device_id, data.device_data);
        } else if (data.action == "ready") {
          device_id = data.device_id;
          me.devices = data.devices;
          if (me.server_time_offset !== false) {
            me.server_time_offset = data.server_time_offset || 0;
          }
          me.onReady(data.code, device_id);
        } else if (data.action == "navigate") {
          window.onbeforeunload = undefined;
        }
      },
      false);
  this.set_("orientation", opts.orientation);
  if (opts.setup_document !== false) {
    this.setupDocument_();
  }
  window.onbeforeunload = function() {
    if (device_id) {
      return "The game is still in progress!"
    }
  };
  this.postMessage_({ action: "ready",
                     synchronize_time: opts.synchronize_time });
}

/**
 * Sends a message to other devices.
 * @param to {number|undefined} - The device ID to send the message to.
 *                                If to is undefined, the message is sent
 *                                to all devices (except this one).
 * @param data
 */
AirConsole.prototype.message = function(to, data) {
  this.postMessage_({ action: "message", to: to, data: data });
};

/**
 * Sends a message to all devices.
 * @param data
 */
AirConsole.prototype.broadcast = function(data) {
  this.message(undefined, data);
};



/**
 * @abstract
 * Gets called when a message is received from another client
 * that called message().
 * @param {number} from - The device ID that sent the message.
 * @param {serializable} data - The data that was sent.
 */
AirConsole.prototype.onMessage = function(from, data) {};

/**
 * The device ID of the game screen.
 * @constant {number}
 */
AirConsole.SCREEN = 0;

/**
 * The portrait orientation.
 * @constant {string}
 */
AirConsole.ORIENTATION_PORTRAIT = "portrait";

/**
 * The landscape orientation.
 * @constant {string}
 */
AirConsole.ORIENTATION_LANDSCAPE = "landscape";

/**
 * Gets called when a device joins/leaves/updates it's DeviceState.
 * @param {number} device_id - the device ID that changed it's DeviceState.
 * @param user_data {AirConsole~DeviceState} - the data of that device.
 *        If undefined, the device has left.
 */
AirConsole.prototype.onDeviceStateChange = function(device_id, device_data) {};

/**
 * Gets called when the game console is ready.
 * @abstract
 * @param {string} code - The AirConsole join code.
 * @param {number} device_id - The device ID of this device.
 */
AirConsole.prototype.onReady = function(code, device_id) {};

/**
 * Request that the devices (screen and players) return to the start screen.
 */
AirConsole.prototype.navigateHome = function() {
  this.set_("home", true);
};

/**
 * Shows or hides the default UI.
 * @param {boolean} visible - Whether to show or hide the default UI.
 */
AirConsole.prototype.showDefaultUI = function(visible) {
  this.set_("default_ui", visible);
};

/**
 * Sets the custom property in this devices DeviceState object.
 */
AirConsole.prototype.setCustomDeviceState = function(data) {
  this.set_("custom", data);
};

/**
 * Sets the custom property in this devices DeviceState object.
 * @param {number} device_id - The device ID of this device.
 * @return {Object|undefined} The custom data previously set by the device.
 */
AirConsole.prototype.getCustomDeviceState = function(device_id) {
  var device_data = this.devices[device_id];
  if (device_data) {
    return device_data["custom"];
  }
};

/**
 * Returns the current time of the game server.
 * Can only be called if the AirConsole was instantiated with the
 * "synchronize_time" opts set to true and after onReady was called.
 * @return {number} Timestamp in milliseconds.
 */
AirConsole.prototype.getServerTime = function() {
  if (this.server_time_offset === false) {
    throw "AirConsole constructor was not called with {synchronize_time: true}";
  }
  return new Date().getTime() + this.server_time_offset;
};

/* --------------------- ONLY PRIVATE FUNCTIONS BELLOW --------------------- */

/**
 * @private
 * Posts a message to the parent window.
 * @param {Object} data - the data to be sent to the parent window.
 */
AirConsole.prototype.postMessage_ = function(data) {
  try {
    window.parent.postMessage(data, document.referrer);
  } catch(e) {
    console.log("Posting message to parent failed: " + JSON.stringify(data));
  }
};

/**
 * @private
 * Sets a variable in the device data object.
 * @param {string} key - The key to set.
 * @param {serializable} value - The value to set.
 */
AirConsole.prototype.set_ = function(key, value) {
  this.postMessage_({ action: "set", key: key, value: value });
};

/**
 * @private
 * Adds default css rules to documents so nothing is selectable, zoom is
 * fixed to 1 and preventing scrolling down (iOS 8 clients drop out of
 * fullscreen when scrolling).
 */
AirConsole.prototype.setupDocument_ = function() {
  var style = document.createElement("style");
  style.type = "text/css";
  var css_code =
      "html {\n" +
      "  -ms-touch-action: pan-x;\n" +
      "}\n" +
      "body {\n" +
      "  -webkit-touch-callout: none;\n" +
      "  -webkit-text-size-adjust: none;\n" +
      "  -ms-text-size-adjust: none;\n" +
      "  -webkit-user-select: none;\n" +
      "  -moz-user-select: none;\n" +
      "  -ms-user-select: none;\n" +
      "  user-select: none;\n" +
      "  -webkit-highlight: none;\n" +
      "  -webkit-tap-highlight-color: rgba(0,0,0,0);\n" +
      "  -webkit-tap-highlight-color: transparent;\n" +
      "  -ms-touch-action: pan-y;\n" +
      "  -ms-content-zooming: none;\n" +
      "}\n" +
      "\n" +
      "input, textarea  {\n" +
      "  -webkit-user-select: text;\n" +
      "  -moz-user-select: text;\n" +
      "  -ms-user-select: text;\n" +
      "  user-select: text;\n" +
      "}\n" +
      "-ms-@viewport {\n" +
      "    width: device-width;\n" +
      "    initial-scale: 1;\n" +
      "    zoom: 1;\n" +
      "    min-zoom: 1;\n" +
      "    max-zoom: 1;\n" +
      "    user-zoom: fixed;\n" +
      "}\n" +
      "@viewport {\n" +
      "    width: device-width;\n" +
      "    initial-scale: 1;\n" +
      "    zoom: 1;\n" +
      "    min-zoom: 1;\n" +
      "    max-zoom: 1;\n" +
      "    user-zoom: fixed;\n" +
      "}"
  if (style.styleSheet) {
    style.styleSheet.cssText = css_code;
  } else {
    style.appendChild(document.createTextNode(css_code));
  }
  var meta = document.createElement("meta");
  meta.setAttribute("name", "viewport");
  meta.setAttribute("content", "width=device-width, minimum-scale=1, " +
      "initial-scale=1, user-scalable=no");
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(meta);
  head.appendChild(style);
  document.addEventListener('touchmove', function (e) {
    e.preventDefault();
  });
};
/*
  AirConsole. Copyright 2015 by N-Dream AG, Switzerland.
  @version 1.2
  See http://developers.airconsole.com/ for API documentation
*/

/**
 * An object containing information about a device in this session.
 * @typedef {object} AirConsole~DeviceState
 * @property {string} uid - The globally unique ID of the user.
 * @property {string|undefined} custom - Custom device data that this API can set.
 * @property {string|undefined} nickname - The nickname of the user.
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
 * @property {number} device_id - The device_id of this device.
 * @property {number} server_time_offset - The difference between this devices
 *           time and the time on the gameserver. Only correct if the opts
 *           param has "synchronize_time" set to true and onReady was called.
 * @param {AirConsole~Config} opts - Constructor config.
 */
function AirConsole(opts) {
  opts = opts || {};
  var me = this;
  me.version = "1.2";
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
          me.device_id = data.device_id;
          me.devices = data.devices;
          if (me.server_time_offset !== false) {
            me.server_time_offset = data.server_time_offset || 0;
          }
          me.onReady(data.code);
        } else if (data.action == "on_before_unload") {
          if (data.on_before_unload) {
            window.onbeforeunload = function() {
              return data.on_before_unload;
            };
          } else {
            window.onbeforeunload = undefined;
          }
        } else if (data.action == "script") {
          me.loadScript(data.script)
        }
      },
      false);
  this.set_("orientation", opts.orientation);
  if (opts.setup_document !== false) {
    this.setupDocument_();
  }
  this.postMessage_({ action: "ready",
                      version: me.version,
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
 */
AirConsole.prototype.onReady = function(code) {};

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

/**
 * Returns the url to a profile picture of the user.
 * @param device_id - The device id for which you want profile picture.
 * @param {number|undefined} size - The size of in pixels of the picture.
 *                                  Default is 64.
 * @return {string|undefined}
 */
AirConsole.prototype.getProfilePicture = function(device_id, size) {
  var device_data = this.devices[device_id];
  if (device_data) {
    return "http://www.airconsole.com/api/profile-picture?uid=" +
        device_data.uid + "&size=" + (size||64);
  }
};

/**
 * Returns the nickname of the user.
 * @param device_id - The device id for which you want the nickname.
 * @param {number|undefined} size - The size of in pixels of the picture.
 *                                  Default is 64.
 * @return {string|undefined}
 */
AirConsole.prototype.getNickname = function(device_id) {
  var device_data = this.devices[device_id];
  if (device_data) {
    return device_data.nickname || ("Player " + device_id);
  }
};

/**
 * Adds a javascript file to the <head> tag.
 * @param {string} src - The source of the script
 */
AirConsole.prototype.loadScript = function(src) {
  var js = document.createElement("script");
  js.type = "text/javascript";
  js.src = src;
  document.getElementsByTagName("head")[0].appendChild(js);
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
      "}";
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
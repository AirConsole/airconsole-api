/**
 * AirConsole.
 * @copyright 2015 by N-Dream AG, Switzerland. All rights reserved.
 * @version 1.3.0
 *
 * IMPORTANT:
 *
 * See http://developers.airconsole.com/ for API documentation
 *
 * Read http://developers.airconsole.com/#/guides/device_ids_and_states to
 * learn more about devices, device states, onReady, etc.
 *
 * If your prefer an event driven api with .on() .off() and .dispatch()
 * interface instead of sending messages, use:
 * http://github.com/AirConsole/airconsole-events/
 *
 */

/**
 * The configuration for the AirConsole constructor.
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
 * Your gateway object to AirConsole.
 * There are getter and setter functions for all properties.
 * Do not access properties of this object directly.
 * @constructor
 * @param {AirConsole~Config} opts - Constructor config.
 * @property {number} device_id - The device_id of this device.
 *           Every device in a AirConsole session has a device_id.
 *           The screen always has device_id 0. You can use the
 *           AirConsole.SCREEN constant instead of 0.
 *           All controllers also get a device_id. You can NOT assume that
 *           the device_ids of controllers are consecutive or that they start
 *           at 1. DO NOT HARDCODE CONTROLLER DEVICE IDS!
 * @property {number} server_time_offset - The difference between this devices
 *           time and the time on the gameserver. Only correct if the opts
 *           param has "synchronize_time" set to true and onReady was called.
 * @property {Array.<AirConsole~DeviceState>} devices - An array of the device
 *           data of all devices in this session. The position is equal to the
 *           device ID of that device (The first element is the screen).
 *           To detect which controllers are in the game, use
 *           getControllerDeviceIds().
 *           Use the the getUID, getNickname, getProfilePicture and
 *           getCustomDeviceState to access the data.
 *           An element can be undefined if the has left.
 *           Devices in this array may not have loaded your game yet and
 *           may not be ready!
 */
function AirConsole(opts) {
  this.init_(opts);
}

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
 * Sends a message to another device.
 * @param to {number|undefined} - The device ID to send the message to.
 *                                If "to" is undefined, the message is sent
 *                                to all devices (except this one).
 * @param data
 */
AirConsole.prototype.message = function(to, data) {
  if (this.device_id !== undefined) {
    this.postMessage_({ action: "message", to: to, data: data });
  }
};

/**
 * Sends a message to all connected devices.
 * @param data
 */
AirConsole.prototype.broadcast = function(data) {
  this.message(undefined, data);
};

/**
 * Gets called when the game console is ready.
 * This event also also fires onConnect for all devices that already are
 * connected and have loaded your game.
 * This event also fires onCustomDeviceStateChange for all devices that are
 * connected, have loaded your game and have set a custom Device State.
 * @abstract
 * @param {string} code - The AirConsole join code.
 */
AirConsole.prototype.onReady = function(code) {};

/**
 * Gets called when a device has connected and loaded the game.
 * @abstract
 * @param {number} device_id - the device ID that loaded the game.
 */
AirConsole.prototype.onConnect = function(device_id) {};

/**
 * Gets called when a device has left the game.
 * @abstract
 * @param {number} device_id - the device ID that left the game.
 */
AirConsole.prototype.onDisconnect = function(device_id) {};

/**
 * @abstract
 * Gets called when a message is received from another device
 * that called message() or broadcast().
 * If you dont want to parse messages yourself and prefer an event driven
 * approach, have a look at http://github.com/AirConsole/airconsole-events/
 * @param {number} from - The device ID that sent the message.
 * @param {serializable} data - The data that was sent.
 */
AirConsole.prototype.onMessage = function(from, data) {};


/**
 * Gets called when a device updates it's custom DeviceState
 * by calling setCustomDeviceState or setCustomDeviceStateProperty.
 * Make sure you understand the power of device states:
 * http://developers.airconsole.com/#/guides/device_ids_and_states
 * @abstract
 * @param {number} device_id - the device ID that changed its custom
 *                             DeviceState.
 * @param {Object} custom_data - The custom DeviceState data value
 */
AirConsole.prototype.onCustomDeviceStateChange = function(device_id,
                                                          custom_data) {};

/**
 * Gets called when a device joins/leaves a game session or updates its
 * DeviceState (custom DeviceState, profile pic, nickname, slow connection).
 * This is function is also called every time onConnect, onDisconnect or
 * onCustomDeviceStateChange is called. It's like their root function.
 * @abstract
 * @param {number} device_id - the device ID that changed it's DeviceState.
 * @param user_data {AirConsole~DeviceState} - the data of that device.
 *        If undefined, the device has left.
 */
AirConsole.prototype.onDeviceStateChange = function(device_id, device_data) {};

/**
 * Returns the device_id of this device.
 * Every device in a AirConsole session has a device_id.
 * The screen always has device_id 0. You can use the AirConsole.SCREEN
 * constant instead of 0.
 * All controllers also get a device_id. You can NOT assume that the device_ids
 * of controllers are consecutive or that they start at 1.
 * DO NOT HARDCODE CONTROLLER DEVICE IDS!
 * @return {number}
 */
AirConsole.prototype.getDeviceId = function() {
  return this.device_id;
};

/**
 * Returns the globally unique id of a device.
 * @param {number|undefined} device_id - The device id for which you want the
 *                                       uid. Default is this device.
 * @return {string|undefined}
 */
AirConsole.prototype.getUID = function(device_id) {
  if (device_id === undefined) {
    device_id = this.device_id;
  }
  var device_data = this.devices[device_id];
  if (device_data) {
    return device_data.uid;
  }
};

/**
 * Returns the nickname of the user.
 * @param {number|undefined} device_id - The device id for which you want the
 *                                       nickname. Default is this device.
 *                                       Screens don't have nicknames.
 * @return {string|undefined}
 */
AirConsole.prototype.getNickname = function(device_id) {
  if (device_id === undefined) {
    device_id = this.device_id;
  }
  var device_data = this.devices[device_id];
  if (device_data) {
    return device_data.nickname || ("Player " + device_id);
  }
};


/**
 * Returns the url to a profile picture of the user.
 * @param {number|undefined} device_id - The device id for which you want
 *                                       profile picture. Default is this
 *                                       device. Screen's don't have profile
 *                                       pictures.
 * @param {number|undefined} size - The size of in pixels of the picture.
 *                                  Default is 64.
 * @return {string|undefined}
 */
AirConsole.prototype.getProfilePicture = function(device_id, size) {
  if (device_id === undefined) {
    device_id = this.device_id;
  }
  var device_data = this.devices[device_id];
  if (device_data) {
    return "http://www.airconsole.com/api/profile-picture?uid=" +
        device_data.uid + "&size=" + (size||64);
  }
};


/**
 * Returns the device ID of the master controller.
 * @return {number|undefined}
 */
AirConsole.prototype.getMasterControllerDeviceId = function() {
  return this.getControllerDeviceIds()[0];
};


/**
 * Returns all controller device ids that have loaded your game.
 * @return {Array}
 */
AirConsole.prototype.getControllerDeviceIds = function() {
  var result = [];
  var game_url = this.getGameUrl_(document.location.href);
  for (var i = AirConsole.SCREEN + 1; i < this.devices.length; ++i) {
    if (this.devices[i] &&
        this.getGameUrl_(this.devices[i].location) == game_url) {
      result.push(i);
    }
  }
  return result;
};


/**
 * Returns the current time of the game server.
 * This allows you to have a synchronized clock: You can send the server
 * time in a message to know exactly at what point something happened on a
 * device. This function Can only be called if the AirConsole was instantiated
 * with the "synchronize_time" opts set to true and after onReady was called.
 * @return {number} Timestamp in milliseconds.
 */
AirConsole.prototype.getServerTime = function() {
  if (this.server_time_offset === false) {
    throw "AirConsole constructor was not called with " +
    "{synchronize_time: true}";
  }
  return new Date().getTime() + this.server_time_offset;
};


/**
 * Gets the custom DeviceState of a device.
 * @param {number|undefined} device_id - The device ID of which you want the
 *                                       custom state. Default is this device.
 * @return {Object|undefined} The custom data previously set by the device.
 */
AirConsole.prototype.getCustomDeviceState = function(device_id) {
  if (device_id === undefined) {
    device_id = this.device_id;
  }
  var device_data = this.devices[device_id];
  if (device_data && this.getGameUrl_(document.location.href) ==
      this.getGameUrl_(device_data.location)) {
    return device_data["custom"];
  }
};


/**
 * Sets the custom DeviceState of this device.
 * @param {Object} data - The custom data to set.
 */
AirConsole.prototype.setCustomDeviceState = function(data) {
  if (this.device_id !== undefined) {
    this.devices[this.device_id]["custom"] = data;
    this.set_("custom", data);
  }
};


/**
 * Sets a property in the custom DeviceState of this device.
 * @param {String} key - The property name.
 * @param {mixed} value - The property value.
 */
AirConsole.prototype.setCustomDeviceStateProperty = function(key, value) {
  if (this.device_id !== undefined) {
    var state = this.getCustomDeviceState();
    if (state === undefined) {
      state = {};
    } else if (typeof state !== "object") {
      throw "Custom DeviceState needs to be of type object";
    }
    state[key] = value;
    this.setCustomDeviceState(state);
  }
};


/**
 * Request that all devices return to the AirConsole store.
 */
AirConsole.prototype.navigateHome = function() {
  this.set_("home", true);
};


/**
 * Request that all devices load a game by url.
 * Note that the custom DeviceStates are preserved. If you don't want that
 * override setCustomDeviceState(undefined) on every device before calling
 * this function.
 */
AirConsole.prototype.navigateTo = function(url) {
  this.set_("home", url);
};


/**
 * Shows or hides the default UI.
 * @param {boolean} visible - Whether to show or hide the default UI.
 */
AirConsole.prototype.showDefaultUI = function(visible) {
  this.set_("default_ui", visible);
};


/**
 * Sets the device orientation.
 * @param {string} orientation - AirConsole.ORIENTATION_PORTRAIT or
 *                               AirConsole.ORIENTATION_LANDSCAPE.
 */
AirConsole.prototype.setOrientation = function(orientation) {
  this.set_("orientation", orientation);
};


/**
 * DeviceState contains information about a device in this session.
 * Use the helper methods getUID, getNickname, getProfilePicture and
 * getCustomDeviceState to access this data.
 * @typedef {object} AirConsole~DeviceState
 * @property {string} uid - The globally unique ID of the user.
 * @property {string|undefined} custom - Custom device data that this API can
 *                                       set.
 * @property {string|undefined} nickname - The nickname of the user.
 * @property {boolean|undefined} slow_connection - If the user has a high
 *                                                 server latency.
 */


/* --------------------- ONLY PRIVATE FUNCTIONS BELLOW --------------------- */

/**
 * Initializes the AirConsole.
 * @param {AirConsole~Config} opts - The Config.
 * @private
 */
AirConsole.prototype.init_ = function(opts) {
  opts = opts || {};
  var me = this;
  me.version = "1.3.0";
  me.devices = [];
  me.server_time_offset = opts.synchronize_time ? 0 : false;
  window.addEventListener(
      "message",
      function (event) {
        var data = event.data;
        var game_url = me.getGameUrl_(document.location.href);
        if (data.action == "message") {
          if (me.device_id !== undefined) {
            if (me.devices[data.from] &&
                game_url == me.getGameUrl_(me.devices[data.from].location)) {
              me.onMessage(data.from, data.data);
            }
          }
        } else if (data.action == "update") {
          if (me.device_id !== undefined) {
            var game_url_before = null;
            var game_url_after = null;
            var before = me.devices[data.device_id];
            if (before) {
              game_url_before = me.getGameUrl_(before.location);
            }
            if (data.device_data) {
              game_url_after = me.getGameUrl_(data.device_data.location);
            }
            me.devices[data.device_id] = data.device_data;
            me.onDeviceStateChange(data.device_id, data.device_data);
            if (game_url_before != game_url && game_url_after == game_url) {
              me.onConnect(data.device_id);
            } else if (game_url_before == game_url &&
                game_url_after != game_url) {
              me.onDisconnect(data.device_id);
            } else if (data.device_data &&
                data.device_data._is_custom_update &&
                game_url_after == game_url) {
              me.onCustomDeviceStateChange(data.device_id,
                                           data.device_data.custom);
            }
          }
        } else if (data.action == "ready") {
          me.device_id = data.device_id;
          me.devices = data.devices;
          if (me.server_time_offset !== false) {
            me.server_time_offset = data.server_time_offset || 0;
          }
          me.onReady(data.code);
          var game_url = me.getGameUrl_(document.location.href);
          for (var i = 0; i < me.devices.length; ++i) {
            if (me.devices[i] &&
                me.getGameUrl_(me.devices[i].location) == game_url) {
              me.onConnect(i);
              var custom_state = me.getCustomDeviceState(i);
              if (custom_state !== undefined) {
                me.onCustomDeviceStateChange(i, custom_state);
              }
            }
          }
        }
      },
      false);
  this.set_("orientation", opts.orientation);
  if (opts.setup_document !== false) {
    this.setupDocument_();
  }
  this.postMessage_({
    action: "ready",
    version: me.version,
    synchronize_time: opts.synchronize_time,
    location: document.location.href
  });
}

/**
 * @private
 * @param {String} url - A url.
 * @return {String} Returns the root game url.
 */
AirConsole.prototype.getGameUrl_ = function(url) {
  if (!url) {
    return;
  }
  url = url.replace("screen.html", "");
  url = url.replace("controller.html", "");
  return url;
};


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
 * Sets a variable in the external AirConsole framework.
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

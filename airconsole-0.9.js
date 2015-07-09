/*
  AirConsole. Copyright 2015 by N-Dream AG, Switzerland.
  @version 0.9
  See http://developers.airconsole.com/ for API documentation
*/

/**
 * An object containing information about a device in this session.
 * @typedef {object} DeviceData
 * Fields are:
 * {string} uid - The globally unique ID of the user.
 * {string|undefined} nickname - The nickname of the user.
 * {string|undefined} thumbnail - The url to a 40x40 px thumbnail of the user.
 * {boolean|undefined} slow_connection - If the user has a high server latency.
 */

/**
 * Your gateway object to the N-Dream Game Console.
 * @constructor
 * @property {Array.<DeviceData>} devices - An array of the device data of all
 *                                          devices. The position is equal to
 *                                          the device ID of that device (The
 *                                          first element is the screen).
 *                                          An element can be undefined if the
 *                                          has left.
 * @property {number} server_time_offset - The difference between this devices
 *                                         time and the time on the gameserver.
 *                                         Only correct if the opts param has
 *                                         "synchronize_time" set to true and
 *                                         onReady was called.
 * @param {Object} opts - Constructor config. Possible key,values are:
 *   "orientation": Force the screen to a certain orientation. Possible values:
 *                  "portrait", "landscape"
 *   "synchronize_time": If set to true, you can call getServerTime() to get
 *                       the time on the game server.
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
          me.onUpdate(data.device_id, data.device_data);
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
  this.set("orientation", opts.orientation);
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
 * @abstract
 * Gets called when a message is received from another client
 * that called message().
 * @param {number} from - The device ID that sent the message.
 * @param {serializable} data - The data that was sent.
 */
AirConsole.prototype.onMessage = function(from, data) {};

/**
 * The device ID of the game screen.
 * @type {number}
 */
AirConsole.SCREEN = 0;

/**
 * Gets called when a device joins/leaves/updates it's DeviceData.
 * @param {number} device_id - the device ID that changed it's DeviceData.
 * @param user_data {DeviceData} - the data of that device. If undefined, the
 *                                 device has left.
 */
AirConsole.prototype.onUpdate = function(device_id, device_data) {};

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
AirConsole.prototype.home = function() {
  this.set("home", true);
};

/**
 * Shows or hides the default UI.
 * @param {boolean} visible - Whether to show or hide the default UI.
 */
AirConsole.prototype.showDefaultUI = function(visible) {
  this.set("default_ui", visible);
};

/**
 * Sets the custom property in this devices DeviceData object.
 */
AirConsole.prototype.setCustom = function(data) {
  this.set("custom", data);
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
AirConsole.prototype.set = function(key, value) {
  this.postMessage_({ action: "set", key: key, value: value });
};

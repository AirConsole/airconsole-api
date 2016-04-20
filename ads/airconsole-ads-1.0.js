/**
 * AirConsoleAd.Ads.
 * @copyright 2015 by N-Dream AG, Switzerland. All rights reserved.
 * @version 1.0
 *
 * IMPORTANT:
 *
 * This is the API for AirConsoleAd.Ads. You can display ads by calling
 * AirConsoleAd.showAd() in the main API.
 *
 * See http://developers.airconsole.com/ for API documentation
 *
 */


/**
 * The configuration for the AirConsoleAd.d constructor.
 * @typedef {object} AirConsoleAd.d~Config
 * @property {boolean|undefiend} setup_document - Sets up the document so
 *           nothing is selectable, zoom is fixed to 1 and scrolling is
 *           disabled (iOS 8 clients drop out of fullscreen when scrolling).
 *           Default: true
 */

/**
 * The gateway for an AirConsoleAd.ad.
 * There are getter and setter functions for all properties.
 * Do not access properties of this object directly.
 * @constructor
 */
function AirConsoleAd(opts) {
  this.init_(opts);
}

/**
 * The device ID of the game screen.
 * @constant {number}
 */
AirConsoleAd.SCREEN = 0;


/**
 * Sends a message to another device.
 * @param device_id {number|undefined} - The device ID to send the message to.
 *                                       If "device_id" is undefined, the
 *                                       message is sent to all devices (except
 *                                       this one).
 * @param data
 */
AirConsoleAd.prototype.message = function(device_id, data) {
  if (this.device_id !== undefined) {
    this.postMessage_({ action: "admessage", to: device_id, data: data });
  }
};


/**
 * Sends a message to all connected devices.
 * @param data
 */
AirConsoleAd.prototype.broadcast = function(data) {
  this.message(undefined, data);
};


/**
 * Gets called when the ad is shown.
 * @abstract
 * @param {string} code - The AirConsoleAd.join code.
 */
AirConsoleAd.prototype.onReady = function(code) {};

/**
 * Gets called when a device updates it's profile pic, nickname or email.
 * @abstract
 * @param {number} device_id - The device_id that changed its profile.
 */
AirConsoleAd.prototype.onDeviceProfileChange = function(device_id) {};


/**
 * Gets called when a device joins/leaves a game session or updates its
 * DeviceState (custom DeviceState, profile pic, nickname, internal state).
 * This is function is also called every time onConnect, onDisconnect or
 * onCustomDeviceStateChange, onDeviceProfileChange is called.
 * It's like their root function.
 * @abstract
 * @param {number} device_id - the device_id that changed its DeviceState.
 * @param user_data {AirConsoleAd.DeviceState} - the data of that device.
 *        If undefined, the device has left.
 */
AirConsoleAd.prototype.onDeviceStateChange = function(device_id, device_data) {};


/**
 * Gets called when a device has connected and loaded the game.
 * @abstract
 * @param {number} device_id - the device ID that loaded the game.
 */
AirConsoleAd.prototype.onConnect = function(device_id) {};


/**
 * Gets called when a device has left the game.
 * @abstract
 * @param {number} device_id - the device ID that left the game.
 */
AirConsoleAd.prototype.onDisconnect = function(device_id) {};

/**
 * Gets called when a message is received from another device's ad
 * that called message() or broadcast().
 * @abstract
 * @param {number} device_id - The device ID that sent the message.
 * @param {serializable} data - The data that was sent.
 */
AirConsoleAd.prototype.onMessage = function(device_id, data) {};


/**
 * Gets called when a device updates it's custom ad state
 * by calling setCustomAdState or setCustomAdStateProperty.
 * @abstract
 * @param {number} device_id - the device ID that changed its custom
 *                             DeviceState.
 * @param {Object} custom_data - The custom DeviceState data value
 */
AirConsoleAd.prototype.onCustomAdStateChange = function(device_id,
                                                      custom_data) {};

/**
 * Returns the device_id of this device.
 * Every device in an AirConsoleAd.session has a device_id.
 * The screen always has device_id 0. You can use the AirConsoleAd.SCREEN
 * constant instead of 0.
 * All controllers also get a device_id. You can NOT assume that the device_ids
 * of controllers are consecutive or that they start at 1.
 *
 * DO NOT HARDCODE CONTROLLER DEVICE IDS!
 *
 * Within an AirConsoleAd.session, devices keep the same device_id when they
 * disconnect and reconnect. Different controllers will never get the same
 * device_id in a session. Every device_id remains reserved for the device that
 * originally got it.
 *
 * For more info read
 * http:// developers.airconsole.com/#/guides/device_ids_and_states
 *
 * @return {number}
 */
AirConsoleAd.prototype.getDeviceId = function() {
  return this.device_id;
};


/**
 * Returns the globally unique id of a device.
 * @param {number|undefined} device_id - The device id for which you want the
 *                                       uid. Default is this device.
 * @return {string|undefined}
 */
AirConsoleAd.prototype.getUID = function(device_id) {
  if (device_id === undefined) {
    device_id = this.device_id;
  }
  var device_data = this.devices[device_id];
  if (device_data) {
    return device_data.uid;
  }
};


/**
 * Returns the nickname of a user.
 * @param {number|undefined} device_id - The device id for which you want the
 *                                       nickname. Default is this device.
 *                                       Screens don't have nicknames.
 * @return {string|undefined}
 */
AirConsoleAd.prototype.getNickname = function(device_id) {
  if (device_id === undefined) {
    device_id = this.device_id;
  }
  var device_data = this.devices[device_id];
  if (device_data) {
    return device_data.nickname || ("Guest " + device_id);
  }
};


/**
 * Returns the url to a profile picture of the user.
 * @param {number|undefined} device_id - The device id for which you want the
 *                                       profile picture. Default is this
 *                                       device. Screens don't have profile
 *                                       pictures.
 * @param {number|undefined} size - The size of in pixels of the picture.
 *                                  Default is 64.
 * @return {string|undefined}
 */
AirConsoleAd.prototype.getProfilePicture = function(device_id, size) {
  if (device_id === undefined) {
    device_id = this.device_id;
  }
  var device_data = this.devices[device_id];
  if (device_data) {
    var url = "https://www.airconsole.com/api/profile-picture?uid=" +
        device_data.uid + "&size=" + (size||64);
    if (device_data.picture) {
      url += "&v=" + device_data.picture;
    }
    return url;
  }
};


/**
 * Returns the device ID of the master controller.
 * @return {number|undefined}
 */
AirConsoleAd.prototype.getMasterControllerDeviceId = function() {
  return this.getControllerDeviceIds()[0];
};


/**
 * Returns all controller device ids that have loaded your game.
 * @return {Array}
 */
AirConsoleAd.prototype.getControllerDeviceIds = function() {
  var result = [];
  for (var i = AirConsoleAd.SCREEN + 1; i < this.devices.length; ++i) {
    if (this.devices[i]) {
      result.push(i);
    }
  }
  return result;
};

/**
 * Gets the custom ad state of a device.
 * @param {number|undefined} device_id - The device ID of which you want the
 *                                       custom state. Default is this device.
 * @return {Object|undefined} The custom ad state previously set by the device.
 */
AirConsoleAd.prototype.getCustomAdState = function(device_id) {
  if (device_id === undefined) {
    device_id = this.device_id;
  }
  var device_data = this.devices[device_id];
  if (device_data && device_data["ad"]) {
    return device_data["ad"]["custom"];
  }
};


/**
 * Sets the custom DeviceState of this device.
 * @param {Object} data - The custom data to set.
 */
AirConsoleAd.prototype.setCustomAdState = function(data) {
  if (this.device_id !== undefined) {
    if (this.devices[this.device_id].ad) {
      this.devices[this.device_id].ad = {}
    }
    this.devices[this.device_id].ad["custom"] = data;
    this.set_("adcustom", data);
  }
};


/**
 * Sets a property in the custom DeviceState of this device.
 * @param {String} key - The property name.
 * @param {mixed} value - The property value.
 */
AirConsoleAd.prototype.setCustomAdStateProperty = function(key, value) {
  if (this.device_id !== undefined) {
    var state = this.getCustomAdState();
    if (state === undefined) {
      state = {};
    } else if (typeof state !== "object") {
      throw "Custom AdState needs to be of type object";
    }
    state[key] = value;
    this.setCustomAdState(state);
  }
};


/**
 * Request that all devices return to the AirConsoleAd.store.
 */
AirConsoleAd.prototype.navigateHome = function() {
  this.set_("home", true);
};

/**
 * Request that all devices load a game by url.
 */
AirConsoleAd.prototype.navigateTo = function(url) {
  this.set_("home", url);
};

/**
 * Opens url in external (default-system) browser. Call this method instead of
 * calling window.open. In-App it will open the system's default browser.
 * @param {stirng} url - The url to open
 */
AirConsoleAd.prototype.openExternal = function(url) {
  if (this.external_url) {
    this.set_("external_url", url);
  } else {
    window.open(url);
  }
};

/**
 * Shows or hides the default UI.
 * @param {boolean} visible - Whether to show or hide the default UI.
 */
AirConsoleAd.prototype.showDefaultUI = function(visible) {
  this.set_("default_ui", visible);
};

/**
 * Returns true if a user is logged in.
 * @param {number|undefined} device_id - The device_id of the user.
 *                                       Default is this device.
 * @returns {boolean}
 */
AirConsoleAd.prototype.isUserLoggedIn = function(device_id) {
  if (device_id == undefined) {
    device_id = this.device_id;
  }
  var data = this.devices[device_id];
  if (data) {
    return data.auth;
  }
}

/**
 * Lets the user change his nickname, profile picture and email address.
 * If you need a real nickname of the user, use this function.
 * onDeviceProfileChange will be called if the user logs in.
 */
AirConsoleAd.prototype.editProfile = function() {
  this.set_("login", true);
};

/**
 * Requests that AirConsoleAd.returns to the game.
 * Can only be called by the AirConsoleAd.SCREEN.
 */
AirConsoleAd.prototype.adComplete = function() {
  if (this.device_id != AirConsoleAd.SCREEN) {
    throw "Only the AirConsoleAd.SCREEN can call showAd!";
  }
  this.set_("ad", false);
};

/* --------------------- ONLY PRIVATE FUNCTIONS BELLOW --------------------- */

/**
 * Initializes the AirConsoleAd.
 * @param {AirConsoleAd.Config} opts - The Config.
 * @private
 */
AirConsoleAd.prototype.init_ = function(opts) {
  opts = opts || {};
  var me = this;
  window.addEventListener('error', function(e) {
    var stack = undefined;
    if (e.error && e.error.stack) {
      stack = e.error.stack;
    }
    me.postMessage_({
                      "action": "jserror",
                      "url": document.location.href,
                      "exception": {
                        "message": e.message,
                        "error": {
                          "stack": stack
                        },
                        "filename": e.filename,
                        "lineno": e.lineno,
                        "colno": e.colno
                      }
                    });
  });
  me.version = "1.0";
  me.devices = [];
  window.addEventListener(
      "message",
      function (event) {
        var data = event.data;
        if (data.action == "admessage") {
          if (me.device_id !== undefined) {
            me.onMessage(data.from, data.data);
          }
        } else if (data.action == "update") {
          if (me.device_id !== undefined) {
            var connect_before = (me.devices[data.device_id] &&
                me.devices[data.device_id].ad &&
                me.devices[data.device_id].ad.loaded);
            var connect = !me.devices[data.device_id] && data.device_data;
            var disconnect = me.devices[data.device_id] && !data.device_data;
            me.devices[data.device_id] = data.device_data;
            var connect = (!connect_before &&  me.devices[data.device_id] &&
                me.devices[data.device_id].ad &&
                me.devices[data.device_id].ad.loaded);
            me.onDeviceStateChange(data.device_id, data.device_data);
            if (connect) {
              me.onConnect(data.device_id);
            } else if (disconnect) {
              me.onDisconnect(data.device_id);
            } else if (data.device_data &&
                data.device_data._is_ad_custom_update) {
              me.onCustomAdStateChange(data.device_id,
                                           data.device_data.custom);
            } else if (data.device_data &&
                data.device_data._is_profile_update) {
              me.onDeviceProfileChange(data.device_id);
            }
          }
        } else if (data.action == "adready") {
          me.device_id = data.device_id;
          me.devices = data.devices;
          me.client  = data.client;
          me.external_url  = data.client ? data.client.external_url : false;
          me.onReady(data.code);
          for (var i = 0; i < me.devices.length; ++i) {
            if (i != me.getDeviceId() && me.devices[i]) {
              me.onConnect(i);
              var custom_state = me.getCustomAdState(i);
              if (custom_state !== undefined) {
                me.onCustomAdStateChange(i, custom_state);
              }
            }
          }
        } else if (data.action == "profile") {
          if (me.device_id) {
            var state = me.devices[me.device_id];
            state["auth"] = data.auth;
            state["nickname"] = data.nickname;
            state["picture"] = data.picture;
            me.onDeviceStateChange(me.device_id, state);
            me.onDeviceProfileChange(me.device_id);
          }
        }
      },
      false);
  if (opts.setup_document !== false) {
    this.setupDocument_();
  }
  this.postMessage_({
                      action: "adready",
                      version: me.version,
                      location: document.location.href
                    });
}

/**
 * Posts a message to the parent window.
 * @private
 * @param {Object} data - the data to be sent to the parent window.
 */
AirConsoleAd.prototype.postMessage_ = function(data) {
  try {
    window.parent.postMessage(data, document.referrer);
  } catch(e) {
    console.log("Posting message to parent failed: " + JSON.stringify(data));
  }
};


/**
 * Sets a variable in the external AirConsoleAd.framework.
 * @private
 * @param {string} key - The key to set.
 * @param {serializable} value - The value to set.
 */
AirConsoleAd.prototype.set_ = function(key, value) {
  this.postMessage_({ action: "set", key: key, value: value });
};


/**
 * Adds default css rules to documents so nothing is selectable, zoom is
 * fixed to 1 and preventing scrolling down (iOS 8 clients drop out of
 * fullscreen when scrolling).
 * @private
 */
AirConsoleAd.prototype.setupDocument_ = function() {
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

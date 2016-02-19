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
 * @property {number|undefined} device_motion - If set, onDeviceMotion gets
 *           called every "device_motion" milliseconds with data from the
 *           accelerometer and the gyroscope. Recommended value: 100.
 *           Only for controllers.
 */
/**
 * Your gateway object to AirConsole.
 * There are getter and setter functions for all properties.
 * Do not access properties of this object directly.
 * @constructor
 * @param {AirConsole~Config} opts - Constructor config.
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
 * @param device_id {number|undefined} - The device ID to send the message to.
 *                                       If "device_id" is undefined, the
 *                                       message is sent to all devices (except
 *                                       this one).
 * @param data
 */
AirConsole.prototype.message = function(device_id, data) {
  if (this.device_id !== undefined) {
    this.postMessage_({ action: "message", to: device_id, data: data });
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
 * Gets called when a message is received from another device
 * that called message() or broadcast().
 * If you dont want to parse messages yourself and prefer an event driven
 * approach, have a look at http://github.com/AirConsole/airconsole-events/
 * @abstract
 * @param {number} device_id - The device ID that sent the message.
 * @param {serializable} data - The data that was sent.
 */
AirConsole.prototype.onMessage = function(device_id, data) {};


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
 * Gets called when a device updates it's profile pic, nickname or email.
 * @abstract
 * @param {number} device_id - The device_id that changed its profile.
 */
AirConsole.prototype.onDeviceProfileChange = function(device_id) {};


/**
 * Gets called when a device joins/leaves a game session or updates its
 * DeviceState (custom DeviceState, profile pic, nickname, internal state).
 * This is function is also called every time onConnect, onDisconnect or
 * onCustomDeviceStateChange, onDeviceProfileChange is called.
 * It's like their root function.
 * @abstract
 * @param {number} device_id - the device_id that changed its DeviceState.
 * @param user_data {AirConsole~DeviceState} - the data of that device.
 *        If undefined, the device has left.
 */
AirConsole.prototype.onDeviceStateChange = function(device_id, device_data) {};


/**
 * Gets called if the request of requestEmailAddress() was granted.
 * For privacy reasons, you need to whitelist your game in order to receive
 * the email address of the user. To whitelist your game, contact
 * developers@airconsole.com. For development purposes, localhost is always
 * allowed.
 * @abstract
 * @param {string|undefined} email_address - The email address of the user if
 *        it was set.
 */
AirConsole.prototype.onEmailAddress = function(email_address) {};

/**
 * Gets called every X milliseconds with device motion data iff the
 * AirConsole was instantiated with the "device_motion" opts set to the
 * interval in milliseconds. Only works for controllers.
 * Note: Some browsers do not allow games to access accelerometer and gyroscope
 *       in an iframe (your game). So use this method if you need gyroscope
 *       or accelerometer data.
 * @abstract
 * @param {object} data - data.x, data.y, data.z for accelerometer
 *                        data.alpha, data.beta, data.gamma for gyroscope
 */
AirConsole.prototype.onDeviceMotion = function(data) {};


/**
 * Gets called when the screen sets the active players by calling
 * setActivePlayers().
 * @abstract
 * @param {number|undefined} player_number - The player number of this device.
 *                                           Can be undefined if this device
 *                                           is not part of the active players.
 */
AirConsole.prototype.onActivePlayersChange = function(player_number) {};


/**
 * Takes all currently connected controllers and assigns them a player number.
 * Can only be called by the screen. You don't have to use this helper
 * function, but this mechanism is very convenient if you want to know which
 * device is the first player, the second player, the third player ...
 * The assigned player numbers always start with 0 and are consecutive.
 * You can hardcode player numbers, but not device_ids.
 * Once the screen has called setActivePlayers you can get the device_id of
 * the first player by calling convertPlayerNumberToDeviceId(0), the device_id
 * of the second player by calling convertPlayerNumberToDeviceId(1), ...
 * You can also convert device_ids to player numbers by calling
 * convertDeviceIdToPlayerNumber(device_id). You can get all device_ids that
 * are active players by calling getActivePlayerDeviceIds().
 * The screen can call this function every time a game round starts.
 * @param {number} max_players - The maximum number of controllers that should
 *                               get a player number assigned.
 */
AirConsole.prototype.setActivePlayers = function(max_players) {
  if (this.getDeviceId() != AirConsole.SCREEN) {
    throw "Only the AirConsole.SCREEN can set the active players!";
  }
  this.device_id_to_player_cache = undefined;
  var players = this.getControllerDeviceIds();
  if (max_players !== undefined) {
    players = players.slice(0, Math.min(players.length, max_players));
  }
  this.devices[AirConsole.SCREEN]["players"] = players;
  this.set_("players", players);
};


/**
 * Returns an array of device_ids of the active players previously set by the
 * screen by calling setActivePlayers. The first device_id in the array is the
 * first player, the second device_id in the array is the second player, ...
 * @returns {Array}
 */
AirConsole.prototype.getActivePlayerDeviceIds = function() {
  return this.devices[AirConsole.SCREEN]["players"] || [];
}


/**
 * Returns the device_id of a player, if the player is part of the active
 * players previously set by the screen by calling setActivePlayers. If fewer
 * players are in the game than the passed in player_number or the active
 * players have not been set by the screen, this function returns undefined.
 * @param player_number
 * @returns {number|undefined}
 */
AirConsole.prototype.convertPlayerNumberToDeviceId = function(player_number) {
  return this.getActivePlayerDeviceIds()[player_number];
};


/**
 * Returns the player number for a device_id, if the device_id is part of the
 * active players previously set by the screen by calling setActivePlayers.
 * Player numbers are zero based and are consecutive. If the device_id is not
 * part of the active players, this function returns undefined.
 * @param device_id
 * @returns {number|undefined}
 */
AirConsole.prototype.convertDeviceIdToPlayerNumber = function(device_id) {
  if (!this.device_id_to_player_cache) {
    this.device_id_to_player_cache = {};
    var players = this.devices[AirConsole.SCREEN]["players"];
    for (var i = 0; i < players.length; ++i) {
      this.device_id_to_player_cache[players[i]] = i;
    }
  }
  return this.device_id_to_player_cache[device_id];
};


/**
 * Returns the device_id of this device.
 * Every device in an AirConsole session has a device_id.
 * The screen always has device_id 0. You can use the AirConsole.SCREEN
 * constant instead of 0.
 * All controllers also get a device_id. You can NOT assume that the device_ids
 * of controllers are consecutive or that they start at 1.
 *
 * DO NOT HARDCODE CONTROLLER DEVICE IDS!
 *
 * If you want to have a logic with "players numbers" (Player 0, Player 1,
 * Player 2, Player 3) use the setActivePlayers helper function! You can
 * hardcode player numbers, but not device_ids.
 *
 * Within an AirConsole session, devices keep the same device_id when they
 * disconnect and reconnect. Different controllers will never get the same
 * device_id in a session. Every device_id remains reserved for the device that
 * originally got it.
 *
 * For more info read
 * http:// developers.airconsole.com/#/guides/device_ids_and_states
 *
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
 * Returns the nickname of a user.
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
AirConsole.prototype.getProfilePicture = function(device_id, size) {
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
 * device. This function can only be called if the AirConsole was instantiated
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
 * Requests the email address of this device and calls onEmailAddress iff the
 * request was granted. For privacy reasons, you need to whitelist your
 * game in order to receive the email address of the user. To whitelist your
 * game, contact developers@airconsole.com. For development purposes, localhost
 * is always allowed.
 */
AirConsole.prototype.requestEmailAddress = function() {
  this.set_("email", true);
};

/**
 * Returns true if a user is logged in.
 * @param {number|undefined} device_id - The device_id of the user.
 *                                       Default is this device.
 * @returns {boolean}
 */
AirConsole.prototype.isUserLoggedIn = function(device_id) {
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
AirConsole.prototype.editProfile = function() {
  this.set_("login", true);
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
  me.version = "1.3.0";
  me.devices = [];
  me.server_time_offset = opts.synchronize_time ? 0 : false;
  window.addEventListener(
      "message",
      function (event) {
        var data = event.data;
        var game_url = me.getGameUrl_(document.location.href);
        if (data.action == "device_motion") {
          me.onDeviceMotion(data.data);
        } else if (data.action == "message") {
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
            } else if (data.device_data &&
                data.device_data._is_players_update &&
                game_url_after == game_url) {
              me.device_id_to_player_cache = null;
              me.onActivePlayersChange(me.convertDeviceIdToPlayerNumber(
                  me.getDeviceId()));
            } else if (data.device_data &&
                data.device_data._is_profile_update &&
                game_url_after == game_url) {
              me.onDeviceProfileChange(data.device_id);
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
            if (i != me.getDeviceId() && me.devices[i] &&
                me.getGameUrl_(me.devices[i].location) == game_url) {
              me.onConnect(i);
              var custom_state = me.getCustomDeviceState(i);
              if (custom_state !== undefined) {
                me.onCustomDeviceStateChange(i, custom_state);
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
        } else if (data.action == "email") {
          me.onEmailAddress(data.email);
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
    device_motion: opts.device_motion,
    synchronize_time: opts.synchronize_time,
    location: document.location.href
  });
}


/**
 * @private
 * @param {String} url - A url.
 * @return {String} Returns the root game url over http.
 */
AirConsole.prototype.getGameUrl_ = function(url) {
  if (!url) {
    return;
  }
  url = url.split("#")[0];
  url = url.split("?")[0];
  if (url.indexOf("screen.html", url.length - 11) !== -1) {
    url = url.substr(0, url.length - 11);
  }
  if (url.indexOf("controller.html", url.length - 15) !== -1) {
    url = url.substr(0, url.length - 15);
  }
  if (url.indexOf("https://") == 0)  {
    url = "http://" + url.substr(8);
  }
  return url;
};

/**
 * Posts a message to the parent window.
 * @private
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
 * Sets a variable in the external AirConsole framework.
 * @private
 * @param {string} key - The key to set.
 * @param {serializable} value - The value to set.
 */
AirConsole.prototype.set_ = function(key, value) {
  this.postMessage_({ action: "set", key: key, value: value });
};


/**
 * Adds default css rules to documents so nothing is selectable, zoom is
 * fixed to 1 and preventing scrolling down (iOS 8 clients drop out of
 * fullscreen when scrolling).
 * @private
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

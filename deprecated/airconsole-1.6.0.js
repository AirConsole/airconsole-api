/**
 * AirConsole.
 * @copyright 2016 by N-Dream AG, Switzerland. All rights reserved.
 * @version 1.6.0
 *
 * IMPORTANT:
 * @see http://developers.airconsole.com/ for API documentation
 *
 * This file is grouped into the following chapters:
 * - Constants: Constants you should use
 * - Connectivity: Device Ids, connects and disconnects
 * - Messaging: Sending messages between devices
 * - Device States: Setting data for a device that is readable for all devices
 * - Profile data: User profile data, including nicknames and profile pictures
 * - Active players: Setting a couple of devices as active players for a game
 * - Controller Inputs: Special device inputs like device motion
 * - Ads: Showing ads and handling their events
 * - Premium: Handling premium users
 * - Navigation: Changing games and opening external links
 * - User Interface: Changing orientation and look and feel
 * - Persistent Data: Storing data across sessions
 * - High Scores: Storing and retrieving high scores
 *
 * If your prefer an event driven api with .on() .off() and .dispatch()
 * interface instead of sending messages,
 * @see http://github.com/AirConsole/airconsole-events/
 *
 */

/**
 * Your gateway object to AirConsole.
 * There are getter and setter functions for all properties.
 * Do not access properties of this object directly.
 * @constructor
 * @param {AirConsole~Config} opts - Constructor config, see bellow.
 */
function AirConsole(opts) {
  this.init_(opts);
}
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
 *           accelerometer and the gyroscope. Only for controllers.
 */


/** ------------------------------------------------------------------------ *
 * @chapter                         CONSTANTS                                *
 * ------------------------------------------------------------------------- */

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


/** ------------------------------------------------------------------------ *
 * @chapter                     CONNECTIVITY                                 *
 * @see         http://developers.airconsole.com/#!/guides/pong              *
 * ------------------------------------------------------------------------- */

/**
 * Gets called when the game console is ready.
 * This event also fires onConnect for all devices that already are
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
 * @see http:// developers.airconsole.com/#/guides/device_ids_and_states
 *
 * @return {number}
 */
AirConsole.prototype.getDeviceId = function() {
  return this.device_id;
};

/**
 * Returns the device ID of the master controller.
 * In the future, Premium devices are prioritzed.
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

/** ------------------------------------------------------------------------ *
 * @chapter                     MESSAGING                                    *
 * @see         http://developers.airconsole.com/#!/guides/pong              *
 * ------------------------------------------------------------------------- */

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
    AirConsole.postMessage_({ action: "message", to: device_id, data: data });
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
 * Gets called when a message is received from another device
 * that called message() or broadcast().
 * If you dont want to parse messages yourself and prefer an event driven
 * approach, @see http://github.com/AirConsole/airconsole-events/
 * @abstract
 * @param {number} device_id - The device ID that sent the message.
 * @param {serializable} data - The data that was sent.
 */
AirConsole.prototype.onMessage = function(device_id, data) {};


/** ------------------------------------------------------------------------ *
 * @chapter                    DEVICE STATES                                 *
 * @see   http://developers.airconsole.com/#!/guides/device_ids_and_states   *
 * ------------------------------------------------------------------------- */

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
 * Gets called when a device updates it's custom DeviceState
 * by calling setCustomDeviceState or setCustomDeviceStateProperty.
 * Make sure you understand the power of device states:
 * @see http://developers.airconsole.com/#/guides/device_ids_and_states
 * @abstract
 * @param {number} device_id - the device ID that changed its custom
 *                             DeviceState.
 * @param {Object} custom_data - The custom DeviceState data value
 */
AirConsole.prototype.onCustomDeviceStateChange = function(device_id,
                                                          custom_data) {};
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


/** ------------------------------------------------------------------------ *
 * @chapter                       PROFILE                                    *
 * ------------------------------------------------------------------------- */

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
 * @param {number|string|undefined} device_id_or_uid - The device id or uid for
 *                                                     which you want the
 *                                                     profile picture.
 *                                                     Default is the current
 *                                                     user.
 *                                                     Screens don't have
 *                                                     profile pictures.
 * @param {number|undefined} size - The size of in pixels of the picture.
 *                                  Default is 64.
 * @return {string|undefined}
 */
AirConsole.prototype.getProfilePicture = function(device_id_or_uid, size) {
  if (device_id_or_uid === undefined) {
    device_id_or_uid = this.device_id;
  } else if (typeof device_id_or_uid == "string") {
    return "https://www.airconsole.com/api/profile-picture?uid=" +
        device_id_or_uid + "&size=" + (size||64);
  }
  var device_data = this.devices[device_id_or_uid];
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
 * Gets called when a device updates it's profile pic, nickname or email.
 * @abstract
 * @param {number} device_id - The device_id that changed its profile.
 */
AirConsole.prototype.onDeviceProfileChange = function(device_id) {};

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
 * Lets the user change his nickname, profile picture and email address.
 * If you need a real nickname of the user, use this function.
 * onDeviceProfileChange will be called if the user logs in.
 */
AirConsole.prototype.editProfile = function() {
  this.set_("login", true);
};


/** ------------------------------------------------------------------------ *
 * @chapter                   ACTIVE PLAYERS                                 *
 * @see   http://developers.airconsole.com/#!/guides/device_ids_and_states   *
 * ------------------------------------------------------------------------- */

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
 * Gets called when the screen sets the active players by calling
 * setActivePlayers().
 * @abstract
 * @param {number|undefined} player_number - The player number of this device.
 *                                           Can be undefined if this device
 *                                           is not part of the active players.
 */
AirConsole.prototype.onActivePlayersChange = function(player_number) {};

/**
 * Returns an array of device_ids of the active players previously set by the
 * screen by calling setActivePlayers. The first device_id in the array is the
 * first player, the second device_id in the array is the second player, ...
 * @returns {Array}
 */
AirConsole.prototype.getActivePlayerDeviceIds = function() {
  return this.devices[AirConsole.SCREEN]["players"] || [];
};

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
  if (!this.devices[AirConsole.SCREEN] ||
      !this.devices[AirConsole.SCREEN]["players"]) {
    return;
  }
  if (!this.device_id_to_player_cache) {
    this.device_id_to_player_cache = {};
    var players = this.devices[AirConsole.SCREEN]["players"];
    for (var i = 0; i < players.length; ++i) {
      this.device_id_to_player_cache[players[i]] = i;
    }
  }
  return this.device_id_to_player_cache[device_id];
};


/** ------------------------------------------------------------------------ *
 * @chapter                 CONTROLLER INPUTS                                *
 * ------------------------------------------------------------------------- */

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
 * Vibrates the device for a specific amount of time. Only works for controllers.
 * Note: iOS ignores the specified time and vibrates for a pre-set amount of time.
 * @param {Number} time - Milliseconds to vibrate the device
 */
AirConsole.prototype.vibrate = function(time) {
  this.set_("vibrate", time);
};

/** ------------------------------------------------------------------------ *
 * @chapter                          ADS                                     *
 * ------------------------------------------------------------------------- */

/**
 * Requests that AirConsole shows a multiscreen advertisment.
 * Can only be called by the AirConsole.SCREEN.
 * onAdShow is called on all connected devices if an advertisement
 * is shown (in this event please mute all sounds).
 * onAdComplete is called on all connected devices when the
 * advertisement is complete or no advertisement was shown.
 */
AirConsole.prototype.showAd = function() {
  if (this.device_id != AirConsole.SCREEN) {
    throw "Only the AirConsole.SCREEN can call showAd!";
  }
  this.set_("ad", true);
};

/**
 * Gets called if a fullscreen advertisement is shown on this screen.
 * In case this event gets called, please mute all sounds.
 * @abstract
 */
AirConsole.prototype.onAdShow = function() {};

/**
 * Gets called when an advertisement is finished or no advertisement was shown.
 * @abstract
 * @param {boolean} ad_was_shown - True iff an ad was shown and onAdShow was
 *                                 called.
 */
AirConsole.prototype.onAdComplete = function(ad_was_shown) {};


/** ------------------------------------------------------------------------ *
 * @chapter                       PREMIUM                                    *
 * ------------------------------------------------------------------------- */

/**
 * Returns true if the device is premium
 * @param {number} device_id - The device_id that should be checked.
 *                             Only controllers can be premium.
 *                             Default is this device.
 * @return {boolean|undefined} Returns true or false for a valid device_id and
 *                             undefined if the device_id is not valid.
 *
 */
AirConsole.prototype.isPremium = function(device_id) {
  if (device_id === undefined) {
    device_id = this.device_id;
  }
  var device_data = this.devices[device_id];
  if (device_data && device_id != AirConsole.SCREEN) {
    return !!device_data.premium;
  }
};

/**
 * Returns all device ids that are premium.
 * @return {Array<number>}
 */
AirConsole.prototype.getPremiumDeviceIds = function() {
  var premium = [];
  for (var i = 1; i < this.devices.length; ++i) {
    if (this.isPremium(i)) {
      premium.push(i);
    }
  }
  return premium;
};

/**
 * Offers the user to become a premium member.
 * Can only be called from controllers.
 * If you call getPremium in development mode, the device becomes premium
 * immediately.
 */
AirConsole.prototype.getPremium = function() {
  this.set_("premium", true);
};

/**
 * Gets called when a device becomes premium or when a premium device connects.
 * @abstract
 * @param {number} device_id - The device id of the premium device.
 */
AirConsole.prototype.onPremium = function(device_id) {};


/** ------------------------------------------------------------------------ *
 * @chapter                       NAVIGATION                                 *
 * ------------------------------------------------------------------------- */

/**
 * Request that all devices return to the AirConsole store.
 */
AirConsole.prototype.navigateHome = function() {
  this.set_("home", true);
};

/**
 * Request that all devices load a game by url.
 * @param {string} url - The base url of the game to navigate to
 *                       (excluding screen.html or controller.html).
 */
AirConsole.prototype.navigateTo = function(url) {
  this.set_("home", url);
};

/**
 * Opens url in external (default-system) browser. Call this method instead of
 * calling window.open. In-App it will open the system's default browser.
 * Because of Safari iOS you can only use it with the onclick handler:
 * <div onclick="airconsole.openExternalUrl('my-url.com');">Open browser</div>
 * OR in JS with assigning element.onclick.
 * @param {string} url - The url to open
 */
AirConsole.prototype.openExternalUrl = function(url) {
  var data = this.devices[this.device_id];
  if (data.client && data.client.pass_external_url === true) {
    this.set_("pass_external_url", url);
  } else {
    window.open(url);
  }
};


/** ------------------------------------------------------------------------ *
 * @chapter                     USER INTERFACE                               *
 * ------------------------------------------------------------------------- */

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


/** ------------------------------------------------------------------------ *
 * @chapter                     PERSISTENT DATA                              *
 * ------------------------------------------------------------------------- */

/**
 * Requests persistent data from the servers.
 * @param {Array<String>|undefined} uids - The uids for which you would like
 *                                         to request the persistent data.
 *                                         Default is the uid of this device.
 */
AirConsole.prototype.requestPersistentData = function(uids) {
  if (!uids) {
    uids = [this.getUID()];
  }
  this.set_("persistentrequest", {"uids": uids})
};

/**
 * Gets called when persistent data was loaded from requestPersistentData().
 * @abstract
 * @param {Object} data - An object mapping uids to all key value pairs.
 */
AirConsole.prototype.onPersistentDataLoaded = function(data) {};

/**
 * Stores a key-value pair persistently on the AirConsole servers.
 * Storage is per game. Total storage can not exceed 1 MB per game and uid.
 * Storage is public, not secure and anyone can request and tamper with it.
 * Do not store sensitive data.
 * @param {String} key - The key of the data entry.
 * @param {mixed} value - The value of the data entry.
 * @param {String|undefiend} uid - The uid for which the data should be stored.
 *                                 Default is the uid of this device.
 */
AirConsole.prototype.storePersistentData = function(key, value, uid) {
  if (!uid) {
    uid = this.getUID();
  }
  this.set_("persistentstore", {"key": key, "value": value, "uid": uid});
};

/**
 * Gets called when persistent data was stored from storePersistentData().
 * @abstract
 * @param {String} uid - The uid for which the data was stored.
 */
AirConsole.prototype.onPersistentDataStored = function(uid) {};


/** ------------------------------------------------------------------------ *
 * @chapter                      HIGH SCORES                                 *
 * @see       http://developers.airconsole.com/#!/guides/highscore           *
 * ------------------------------------------------------------------------- */

/**
 * Stores a high score of the current user on the AirConsole servers.
 * High Scores are public, not secure and anyone can request and tamper with
 * them. Do not store sensitive data. Only updates the high score if it was a
 * higher or same score. Calls onHighScoreStored when the request is done.
 * We highly recommend to read the High Score guide (developers.airconsole.com)
 * @param {String} level_name - The name of the level the user was playing.
 *                              This should be a human readable string because
 *                              it appears in the high score sharing image.
 *                              You can also just pass an empty string.
 * @param {String} level_version - The version of the level the user was
 *                                 playing. This is for your internal use.
 * @param {number} score - The score the user has achieved
 * @param {String|Array<String>|undefined} uid - The UIDs of the users that
 *                                               achieved the high score.
 *                                               Can be a single uid or an
 *                                               array of uids. Default is the
 *                                               uid of this device.
 * @param {mixed|undefined} data - Custom high score data (e.g. can be used to
 *                                 implement Ghost modes or include data to
 *                                 verify that it is not a fake high score).
 * @param {String|undefined} score_string - A short human readable
 *                                          representation of the score.
 *                                          (e.g. "4 points in 3s").
 *                                          Defaults to "X points" where x is
 *                                          the score converted to an integer.
 */
AirConsole.prototype.storeHighScore = function(level_name, level_version,
                                               score, uid, data,
                                               score_string) {
  if (score == NaN || typeof score != "number") {
    throw "Score needs to be a number and not NaN!"
  }
  if (!uid) {
    uid = this.getUID();
  }
  if (uid.constructor == Array) {
    uid = uid.join("|");
  }
  this.set_("highscore",
            {
              "uid": uid,
              "level_name": level_name,
              "level_version": level_version,
              "score": score,
              "data": data,
              "score_string": score_string
            });
};

/**
 * Gets called when a high score was successfully stored.
 * We highly recommend to read the High Score guide (developers.airconsole.com)
 * @param {AirConsole~HighScore|null} high_score - The stored high score if
 *                                                 it is a new best for the
 *                                                 user or else null.
 *                                                 Ranks include "world",
 *                                                 "country", "region", "city"
 *                                                 if a high score is passed.
 */
AirConsole.prototype.onHighScoreStored = function(high_score) {};

/**
 * Requests high score data of players (including global high scores and
 * friends). Will call onHighScores when data was received.
 * We highly recommend to read the High Score guide (developers.airconsole.com)
 * @param {String} level_name - The name of the level
 * @param {String} level_version - The version of the level
 * @param {Array<String>|undefined} uids - An array of UIDs of the users that
 *                                         should be included in the result.
 *                                         Default is all connected controllers
 * @param {Array<String>|undefined} ranks - An array of high score rank types.
 *                                          High score rank types can include
 *                                          data from across the world, only a
 *                                          specific area or a users friends.
 *                                          Valid array entries are "world",
 *                                          "country",  "region", "city",
 *                                          "friends".
 *                                          Default is ["world"].
 * @param {number|undefined} total - Amount of high scores to return per rank
 *                                   type. Default is 8.
 * @param {number|undefined} top - Amount of top high scores to return per rank
 *                                 type. top is part of total. Default is 5.
 */
AirConsole.prototype.requestHighScores = function(level_name, level_version,
                                                  uids, ranks, total, top) {
  if (!ranks) {
    ranks = ["world"];
  }
  if (!uids) {
    uids = [];
    var device_ids = this.getControllerDeviceIds();
    for (var i = 0; i < device_ids.length; ++i) {
      uids.push(this.getUID(device_ids[i]));
    }
  }
  if (total == undefined) {
    total = 8;
  }
  if (top == undefined) {
    top = 5;
  }
  this.set_("highscores",
            {
              "level_name": level_name,
              "level_version": level_version,
              "uids": uids,
              "ranks": ranks,
              "total": total,
              "top": top
            });
};

/**
 * Gets called when high scores are returned after calling requestHighScores.
 * We highly recommend to read the High Score guide (developers.airconsole.com)
 * @param {Array<AirConsole~HighScore>} high_scores - The high scores.
 */
AirConsole.prototype.onHighScores = function(high_scores) {};

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

/**
 * HighScore contains information about a users high score
 * We highly recommend to read the High Score guide (developers.airconsole.com)
 * @typedef {object} AirConsole~HighScore
 * @property {String} level_name - The name of the level the user was playing
 * @property {String} level_version - The version of the level the user was
 *                                    playing
 * @property {number} score - The score the user has achieved
 * @property {String} score_string - A human readable version of score.
 * @property {Object} ranks - A dictionary of rank type to actual rank.
 * @property {mixed} data - Custom High Score data. Can be used to implement
 *                          Ghost modes or to verify that it is not a fake
 *                          high score.
 * @property {String} uids - The unique ID of the users that achieved the
 *                           high score.
 * @property {number} timestamp - The timestamp of the high score
 * @property {String} nicknames - The nicknames of the users
 * @property {String} relationship - How the user relates to the current user
 *                                 - "requested" (a user which was requested)
 *                                 - "airconsole" (played AirConsole together)
 *                                 - "facebook" (a facebook friend)
 *                                 - "other" (about same skill level)
 * @property {String} location_country_code - The iso3166 country code
 * @property {String} location_country_name - The name of the country
 * @property {String} location_region_code - The iso3166 region code
 * @property {String} location_region_name - The name of the region
 * @property {String} location_city_name - The name of the city
 * @property {String} share_url - The URL that should be used to share this
 *                                high score.
 * @property {String} share_image - The URL to an image that displays this
 *                                  high score.
 */


/** ------------------------------------------------------------------------ *
 *                   ONLY PRIVATE FUNCTIONS BELLOW                           *
 * ------------------------------------------------------------------------- */

/**
 * Initializes the AirConsole.
 * @param {AirConsole~Config} opts - The Config.
 * @private
 */
AirConsole.prototype.init_ = function(opts) {
  opts = opts || {};
  var me = this;
  me.version = "1.6.0";
  me.devices = [];
  me.server_time_offset = opts.synchronize_time ? 0 : false;
  window.addEventListener("message", function(event) {
    me.onPostMessage_(event);
  }, false);
  this.set_("orientation", opts.orientation);
  if (opts.setup_document !== false) {
    this.setupDocument_();
  }
  AirConsole.postMessage_({
                            action: "ready",
                            version: me.version,
                            device_motion: opts.device_motion,
                            synchronize_time: opts.synchronize_time,
                            location: document.location.href
                          });
};

/**
 * Handling onMessage events
 * @private
 * @param {Event} event - Event object
 */
AirConsole.prototype.onPostMessage_ = function(event) {
  var me = this;
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
      var is_connect = (game_url_before != game_url &&
                        game_url_after == game_url);
      if (is_connect) {
        me.onConnect(data.device_id);
        if (me.device_id === 0 && me.devices[data.device_id].experiments && me.devices[data.device_id].experiments['debug'] === 'js' && !me.injected_chii) {
          me.injected_chii = true;
          document.title = me.devices[data.device_id].nickname + ': ' + me.devices[0].client.app + ' Game: ' + document.title;
          var script = document.createElement('script');
          script.setAttribute('src','https://debug.airconsole.com/target.js');
          document.head.appendChild(script);
        }
      } else if (game_url_before == game_url &&
                 game_url_after != game_url) {
        me.onDisconnect(data.device_id);
      }
      if (data.device_data) {
        if ((data.device_data._is_custom_update &&
             game_url_after == game_url) ||
            (is_connect && data.device_data.custom)) {
          me.onCustomDeviceStateChange(data.device_id,
                                       data.device_data.custom);
        }
        if ((data.device_data._is_players_update &&
             game_url_after == game_url) ||
            (data.device_id == AirConsole.SCREEN &&
             data.device_data.players && is_connect)) {
          me.device_id_to_player_cache = null;
          me.onActivePlayersChange(me.convertDeviceIdToPlayerNumber(
              me.getDeviceId()));
        }
        if (data.device_data.premium &&
            (data.device_data._is_premium_update || is_connect)) {
          me.onPremium(data.device_id);
        }
        if (data.device_data._is_profile_update) {
          me.onDeviceProfileChange(data.device_id);
        }
      }
    }
  } else if (data.action == "ready") {
    me.device_id = data.device_id;
    me.devices = data.devices;
    if (me.server_time_offset !== false) {
      me.server_time_offset = data.server_time_offset || 0;
    }
    me.onReady(data.code);
    var client = me.devices[data.device_id].client;
    me.bindTouchFix_(client);
    var game_url = me.getGameUrl_(document.location.href);
    for (var i = 0; i < me.devices.length; ++i) {
      if (me.devices[i] &&
          me.getGameUrl_(me.devices[i].location) == game_url) {
        if (i != me.getDeviceId()) {
          me.onConnect(i);
          var custom_state = me.getCustomDeviceState(i);
          if (custom_state !== undefined) {
            me.onCustomDeviceStateChange(i, custom_state);
          }
          if (i == AirConsole.SCREEN && me.devices[i].players) {
            me.device_id_to_player_cache = null;
            me.onActivePlayersChange(me.convertDeviceIdToPlayerNumber(
                me.getDeviceId()));
          }
        }
        if (me.isPremium(i)) {
          me.onPremium(i);
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
  } else if (data.action == "ad") {
    if (data.complete == undefined) {
      me.onAdShow();
    } else {
      me.onAdComplete(data.complete);
    }
  } else if (data.action == "highscores") {
    me.onHighScores(data.highscores);
  } else if (data.action == "highscore") {
    me.onHighScoreStored(data.highscore);
  } else if (data.action == "persistentstore") {
    me.onPersistentDataStored(data.uid);
  } else if (data.action == "persistentrequest") {
    me.onPersistentDataLoaded(data.data);
  } else if (data.action == "premium") {
    me.devices[data.device_id].premium = true;
    me.onPremium(data.device_id);
  }
};

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
AirConsole.postMessage_ = function(data) {
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
  AirConsole.postMessage_({ action: "set", key: key, value: value });
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
  }, {passive: false });
  if (navigator.userAgent.indexOf("Windows Phone ") != -1 &&
      navigator.userAgent.indexOf("Edge/") != -1) {
    document.oncontextmenu = document.body.oncontextmenu = function () {
      return false;
    }
  }
};

/**
 * Fixes delay in touchstart in crosswalk by calling preventDefault.
 * @param {Object} client - The client object
 * @private
 */
AirConsole.prototype.bindTouchFix_ = function(client) {
  // This fix is only necessary for Android Crosswalk
  if (navigator.userAgent.match(/Android/) &&
      client && client.app === "intel-xdk" &&
      client.version <= 2.3) {
    document.addEventListener('touchstart', function(e) {
      var els = ['DIV', 'IMG', 'SPAN', 'BODY', 'TD', 'TH', 'CANVAS', 'P', 'B',
        'CENTER', 'EM', 'FONT', 'H1', 'H2', 'H3', 'H4',
        'H5', 'H6', 'HR', 'I', 'LI', 'PRE', 'SMALL', 'STRONG', 'U'];
      if (els.indexOf(e.target.nodeName) != -1) {
        // Check if one of the parent elements is a link
        var parent = e.target.parentNode;
        while (parent && parent.nodeName != "BODY") {
          if (parent.nodeName == "A") {
            return;
          }
          parent = parent.parentNode;
        }
        e.preventDefault();
        setTimeout(function() {
          e.target.click();
        }, 200);
      }
    });
  }
};

window.addEventListener('error', function(e) {
  var stack = undefined;
  if (e.error && e.error.stack) {
    stack = e.error.stack;
  }
  AirConsole.postMessage_({
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

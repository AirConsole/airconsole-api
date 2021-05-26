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
 * @typedef {object} AirConsoleAd~Config
 * @property {boolean|undefiend} setup_document - Sets up the document so
 *           nothing is selectable, zoom is fixed to 1 and scrolling is
 *           disabled (iOS 8 clients drop out of fullscreen when scrolling).
 *           Default: true
 * @property {boolean} translation - If an AirConsole translation file should
 *           be loaded. Default: false
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
    AirConsoleAd.postMessage_(
        { action: "admessage", to: device_id, data: data });
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
  var premium_ids = this.getPremiumDeviceIds();
  if (premium_ids.length) {
    return premium_ids[0];
  } else  {
    return this.getControllerDeviceIds()[0];
  }
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
 * Because of Safari iOS you can only use it with the onclick handler:
 * <div onclick="airconsole.openExternalUrl('my-url.com');">Open new window</div>
 * OR in JS with assigning element.onclick.
 * @param {stirng} url - The url to open
 */
AirConsoleAd.prototype.openExternalUrl = function(url) {
  var data = this.devices[this.device_id];
  if (data.client && data.client.pass_external_url === true) {
    this.set_("pass_external_url", url);
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
 * Requests the email address of this device and calls onEmailAddress iff the
 * request was granted. For privacy reasons, you need to whitelist your
 * game in order to receive the email address of the user. To whitelist your
 * game, contact developers@airconsole.com. For development purposes, localhost
 * is always allowed.
 */
AirConsoleAd.prototype.requestEmailAddress = function() {
  this.set_("ademail", true);
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
 AirConsoleAd.prototype.onEmailAddress = function(email_address) {};

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

/**
 * Gets called when persistent data was stored from storePersistentData().
 * @abstract
 * @param {String} uid - The uid for which the data was stored.
 */
AirConsoleAd.prototype.onPersistentDataStored = function(uid) {};

/**
 * Gets called when persistent data was loaded from requestPersistentData().
 * @abstract
 * @param {Object} data - An object mapping uids to all key value pairs.
 */
AirConsoleAd.prototype.onPersistentDataLoaded = function(data) {};

/**
 * Requests persistent data from the servers.
 * @param {Array<String>|undefined} uids - The uids for which you would like
 *                                         to request the persistent data.
 *                                         Default is the uid of this device.
 */
AirConsoleAd.prototype.requestPersistentData = function(uids) {
  if (!uids) {
    uids = [this.getUID()];
  }
  this.set_("adpersistentrequest", {"uids": uids})
};

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
AirConsoleAd.prototype.storePersistentData = function(key, value, uid) {
  if (!uid) {
    uid = this.getUID();
  }
  this.set_("adpersistentstore", {"key": key, "value": value, "uid": uid});
};

/**
 * Returns true if the device is premium
 * @param {number} device_id - The device_id that should be checked.
 *                             Only controllers can be premium.
 *                             Default is this device.
 * @return {boolean|undefined} Returns true or false for a valid device_id and
 *                             undefined if the device_id is not valid.
 *
 */
AirConsoleAd.prototype.isPremium = function(device_id) {
  if (device_id === undefined) {
    device_id = this.device_id;
  }
  var device_data = this.devices[device_id];
  if (device_data && device_id != AirConsoleAd.SCREEN) {
    return !!device_data.premium;
  }
};

/**
 * Returns all device ids that are premium.
 * @return {Array<number>}
 */
AirConsoleAd.prototype.getPremiumDeviceIds = function() {
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
 * @param {boolean|object} config - True by default. Can be an object to pass down additional config.
 */
AirConsoleAd.prototype.getPremium = function(config) {
  if (config === undefined) {
    config = true;
  }
  this.set_("premium", config);
};

/**
 * Gets called when a device becomes premium or when a premium device connects.
 * @abstract
 * @param {number} device_id - The device id of the premium device.
 */
AirConsoleAd.prototype.onPremium = function(device_id) {};

/**
 * Gets a translation for the users current language
 * See http://developers.airconsole.com/#!/guides/translations
 * @param {String} id - The id of the translation string.
 * @param {Object|undefined} values - Values that should be used for
 *                                    replacement in the translated string.
 *                                    E.g. if a translated string is
 *                                    "Hi %name%" and values is {"name": "Tom"}
 *                                    then this will be replaced to "Hi Tom".
 */
AirConsoleAd.prototype.getTranslation = function(id, values) {
  if (this.translations) {
    if (this.translations[id]) {
      var result = this.translations[id];
      if (values && result) {
        var parts = result.split("%");
        for (var i = 1; i < parts.length; i += 2) {
          if (parts[i].length) {
            parts[i] = values[parts[i]] || "";
          } else {
            parts[i] = "%";
          }
        }
        result = parts.join("");
      }
      return result;
    }
  }
};

/**
 * Returns the current IETF language tag of a device e.g. "en" or "en-US"
 * @param {number|undefined} device_id - The device id for which you want the
 *                                       language. Default is this device.
 * @return {String} IETF language
 */
AirConsoleAd.prototype.getLanguage = function(device_id) {
  if (device_id === undefined) {
    device_id = this.device_id;
  }
  var device_data = this.devices[device_id];
  if (device_data) {
    return device_data.language;
  }
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
            }
            if (data.device_data) {
              if ((data.device_data._is_ad_custom_update ||
                  (connect &&
                  data.device_data["ad"] &&
                  data.device_data["ad"]["custom"]))) {
                me.onCustomAdStateChange(data.device_id,
                                         me.getCustomAdState(data.device_id));
              } else if (data.device_data._is_profile_update) {
                me.onDeviceProfileChange(data.device_id);
              } else if ((data.device_data._is_premium_update || connect) &&
                  data.device_data.premium) {
                me.onPremium(data.device_id);
              }
            }
          }
        } else if (data.action == "adready") {
          me.device_id = data.device_id;
          me.devices = data.devices;
          if (data.translations) {
            me.translations = data.translations;
            var elements = document.querySelectorAll("[data-translation]");
            for (var i = 0; i < elements.length; ++i) {
              elements[i].innerHTML = me.getTranslation(elements[i].getAttribute(
                  "data-translation"));
            }
          }
          me.onReady(data.code);
          for (var i = 0; i < me.devices.length; ++i) {
            if (i != me.getDeviceId() && me.devices[i]) {
              me.onConnect(i);
              var custom_state = me.getCustomAdState(i);
              if (custom_state !== undefined) {
                me.onCustomAdStateChange(i, custom_state);
              }
            }
            if (me.isPremium(i)) {
              me.onPremium(i);
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
        } else if (data.action == "ademail") {
          me.onEmailAddress(data.email);
        } else if (data.action == "adpersistentstore") {
          me.onPersistentDataStored(data.uid);
        } else if (data.action == "adpersistentrequest") {
          me.onPersistentDataLoaded(data.data);
        } else if (data.action == "premium") {
          me.devices[data.device_id].premium = true;
          me.onPremium(data.device_id);
        }
      },
      false);
  if (opts.setup_document !== false) {
    this.setupDocument_();
  }
  AirConsoleAd.postMessage_({
                      action: "adready",
                      version: me.version,
                      location: document.location.href,
                      translation: opts.translation
                    });
}

/**
 * Posts a message to the parent window.
 * @private
 * @param {Object} data - the data to be sent to the parent window.
 */
AirConsoleAd.postMessage_ = function(data) {
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
  AirConsoleAd.postMessage_({ action: "set", key: key, value: value });
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
  }, {passive: false });
  if (navigator.userAgent.indexOf("Windows Phone ") != -1 &&
      navigator.userAgent.indexOf("Edge/") != -1) {
    document.oncontextmenu = document.body.oncontextmenu = function () {
      return false;
    }
  }
};

window.addEventListener('error', function(e) {
  var stack = undefined;
  if (e.error && e.error.stack) {
    stack = e.error.stack;
  }
  AirConsoleAd.postMessage_({
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

window.addEventListener('unhandledrejection', function(e) {
  var stack = undefined;
  if (e.reason && e.reason.stack) {
    stack = e.reason.stack;
  }
  AirConsole.postMessage_({
                            "action": "jserror",
                            "url": document.location.href,
                            "exception": {
                              "message": "Unhandled promise rejection: " + e.reason,
                              "error": {
                                "stack": stack
                              },
                              "filename": "unhandledrejection",
                              "lineno": 0
                            }
                          });
});

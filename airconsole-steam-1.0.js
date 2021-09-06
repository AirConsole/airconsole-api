(function() {
  /** ------------------------------------------------------------------------ *
   * @chapter                     STEAM                                        *
   * @see       http://developers.airconsole.com/#!/guides/steam               *
   * @description Include this api after the airconsole-api. Use it to         *
   *              communicate with the Steam client                            *
   * ------------------------------------------------------------------------- */

   if (!window["AirConsole"]) {
    console.error("AirConsole object not found. Did you forget to include the airconsole api (first)?");
    return;
   }

   /**
    * Returns True if we are on the Screen
    * @return {boolean}
    */
   AirConsole.prototype.isScreen = function() {
    var device_id = this.getDeviceId();
    var device_data = this.devices[this.getDeviceId()];
    return (device_data && this.getDeviceId() === AirConsole.SCREEN);
   };

  /**
   * Queries if the steam user has achieved an achievement. Use the onSteamAchievement() method
   * to listen for the result object { method "request",
   *  achievement <String>, is_achieved <Boolean> }
   * @param {string} achievement - The achievement name as defined in the Steamworkshop
   */
  AirConsole.prototype.getSteamAchievement = function(achievement) {
    if (!this.isScreen()) {
      console.warn("You can call Steam related functions only on the AirConsole Screen");
      return;
    };

    this.set_("steam_api", {
      action: "client_steam_achievement",
      method: "request",
      achievement: achievement
    });
  };

   /**
    * Unlocks an achievement for a steam user. You can listen for its success by using
    * the onSteamAchievement() method "unlock"
    * @param {string} achievement - The achievement name as defined in the Steamworkshop
    */
  AirConsole.prototype.unlockSteamAchievement = function(achievement) {
    if (!this.isScreen()) {
      console.warn("You can call Steam related functions only on the AirConsole Screen");
      return;
    };

    this.set_("steam_api", {
      action: "client_steam_achievement",
      method: "unlock",
      achievement: achievement
    });
  };

  /**
   * Gets called when steam achievement relevant data is requested by
   * unlockSteamAchievement getSteamAchievement. Overwrite this message to use it.
   * @param {object} data - { achievement <String>, method <String>  }
   */
  AirConsole.prototype.onSteamAchievement = function(data) {
    console.log("AirConsole::onSteamAchievement", data);
  };

  // Overwriting the original onPostMessage_ function
  var originalPostMessage = AirConsole.prototype.onPostMessage_;

  AirConsole.prototype.onPostMessage_ = function(event) {
    var me = this;
    originalPostMessage.call(this, event);
    var data = event.data;
    if (data) {
      if (data.action === "steam_api") {
        if (data.value && data.value.action === "client_steam_achievement") {
          me.onSteamAchievement(data.value);
        }
      }
    }
  };

})();

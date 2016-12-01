describe("AirConsole 1.6.0", function() {
  var airconsole = null;
  var DEVICE_ID = 2;
  var LOCATION = document.location.href;

  function dispatchCustomMessageEvent (data, event_type) {
    event_type = event_type || 'message';
    var fake_event = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
    fake_event.initCustomEvent(event_type, false, false, null);
    fake_event.data = data || {};
    window.dispatchEvent(fake_event);
  };

  // Overwrite functions
  AirConsole.postMessage_ = function(data) {
    //console.info("Calling Mock AirConsole.postMessage_", data);
  };

  function initAirConsole() {
    //
    airconsole = new AirConsole({
      setup_document: false
    });
    airconsole.device_id = AirConsole.SCREEN;

    airconsole.devices[0] = {};
    airconsole.devices[1] = undefined;

    var device_data = {
      uid: 1237,
      nickname: "Sergio",
      location: LOCATION,
      custom: {}
    };
    airconsole.devices[DEVICE_ID] = device_data;
  }

  function tearDown() {
    if (airconsole) {
      window.removeEventListener('message', airconsole.onPostMessage_);
      airconsole = null;
    }
  }

  afterEach(function() {
    tearDown();
  });

  /**
    ======================================================================================
    COMMON FUNCTIONALITY
  */

  describe("Setup functionality", function() {

    beforeEach(function() {
    });

    afterEach(function() {
      tearDown();
    });

    it ("Should have defined the correct version", function() {
      airconsole = new AirConsole({
        setup_document: false
      });
      expect(airconsole.version).toEqual("1.6.0");
    });

    it ("Should have defined constants correctly", function() {
      expect(AirConsole.SCREEN).toEqual(0);
      expect(AirConsole.ORIENTATION_PORTRAIT).toEqual("portrait");
      expect(AirConsole.ORIENTATION_LANDSCAPE).toEqual("landscape");
    });

    it ("Should initialize correctly with default options", function() {
      airconsole = new AirConsole({
        setup_document: false
      });
      expect(airconsole.devices).toEqual([]);
      expect(airconsole.server_time_offset).toEqual(false);
    });

    it ("Should initialize correctly with custom options", function() {
      airconsole = new AirConsole({
        setup_document: false,
        synchronize_time: true
      });
      expect(airconsole.devices).toEqual([]);
      expect(airconsole.server_time_offset).toEqual(0);
    });

    it ("Should bind window.onMessage handler correctly", function() {
      airconsole = new AirConsole({
        setup_document: false
      });
      spyOn(airconsole, 'onPostMessage_');
      dispatchCustomMessageEvent();
      expect(airconsole.onPostMessage_).toHaveBeenCalled();
    });

    it ("Should throw error when requesting time offset without declaring it", function() {
      airconsole = new AirConsole();
      expect(airconsole.getServerTime.bind(airconsole)).toThrow();
    });

    it ("Should call postMessage_ on error", function() {
      spyOn(AirConsole, 'postMessage_');
      dispatchCustomMessageEvent({}, 'error');
      expect(AirConsole.postMessage_).toHaveBeenCalled();
    });

  });

  /**
    ======================================================================================
    TEST CONNECTIVTY
  */

  describe("Connectiviy", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

    it ("Should return all connected controller device ids", function() {
      airconsole.devices = [];
      airconsole.devices[AirConsole.SCREEN] = { "device": "screen" };
      airconsole.devices[2]  = { "device": "unicorn", location: LOCATION };
      airconsole.devices[5]  = { "device": "Not in this game", location: "another.location" };
      airconsole.devices[10] = { "device": "Na na na batman", location: LOCATION };
      //
      var actual_ids = airconsole.getControllerDeviceIds();
      var expected_ids = [2, 10];
      expect(actual_ids).toEqual(expected_ids);
    });

    it ("Should return the correct master device id", function() {
      var expected_id = 3;
      airconsole.devices = [];
      airconsole.devices[AirConsole.SCREEN] = {"device": "screen"};
      airconsole.devices[expected_id] = { "device": "unicorn", location: LOCATION };
      airconsole.devices[4] = { "device": "Na na na batman", location: LOCATION };
      //
      var actual_id = airconsole.getMasterControllerDeviceId();
      expect(actual_id).toEqual(expected_id);
    });

    it ("Should return undefined for master device ID when no devices are connected",
        function() {
      airconsole.devices = [];
      airconsole.devices[AirConsole.SCREEN] = {"device" : "screen"};

      var actual_id = airconsole.getMasterControllerDeviceId();
      expect(actual_id).toEqual(undefined);
    });

    it ("Should call onConnect when a device has loaded the game", function() {
      spyOn(airconsole, 'onDeviceStateChange');
      spyOn(airconsole, 'onConnect');
      airconsole.devices[DEVICE_ID].location = "another_location";
      var device_data = {
       location: LOCATION
      };
      dispatchCustomMessageEvent({
       action: "update",
       device_id: DEVICE_ID,
       device_data: device_data,
       code: 1237
      });

      expect(airconsole.onConnect).toHaveBeenCalledWith(DEVICE_ID);
      expect(airconsole.onDeviceStateChange).toHaveBeenCalledWith(DEVICE_ID, device_data);
    });

    it ("Should call onDisconnect when a device leaves the game", function() {
      spyOn(airconsole, 'onDeviceStateChange');
      spyOn(airconsole, 'onDisconnect');
      var device_data = {
       location: "new_location"
      };
      dispatchCustomMessageEvent({
       action: "update",
       device_id: DEVICE_ID,
       device_data: device_data
      });
      expect(airconsole.onDisconnect).toHaveBeenCalledWith(DEVICE_ID);
      expect(airconsole.onDeviceStateChange).toHaveBeenCalledWith(DEVICE_ID, device_data);
    });

    it ("Should call onReady", function() {
      spyOn(airconsole, 'onReady');
      spyOn(airconsole, 'onConnect');
      var device_data = airconsole.devices[DEVICE_ID];
      dispatchCustomMessageEvent({
        action: "ready",
        code: 1237,
        device_id: 0,
        device_data: {
          location: LOCATION
        },
        devices: [{}, undefined, device_data]
      });
      expect(airconsole.onReady).toHaveBeenCalledWith(1237);
      expect(airconsole.onConnect).toHaveBeenCalledWith(DEVICE_ID);
    });

  });

/**
  ======================================================================================
  COMMON FUNCTIONALITY
*/

  describe("Messaging", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

    it ("Should call postMessage_ function when calling message()", function() {
      var expected_data = { msg: "Ninja Turtle" };
      var expected_params = { action: "message", to: DEVICE_ID, data: expected_data };
      spyOn(AirConsole, 'postMessage_');
      airconsole.message(DEVICE_ID, expected_data);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_params);
    });

    it ("Should call postMessage_ function when calling broadcast()", function() {
      var expected_data = { msg: "Ninja Turtle" };
      var expected_params = { action: "message", to: undefined, data: expected_data };
      spyOn(AirConsole, 'postMessage_');
      airconsole.broadcast(expected_data);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_params);
    });

    it ("Should handle postMessage with action 'message' correctly", function() {
      var custom_data = { eat: "burger" };
      spyOn(airconsole, 'onMessage');
      dispatchCustomMessageEvent({
      action: "message",
      from: DEVICE_ID,
      data: custom_data
      });
      expect(airconsole.onMessage).toHaveBeenCalledWith(DEVICE_ID, custom_data);
    });

  });

  /**
    ======================================================================================
    TEST DEVICE STATES
  */

  describe("Device States", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

    it ("Should call postMessage_ method when setting custom device data", function() {
      var expected_data = { msg: "Pen Apple Pi" };
      var expected_params = { action: "set", key: "custom", value: expected_data };
      airconsole.devices[0].location = LOCATION;
      spyOn(AirConsole, 'postMessage_');
      airconsole.setCustomDeviceState(expected_data);
      // Check data
      var actual_data = airconsole.getCustomDeviceState();
      expect(actual_data).toEqual(expected_data);
      //
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_params);
    });

    it ("Should call postMessage_ method when setting custom device state property", function() {
      var expected_data = {
        prev_data: "true",
        msg: "fruits"
      };
      airconsole.device_id = DEVICE_ID;
      // Prefill data
      var prev_data = { prev_data: "true" };
      airconsole.devices[DEVICE_ID]["custom"] = prev_data;
      // Check prefilled data
      var actual_data = airconsole.getCustomDeviceState(DEVICE_ID);
      expect(actual_data).toEqual(prev_data);
      //
      var expected_params = { action: "set", key: "custom", value: expected_data };
      spyOn(AirConsole, 'postMessage_');
      airconsole.setCustomDeviceStateProperty("msg", "fruits");
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_params);
    });

    it ("Should call custom device state change when a device changes custom data", function() {
      spyOn(airconsole, 'onCustomDeviceStateChange');
      var expected_data = { francois: true };
      dispatchCustomMessageEvent({
        action: "update",
        device_id: DEVICE_ID,
        device_data: {
          location: LOCATION,
          _is_custom_update: true,
          custom: expected_data
        }
      });
      expect(airconsole.onCustomDeviceStateChange).toHaveBeenCalledWith(DEVICE_ID, expected_data);
    });

  });

  /**
    ======================================================================================
    COMMON PROFILE FUNCTIONALITY
  */

  describe("Profile", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

    it ("Should return correct UID", function() {
      var expected_uid = "UID14";
      airconsole.devices[DEVICE_ID].uid = expected_uid;
      var actual_uid = airconsole.getUID(DEVICE_ID);
      expect(actual_uid).toEqual(expected_uid);
    });

    it ("Should return correct UID when no param is set", function() {
      var expected_uid = "UID14";
      airconsole.device_id = DEVICE_ID;
      airconsole.devices[DEVICE_ID].uid = expected_uid;
      var actual_uid = airconsole.getUID();
      expect(actual_uid).toEqual(expected_uid);
    });

    it ("Should return undefined UID when device does not exist", function() {
      var expected_uid = undefined;
      var actual_uid = airconsole.getUID(34);
      expect(actual_uid).toEqual(expected_uid);
    });

    it ("Should return nickname if device has nickname set", function() {
      var actual_name = airconsole.getNickname(DEVICE_ID);
      var expected_name = "Sergio";
      expect(expected_name).toEqual(actual_name);
    });

    it ("Should return Guest name if device has nickname NOT set", function() {
      delete airconsole.devices[DEVICE_ID].nickname;
      var actual_name = airconsole.getNickname(DEVICE_ID);
      var expected_name = "Guest 2";
      expect(expected_name).toEqual(actual_name);
    });

    it ("Should return undefined when requesting nickname for non-existing device_id", function() {
      var actual_name = airconsole.getNickname(3);
      var expected_name = undefined;
      expect(expected_name).toEqual(actual_name);
    });

    it ("Should return profile picture", function() {
      var actual_path = airconsole.getProfilePicture(DEVICE_ID, 320);
      var expected_path = "https://www.airconsole.com/api/profile-picture?uid=1237&size=320";
      expect(expected_path).toEqual(actual_path);
    });

    it ("Should return profile picture with size 64 when no size param passed", function() {
      var actual_path = airconsole.getProfilePicture(DEVICE_ID);
      var expected_path = "https://www.airconsole.com/api/profile-picture?uid=1237&size=64";
      expect(expected_path).toEqual(actual_path);
    });

    it ("Should return undefined when requesting picture for non-existing device_id", function() {
      airconsole.devices = [];
      var actual_path = airconsole.getProfilePicture(1);
      var expected_path = undefined;
      expect(expected_path).toEqual(actual_path);
    });

    it ("Should return correct values for isUserLoggedIn", function() {
      airconsole.devices = [];
      var device_data_1 = {
        location: LOCATION,
        custom: {},
        auth: false
      };
      var device_data_3 = {
        location: LOCATION,
        custom: {},
        auth: true
      };
      airconsole.devices[1] = device_data_1;
      airconsole.devices[3] = device_data_3;

      expect(airconsole.isUserLoggedIn(3)).toEqual(true);
      expect(airconsole.isUserLoggedIn(1)).toEqual(false);
    });

    it ("Should call postMessage_ on calling requestEmailAddress", function() {
      var expected_data = { action: "set", key: "email", value: true };
      spyOn(AirConsole, 'postMessage_');
      airconsole.requestEmailAddress();
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
    });


    it ("Should call profile change handler when device changes profile", function() {
      spyOn(airconsole, 'onDeviceProfileChange');
      dispatchCustomMessageEvent({
        action: "update",
        device_id: DEVICE_ID,
        device_data: {
          location: LOCATION,
          _is_profile_update: true
        }
      });
      expect(airconsole.onDeviceProfileChange).toHaveBeenCalledWith(DEVICE_ID);
    });

  });

  /**
    ======================================================================================
    COMMON PROFILE FUNCTIONALITY
  */

  describe("Active Players", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

    it ("Should set active players correctly when max_players is set", function() {
      spyOn(airconsole, 'set_');
      airconsole.devices = [];
      airconsole.device_id = AirConsole.SCREEN;
      airconsole.devices[AirConsole.SCREEN] = {};
      var device_data = {
        location: LOCATION,
        custom: {}
      };
      // We only want the first two devices
      var max_players = 2;
      airconsole.devices[2] = device_data;
      airconsole.devices[5] = device_data;
      airconsole.devices[3] = device_data;
      airconsole.setActivePlayers(max_players);

      var actual_players = airconsole.devices[AirConsole.SCREEN]["players"];
      var count = actual_players.length;
      var expected_players = [2, 3];
      expect(count).toEqual(max_players);
      expect(airconsole.set_).toHaveBeenCalledWith('players', expected_players);

      // Test getActivePlayerDeviceIds()
      var actual_device_ids = airconsole.getActivePlayerDeviceIds();
      expect(expected_players).toEqual(actual_device_ids);
    });

    it ("Should set active players correctly when max_players is NOT set", function() {
      spyOn(airconsole, 'set_');
      airconsole.devices = [];
      airconsole.device_id = AirConsole.SCREEN;
      airconsole.devices[AirConsole.SCREEN] = {};
      var device_data = {
        location: LOCATION,
        custom: {}
      };
      // We only want the first two ones
      airconsole.devices[1] = device_data;
      airconsole.devices[5] = device_data;
      airconsole.devices[3] = device_data;
      airconsole.setActivePlayers();

      var actual_players = airconsole.devices[AirConsole.SCREEN]["players"];
      var count = actual_players.length;
      var expected_players = [1, 3, 5];
      expect(count).toEqual(expected_players.length);
      expect(airconsole.set_).toHaveBeenCalledWith('players', expected_players);

      // Test getActivePlayerDeviceIds()
      var actual_device_ids = airconsole.getActivePlayerDeviceIds();
      expect(expected_players).toEqual(actual_device_ids);
    });

    it ("Should throw when setActivePlayers is called on a controller", function() {
      airconsole.device_id = DEVICE_ID;
      expect(airconsole.device_id).not.toEqual(AirConsole.SCREEN);
      expect(airconsole.setActivePlayers).toThrow();
    });

    it ("Should convert player number to device id correctly", function() {
      airconsole.devices = [];
      airconsole.device_id = AirConsole.SCREEN;
      airconsole.devices[AirConsole.SCREEN] = {};
      var device_data = {
        location: LOCATION,
        custom: {}
      };
      airconsole.devices[2] = device_data;
      airconsole.devices[3] = device_data;
      // Player number 2
      airconsole.devices[5] = device_data;
      airconsole.setActivePlayers();

      // Player 2
      var actual_device_id = airconsole.convertPlayerNumberToDeviceId(2);
      var expected_device_id = 5;
      expect(expected_device_id).toEqual(actual_device_id);

      // Player 0
      var actual_device_id = airconsole.convertPlayerNumberToDeviceId(0);
      var expected_device_id = 2;
      expect(expected_device_id).toEqual(actual_device_id);
    });

    it ("Should convert device id to player number correctly", function() {
      airconsole.devices = [];
      airconsole.device_id = AirConsole.SCREEN;
      airconsole.devices[AirConsole.SCREEN] = {};
      var device_data = {
        location: LOCATION,
        custom: {}
      };
      airconsole.devices[2] = device_data;
      airconsole.devices[3] = device_data;
      airconsole.devices[5] = device_data;
      airconsole.setActivePlayers();

      // Player 0 is first device
      var actual_number = airconsole.convertDeviceIdToPlayerNumber(2);
      var expected_number = 0;
      expect(expected_device_id).toEqual(actual_device_id);

      // Player 2 is last device
      var actual_device_id = airconsole.convertDeviceIdToPlayerNumber(5);
      var expected_device_id = 2;
      expect(expected_device_id).toEqual(actual_device_id);
    });

  });

  /**
    ======================================================================================
    TEST DEVICE MOTION
  */

  describe("Controller Inputs", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

    it ("Should handle action device_motion", function() {
      var custom_data = { x: 2, y: -35 };
      spyOn(airconsole, 'onDeviceMotion');
      dispatchCustomMessageEvent({
       action: "device_motion",
       data: custom_data,
      });
      expect(airconsole.onDeviceMotion).toHaveBeenCalledWith(custom_data);
    });

  });

  /**
    ======================================================================================
    TEST ADS
  */

  describe("Ads", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

    it ("Should call postMessage_ on calling showAd", function() {
      var expected_data = { action: "set", key: "ad", value: true };
      spyOn(AirConsole, 'postMessage_');
      airconsole.showAd();
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
    });

    it ("Should call ad-handler on post message update", function() {
      spyOn(airconsole, 'onAdShow');
      dispatchCustomMessageEvent({
        action: "update",
        ad: {
          show: "www.url.test"
        },
        _is_ad_update: true,
        device_id: DEVICE_ID,
        device_data: {
          location: LOCATION
        }
      });
      expect(airconsole.onAdShow).toHaveBeenCalledWith();
    });

    it ("Should call ad-complete-handler on post message update", function() {
      spyOn(airconsole, 'onAdComplete');
      dispatchCustomMessageEvent({
        action: "update",
        ad: {
          complete: true
        },
        _is_ad_update: true,
        device_id: DEVICE_ID,
        device_data: {
          location: LOCATION
        }
      });
      expect(airconsole.onAdComplete).toHaveBeenCalledWith(true);
    });

  });

  /**
    ======================================================================================
    PREMIUM FUNCTIONALITY
  */

  describe("Premium", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

    it ("Should call onPremium when a premium device joins or updates", function() {
      spyOn(airconsole, 'onPremium');
      dispatchCustomMessageEvent({
        action: "update",
        device_id: DEVICE_ID,
        device_data: {
          location: LOCATION,
          _is_premium_update: true,
          premium: true
        }
      });
      expect(airconsole.onPremium).toHaveBeenCalledWith(DEVICE_ID);
    });

    it ("Should not call onPremium when a non premium device joins or updates", function() {
      spyOn(airconsole, 'onPremium');
      dispatchCustomMessageEvent({
        action: "update",
        device_id: DEVICE_ID,
        device_data: {
          location: LOCATION,
          _is_premium_update: true,
          premium: false
        }
      });
      expect(airconsole.onPremium).not.toHaveBeenCalledWith(DEVICE_ID);
    });

    it ("Should call onPremium when device calls onReady", function() {
      spyOn(airconsole, 'onReady');
      spyOn(airconsole, 'onConnect');
      spyOn(airconsole, 'onPremium');
      var device_data = airconsole.devices[DEVICE_ID];
      device_data.premium = true;
      //
      dispatchCustomMessageEvent({
        action: "ready",
        code: 1237,
        device_id: 0,
        device_data: {
          location: LOCATION
        },
        devices: [{}, undefined, device_data]
      });
      expect(airconsole.onReady).toHaveBeenCalledWith(1237);
      expect(airconsole.onConnect).toHaveBeenCalledWith(DEVICE_ID);
      expect(airconsole.onPremium).toHaveBeenCalledWith(DEVICE_ID);
    });

    it ("Should get all premium device ids correctly", function() {
      airconsole.devices = [];
      var expected_premium_device_id = 3;
      var device_data = {
        location: LOCATION,
        custom: {}
      };
      airconsole.devices[2] = device_data;
      airconsole.devices[expected_premium_device_id] = {
        location: LOCATION,
        custom: {},
        premium: true
      };;
      airconsole.devices[5] = device_data;

      var premium_devices = airconsole.getPremiumDeviceIds();
      expect(premium_devices.length).toEqual(1);
      expect(premium_devices[0]).toEqual(expected_premium_device_id);
    });

    it ("Should return correct values for isPremium", function() {
      airconsole.devices = [];
      var expected_premium_device_id = 3;
      var device_data = {
        location: LOCATION,
        custom: {}
      };
      airconsole.devices[2] = device_data;
      airconsole.devices[expected_premium_device_id] = {
        location: LOCATION,
        custom: {},
        premium: true
      };;
      airconsole.devices[5] = device_data;
      expect(airconsole.isPremium(AirConsole.SCREEN)).toEqual(undefined);
      expect(airconsole.isPremium(expected_premium_device_id)).toEqual(true);
      expect(airconsole.isPremium(2)).toEqual(false);
      expect(airconsole.isPremium(5)).toEqual(false);
    });

    it ("Should call postMessage_ method when requesting premium", function() {
      var expected_data = { action: "set", key: "premium", value: true };
      spyOn(AirConsole, 'postMessage_');
      airconsole.getPremium();
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
    });

  });

  /**
    ======================================================================================
    TEST NAVIGATION
  */

  describe("Navigation", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

    it ("Should call postMessage_ method when using navigateTo", function() {
      var url = 'http://airconsole.com';
      var expected_data = { action: "set", key: "home", value: url };
      airconsole.device_id = 1;
      spyOn(AirConsole, 'postMessage_');
      airconsole.navigateTo(url);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
    });

    it ("Should call postMessage_ method when navigating home", function() {
      var expected_data = { action: "set", key: "home", value: true };
      airconsole.device_id = 1;
      spyOn(AirConsole, 'postMessage_');
      airconsole.navigateHome();
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
    });

    it ("Should call postMessage_ method when calling openExternalUrl", function() {
      var url = 'http://ndream.com';
      var expected_data = { action: "set", key: "pass_external_url", value: url };
      spyOn(AirConsole, 'postMessage_');
      airconsole.device_id = DEVICE_ID;
      airconsole.devices[DEVICE_ID].client = {
        pass_external_url: true
      };
      airconsole.openExternalUrl(url);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
    });

    it ("Should not call postMessage_ method but open browser window when calling openExternalUrl", function() {
      var url = 'http://ndream.com';
      var expected_data = { action: "set", key: "pass_external_url", value: url };
      spyOn(AirConsole, 'postMessage_');
      spyOn(window, 'open');
      airconsole.device_id = DEVICE_ID;
      airconsole.devices[DEVICE_ID].client = {};
      airconsole.openExternalUrl(url);
      expect(window.open).toHaveBeenCalled();
      expect(AirConsole.postMessage_).not.toHaveBeenCalled();
    });

  });

  /**
    ======================================================================================
    TEST UI
  */

  describe("User Interface", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

    it ("Should call postMessage_ method when setting UI", function() {
      var expected_data = { action: "set", key: "default_ui", value: true };
      spyOn(AirConsole, 'postMessage_');
      airconsole.showDefaultUI(true);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
    });

    it ("Should call postMessage_ method when setting orientation", function() {
      var expected_data = { action: "set", key: "orientation", value: AirConsole.ORIENTATION_LANDSCAPE };
      spyOn(AirConsole, 'postMessage_');
      airconsole.setOrientation(AirConsole.ORIENTATION_LANDSCAPE);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
    });

  });

  /**
    ======================================================================================
    TEST DEVICE STATES
  */

  describe("Persistent Data", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

    it ("Should call postMessage_ method when requesting persistent data", function() {
      var uids = [1, 3];
      var expected_data = { action: "set", key: "persistentrequest", value: { uids: uids } };
      spyOn(AirConsole, 'postMessage_');
      airconsole.requestPersistentData(uids);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
    });

    it ("Should call postMessage_ method when storing persistent data", function() {
      var value = { key: "hero", value: 2, uid: 293 };
      var expected_data = { action: "set", key: "persistentstore", value: value };
      spyOn(AirConsole, 'postMessage_');
      airconsole.storePersistentData("hero", 2, 293);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
    });

  });

  /**
    ======================================================================================
    TEST DEVICE STATES
  */

  describe("High Scores", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

  });

});

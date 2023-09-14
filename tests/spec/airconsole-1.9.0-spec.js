describe("AirConsole 1.8.0", function () {
  var overwrites = {};

  // Overwrite functions
  AirConsole.postMessage_ = function (data) {
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

  afterEach(function () {
    tearDown();
  });

  /**
   ======================================================================================
   COMMON FUNCTIONALITY
   */

  describe("Setup functionality", function () {

    beforeEach(function () {
    });

    afterEach(function () {
      tearDown();
    });

    testSetup("1.8.0");

  });

  /**
   ======================================================================================
   TEST CONNECTIVTY
   */

  describe("Connectivity", function () {

    beforeEach(function () {
      initAirConsole();
    });

    afterEach(function () {
      tearDown();
    });

    overwrites["Should return the correct master device id"] = function () {
      var expected_id = 5;
      airconsole.devices = [];
      airconsole.devices[AirConsole.SCREEN] = { "device": "screen" };
      airconsole.devices[3] = { "device": "unicorn", location: LOCATION };
      airconsole.devices[expected_id] = {
        "device": "hero",
        location: LOCATION,
        premium: true
      };
      airconsole.devices[6] = { "device": "other hero", location: LOCATION, premium: true };
      //
      var actual_id = airconsole.getMasterControllerDeviceId();
      expect(actual_id).toEqual(expected_id);
    };

    testConnectivity(overwrites);

  });

  /**
   ======================================================================================
   COMMON FUNCTIONALITY
   */

  describe("Messaging", function () {

    beforeEach(function () {
      initAirConsole();
    });

    afterEach(function () {
      tearDown();
    });

    testMessaging();

  });

  /**
   ======================================================================================
   TEST DEVICE STATES
   */

  describe("Device States", function () {

    beforeEach(function () {
      initAirConsole();
    });

    afterEach(function () {
      tearDown();
    });

    testDeviceStates();

  });

  /**
   ======================================================================================
   COMMON PROFILE FUNCTIONALITY
   */

  describe("Profile", function () {

    beforeEach(function () {
      initAirConsole();
    });

    afterEach(function () {
      tearDown();
    });

    testProfile();

  });

  /**
   ======================================================================================
   COMMON PROFILE FUNCTIONALITY
   */

  describe("Active Players", function () {

    beforeEach(function () {
      initAirConsole();
    });

    afterEach(function () {
      tearDown();
    });

    testActivePlayers();

  });

  /**
   ======================================================================================
   TEST CTRL INPUTS
   */

  describe("Controller Inputs", function () {

    beforeEach(function () {
      initAirConsole();
    });

    afterEach(function () {
      tearDown();
    });

    testCtrlInputs();

  });

  /**
   ======================================================================================
   TEST ADS
   */

  describe("Ads", function () {

    beforeEach(function () {
      initAirConsole();
    });

    afterEach(function () {
      tearDown();
    });

    testAds();

  });

  /**
   ======================================================================================
   PREMIUM FUNCTIONALITY
   */

  describe("Premium", function () {

    beforeEach(function () {
      initAirConsole();
    });

    afterEach(function () {
      tearDown();
    });

    testPremium();

  });

  /**
   ======================================================================================
   TEST NAVIGATION
   */

  describe("Navigation", function () {

    beforeEach(function () {
      initAirConsole();
    });

    afterEach(function () {
      tearDown();
    });

    testNavigation();

    it("Should call postMessage_ method when using navigateTo by game_id", function () {
      var url = 'com.airconsole.games.test';
      var expected_data = { action: "set", key: "home", value: url };
      airconsole.device_id = 1;
      spyOn(AirConsole, 'postMessage_');
      airconsole.navigateTo(url);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
    });

    it("Should call postMessage_ method when using navigateTo by navigating relatively", function () {
      spyOn(AirConsole, 'postMessage_');
      airconsole.device_id = 1;

      var root_url = "http://storage.airconsole.com/root/";
      var mock_url = root_url + "one/two/three/";
      spyOn(airconsole, 'getLocationUrl_').and.returnValue(mock_url);

      // Navigate to parent
      var url = '..';
      var expected_url = root_url + "one/two/";
      var expected_root_data = { action: "set", key: "home", value: expected_url };
      airconsole.navigateTo(url);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_root_data);

      airconsole.getLocationUrl_.and.returnValue(expected_url);
      expected_url = root_url + "one/";
      var expected_root_data = { action: "set", key: "home", value: expected_url };
      airconsole.navigateTo(url);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_root_data);

      airconsole.getLocationUrl_.and.returnValue(expected_url);
      expected_url = root_url;
      var expected_root_data = { action: "set", key: "home", value: expected_url };
      airconsole.navigateTo(url);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_root_data);

      // Already at root dir
      airconsole.getLocationUrl_.and.returnValue(expected_url);
      expected_url = root_url;
      var expected_root_data = { action: "set", key: "home", value: expected_url };
      airconsole.navigateTo(url);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_root_data);

      airconsole.getLocationUrl_.and.returnValue(expected_url);
      expected_url = root_url;
      var expected_root_data = { action: "set", key: "home", value: expected_url };
      airconsole.navigateTo(url);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_root_data);

      // Navigate to a subdir
      var url = "./subdir";
      airconsole.getLocationUrl_.and.returnValue(root_url);
      expected_url = root_url + "subdir/";
      var expected_root_data = { action: "set", key: "home", value: expected_url };
      airconsole.navigateTo(url);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_root_data);

      var url = "./second";
      airconsole.getLocationUrl_.and.returnValue(expected_url + "#%7B%22my_value%22%3Atrue%7D");
      expected_url = root_url + "subdir/second/";
      var expected_root_data = { action: "set", key: "home", value: expected_url };
      airconsole.navigateTo(url);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_root_data);

      // Navigate with Params
      var url = "./third";
      airconsole.getLocationUrl_.and.returnValue(expected_url);
      var params = { my_value: true };
      var expected_params = encodeURIComponent(JSON.stringify(params));
      expected_url = root_url + "subdir/second/third/#" + expected_params;
      var expected_root_data = { action: "set", key: "home", value: expected_url };
      airconsole.navigateTo(url, params);
      expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_root_data);
    });

  });

  /**
   ======================================================================================
   TEST PAUSE RESUME
   */

  describe("Pause / Resume", function () {

    beforeEach(function () {
      initAirConsole();
    });

    afterEach(function () {
      tearDown();
    });

    testOnPauseOnResume();
  });

  /**
   ======================================================================================
   TEST DEVICE STATES
   */

  describe("Persistent Data", function () {

    beforeEach(function () {
      initAirConsole();
    });

    afterEach(function () {
      tearDown();
    });

    testPersistentData();

  });

  /**
   ======================================================================================
   TEST DEVICE STATES
   */

  describe("High Scores", function () {

    beforeEach(function () {
      initAirConsole();
    });

    afterEach(function () {
      tearDown();
    });

  });

});

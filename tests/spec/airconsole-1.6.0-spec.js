describe("AirConsole 1.6.0", function() {

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

    testSetup("1.6.0");

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

    testConnectivity();

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

    testMessaging();

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

    testDeviceStates();

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

    testProfile();

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

    testActivePlayers();

  });

  /**
    ======================================================================================
    TEST CTRL INPUTS
  */

  describe("Controller Inputs", function() {

    beforeEach(function() {
      initAirConsole();
    });

    afterEach(function() {
      tearDown();
    });

    testCtrlInputs();

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

    testAds();

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

    testPremium();

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

    testNavigation();

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

    testUI();
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

    testPersistentData();

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

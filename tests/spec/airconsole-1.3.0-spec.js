describe("API 1.3.0", function() {

  var air_console = null;
  var LOCATION = document.location.href;
  var DEVICE_ID = 1;

  var dispatchCustomEvent = function(data) {
    var fake_event = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
    fake_event.initCustomEvent('message', false, false, null);
    fake_event.data = data;
    window.dispatchEvent(fake_event);
  };

  beforeEach(function() {
    air_console = new AirConsole({
      setup_document: false
    });
    var device_data = {
      uid: 1237,
      nickname: "Potato",
      location: LOCATION,
      custom: {}
    };
    air_console.devices[DEVICE_ID] = device_data;
    air_console.device_id = DEVICE_ID;
  });

  it ("should call onConnect when a device has loaded the game", function() {
    spyOn(air_console, 'onDeviceStateChange');
    spyOn(air_console, 'onConnect');
    air_console.devices[DEVICE_ID].location = "another_location";

    var device_data = {
      location: LOCATION
    };

    dispatchCustomEvent({
      action: "update",
      device_id: DEVICE_ID,
      device_data: device_data,
      code: 1034
    });

    expect(air_console.onConnect).toHaveBeenCalledWith(DEVICE_ID);
    expect(air_console.onDeviceStateChange).toHaveBeenCalledWith(DEVICE_ID, device_data);
  });

  it ("should call onDisconnect when a device leaves the game", function() {
    spyOn(air_console, 'onDeviceStateChange');
    spyOn(air_console, 'onDisconnect');

    var device_data = {
      location: 'after_url'
    };

    dispatchCustomEvent({
      action: "update",
      device_id: DEVICE_ID,
      device_data: device_data,
      code: 1034
    });

    expect(air_console.onDisconnect).toHaveBeenCalledWith(DEVICE_ID);
    expect(air_console.onDeviceStateChange).toHaveBeenCalledWith(DEVICE_ID, device_data);
  });

  it ("should call onCustomDeviceStateChange when update event triggers", function() {
    spyOn(air_console, 'onCustomDeviceStateChange');

    var device_data = {
      location: LOCATION,
      _is_custom_update: true,
      custom: {
        r2d2: true
      }
    };

    var devices = [];
    devices[DEVICE_ID] = device_data;

    dispatchCustomEvent({
      action: "update",
      device_id: DEVICE_ID,
      device_data: device_data,
      devices: devices,
      code: 1034
    });

    expect(air_console.onCustomDeviceStateChange).toHaveBeenCalledWith(DEVICE_ID, device_data.custom);
  });

  it ("should call onCustomDeviceStateChange when changing custom device state", function() {
    spyOn(air_console, 'onCustomDeviceStateChange');
    var custom_data = {
      telefon: 'yes'
    };
    var devices = [];
    devices[DEVICE_ID] = {
      location: LOCATION,
      custom: custom_data
    };
    dispatchCustomEvent({
      action: "ready",
      device_id: DEVICE_ID,
      devices: devices,
      code: 1034
    });
    //
    expect(air_console.onCustomDeviceStateChange).toHaveBeenCalledWith(DEVICE_ID, custom_data);
  });

  it ("should set custom device state when calling setCustomDeviceStateProperty", function() {
    var key = 'dolphin';
    var value = 'ih ih ih';
    var key_2 = 'tiger';
    var value_2 = 'miauuu';

    spyOn(air_console, 'setCustomDeviceState');

    // Set property
    air_console.setCustomDeviceStateProperty(key, value);
    var actual_data = air_console.getCustomDeviceState();
    expect(actual_data[key]).toEqual(value);

    // Listen if setCustomDeviceState was called
    var expected_custom_data = {};
    expected_custom_data[key] = value;
    expect(air_console.setCustomDeviceState).toHaveBeenCalledWith(expected_custom_data);

    // Set another to check that it does not get overwritten
    air_console.setCustomDeviceStateProperty(key, value);
    var actual_data = air_console.getCustomDeviceState();
    expect(actual_data[key]).toEqual(value);
    //
    air_console.setCustomDeviceStateProperty(key_2, value_2);
    var actual_data_2 = air_console.getCustomDeviceState();
    expect(actual_data[key_2]).toEqual(value_2);
  });

  it ("should set active players correctly when max_players is set", function() {
    spyOn(air_console, 'set_');
    air_console.devices = [];
    air_console.device_id = AirConsole.SCREEN;
    air_console.devices[AirConsole.SCREEN] = {};
    var device_data = {
      location: LOCATION,
      custom: {}
    };
    // We only want the first two devices
    var max_players = 2;
    air_console.devices[2] = device_data;
    air_console.devices[5] = device_data;
    air_console.devices[3] = device_data;
    air_console.setActivePlayers(max_players);

    var actual_players = air_console.devices[AirConsole.SCREEN]["players"];
    var count = actual_players.length;
    var expected_players = [2, 3];
    expect(count).toEqual(max_players);
    expect(air_console.set_).toHaveBeenCalledWith('players', expected_players);

    // Test getActivePlayerDeviceIds()
    var actual_device_ids = air_console.getActivePlayerDeviceIds();
    expect(expected_players).toEqual(actual_device_ids);
  });

  it ("should set active players correctly when max_players is NOT set", function() {
    spyOn(air_console, 'set_');
    air_console.devices = [];
    air_console.device_id = AirConsole.SCREEN;
    air_console.devices[AirConsole.SCREEN] = {};
    var device_data = {
      location: LOCATION,
      custom: {}
    };
    // We only want the first two ones
    air_console.devices[1] = device_data;
    air_console.devices[5] = device_data;
    air_console.devices[3] = device_data;
    air_console.setActivePlayers();

    var actual_players = air_console.devices[AirConsole.SCREEN]["players"];
    var count = actual_players.length;
    var expected_players = [1, 3, 5];
    expect(count).toEqual(expected_players.length);
    expect(air_console.set_).toHaveBeenCalledWith('players', expected_players);

    // Test getActivePlayerDeviceIds()
    var actual_device_ids = air_console.getActivePlayerDeviceIds();
    expect(expected_players).toEqual(actual_device_ids);
  });

  it ("should throw when set active players is called on a controller", function() {
    expect(air_console.device_id).not.toEqual(AirConsole.SCREEN);
    expect(air_console.setActivePlayers).toThrow();
  });

  it ("should convert player number to device id correctly", function() {
    air_console.devices = [];
    air_console.device_id = AirConsole.SCREEN;
    air_console.devices[AirConsole.SCREEN] = {};
    var device_data = {
      location: LOCATION,
      custom: {}
    };
    air_console.devices[2] = device_data;
    air_console.devices[3] = device_data;
    // Player number 2
    air_console.devices[5] = device_data;
    air_console.setActivePlayers();

    // Player 2
    var actual_device_id = air_console.convertPlayerNumberToDeviceId(2);
    var expected_device_id = 5;
    expect(expected_device_id).toEqual(actual_device_id);

    // Player 0
    var actual_device_id = air_console.convertPlayerNumberToDeviceId(0);
    var expected_device_id = 2;
    expect(expected_device_id).toEqual(actual_device_id);
  });

  it ("should convert device id to player number correctly", function() {
    air_console.devices = [];
    air_console.device_id = AirConsole.SCREEN;
    air_console.devices[AirConsole.SCREEN] = {};
    var device_data = {
      location: LOCATION,
      custom: {}
    };
    air_console.devices[2] = device_data;
    air_console.devices[3] = device_data;
    air_console.devices[5] = device_data;
    air_console.setActivePlayers();

    // Player 0 is first device
    var actual_number = air_console.convertDeviceIdToPlayerNumber(2);
    var expected_number = 0;
    expect(expected_device_id).toEqual(actual_device_id);

    // Player 2 is last device
    var actual_device_id = air_console.convertDeviceIdToPlayerNumber(5);
    var expected_device_id = 2;
    expect(expected_device_id).toEqual(actual_device_id);
  });

});

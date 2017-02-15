function testActivePlayers() {
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
}

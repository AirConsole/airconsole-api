function testConnectivity(overwrite_its, params) {

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

  itp ("Should return the correct master device id", function() {
    var expected_id = 3;
    airconsole.devices = [];
    airconsole.devices[AirConsole.SCREEN] = {"device": "screen"};
    airconsole.devices[expected_id] = { "device": "unicorn", location: LOCATION };
    airconsole.devices[4] = { "device": "Na na na batman", location: LOCATION };
    //
    var actual_id = airconsole.getMasterControllerDeviceId();
    expect(actual_id).toEqual(expected_id);
  }, overwrite_its);

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
    spyOn(airconsole, 'onCustomDeviceStateChange');
    var device_data = airconsole.devices[DEVICE_ID];
    var custom_data = {
      "somekey": "somevalue"
    };
    device_data.custom = custom_data;
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
    expect(airconsole.onCustomDeviceStateChange).toHaveBeenCalledWith(DEVICE_ID, custom_data);
  });

}

function testPremium() {
  it ("Should call onPremium when a device updates to premium", function() {
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
    expect(airconsole.onPremium).toHaveBeenCalledTimes(1);
    expect(airconsole.onPremium).toHaveBeenCalledWith(DEVICE_ID);
  });

  it ("Should call onPremium when a premium device joins", function() {
    spyOn(airconsole, 'onPremium');
    spyOn(airconsole, 'onConnect');
    airconsole.devices[DEVICE_ID].location = "location_before";
    dispatchCustomMessageEvent({
      action: "update",
      device_id: DEVICE_ID,
      device_data: {
        location: LOCATION,
        _is_premium_update: false, // FALSE!
        premium: true
      }
    });
    expect(airconsole.onPremium).toHaveBeenCalledTimes(1);
    expect(airconsole.onPremium).toHaveBeenCalledWith(DEVICE_ID);
    expect(airconsole.onConnect).toHaveBeenCalledWith(DEVICE_ID);
  });

  it ("Should not call onPremium when a non premium device updates", function() {
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
    expect(airconsole.onPremium).not.toHaveBeenCalled();
  });

  it ("Should not call onPremium when a non premium device joins", function() {
    spyOn(airconsole, 'onPremium');
    airconsole.devices[DEVICE_ID].location = "location_before";
    dispatchCustomMessageEvent({
      action: "update",
      device_id: DEVICE_ID,
      device_data: {
        location: LOCATION,
        //_is_premium_update: true,
        premium: false
      }
    });
    expect(airconsole.onPremium).not.toHaveBeenCalled();
  });

  it ("Should call onPremium when device calls onReady", function() {
    spyOn(airconsole, 'onReady');
    spyOn(airconsole, 'onConnect');
    spyOn(airconsole, 'onPremium');
    var device_data = airconsole.devices[DEVICE_ID];
    device_data.premium = true;

    var device_data_4 = {
      uid: 'def4',
      location: LOCATION,
      premium: false
    };
    airconsole.devices[4] = device_data_4;
    //
    dispatchCustomMessageEvent({
      action: "ready",
      code: 1237,
      device_id: 0,
      device_data: {
        location: LOCATION
      },
      devices: [{}, undefined, device_data, undefined, device_data_4]
    });
    expect(airconsole.onReady).toHaveBeenCalledWith(1237);
    expect(airconsole.onConnect).toHaveBeenCalledWith(DEVICE_ID);
    expect(airconsole.onConnect).toHaveBeenCalledTimes(2);
    expect(airconsole.onPremium).toHaveBeenCalledWith(DEVICE_ID);
    expect(airconsole.onPremium).toHaveBeenCalledTimes(1);
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
}

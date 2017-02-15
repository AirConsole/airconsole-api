function testDeviceStates() {
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
}

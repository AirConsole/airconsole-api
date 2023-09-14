function testImmersive() {

  it('Should call setCustomDeviceState with the correct object when called from screen with zoneId', function(){
    var payload = [{color: "#fff", zoneId: 1}];
    var expected_data = {__AC_IMMERSIVE_STATE__: {1: {color: "#fff"}}};
    var expected_params = {action: "set", key: "custom", value: expected_data};
    airconsole.devices[0].location = LOCATION;
    spyOn(AirConsole, 'postMessage_');
    airconsole.setImmersiveState(payload);
    // Check data
    var actual_data = airconsole.getCustomDeviceState();
    expect(actual_data).toEqual(expected_data);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_params);
  });


  it('Should call setCustomDeviceState with the correct object when called from device', function(){
    airconsole.devices[AirConsole.SCREEN] = { "device": "screen",  location: LOCATION };
    airconsole.devices[2]  = { "device": "unicorn", location: LOCATION };
    airconsole.setActivePlayers(1);
    airconsole.device_id = 2;
    var payload = [{color: "#fff"}];
    var expected_data = {__AC_IMMERSIVE_STATE__: {0: {color: "#fff"}}};
    var expected_params = {action: "set", key: "custom", value: expected_data};
    airconsole.devices[0].location = LOCATION;
    spyOn(AirConsole, 'postMessage_');
    airconsole.setImmersiveState(payload);
    // Check data
    var actual_data = airconsole.getCustomDeviceState();
    expect(actual_data).toEqual(expected_data);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_params);
  });
}

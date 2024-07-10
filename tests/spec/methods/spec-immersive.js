function testImmersive() {
  it('Should call postMessage_ with the correct object', function () {
    var payload = { light: { r: 255, b: 188, g: 7 }};
    var expected_data = { light: { r: 255, b: 188, g: 7 }};
    var expected_params = { action: 'set', key: 'immersive', value: expected_data };
    airconsole.devices[0].location = LOCATION;
    spyOn(AirConsole, 'postMessage_');

    airconsole.setImmersiveState(payload);

    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_params);
  });

  it('Should not call postMessage_ without object', function () {
    spyOn(AirConsole, 'postMessage_');

    airconsole.setImmersiveState();

    expect(AirConsole.postMessage_).toHaveBeenCalledTimes(0)
  });

  it('Should not call postMessage_ with empty object', function () {
    var payload = { };
    spyOn(AirConsole, 'postMessage_');

    airconsole.setImmersiveState(payload);

    expect(AirConsole.postMessage_).toHaveBeenCalledTimes(0);
  });

  it('Should not call postMessage_ with object without valid property', function () {
    var payload = { unexpected: { r: 255, b: 188, g: 7 }};
    spyOn(AirConsole, 'postMessage_');

    airconsole.setImmersiveState(payload);

    expect(AirConsole.postMessage_).toHaveBeenCalledTimes(0);
  });

  it('Should throw an error when called from controller', function () {
    airconsole.devices[AirConsole.SCREEN] = { 'device': 'screen', location: LOCATION };
    airconsole.devices[2] = { 'device': 'unicorn', location: LOCATION };
    airconsole.setActivePlayers(1);
    airconsole.device_id = 2;
    var payload = { r: 255, b: 188, g: 7 };
    airconsole.devices[0].location = LOCATION;
    spyOn(AirConsole, 'postMessage_');

    try {
      airconsole.setImmersiveState(payload);
    } catch (err) {
      expect(err).toEqual('Only the screen can set the immersive state.');
    }
  });
}

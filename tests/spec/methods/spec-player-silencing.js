function testPlayerSilencing() {
  function initAirConsole(constructorArguments, version) {
    const srcUrl = `http://localhost/api/airconsole-${version || 'latest'}.js`;
    spyOn(document, 'getElementsByTagName').and.callFake(() => [{ src: srcUrl }]);
    
    //
    airconsole = new AirConsole({
      setup_document: false,
      ...(!!constructorArguments ? constructorArguments : {})
    });
    airconsole.device_id = AirConsole.SCREEN;

    airconsole.devices[0] = {};
    airconsole.devices[1] = undefined;

    airconsole.devices[DEVICE_ID] = {
      uid: 1237,
      nickname: "Sergio",
      location: LOCATION,
      custom: {}
    };
  }
  
  it("Should not silence players with default AirConsole initialization on latest", function () {
    initAirConsole( undefined, 'latest');
    airconsole.setActivePlayers(2);

    expect(airconsole.arePlayersSilenced()).toBe(false);
  });
  
  it("Should silence players with default AirConsole initialization on 1.9.0", function () {
    initAirConsole( undefined, '1.9.0');
    airconsole.setActivePlayers(2);

    expect(airconsole.arePlayersSilenced()).toBe(true);
  });

  it("Should not silence players with AirConsole configured to not silence players on 1.9.0", function () {
    initAirConsole({ silence_inactive_players: false }, '1.9.0');
    airconsole.setActivePlayers(2);

    expect(airconsole.arePlayersSilenced()).toBe(false);
  });
  
  it("Should not silence players with AirConsole configured to not silence players on latest", function () {
    initAirConsole({ silence_inactive_players: false }, 'latest');
    airconsole.setActivePlayers(2);

    expect(airconsole.arePlayersSilenced()).toBe(false);
  });

  it("Should silence players with AirConsole configured to silence players", function () {
    initAirConsole({ silence_inactive_players: true });
    airconsole.setActivePlayers(2);

    expect(airconsole.arePlayersSilenced()).toBe(true);
  });

  it("Should not silence players with 0 active players", () => {
    initAirConsole({ silence_inactive_players: true });
    airconsole.setActivePlayers(2);

    airconsole.setActivePlayers(0);

    expect(airconsole.arePlayersSilenced()).toBe(false);
  });

  const activePlayersBasedSilencingTestParameters = [
    { description: "Should not silence players with 0 active players", input: 0, result: false },
    { description: "Should silence players with 1 active player", input: 1, result: true },
    { description: "Should silence players with 2 active players", input: 2, result: true },
    { description: "Should silence players with 5 active players", input: 5, result: true }
  ];
  activePlayersBasedSilencingTestParameters.forEach(parameter => {
    it(parameter.description, () => {
      initAirConsole({ silence_inactive_players: true });

      airconsole.setActivePlayers(parameter.input);

      expect(airconsole.arePlayersSilenced()).toBe(parameter.result);
    })
  })

  it("Should ignore messages to silenced players on the controller", () => {
    const silenced_id = 2;
    initAirConsoleWithSilencedDevice(1, silenced_id, silenced_id);
    spyOn(airconsole, 'onMessage');

    airconsole.device_id = silenced_id;
    const data = { action: "message", from: AirConsole.SCREEN, to: silenced_id, data: { message: "Hi" } };
    dispatchCustomMessageEvent(data);

    expect(airconsole.onMessage).not.toHaveBeenCalled();
  });

  it("Should send messages to not silenced players on the controller", () => {
    const silenced_id = 2;
    initAirConsoleWithSilencedDevice(1, silenced_id);
    spyOn(airconsole, 'onMessage');


    const data = { message: "Hi" };
    const msg = { action: "message", from: AirConsole.SCREEN, to: 1, data };
    dispatchCustomMessageEvent(msg);

    expect(airconsole.onMessage).toHaveBeenCalledWith(0, data);
  });

  it("Should not send messages from the screen to silenced players", () => {
    const silenced_id = 2;
    initAirConsoleWithSilencedDevice(1, silenced_id);
    spyOn(AirConsole, 'postMessage_');

    const data = { action: "message", from: AirConsole.SCREEN, to: silenced_id, data: { message: "Hi" } };
    airconsole.message(silenced_id, data);

    expect(AirConsole.postMessage_).toHaveBeenCalledTimes(0);
  });

  it("Should not send messages from the controller to silenced players", () => {
    const silenced_id = 2;
    initAirConsoleWithSilencedDevice(1, silenced_id, 1);
    spyOn(AirConsole, 'postMessage_');

    const data = { action: "message", from: AirConsole.SCREEN, to: silenced_id, data: { message: "Hi" } };
    airconsole.message(silenced_id, data);

    expect(AirConsole.postMessage_).toHaveBeenCalledTimes(0);
  });

  it("Should invoke onConnect after the player is no longer silenced", () => {
    const silenced_id = 2;
    initAirConsoleWithSilencedDevice(1, silenced_id, 0);
    const target_location = airconsole.devices[silenced_id].location;
    airconsole.devices[silenced_id].location = null;
    spyOn(airconsole, 'onConnect');
    // When device_id 2 connects, NO onConnect is executed
    dispatchCustomMessageEvent({
      action: "update",
      device_id: silenced_id,
      device_data: { location: target_location }
    });
    expect(airconsole.onConnect).not.toHaveBeenCalledWith(silenced_id);

    airconsole.setActivePlayers(0);

    expect(airconsole.onConnect).toHaveBeenCalledWith(silenced_id);
  });

  it("Should invoke onConnect if the player has disconnected while still silenced", () => {
    const silenced_id = 2;
    initAirConsoleWithSilencedDevice(1, silenced_id, 0);
    const target_location = airconsole.devices[silenced_id].location;
    airconsole.devices[silenced_id].location = null;
    spyOn(airconsole, 'onConnect');
    // When device_id 2 connects, NO onConnect is executed
    dispatchCustomMessageEvent({
      action: "update",
      device_id: silenced_id,
      device_data: { location: target_location }
    });

    // While player silencing is active and device_id 2 is still silenced, onConnect should not fire.
    expect(airconsole.onConnect).not.toHaveBeenCalledWith(silenced_id);

    // When device_id 2 disconnects, NO onConnect is executed
    dispatchCustomMessageEvent({
      action: "update",
      device_id: silenced_id,
      device_data: { location: "disconnect" }
    });
    airconsole.devices[silenced_id].location = target_location;

    airconsole.setActivePlayers(0);

    expect(airconsole.onConnect).not.toHaveBeenCalledWith(silenced_id);
  });

  it("Should invoke onDisconnect if the player has disconnected while still silenced", () => {
    const silenced_id = 2;
    initAirConsoleWithSilencedDevice(1, silenced_id, 0);
    const target_location = airconsole.devices[silenced_id].location;
    airconsole.devices[silenced_id].location = null;
    spyOn(airconsole, 'onDisconnect');
    // When device_id 2 connects, NO onConnect is executed
    dispatchCustomMessageEvent({
      action: "update",
      device_id: silenced_id,
      device_data: { location: target_location }
    });


    airconsole.devices[silenced_id].location = target_location;
    // When device_id 2 disconnects, NO onConnect is executed
    dispatchCustomMessageEvent({
      action: "update",
      device_id: silenced_id,
      device_data: { location: "disconnect" }
    });

    airconsole.setActivePlayers(0);

    expect(airconsole.onDisconnect).not.toHaveBeenCalledWith(silenced_id);
  });

  it("Should invoke onConnect if the player has disconnected while still silenced", () => {
    const silenced_id = 2;
    initAirConsoleWithSilencedDevice(1, silenced_id, 0);
    const target_location = airconsole.devices[silenced_id].location;
    airconsole.devices[silenced_id].location = null;
    spyOn(airconsole, 'onConnect');
    // When device_id 2 connects, NO onConnect is executed
    dispatchCustomMessageEvent({
      action: "update",
      device_id: silenced_id,
      device_data: { location: target_location }
    });


    airconsole.devices[silenced_id].location = target_location;
    // When device_id 2 disconnects, NO onConnect is executed
    dispatchCustomMessageEvent({
      action: "update",
      device_id: silenced_id,
      device_data: { location: "disconnect" }
    });

    airconsole.setActivePlayers(0);

    expect(airconsole.onConnect).not.toHaveBeenCalledWith(silenced_id);
  });

  it("Should invoke onDisconnect if the player has disconnected while still silenced", () => {
    const silenced_id = 2;
    initAirConsoleWithSilencedDevice(1, silenced_id, 0);
    const target_location = airconsole.devices[silenced_id].location;
    airconsole.devices[silenced_id].location = null;
    spyOn(airconsole, 'onDisconnect');
    // When device_id 2 connects, NO onConnect is executed
    dispatchCustomMessageEvent({
      action: "update",
      device_id: silenced_id,
      device_data: { location: target_location }
    });

    airconsole.devices[silenced_id].location = target_location;
    // When device_id 2 disconnects, NO onConnect is executed
    dispatchCustomMessageEvent({
      action: "update",
      device_id: silenced_id,
      device_data: { location: "disconnect" }
    });

    expect(airconsole.onDisconnect).toHaveBeenCalledTimes(0);
  });
  
  const defaultSilencingParameterDeductionnParams = [
    { description: "Should by default have player silencing enabled for API 1.9.0", input: '1.9.0', result: true },
    { description: "Should by default have player silencing disabled for latest API", input: 'latest', result: false }
  ];
  defaultSilencingParameterDeductionnParams.forEach(parameter => {
    it(parameter.description, () => {
      initAirConsole(undefined, parameter.input);
      
      expect(airconsole.silence_inactive_players).toBe(parameter.result); 
    });
  });

  function initAirConsoleWithSilencedDevice(connected_id = 1, silenced_id = 2, active_device_id = 0) {
    initAirConsole({ silence_inactive_players: true });
    airconsole.devices = [];
    airconsole.devices[AirConsole.SCREEN] = { "device": "Screen", location: LOCATION };
    airconsole.devices[connected_id] = { "device": "unicorn", location: LOCATION };
    airconsole.setActivePlayers(2);
    airconsole.devices[silenced_id] = { "device": "Na na na batman", location: LOCATION };
    airconsole.device_id = active_device_id;
  }
}

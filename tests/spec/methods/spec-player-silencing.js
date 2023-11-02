function testPlayerSilencing() {
  function initAirConsole(optional_arguments) {
    //
    airconsole = new AirConsole({
      setup_document: false,
      ...(!!optional_arguments ? optional_arguments : {})
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

  it("should silence players with AirConsole not containing a silencing configuration", function () {
    initAirConsole();
    airconsole.setActivePlayers(2);

    expect(airconsole.arePlayersSilenced()).toBe(false);
  });

  it("should not silence players without AirConsole configured to silence players", function () {
    initAirConsole({ silence_players: false });
    airconsole.setActivePlayers(2);

    expect(airconsole.arePlayersSilenced()).toBe(false);
  });

  it("should silence players with AirConsole configured to silence players", function () {
    initAirConsole({ silence_players: true });
    airconsole.setActivePlayers(2);

    expect(airconsole.arePlayersSilenced()).toBe(true);
  });

  it("should reset silencing players with 0 active players", () => {
    initAirConsole({ silence_players: true });
    airconsole.setActivePlayers(2);

    airconsole.setActivePlayers(0);

    expect(airconsole.arePlayersSilenced()).toBe(false);
  });

  const activePlayersBasedSilencingTestParameters = [
    { description: "should not silence players with 0 active players", input: 0, result: false },
    { description: "should silence players with 1 active player", input: 1, result: true },
    { description: "should silence players with 2 active players", input: 2, result: true },
    { description: "should silence players with 5 active players", input: 5, result: true }
  ];
  activePlayersBasedSilencingTestParameters.forEach(parameter => {
    it(parameter.description, () => {
      initAirConsole({ silence_players: true });

      airconsole.setActivePlayers(parameter.input);

      expect(airconsole.arePlayersSilenced()).toBe(parameter.result);
    })
  })

  it("Should ignore messages to silenced players on the controller", () => {
    const silenced_id = 2;
    initAirConsoleWithSilencedDevice(1, silenced_id, silenced_id);
    spyOn(airconsole, 'onMessage');

    const data = { action: "message", from: AirConsole.SCREEN, to: silenced_id, data: { message: "Hi" } };
    dispatchCustomMessageEvent(data);

    expect(airconsole.onMessage).toHaveBeenCalledTimes(0);
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

  function initAirConsoleWithSilencedDevice(connected_id = 1, silenced_id = 2, active_device_id = 0) {
    initAirConsole({ silence_players: true });
    airconsole.devices = [];
    airconsole.devices[AirConsole.SCREEN] = { "device": "screen", location: LOCATION };
    airconsole.devices[connected_id] = { "device": "unicorn", location: LOCATION };
    airconsole.setActivePlayers(2);
    airconsole.devices[silenced_id] = { "device": "Na na na batman", location: LOCATION };
    airconsole.device_id = active_device_id;
  }
}

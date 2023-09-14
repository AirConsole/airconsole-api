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

    var device_data = {
      uid: 1237,
      nickname: "Sergio",
      location: LOCATION,
      custom: {}
    };
    airconsole.devices[DEVICE_ID] = device_data;
  }

  it("should silence players with AirConsole not containing a silencing configuration", function () {
    initAirConsole();
    airconsole.setActivePlayers(2);

    expect(airconsole.getPlayersAreSilenced()).toBe(false);
  });

  it("should not silence players without AirConsole configured to silence players", function () {
    initAirConsole({ silence_players: false });
    airconsole.setActivePlayers(2);

    expect(airconsole.getPlayersAreSilenced()).toBe(false);
  });

  it("should silence players with AirConsole configured to silence players", function () {
    initAirConsole({ silence_players: true });
    airconsole.setActivePlayers(2);

    expect(airconsole.getPlayersAreSilenced()).toBe(true);
  });

  it("should reset silencing players with 0 active players", () => {
    initAirConsole({ silence_players: true });
    airconsole.setActivePlayers(2);

    airconsole.setActivePlayers(0);

    expect(airconsole.getPlayersAreSilenced()).toBe(false);
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

      expect(airconsole.getPlayersAreSilenced()).toBe(parameter.result);
    })
  })

  it("Should ignore messages to silenced players on the controller", () => {
    initAirConsole({ silence_players: true });
    const expected_id = 1;
    const silenced_id = 2;
    airconsole.devices = [];
    airconsole.devices[AirConsole.SCREEN] = { "device": "screen", location: LOCATION };
    airconsole.devices[expected_id] = { "device": "unicorn", location: LOCATION };
    airconsole.setActivePlayers(2);
    airconsole.devices[silenced_id] = { "device": "Na na na batman", location: LOCATION };
    airconsole.device_id = silenced_id;
    spyOn(airconsole, 'onMessage');

    const data = { action: "message", from: AirConsole.SCREEN, to: silenced_id, data: { message: "Hi" } };
    dispatchCustomMessageEvent(data);

    expect(airconsole.onMessage).toHaveBeenCalledTimes(0);
  });

  xit("Should ignore messages to silenced players on the screen", () => {
    initAirConsole({ silence_players: true });
  });

  xit("Should not send messages from the screen to silenced players", () => {
    initAirConsole({ silence_players: true });
  });

  xit("Should not send messages from the controller to silenced players", () => {
    initAirConsole({ silence_players: true });

  });
}

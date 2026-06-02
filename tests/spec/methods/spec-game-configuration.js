function testGameConfiguration() {

  it ("Should retain gameConfiguration from ready event", function() {
    const gameConfiguration = {
      transparentVideoSupported: true,
      unityVideoSupported: true
    };
    dispatchCustomMessageEvent({
      action: "ready",
      code: 1237,
      device_id: 0,
      devices: [{}, undefined, airconsole.devices[DEVICE_ID]],
      gameConfiguration: gameConfiguration
    });

    expect(airconsole.getGameConfiguration()).toEqual(gameConfiguration);
  });

  it ("Should return `{}` when not provided in ready event", function() {
    dispatchCustomMessageEvent({
      action: "ready",
      code: 1237,
      device_id: 0,
      devices: [{}, undefined, airconsole.devices[DEVICE_ID]]
    });

    expect(airconsole.getGameConfiguration()).toEqual({});
  });

  it("Should return `{}` when getGameConfiguration is called on controller", function () {
    dispatchCustomMessageEvent({
      action: "ready",
      code: 1237,
      device_id: DEVICE_ID,
      devices: [{}, undefined, airconsole.devices[DEVICE_ID]]
    });

    expect(airconsole.getGameConfiguration()).toEqual({});
  });

  it("Should throw before onReady fires", function () {
    airconsole.device_id = undefined;

    expect(airconsole.getGameConfiguration.bind(airconsole)).toThrow("getGameConfiguration is available only after onReady.");
  });

}

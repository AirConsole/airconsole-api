function testGameConfiguration() {

  it ("Should store configuration from ready event", function() {
    const configuration = {
      transparentVideoSupported: true,
      unityVideoSupported: true,
      gamePerformanceLevel: "high"
    };
    dispatchCustomMessageEvent({
      action: "ready",
      code: 1237,
      device_id: 0,
      devices: [{}, undefined, airconsole.devices[DEVICE_ID]],
      configuration: configuration
    });

    expect(airconsole.getGameConfiguration()).toEqual(configuration);
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

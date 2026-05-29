function testGetConfiguration() {

  it ("Should store configuration from ready event", function() {
    const configuration = {
      supportedVideoFormats: ["vp9", "h264", "vp8"],
      transparentVideoSupported: true,
      unityVideoSupported: true,
      graphicsQualityTier: "high"
    };
    dispatchCustomMessageEvent({
      action: "ready",
      code: 1237,
      device_id: 0,
      devices: [{}, undefined, airconsole.devices[DEVICE_ID]],
      configuration: configuration
    });
    expect(airconsole.getConfiguration()).toEqual(configuration);
  });

  it ("Should return `{}` when not provided in ready event", function() {
    dispatchCustomMessageEvent({
      action: "ready",
      code: 1237,
      device_id: 0,
      devices: [{}, undefined, airconsole.devices[DEVICE_ID]]
    });

    expect(airconsole.getConfiguration()).toEqual({});
  });

  it("Should throw before onReady fires", function () {
    airconsole.device_id = undefined;

    expect(airconsole.getConfiguration.bind(airconsole)).toThrow("getConfiguration is available only after onReady.");
  });

  it("Should throw when getConfiguration is called on controller", function () {
    const configuration = {
      supportedVideoFormats: ["vp9", "h264", "vp8"],
      transparentVideoSupported: true,
      unityVideoSupported: true,
      graphicsQualityTier: "high"
    };
    dispatchCustomMessageEvent({
      action: "ready",
      code: 1237,
      device_id: DEVICE_ID,
      devices: [{}, undefined, airconsole.devices[DEVICE_ID]],
      configuration
    });

    expect(airconsole.getConfiguration.bind(airconsole)).toThrow("getConfiguration is only supported on AirConsole.SCREEN.");
  });

}

function testGetConfiguration() {

  it ("Should store configuration from ready event", function() {
    var configuration = {
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

  it ("Should return undefined configuration when not provided in ready event", function() {
    dispatchCustomMessageEvent({
      action: "ready",
      code: 1237,
      device_id: 0,
      devices: [{}, undefined, airconsole.devices[DEVICE_ID]]
    });
    expect(airconsole.getConfiguration()).toBeUndefined();
  });

  it ("Should return undefined configuration before onReady fires", function() {
    // getConfiguration() must return undefined until the READY message has been processed;
    // a freshly-constructed AirConsole instance has not yet received a ready event.
    expect(airconsole.getConfiguration()).toBeUndefined();
  });

}

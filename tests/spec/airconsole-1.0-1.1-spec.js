describe("API 1.0 - 1.1 compatible", function() {

  var air_console = null;

  beforeEach(function() {
  });

  afterEach(function() {
    window.removeEventListener('message');
    window.onbeforeunload = null;
    air_console = null;
  });

  it ("should call onReady when window message event is dispatched with action equal ready", function() {
    var device_id = 8;
    air_console = new AirConsole();
    spyOn(air_console, 'onReady');
    // Trigger Event
    var fake_event = new Event('message');
    fake_event.data = {
      action: "ready",
      device_id: device_id,
      devices: [1, 5, 8],
      code: 1034
    };
    window.dispatchEvent(fake_event);
    //
    expect(air_console.onReady).toHaveBeenCalledWith(1034, device_id);
    expect(air_console.devices).toEqual([1, 5, 8]);
  });
});
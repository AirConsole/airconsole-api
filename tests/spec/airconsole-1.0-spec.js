describe("API 1.0", function() {

  var air_console = null;

  beforeEach(function() {
  });

  afterEach(function() {
    window.removeEventListener('message');
    window.onbeforeunload = null;
    air_console = null;
  });

  it ("should have constant SCREEN property with value 0", function() {
    expect(AirConsole.SCREEN).toEqual(0);
  });

  it ("should init with empty opts", function() {
    var expected_opts = {};
    air_console = new AirConsole(expected_opts);
    expect(air_console.server_time_offset).toEqual(false);
  });

  it ("should init with specified opts", function() {
    var expected_opts = {
      synchronize_time: true
    };
    air_console = new AirConsole(expected_opts);
    expect(air_console.server_time_offset).toEqual(0);
  });

  it ("should call postMessage_ method when calling message method", function() {
    var custom_data = { url: "airconsole.com" };
    var expected_data = { action: "message", to: 1, data: custom_data };
    air_console = new AirConsole();
    air_console.device_id = 1;
    spyOn(air_console, 'postMessage_');
    air_console.message(1, custom_data);
    expect(air_console.postMessage_).toHaveBeenCalledWith(expected_data);
  });

  it ("should call postMessage_ method when calling broadcast method", function() {
    var custom_data = { url: "airconsole.com" };
    var expected_data = { action: "message", to: undefined, data: custom_data };
    air_console = new AirConsole();
    air_console.device_id = 1;
    spyOn(air_console, 'postMessage_');
    air_console.broadcast(custom_data);
    expect(air_console.postMessage_).toHaveBeenCalledWith(expected_data);
  });

  it ("should call postMessage_ method when navigating home", function() {
    var expected_data = { action: "set", key: "home", value: true };
    air_console = new AirConsole();
    air_console.device_id = 1;
    spyOn(air_console, 'postMessage_');
    air_console.navigateHome();
    expect(air_console.postMessage_).toHaveBeenCalledWith(expected_data);
  });

  it ("should call postMessage_ method when setting UI", function() {
    var expected_data = { action: "set", key: "default_ui", value: true };
    air_console = new AirConsole();
    air_console.device_id = 1;
    spyOn(air_console, 'postMessage_');
    air_console.showDefaultUI(true);
    expect(air_console.postMessage_).toHaveBeenCalledWith(expected_data);
  });

  it ("should throw error when requesting time offset without declaring it", function() {
    air_console = new AirConsole();
    expect(air_console.getServerTime.bind(air_console)).toThrow();
  });

  it ("should call onMessage when window message event is dispatched with action equal message", function() {
    air_console = new AirConsole();
    var device_id = 1;
    var device_data = {
      uid: 8237,
      nickname: "Sergio",
      location: document.location.href
    };
    air_console.device_id = device_id;
    air_console.devices[device_id] = device_data;
    spyOn(air_console, 'onMessage');
    // Trigger Event
    var fake_event = new Event('message');
    fake_event.data = {
      action: "message",
      from: device_id,
      location: document.location.href,
      data: {
        games: "are fun"
      }
    };
    window.dispatchEvent(fake_event);
    //
    var expected_data = {
      games: "are fun"
    };
    expect(air_console.onMessage).toHaveBeenCalledWith(1, expected_data);
  });

  it ("should call onDeviceStateChange when window message event is dispatched with action equal update", function() {
    var from = 8;
    air_console = new AirConsole();
    air_console.device_id = 1;
    spyOn(air_console, 'onDeviceStateChange');
    // Trigger Event
    var fake_event = new Event('message');
    fake_event.data = {
      action: "update",
      device_id: from,
      device_data: {
        player: "numero ocho"
      }
    };
    window.dispatchEvent(fake_event);
    //
    var expected_data = {
      player: "numero ocho"
    };
    expect(air_console.onDeviceStateChange).toHaveBeenCalledWith(from, expected_data);
    expect(air_console.devices[from]).toEqual(expected_data);
  });
});

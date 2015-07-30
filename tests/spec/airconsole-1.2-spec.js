describe("API 1.2", function() {

  var air_console = null;

  beforeEach(function() {
    air_console = new AirConsole({
      setup_document: false
    });
    var device_id = 1;
    var device_data = {
      uid: 8237,
      nickname: "Sergio"
    };
    air_console.devices[device_id] = device_data;
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
      code: 1034,
    };
    window.dispatchEvent(fake_event);
    //
    expect(air_console.onReady).toHaveBeenCalledWith(1034);
    expect(air_console.devices).toEqual([1, 5, 8]);
  });

  it ("should return nickname if device has nickname set", function() {
    var actual_name = air_console.getNickname(1);
    var expected_name = "Sergio";
    expect(expected_name).toEqual(actual_name);
  });

  it ("should return default name if device has nickname NOT set", function() {
    delete air_console.devices[1].nickname;

    var actual_name = air_console.getNickname(1);
    var expected_name = "Player 1";
    expect(expected_name).toEqual(actual_name);
  });

  it ("should return profile picture", function() {
    var actual_path = air_console.getProfilePicture(1, 320);
    var expected_path = "http://www.airconsole.com/api/profile-picture?uid=8237&size=320";
    expect(expected_path).toEqual(actual_path);
  });

  it ("should return profile picture with size 64 when no size param passed", function() {
    var actual_path = air_console.getProfilePicture(1);
    var expected_path = "http://www.airconsole.com/api/profile-picture?uid=8237&size=64";
    expect(expected_path).toEqual(actual_path);
  });

  it ("should return undefined when requesting picture for non-existing device_id", function() {
    air_console.devices = [];
    var actual_path = air_console.getProfilePicture(1);
    var expected_path = undefined;
    expect(expected_path).toEqual(actual_path);
  });

});

function testNavigation() {
  it ("Should call postMessage_ method when using navigateTo", function() {
    var url = 'http://airconsole.com';
    var expected_data = { action: "set", key: "home", value: url };
    airconsole.device_id = 1;
    spyOn(AirConsole, 'postMessage_');
    airconsole.navigateTo(url);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
  });

  it ("Should call postMessage_ method when navigating home", function() {
    var expected_data = { action: "set", key: "home", value: true };
    airconsole.device_id = 1;
    spyOn(AirConsole, 'postMessage_');
    airconsole.navigateHome();
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
  });

  it ("Should call postMessage_ method when calling openExternalUrl", function() {
    var url = 'http://ndream.com';
    var expected_data = { action: "set", key: "pass_external_url", value: url };
    spyOn(AirConsole, 'postMessage_');
    airconsole.device_id = DEVICE_ID;
    airconsole.devices[DEVICE_ID].client = {
      pass_external_url: true
    };
    airconsole.openExternalUrl(url);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
  });

  it ("Should not call postMessage_ method but open browser window when calling openExternalUrl", function() {
    var url = 'http://ndream.com';
    var expected_data = { action: "set", key: "pass_external_url", value: url };
    spyOn(AirConsole, 'postMessage_');
    spyOn(window, 'open');
    airconsole.device_id = DEVICE_ID;
    airconsole.devices[DEVICE_ID].client = {};
    airconsole.openExternalUrl(url);
    expect(window.open).toHaveBeenCalled();
    expect(AirConsole.postMessage_).not.toHaveBeenCalled();
  });
}

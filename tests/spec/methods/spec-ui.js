function testUI() {
  it ("Should call postMessage_ method when setting UI", function() {
    var expected_data = { action: "set", key: "default_ui", value: true };
    spyOn(AirConsole, 'postMessage_');
    airconsole.showDefaultUI(true);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
  });

  it ("Should call postMessage_ method when setting orientation", function() {
    var expected_data = { action: "set", key: "orientation", value: AirConsole.ORIENTATION_LANDSCAPE };
    spyOn(AirConsole, 'postMessage_');
    airconsole.setOrientation(AirConsole.ORIENTATION_LANDSCAPE);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
  });

}

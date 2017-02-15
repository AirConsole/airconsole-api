function testCtrlInputs() {
  it ("Should handle action device_motion", function() {
    var custom_data = { x: 2, y: -35 };
    spyOn(airconsole, 'onDeviceMotion');
    dispatchCustomMessageEvent({
     action: "device_motion",
     data: custom_data,
    });
    expect(airconsole.onDeviceMotion).toHaveBeenCalledWith(custom_data);
  });

  it ("Should handle action vibrate", function() {
    var time = 100;
    spyOn(AirConsole, 'postMessage_');
    airconsole.vibrate(time);
    var expected_data = { action: "set", key: "vibrate", value: time };
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
  });

}

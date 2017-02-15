function testMessaging() {

  it ("Should call postMessage_ function when calling message()", function() {
    var expected_data = { msg: "Ninja Turtle" };
    var expected_params = { action: "message", to: DEVICE_ID, data: expected_data };
    spyOn(AirConsole, 'postMessage_');
    airconsole.message(DEVICE_ID, expected_data);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_params);
  });

  it ("Should call postMessage_ function when calling broadcast()", function() {
    var expected_data = { msg: "Ninja Turtle" };
    var expected_params = { action: "message", to: undefined, data: expected_data };
    spyOn(AirConsole, 'postMessage_');
    airconsole.broadcast(expected_data);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_params);
  });

  it ("Should handle postMessage with action 'message' correctly", function() {
    var custom_data = { eat: "burger" };
    spyOn(airconsole, 'onMessage');
    dispatchCustomMessageEvent({
    action: "message",
    from: DEVICE_ID,
    data: custom_data
    });
    expect(airconsole.onMessage).toHaveBeenCalledWith(DEVICE_ID, custom_data);
  });

}

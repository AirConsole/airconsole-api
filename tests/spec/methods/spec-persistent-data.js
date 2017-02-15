function testPersistentData() {
  it ("Should call postMessage_ method when requesting persistent data", function() {
    var uids = [1, 3];
    var expected_data = { action: "set", key: "persistentrequest", value: { uids: uids } };
    spyOn(AirConsole, 'postMessage_');
    airconsole.requestPersistentData(uids);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
  });

  it ("Should call postMessage_ method when storing persistent data", function() {
    var value = { key: "hero", value: 2, uid: 293 };
    var expected_data = { action: "set", key: "persistentstore", value: value };
    spyOn(AirConsole, 'postMessage_');
    airconsole.storePersistentData("hero", 2, 293);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
  });
}

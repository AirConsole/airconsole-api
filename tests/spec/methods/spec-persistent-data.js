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

  it ("Should throw an error when storing persistent data without a uid from screen", function() {
    airconsole.device_id = 0;
    var value = { key: "hero", value: 2, uid: 293 };
    var expected_data = { action: "set", key: "persistentstore", value: value };

    try {
      airconsole.storePersistentData("hero", 2);
    } catch (e){
      expect(e).toEqual(new Error("A valid uid must be provided on the screen"));
    }
  });

  it ("Should throw an error when storing persistent data without a uid from controller", function() {
    airconsole.device_id = 1;
    expected_uid = 123;
    airconsole.devices[1] = { uid: expected_uid }
    spyOn(AirConsole, 'postMessage_');

    airconsole.storePersistentData("hero", 2);

    expect(AirConsole.postMessage_).toHaveBeenCalledWith({ action: 'set', key: 'persistentstore', value: { key: 'hero', value: 2, uid: expected_uid}});
  });

  it ("Should throw an error when requesting persistent data without uids from screen", function() {
    airconsole.device_id = 0;

    try {
      airconsole.requestPersistentData();
    } catch (e){
      expect(e).toEqual(new Error("A valid array of uids must be provided on the screen"));
    }
  });

  it ("Should complete the uid when requesting persistent data without uids from controller", function() {
    airconsole.device_id = 1;
    expected_uid = 123;
    airconsole.devices[1] = { uid: expected_uid }
    spyOn(AirConsole, 'postMessage_');

    airconsole.requestPersistentData();

    expect(AirConsole.postMessage_).toHaveBeenCalledWith({ action: 'set', key: 'persistentrequest', value: { uids: [expected_uid]}});
  });

  it ("Should throw an error when requesting persistent data with an empty uids array from screen", function() {
    airconsole.device_id = 0;

    try {
      airconsole.requestPersistentData([]);
    } catch (e){
      expect(e).toEqual(new Error("At least one valid uid must be provided on the screen"));
    }
  });
}

function testPersistentData_190_up() {
  it ("Should complete the uid when requesting persistent data with empty uids from controller", function() {
    airconsole.device_id = 1;
    expected_uid = 123;
    airconsole.devices[1] = { uid: expected_uid }
    spyOn(AirConsole, 'postMessage_');

    airconsole.requestPersistentData([]);

    expect(AirConsole.postMessage_).toHaveBeenCalledWith({ action: 'set', key: 'persistentrequest', value: { uids: [expected_uid]}});
  });
}
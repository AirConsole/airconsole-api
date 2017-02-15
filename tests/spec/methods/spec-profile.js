function testProfile() {
  it ("Should return correct UID", function() {
    var expected_uid = "UID14";
    airconsole.devices[DEVICE_ID].uid = expected_uid;
    var actual_uid = airconsole.getUID(DEVICE_ID);
    expect(actual_uid).toEqual(expected_uid);
  });

  it ("Should return correct UID when no param is set", function() {
    var expected_uid = "UID14";
    airconsole.device_id = DEVICE_ID;
    airconsole.devices[DEVICE_ID].uid = expected_uid;
    var actual_uid = airconsole.getUID();
    expect(actual_uid).toEqual(expected_uid);
  });

  it ("Should return undefined UID when device does not exist", function() {
    var expected_uid = undefined;
    var actual_uid = airconsole.getUID(34);
    expect(actual_uid).toEqual(expected_uid);
  });

  it ("Should return nickname if device has nickname set", function() {
    var actual_name = airconsole.getNickname(DEVICE_ID);
    var expected_name = "Sergio";
    expect(expected_name).toEqual(actual_name);
  });

  it ("Should return Guest name if device has nickname NOT set", function() {
    delete airconsole.devices[DEVICE_ID].nickname;
    var actual_name = airconsole.getNickname(DEVICE_ID);
    var expected_name = "Guest 2";
    expect(expected_name).toEqual(actual_name);
  });

  it ("Should return undefined when requesting nickname for non-existing device_id", function() {
    var actual_name = airconsole.getNickname(3);
    var expected_name = undefined;
    expect(expected_name).toEqual(actual_name);
  });

  it ("Should return profile picture", function() {
    var actual_path = airconsole.getProfilePicture(DEVICE_ID, 320);
    var expected_path = "https://www.airconsole.com/api/profile-picture?uid=1237&size=320";
    expect(expected_path).toEqual(actual_path);
  });

  it ("Should return profile picture with size 64 when no size param passed", function() {
    var actual_path = airconsole.getProfilePicture(DEVICE_ID);
    var expected_path = "https://www.airconsole.com/api/profile-picture?uid=1237&size=64";
    expect(expected_path).toEqual(actual_path);
  });

  it ("Should return undefined when requesting picture for non-existing device_id", function() {
    airconsole.devices = [];
    var actual_path = airconsole.getProfilePicture(1);
    var expected_path = undefined;
    expect(expected_path).toEqual(actual_path);
  });

  it ("Should return correct values for isUserLoggedIn", function() {
    airconsole.devices = [];
    var device_data_1 = {
      location: LOCATION,
      custom: {},
      auth: false
    };
    var device_data_3 = {
      location: LOCATION,
      custom: {},
      auth: true
    };
    airconsole.devices[1] = device_data_1;
    airconsole.devices[3] = device_data_3;

    expect(airconsole.isUserLoggedIn(3)).toEqual(true);
    expect(airconsole.isUserLoggedIn(1)).toEqual(false);
  });

  it ("Should call postMessage_ on calling requestEmailAddress", function() {
    var expected_data = { action: "set", key: "email", value: true };
    spyOn(AirConsole, 'postMessage_');
    airconsole.requestEmailAddress();
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
  });


  it ("Should call profile change handler when device changes profile", function() {
    spyOn(airconsole, 'onDeviceProfileChange');
    dispatchCustomMessageEvent({
      action: "update",
      device_id: DEVICE_ID,
      device_data: {
        location: LOCATION,
        _is_profile_update: true
      }
    });
    expect(airconsole.onDeviceProfileChange).toHaveBeenCalledWith(DEVICE_ID);
  });
}

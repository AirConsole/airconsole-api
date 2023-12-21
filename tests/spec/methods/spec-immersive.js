function testImmersive() {

  it('Should call postMessage_ with the correct object when called from screen with zoneId', function(){
    var payload = [{color: "#fff", zoneId: 1}];
    var expected_data = {1: {color: "#fff"}};
    var expected_params = {action: "set", key: "immersive", value: expected_data};
    airconsole.devices[0].location = LOCATION;
    spyOn(AirConsole, 'postMessage_');
    
    airconsole.setImmersiveState(payload);
    
    // TODO(marc): Is this local information actually necessary or was that just an afterthought due to customDeviceState capabilities?
    expect(airconsole.devices[AirConsole.SCREEN].immersive).toEqual(expected_data);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_params);
  });

  it('Should call postMessage_ with the correct object when called from screen with many zoneId', function(){
    var payload = [{color: "#fff", zoneId: 1}, {color: "#f00", zoneId: 0}];
    var expected_data = {1: {color: "#fff"},0:{color: "#f00"}};
    var expected_params = {action: "set", key: "immersive", value: expected_data};
    airconsole.devices[0].location = LOCATION;
    spyOn(AirConsole, 'postMessage_');
    
    airconsole.setImmersiveState(payload);
   
    // TODO(marc): Is this local information actually necessary or was that just an afterthought due to customDeviceState capabilities? 
    expect(airconsole.devices[AirConsole.SCREEN].immersive).toEqual(expected_data);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_params);
  });


  it('Should call postMessage_ with the correct object when called from device', function(){
    airconsole.devices[AirConsole.SCREEN] = { "device": "screen",  location: LOCATION };
    airconsole.devices[2]  = { "device": "unicorn", location: LOCATION };
    airconsole.setActivePlayers(1);
    airconsole.device_id = 2;
    var payload = [{color: "#fff"}];
    var expected_data = {0: {color: "#fff"}};
    var expected_params = {action: "set", key: "immersive", value: expected_data};
    airconsole.devices[0].location = LOCATION;
    spyOn(AirConsole, 'postMessage_');
    
    airconsole.setImmersiveState(payload);
   
    // TODO(marc): Is this local information actually necessary or was that just an afterthought due to customDeviceState capabilities? 
    expect(airconsole.devices[airconsole.device_id].immersive[airconsole.convertDeviceIdToPlayerNumber(airconsole.device_id)]).toEqual(expected_data);
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_params);
  });
}

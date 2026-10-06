function testPhotonEngineAuth() {
  it("Should post an photonengineauth set request from the screen", function () {
    spyOn(AirConsole, "postMessage_");

    airconsole.requestPhotonEngineAuth();

    expect(AirConsole.postMessage_).toHaveBeenCalledWith({ action: "set", key: "photonengineauth", value: {} });
  });

  it("Should throw when a controller requests Photon Engine authentication", function () {
    airconsole.device_id = DEVICE_ID;

    expect(function () {
      airconsole.requestPhotonEngineAuth();
    }).toThrow(new Error("Only the screen can request Photon Engine authentication."));
  });

  it("Should pass the ticket to onPhotonEngineAuth", function () {
    spyOn(airconsole, "onPhotonEngineAuth");

    dispatchCustomMessageEvent({ action: "photonengineauth", data: { ticket: "abc" } });

    expect(airconsole.onPhotonEngineAuth).toHaveBeenCalledWith("abc");
  });

  it("Should pass null to onPhotonEngineAuth when the request failed", function () {
    spyOn(airconsole, "onPhotonEngineAuth");

    dispatchCustomMessageEvent({ action: "photonengineauth", data: { ticket: null } });

    expect(airconsole.onPhotonEngineAuth).toHaveBeenCalledWith(null);
  });
}

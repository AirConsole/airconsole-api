function testExitGamesAuth() {
  it("Should post an exitgamesauth set request from the screen", function () {
    spyOn(AirConsole, "postMessage_");

    airconsole.requestExitGamesAuth();

    expect(AirConsole.postMessage_).toHaveBeenCalledWith({ action: "set", key: "exitgamesauth", value: {} });
  });

  it("Should throw when a controller requests ExitGames authentication", function () {
    airconsole.device_id = DEVICE_ID;

    expect(function () {
      airconsole.requestExitGamesAuth();
    }).toThrow(new Error("Only the screen can request ExitGames authentication."));
  });

  it("Should pass the ticket to onExitGamesAuth", function () {
    spyOn(airconsole, "onExitGamesAuth");

    dispatchCustomMessageEvent({ action: "exitgamesauth", data: { ticket: "abc" } });

    expect(airconsole.onExitGamesAuth).toHaveBeenCalledWith("abc");
  });

  it("Should pass null to onExitGamesAuth when the request failed", function () {
    spyOn(airconsole, "onExitGamesAuth");

    dispatchCustomMessageEvent({ action: "exitgamesauth", data: { ticket: null } });

    expect(airconsole.onExitGamesAuth).toHaveBeenCalledWith(null);
  });
}

function testAds() {
  it ("Should call postMessage_ on calling showAd", function() {
    var expected_data = { action: "set", key: "ad", value: true };
    spyOn(AirConsole, 'postMessage_');
    airconsole.showAd();
    expect(AirConsole.postMessage_).toHaveBeenCalledWith(expected_data);
  });

  it ("Should call ad-handler on post message 'ad'", function() {
    spyOn(airconsole, 'onAdShow');
    dispatchCustomMessageEvent({
      action: "ad",
      complete: undefined
    });
    expect(airconsole.onAdShow).toHaveBeenCalledWith();
  });

  it ("Should call ad-complete-handler on post message 'ad'", function() {
    spyOn(airconsole, 'onAdComplete');
    dispatchCustomMessageEvent({
      action: "ad",
      complete: true
    });
    expect(airconsole.onAdComplete).toHaveBeenCalledWith(true);
  });
}

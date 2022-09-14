function testOnMute() {
  it ("Should call onMute(true) when post message is received", function() {
    spyOn(airconsole, 'onMute');
    dispatchCustomMessageEvent({
                                 action: "mute",
                                 mute: true
                               });
    expect(airconsole.onMute).toHaveBeenCalledWith(true);
  });

  it ("Should call onMute(true) when post message is received", function() {
    spyOn(airconsole, 'onMute');
    dispatchCustomMessageEvent({
                                 action: "mute",
                                 mute: false
                               });
    expect(airconsole.onMute).toHaveBeenCalledWith(false);
  });

}

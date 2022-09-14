function testOnPauseOnResume() {
  it ("Should call onPause when post message is received", function() {
    spyOn(airconsole, 'onPause');
    dispatchCustomMessageEvent({
                                 action: "pause"
                               });
    expect(airconsole.onPause).toHaveBeenCalled();
  });

  it ("Should call onResume when post message is received", function() {
    spyOn(airconsole, 'onResume');
    dispatchCustomMessageEvent({
                                 action: "resume"
                               });
    expect(airconsole.onResume).toHaveBeenCalled();
  });

}

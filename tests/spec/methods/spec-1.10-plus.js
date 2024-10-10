function testAirConsole110Plus() {
  
  function initAirConsole(optional_arguments) {
    airconsole = new AirConsole({
      setup_document: false,
      ...(!!optional_arguments ? optional_arguments : {})
    });
  }

  it("Should forward supportsNativeGameSizing in init", function () {
    spyOn(AirConsole, 'postMessage_');
    initAirConsole({supportsNativeGameSizing: true});

    expect(AirConsole.postMessage_).toHaveBeenCalledWith(
      jasmine.objectContaining({ supportsNativeGameSizing: true})
    );
  });
}
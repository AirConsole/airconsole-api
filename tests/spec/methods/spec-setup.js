function testSetup(version) {

    it ("Should have defined the correct version", function() {
      airconsole = new AirConsole({
        setup_document: false
      });
      expect(airconsole.version).toEqual(version);
    });

    it ("Should have defined constants correctly", function() {
      expect(AirConsole.SCREEN).toEqual(0);
      expect(AirConsole.ORIENTATION_PORTRAIT).toEqual("portrait");
      expect(AirConsole.ORIENTATION_LANDSCAPE).toEqual("landscape");
    });

    it ("Should initialize correctly with default options", function() {
      airconsole = new AirConsole({
        setup_document: false
      });
      expect(airconsole.devices).toEqual([]);
      expect(airconsole.server_time_offset).toEqual(false);
    });

    it ("Should initialize correctly with custom options", function() {
      airconsole = new AirConsole({
        setup_document: false,
        synchronize_time: true
      });
      expect(airconsole.devices).toEqual([]);
      expect(airconsole.server_time_offset).toEqual(0);
    });

    it ("Should bind window.onMessage handler correctly", function() {
      airconsole = new AirConsole({
        setup_document: false
      });
      spyOn(airconsole, 'onPostMessage_');
      dispatchCustomMessageEvent();
      expect(airconsole.onPostMessage_).toHaveBeenCalled();
    });

    it ("Should throw error when requesting time offset without declaring it", function() {
      airconsole = new AirConsole();
      expect(airconsole.getServerTime.bind(airconsole)).toThrow();
    });

    it ("Should call postMessage_ on error", function() {
      spyOn(AirConsole, 'postMessage_');
      dispatchCustomMessageEvent({}, 'error');
      expect(AirConsole.postMessage_).toHaveBeenCalled();
    });

}

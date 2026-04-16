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
      // Dispatching a real 'error' event on window is intercepted by Jasmine 4's
      // global error handler. Capture the listener AirConsole registered and call it directly.
      let errorListener = null;
      const origAdd = window.addEventListener;
      spyOn(window, 'addEventListener').and.callFake(function(type, fn, opts) {
        if (type === 'error') errorListener = fn;
        origAdd.call(window, type, fn, opts);
      });
      // Re-instantiate so our spy captures the registration
      const airConsole = new AirConsole({setup_document: false});
      window.addEventListener.and.callThrough();
      if (errorListener) {
        errorListener({ message: 'test error', error: null });
      }
      expect(AirConsole.postMessage_).toHaveBeenCalled();
      window.removeEventListener('error', errorListener);
    });

}

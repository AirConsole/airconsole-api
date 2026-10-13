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

/**
 * Safari's privacy protections empty document.referrer in sandboxed or cross-site game frames.
 */
function testPostMessageWithoutReferrer() {

    describe("Without document.referrer", function() {
      let host;
      let blobUrl;

      afterEach(function() {
        if (host) host.remove();
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        host = blobUrl = undefined;
      });

      it ("Should post the ready message to the parent", function(done) {
        // The bundle this runner loaded, so each runner tests its own version.
        const bundleUrl = [...document.scripts].map((s) => s.src).find((src) => /airconsole-\d+\.\d+\.\d+\.js$/.test(src));
        if (!bundleUrl) return done.fail('AirConsole bundle script not found');
        // Without an empty referrer the old code path would pass too, so the frame only starts AirConsole then.
        const html = '<script src="' + bundleUrl + '"><\/script>'
          + '<script>if (document.referrer === "") new AirConsole({ setup_document: false });<\/script>';
        blobUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
        // The about:blank host gives the game frame an empty referrer and keeps its messages away from the
        // AirConsole instances of this runner.
        host = document.createElement('iframe');
        document.body.appendChild(host);
        const frame = host.contentDocument.createElement('iframe');
        frame.setAttribute('sandbox', 'allow-scripts');
        frame.src = blobUrl;

        host.contentWindow.addEventListener('message', function(event) {
          if (event.source !== frame.contentWindow || event.data.action !== 'ready') return;
          expect(event.origin).toBe('null'); // Sent by the sandboxed frame
          done();
        });
        host.contentDocument.body.appendChild(frame);
      });
    });

}

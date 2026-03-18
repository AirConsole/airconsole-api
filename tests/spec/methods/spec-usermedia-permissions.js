function testUserMediaPermissions() {
  function initAirConsoleAsController() {
    spyOn(document, 'getElementsByTagName').and.callFake(function() {
      return [{ src: 'http://localhost/api/airconsole-latest.js' }];
    });
    airconsole = new AirConsole({ setup_document: false });
    airconsole.device_id = DEVICE_ID; // 2 = controller
    airconsole.devices[0] = {};
    airconsole.devices[DEVICE_ID] = { uid: 1237, nicktype: 'Sergio', location: LOCATION, custom: {} };
  }

  beforeEach(function() {
    jasmine.clock().install();      // ← install for ALL tests
    initAirConsoleAsController();
  });

  afterEach(function() {
    jasmine.clock().uninstall();    // ← uninstall after ALL tests
  });

  // Group 1: Early rejections (sync, resolve immediately)

  it('Should reject with "getUserMedia is not supported on screen" when device_id === AirConsole.SCREEN', function(done) {
    airconsole.device_id = AirConsole.SCREEN;

    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: getUserMedia is not supported on screen');
      done();
    });
  });

  it('Should reject with "AirConsole not ready" when device_id === undefined', function(done) {
    airconsole.device_id = undefined;

    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: AirConsole not ready');
      done();
    });
  });

  it('Should reject with "AirConsole not ready" when device_id === null', function(done) {
    airconsole.device_id = null;

    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: AirConsole not ready');
      done();
    });
  });

  it('Should reject with "Request already in progress" when media_permission_pending_ is already true', function(done) {
    airconsole.media_permission_pending_ = true;

    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: Request already in progress');
      done();
    });
  });

  it('Should reject with "getUserMedia failed: audio or video constraint must be specified" when constraints are null', function(done) {

    airconsole.getUserMedia(null).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: audio or video constraint must be specified');
      done();
    });
  });

  it('Should reject with "getUserMedia failed: audio or video constraint must be specified" when constraints are undefined', function(done) {

    airconsole.getUserMedia(undefined).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: audio or video constraint must be specified');
      done();
    });
  });

  it('Should reject with "getUserMedia failed: audio or video constraint must be specified" when constraints are empty', function(done) {

    airconsole.getUserMedia({}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: audio or video constraint must be specified');
      done();
    });
  });

  it('Should set media_permission_pending_ to true when a valid request is started', function(done) {
    spyOn(airconsole, 'sendEvent_');

    airconsole.getUserMedia({audio: true});

    expect(airconsole.media_permission_pending_).toBe(true);
    done();
  });

  it('Should call sendEvent_(...) with correct payload when valid', function(done) {
    spyOn(airconsole, 'sendEvent_');

    airconsole.getUserMedia({audio: true});

    expect(airconsole.sendEvent_).toHaveBeenCalledWith(
      'request-media-permission',
      jasmine.objectContaining({ constraints: { audio: true } })
    );
    done();
  });

  // Group 2: _resolveMediaPermission_ / event handler responses

  it('Should resolve with {success: false, reason} on usermedia-permission-denied operation', function(done) {
    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.reason).toBe('denied-temporary');
      done();
    });

    dispatchCustomMessageEvent({ action: 'event', type: 'usermedia-permission-denied', data: { denial: false } });
  });

  it('Should resolve with {success: true, stream: <stream>} on usermedia-permission-granted when getUserMedia succeeds with audio tracks', async function() {

    const fakeStream = {
      getAudioTracks: function() {
        return [{}];
      }
    };
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
    dispatchCustomMessageEvent({action: 'event', type: 'usermedia-permission-granted'});

    const result = await airconsole.getUserMedia({audio: true});
    expect(result.success).toBe(true);
    expect(result.stream).toBe(fakeStream);
  });

  it('Should resolve with {success: false, error: err} on usermedia-permission-granted when getUserMedia rejects', async function() {

     const testError = new Error('getUserMedia failed: Permission denied');
     spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.reject(testError));

     dispatchCustomMessageEvent({ action: 'event', type: 'usermedia-permission-granted' });

     const result = await airconsole.getUserMedia({audio:true}); //.then(function(result) {
     expect(result.success).toBe(false);
     expect(result.error).toBe(testError);
    });

  it('Should resolve with {success: true, stream: <stream>} on usermedia-permission-prompt when getUserMedia succeeds with audio tracks', function(done) {

    const fakeStream = { getAudioTracks: function() { return [{}]; } };
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));

    airconsole.getUserMedia({audio:true}).then(function(result) {
      expect(result.success).toBe(true);
      expect(result.stream).toBe(fakeStream);
      done();
    });

    dispatchCustomMessageEvent({ action: 'event', type: 'usermedia-permission-prompt' });
  });

  it('Should clear media_permission_pending_ after resolution', function(done) {
    spyOn(airconsole, 'sendEvent_');

    var fakeStream = { getAudioTracks: function() { return [{}]; } };
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));

    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(airconsole.media_permission_pending_).toBe(false);
      done();
    });

    dispatchCustomMessageEvent({ action: 'event', type: 'usermedia-permission-granted' });
  });

   it('Should handle double-call to _resolveMediaPermission_ safely (second call is no-op)', function(done) {
     spyOn(airconsole, 'sendEvent_');

     var resolveCallCount = 0;
     airconsole.getUserMedia({audio: true}).then(function(result) {
       resolveCallCount++;
       expect(resolveCallCount).toBe(1);
       expect(result.success).toBe(false);
       expect(result.reason).toBe('denied-temporary');

       // Now call _resolveMediaPermission_ again - this should be no-op
       airconsole._resolveMediaPermission_({ success: true });

       // Immediately verify resolveCallCount is still 1
       expect(resolveCallCount).toBe(1);
       done();
     });

     dispatchCustomMessageEvent({ action: 'event', type: 'usermedia-permission-denied', data: { denial: false } });
   });

  // Group 3: Timeout

  it('Should resolve with {success: false, error: {message: "timeout"}} after 30000ms', function(done) {
    spyOn(airconsole, 'sendEvent_');

    airconsole.getUserMedia({audio:true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('timeout');
      done();
    });

    jasmine.clock().tick(30001);
  });
}

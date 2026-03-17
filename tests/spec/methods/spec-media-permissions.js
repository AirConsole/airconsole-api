function testMediaPermissions() {
  function initAirConsoleAsController() {
    spyOn(document, 'getElementsByTagName').and.callFake(function() {
      return [{ src: 'http://localhost/api/airconsole-latest.js' }];
    });
    airconsole = new AirConsole({ setup_document: false });
    airconsole.device_id = DEVICE_ID; // 2 = controller
    airconsole.devices[0] = {};
    airconsole.devices[DEVICE_ID] = { uid: 1237, nicktype: 'Sergio', location: LOCATION, custom: {} };
  }

  // Group 1: Early rejections (sync, resolve immediately)
  
  it('Should reject with "getUserMedia is not supported on screen" when device_id === AirConsole.SCREEN', function(done) {
    initAirConsoleAsController();
    airconsole.device_id = AirConsole.SCREEN;
    
    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: getUserMedia is not supported on screen');
      done();
    });
  });

  it('Should reject with "AirConsole not ready" when device_id === undefined', function(done) {
    initAirConsoleAsController();
    airconsole.device_id = undefined;
    
    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: AirConsole not ready');
      done();
    });
  });

  it('Should reject with "AirConsole not ready" when device_id === null', function(done) {
    initAirConsoleAsController();
    airconsole.device_id = null;
    
    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: AirConsole not ready');
      done();
    });
  });

  it('Should reject with "Request already in progress" when media_permission_pending_ is already true', function(done) {
    initAirConsoleAsController();
    airconsole.media_permission_pending_ = true;
    
    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: Request already in progress');
      done();
    });
  });

  it('Should reject with "getUserMedia failed: audio or video constraint must be specified" when constraints are null', function(done) {
    initAirConsoleAsController();
    
    airconsole.getUserMedia(null).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: audio or video constraint must be specified');
      done();
    });
  });

  it('Should reject with "getUserMedia failed: audio or video constraint must be specified" when constraints are undefined', function(done) {
    initAirConsoleAsController();
    
    airconsole.getUserMedia(undefined).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: audio or video constraint must be specified');
      done();
    });
  });

  it('Should reject with "getUserMedia failed: audio or video constraint must be specified" when constraints are empty', function(done) {
    initAirConsoleAsController();
    
    airconsole.getUserMedia({}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: audio or video constraint must be specified');
      done();
    });
  });

  it('Should set media_permission_pending_ to true when a valid request is started', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'sendEvent_');
    
    airconsole.getUserMedia({audio: true});
    
    expect(airconsole.media_permission_pending_).toBe(true);
    done();
  });

  it('Should call sendEvent_(...) with correct payload when valid', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'sendEvent_');
    
    airconsole.getUserMedia({audio: true});
    
    expect(airconsole.sendEvent_).toHaveBeenCalledWith(
      'request-media-permission',
      jasmine.objectContaining({ constraints: { audio: true } })
    );
    done();
  });

  // Group 2: _resolveMediaPermission_ / event handler responses

  it('Should resolve with {success: false, error} on microphone-permission-denied operation', function(done) {
    initAirConsoleAsController();

    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: Permission denied');
      done();
    });
    
    dispatchCustomMessageEvent({ action: 'event', type: 'microphone-permission-denied' });
  });

  it('Should resolve with {success: true, stream: <stream>} on microphone-permission-granted when getUserMedia succeeds with audio tracks', function(done) {
    initAirConsoleAsController();

    var fakeStream = { getAudioTracks: function() { return [{}]; } };
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
    
    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(result.success).toBe(true);
      expect(result.stream).toBe(fakeStream);
      done();
    });
    
    dispatchCustomMessageEvent({ action: 'event', type: 'microphone-permission-granted' });
  });


  it('Should resolve with {success: false, error: err} on microphone-permission-granted when getUserMedia rejects', function(done) {
    initAirConsoleAsController();

    const testError = new Error('getUserMedia error');
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.reject(testError));
    
    airconsole.getUserMedia({audio:true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error).toBe(testError);
      done();
    });
    
    dispatchCustomMessageEvent({ action: 'event', type: 'microphone-permission-granted' });
  });

  it('Should resolve with {success: true, stream: <stream>} on microphone-permission-undefined when getUserMedia succeeds with audio tracks', function(done) {
    initAirConsoleAsController();

    const fakeStream = { getAudioTracks: function() { return [{}]; } };
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
    
    airconsole.getUserMedia({audio:true}).then(function(result) {
      expect(result.success).toBe(true);
      expect(result.stream).toBe(fakeStream);
      done();
    });
    
    dispatchCustomMessageEvent({ action: 'event', type: 'microphone-permission-undefined' });
  });

  it('Should clear media_permission_pending_ after resolution', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'sendEvent_');
    
    var fakeStream = { getAudioTracks: function() { return [{}]; } };
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
    
    airconsole.getUserMedia({audio: true}).then(function(result) {
      expect(airconsole.media_permission_pending_).toBe(false);
      done();
    });
    
    dispatchCustomMessageEvent({ action: 'event', type: 'microphone-permission-granted' });
  });

  it('Should handle double-call to _resolveMediaPermission_ safely (second call is no-op)', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'sendEvent_');
    
    var resolveCallCount = 0;
    airconsole.getUserMedia({audio: true}).then(function(result) {
      resolveCallCount++;
      expect(resolveCallCount).toBe(1);
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('getUserMedia failed: Permission denied');
      
      // Now call _resolveMediaPermission_ again - this should be no-op
      airconsole._resolveMediaPermission_({ success: true });
      
      // After a small delay, verify resolveCallCount is still 1
      setTimeout(function() {
        expect(resolveCallCount).toBe(1);
        done();
      }, 50);
    });
    
    dispatchCustomMessageEvent({ action: 'event', type: 'microphone-permission-denied' });
  });

  // Group 3: timeout

  it('Should resolve with {success: false, error: {message: "timeout"}} after 30000ms', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'sendEvent_');
    jasmine.clock().install();
    
    airconsole.getUserMedia({audio:true}).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('timeout');
      jasmine.clock().uninstall();
      done();
    });
    
    jasmine.clock().tick(30001);
  });
}

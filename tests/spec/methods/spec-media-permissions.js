function testMediaPermissions() {
  function initAirConsoleAsController() {
    spyOn(document, 'getElementsByTagName').and.callFake(function() {
      return [{ src: 'http://localhost/api/airconsole-latest.js' }];
    });
    airconsole = new AirConsole({ setup_document: false });
    airconsole.device_id = DEVICE_ID; // 2 = controller
    airconsole.devices[0] = {};
    airconsole.devices[DEVICE_ID] = { uid: 1237, nickname: 'Sergio', location: LOCATION, custom: {} };
  }

  // Group 1: Early rejections (sync, resolve immediately)
  
  it('Should reject with "requestMediaPermissions is not supported on screen" when device_id === AirConsole.SCREEN', function(done) {
    initAirConsoleAsController();
    airconsole.device_id = AirConsole.SCREEN;
    
    airconsole.requestMediaPermissions(['microphone']).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('requestMediaPermissions is not supported on screen');
      done();
    });
  });

  it('Should reject with "AirConsole not ready" when device_id === undefined', function(done) {
    initAirConsoleAsController();
    airconsole.device_id = undefined;
    
    airconsole.requestMediaPermissions(['microphone']).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('AirConsole not ready');
      done();
    });
  });

  it('Should reject with "AirConsole not ready" when device_id === null', function(done) {
    initAirConsoleAsController();
    airconsole.device_id = null;
    
    airconsole.requestMediaPermissions(['microphone']).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('AirConsole not ready');
      done();
    });
  });

  it('Should reject with "Request already in progress" when media_permission_pending_ is already true', function(done) {
    initAirConsoleAsController();
    airconsole.media_permission_pending_ = true;
    
    airconsole.requestMediaPermissions(['microphone']).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('Request already in progress');
      done();
    });
  });

  it('Should reject with "unsupported media type" when mediaTypes is null', function(done) {
    initAirConsoleAsController();
    
    airconsole.requestMediaPermissions(null).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('unsupported media type');
      done();
    });
  });

  it('Should reject with "unsupported media type" when mediaTypes is undefined', function(done) {
    initAirConsoleAsController();
    
    airconsole.requestMediaPermissions(undefined).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('unsupported media type');
      done();
    });
  });

  it('Should reject with "unsupported media type" when mediaTypes is an empty array', function(done) {
    initAirConsoleAsController();
    
    airconsole.requestMediaPermissions([]).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('unsupported media type');
      done();
    });
  });

  it('Should reject with "unsupported media type" when mediaTypes contains only non-microphone types', function(done) {
    initAirConsoleAsController();
    
    airconsole.requestMediaPermissions(['camera']).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('unsupported media type');
      done();
    });
  });

  it('Should set media_permission_pending_ to true when a valid request is started', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'set_');
    
    airconsole.requestMediaPermissions(['microphone']);
    
    expect(airconsole.media_permission_pending_).toBe(true);
    done();
  });

  it('Should call set_("operation", ...) with correct payload when valid', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'set_');
    
    airconsole.requestMediaPermissions(['microphone']);
    
    expect(airconsole.set_).toHaveBeenCalledWith('operation', jasmine.objectContaining({
      name: 'request-microphone-permission',
      data: jasmine.objectContaining({ mediaTypes: ['microphone'] })
    }));
    done();
  });

  // Group 2: _resolveMediaPermission_ / operation handler responses

  it('Should resolve with {success: false, error} on microphone-permission-denied operation', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'set_');
    
    airconsole.requestMediaPermissions(['microphone']).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('Permission denied');
      done();
    });
    
    dispatchCustomMessageEvent({ action: 'operation', name: 'microphone-permission-denied' });
  });

  it('Should resolve with {success: true, stream: <stream>} on microphone-permission-granted when getUserMedia succeeds with audio tracks', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'set_');
    
    var fakeStream = { getAudioTracks: function() { return [{}]; } };
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
    
    airconsole.requestMediaPermissions(['microphone']).then(function(result) {
      expect(result.success).toBe(true);
      expect(result.stream).toBe(fakeStream);
      done();
    });
    
    dispatchCustomMessageEvent({ action: 'operation', name: 'microphone-permission-granted' });
  });

  it('Should resolve with {success: false, error} on microphone-permission-granted when getUserMedia resolves but stream has no audio tracks', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'set_');
    
    var fakeStream = { getAudioTracks: function() { return []; } };
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
    
    airconsole.requestMediaPermissions(['microphone']).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('No audio tracks');
      done();
    });
    
    dispatchCustomMessageEvent({ action: 'operation', name: 'microphone-permission-granted' });
  });

  it('Should resolve with {success: false, error: err} on microphone-permission-granted when getUserMedia rejects', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'set_');
    
    var testError = new Error('getUserMedia error');
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.reject(testError));
    
    airconsole.requestMediaPermissions(['microphone']).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error).toBe(testError);
      done();
    });
    
    dispatchCustomMessageEvent({ action: 'operation', name: 'microphone-permission-granted' });
  });

  it('Should resolve with {success: true, stream: <stream>} on microphone-permission-undefined when getUserMedia succeeds with audio tracks', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'set_');
    
    var fakeStream = { getAudioTracks: function() { return [{}]; } };
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
    
    airconsole.requestMediaPermissions(['microphone']).then(function(result) {
      expect(result.success).toBe(true);
      expect(result.stream).toBe(fakeStream);
      done();
    });
    
    dispatchCustomMessageEvent({ action: 'operation', name: 'microphone-permission-undefined' });
  });

  it('Should clear media_permission_pending_ after resolution', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'set_');
    
    var fakeStream = { getAudioTracks: function() { return [{}]; } };
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
    
    airconsole.requestMediaPermissions(['microphone']).then(function(result) {
      expect(airconsole.media_permission_pending_).toBe(false);
      done();
    });
    
    dispatchCustomMessageEvent({ action: 'operation', name: 'microphone-permission-granted' });
  });

  it('Should handle double-call to _resolveMediaPermission_ safely (second call is no-op)', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'set_');
    
    var resolveCallCount = 0;
    airconsole.requestMediaPermissions(['microphone']).then(function(result) {
      resolveCallCount++;
      expect(resolveCallCount).toBe(1);
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('Permission denied');
      
      // Now call _resolveMediaPermission_ again - this should be no-op
      airconsole._resolveMediaPermission_({ success: true });
      
      // After a small delay, verify resolveCallCount is still 1
      setTimeout(function() {
        expect(resolveCallCount).toBe(1);
        done();
      }, 50);
    });
    
    dispatchCustomMessageEvent({ action: 'operation', name: 'microphone-permission-denied' });
  });

  // Group 3: timeout

  it('Should resolve with {success: false, error: {message: "timeout"}} after 30000ms', function(done) {
    initAirConsoleAsController();
    spyOn(airconsole, 'set_');
    jasmine.clock().install();
    
    airconsole.requestMediaPermissions(['microphone']).then(function(result) {
      expect(result.success).toBe(false);
      expect(result.error.message).toBe('timeout');
      jasmine.clock().uninstall();
      done();
    });
    
    jasmine.clock().tick(30001);
  });
}

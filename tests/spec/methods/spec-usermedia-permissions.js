function testUserMediaPermissions() {
  // --- Shared helpers ---

  function initAirConsoleAsController() {
    spyOn(document, 'getElementsByTagName').and.callFake(function () {
      return [{ src: 'http://localhost/api/airconsole-latest.js' }];
    });
    airconsole = new AirConsole({ setup_document: false });
    airconsole.device_id = DEVICE_ID; // 2 = controller
    airconsole.devices[0] = {};
    airconsole.devices[DEVICE_ID] = { uid: 1237, nicktype: 'Sergio', location: LOCATION, custom: {} };
    spyOn(navigator.mediaDevices, 'enumerateDevices').and.returnValue(Promise.resolve(FAKE_DEVICES));
  }

  const PERMISSION_TIMEOUT = 60001;

  const FAKE_DEVICES = [
    { kind: 'audioinput', deviceId: 'mic-builtin', label: 'iPhone Microphone', groupId: 'g1' },
    { kind: 'audioinput', deviceId: 'mic-car', label: 'CarPlay', groupId: 'g2' },
    { kind: 'audiooutput', deviceId: 'speaker', label: 'Speaker', groupId: 'g1' },
  ];

  // Platform stand-in for sendEvent_: answers requestPreferredAudioInputDevice with no preference, as a non-car
  // platform does, and ignores every other event.
  function replyNoPreference(eventType) {
    if (eventType === 'requestPreferredAudioInputDevice') {
      dispatchCustomMessageEvent({ action: 'event', type: 'preferredAudioInputDevice', data: { deviceId: null } });
    }
  }

  function teardown() {
    if (airconsole) {
      window.removeEventListener('message', airconsole.messageEventListener_);
      airconsole = null;
    }
  }

  function promptUserMediaPermission() {
    dispatchCustomMessageEvent({
      action: 'event',
      type: 'promptUserMediaPermission',
    });
  }

  function makeFakeStream(deviceId) {
    const track = {
      readyState: 'live',
      stop: jasmine.createSpy('stop').and.callFake(function () { track.readyState = 'ended'; }),
      getSettings: function () { return { deviceId: deviceId || 'mic-car' }; },
    };
    return {
      track: track,
      getAudioTracks: function() {
        return [track];
      },
      getTracks: function() {
        return [track];
      },
    };
  }

  function makeNotAllowedError() {
    const err = new DOMException('Permission denied by user', 'NotAllowedError');
    return err;
  }

  function makeNotFoundError() {
    const err = new DOMException('Device not found', 'NotFoundError');
    return err;
  }

  // --- Group 1–3: getUserMedia() return value / promise resolution ---
  // Uses jasmine.clock() for the timeout test

  describe('promise success', function () {
    beforeEach(function () {
      jasmine.clock().install();
      initAirConsoleAsController();
      spyOn(airconsole, 'sendEvent_').and.callFake(replyNoPreference);
    });

    afterEach(function () {
      jasmine.clock().uninstall();
      teardown();
    });

    // Group 1: Early synchronous rejections

    it('Should reject with AirConsole.USER_MEDIA_ERROR_TYPE.notSupportedOnScreen when device_id is SCREEN', function(done) {
      airconsole.device_id = AirConsole.SCREEN;
      airconsole.getUserMedia({ audio: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.notSupportedOnScreen);
        done();
      });
    });

    it('Should reject when device_id is undefined', function(done) {
      airconsole.device_id = undefined;
      airconsole.getUserMedia({ audio: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.notReady);
        done();
      });
    });

    it('Should reject with AirConsole.USER_MEDIA_ERROR_TYPE.alreadyPending when a request is already in progress', function(done) {
      airconsole.mediaPermissionPending_ = true;
      airconsole.getUserMedia({ audio: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.alreadyPending);
        done();
      });
    });

    it('Should reject with AirConsole.USER_MEDIA_ERROR_TYPE.invalidConstraints when constraints are null', function(done) {
      airconsole.getUserMedia(null).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.invalidConstraints);
        done();
      });
    });

    it('Should reject with AirConsole.USER_MEDIA_ERROR_TYPE.invalidConstraints with constraint { audio: true, video: true }', function(done) {
      airconsole.getUserMedia({ video: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.invalidConstraints);
        done();
      });
    });

    it('Should reject with AirConsole.USER_MEDIA_ERROR_TYPE.invalidConstraints with constraint { video: true }', function(done) {
      airconsole.getUserMedia({ video: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.invalidConstraints);
        done();
      });
    });

    it('Should reject with AirConsole.USER_MEDIA_ERROR_TYPE.invalidConstraints with constraint { audio: false }', function(done) {
      airconsole.getUserMedia({ audio: false }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.invalidConstraints);
        done();
      });
    });

    it('Should reject with AirConsole.USER_MEDIA_ERROR_TYPE.invalidConstraints with constraint { video: { width: 1280, height: 720 } }', function(done) {
      airconsole.getUserMedia({ video: { width: 1280, height: 720 } }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.invalidConstraints);
        done();
      });
    });

    it('Should reject with AirConsole.USER_MEDIA_ERROR_TYPE.invalidConstraints when constraints have no audio property', function(done) {
      airconsole.getUserMedia({ foo: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.invalidConstraints);
        done();
      });
    });

    it('Should call sendEvent_ with requestUserMediaPermission and constraints when valid', function() {
      airconsole.getUserMedia({ audio: true });
      expect(airconsole.sendEvent_).toHaveBeenCalledWith(
        'requestUserMediaPermission',
        jasmine.objectContaining({ constraints: { audio: true } })
      );
    });

    // Group 2: resolveMediaPermission_ via platform event responses

    it('Should reject AirConsole.USER_MEDIA_ERROR_TYPE.permissionDenied on userMediaPermissionDenied', function(done) {
      airconsole.getUserMedia({ audio: true }).catch(function(error) {
        expect(error.name).toBe('AirConsole.UserMediaError');
        expect(error.message).toBe('PermissionDenied');
        done();
      });
      dispatchCustomMessageEvent({
        action: 'event', type: 'userMediaPermissionDenied',
      });
    });

    it('Should resolve stream on userMediaPermissionGranted when browser succeeds', function(done) {
      const fakeStream = makeFakeStream();
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
      airconsole.getUserMedia({ audio: true }).then(function(stream) {
        expect(stream).toBe(fakeStream);
        done();
      });
      dispatchCustomMessageEvent({ action: 'event', type: 'userMediaPermissionGranted' });
    });

    it('Should reject on userMediaPermissionGranted when browser rejects', function(done) {
      const testError = new Error('getUserMedia failed: Permission denied');
      spyOn(navigator.mediaDevices, 'getUserMedia').and.callFake(function() { return Promise.reject(testError); });
      airconsole.getUserMedia({ audio: true }).catch(function(error) {
        expect(error).toBe(testError);
        done();
      });
      dispatchCustomMessageEvent({ action: 'event', type: 'userMediaPermissionGranted' });
    });

    it('Should resolve stream on promptUserMediaPermission when browser succeeds', function(done) {
      const fakeStream = makeFakeStream();
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
      airconsole.getUserMedia({ audio: true }).then(function(stream) {
        expect(stream).toEqual(fakeStream);
        done();
      });
      dispatchCustomMessageEvent({ action: 'event', type: 'promptUserMediaPermission' });
    });

    it('Should clear mediaPermissionPending_ after resolution', function(done) {
      const fakeStream = makeFakeStream();
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
      airconsole.getUserMedia({ audio: true }).then(function() {
        expect(airconsole.mediaPermissionPending_).toBe(false);
        done();
      });
      dispatchCustomMessageEvent({ action: 'event', type: 'userMediaPermissionGranted' });
    });

    it('Should clear mediaPermissionPending_ when userMediaPermissionDenied is received', function (done) {
      airconsole.getUserMedia({ audio: true }).catch(function () {
        expect(airconsole.mediaPermissionPending_).toBe(false);
        done();
      });
      dispatchCustomMessageEvent({
        action: 'event',
        type: 'userMediaPermissionDenied',
      });
    });

    // Group 3: Timeout

    it('Should reject with AirConsole.USER_MEDIA_ERROR_TYPE.timeout after 60000ms', function(done) {
      airconsole.getUserMedia({ audio: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.timeout);
        done();
      });
      jasmine.clock().tick(59999);
      expect(airconsole.mediaPermissionPending_).toBe(true);
      jasmine.clock().tick(2);
    });
  });

  // Groups 4–6: Event-driven permission flows.
  // These tests run WITHOUT the fake clock to avoid interference with Promise microtasks.
  describe('media permission flows', function () {
    beforeEach(function () {
      initAirConsoleAsController();
      // Spy on sendEvent_ and simulate the platform echo for denial events.
      spyOn(airconsole, 'sendEvent_').and.callFake(function (eventType, eventData) {
        dispatchCustomMessageEvent({
          action: 'event',
          type: eventType,
          data: eventData
        });
        replyNoPreference(eventType);
      });
    });

    afterEach(teardown);

    function spyGetUserMediaReject(err) {
      spyOn(navigator.mediaDevices, 'getUserMedia').and.callFake(function () {
        return Promise.reject(err);
      });
    }

    function spyGetUserMediaResolve(stream) {
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(stream));
    }

    // Dispatches a userMediaPermissionDenied event
    function dispatchDenied() {
      dispatchCustomMessageEvent({
        action: 'event', type: 'userMediaPermissionDenied',
      });
    }

    // --- Group 4: Promise settlement idempotency and error forwarding ---

    describe('promise settlement and error forwarding', function () {
      it('Should settle the promise only once even if platform sends two events', function (done) {
        let resolutionCount = 0;
        airconsole
          .getUserMedia({ audio: true })
          .catch(function () {
            resolutionCount++;
          })
          .then(function () {
            // Second event — no-op since promise already settled
            dispatchDenied();
            expect(resolutionCount).toBe(1);
            done();
          });
        dispatchDenied();
      });

      it('Should reject with a DOMException when browser getUserMedia is aborted', function (done) {
        const domException = new DOMException('DOM Abort Test', 'AbortError');
        spyGetUserMediaReject(domException);
        airconsole.getUserMedia({ audio: true })
          .catch(function(error) {
            expect(error).toBe(domException);
            expect(error).toBeInstanceOf(DOMException);
            expect(airconsole.sendEvent_).toHaveBeenCalledWith('userMediaPermissionDenied');
            done();
          });
        promptUserMediaPermission();
      });
    });

    // --- Group 5: promptUserMediaPermission + NotAllowedError ---
    // Platform sends 'promptUserMediaPermission'; browser getUserMedia fails with NotAllowedError.
    // Implementation caches the error, fires sendEvent_('userMediaPermissionDenied').
    describe('promptUserMediaPermission NotAllowedError rejection flow', function () {
      it('Should fire sendEvent_(userMediaPermissionDenied)', function (done) {
        const domException = makeNotAllowedError();
        spyGetUserMediaReject(domException);
        airconsole.getUserMedia({ audio: true }).catch(function () {
          expect(airconsole.sendEvent_).toHaveBeenCalledWith('userMediaPermissionDenied');
          done();
        });
        promptUserMediaPermission();
      });

      it('Should reject the promise with the cached NotAllowedError', function (done) {
        const notAllowedError = makeNotAllowedError();
        spyGetUserMediaReject(notAllowedError);
        airconsole.getUserMedia({ audio: true }).catch(function (error) {
          expect(error).toBe(notAllowedError);
          expect(error).toBeInstanceOf(DOMException);
          expect(error.name).toBe('NotAllowedError');
          done();
        });
        promptUserMediaPermission();
      });

      it('Should clear mediaPermissionPending_ after rejection', function (done) {
        spyGetUserMediaReject(makeNotAllowedError());
        airconsole.getUserMedia({ audio: true }).catch(function () {
          expect(airconsole.mediaPermissionPending_).toBe(false);
          done();
        });
        promptUserMediaPermission();
      });
    });

    // --- Group 6: sendEvent_('userMediaPermissionGranted') after browser success ---

    describe('sendEvent userMediaPermissionGranted after browser success', function () {
      it('Should call sendEvent_(userMediaPermissionGranted) on userMediaPermissionGranted event', function (done) {
        spyGetUserMediaResolve(makeFakeStream());
        airconsole.getUserMedia({ audio: true }).then(function (result) {
          expect(airconsole.sendEvent_).toHaveBeenCalledWith(
            'userMediaPermissionGranted',
            { constraints: { audio: true } },
          );
          done();
        });
        dispatchCustomMessageEvent({
          action: 'event',
          type: 'userMediaPermissionGranted',
        });
      });

      it('Should call sendEvent_(userMediaPermissionGranted) on promptUserMediaPermission event', function (done) {
        spyGetUserMediaResolve(makeFakeStream());
        airconsole.getUserMedia({ audio: true }).then(function (result) {
          expect(airconsole.sendEvent_).toHaveBeenCalledWith(
            'userMediaPermissionGranted',
            { constraints: { audio: true } },
          );
          done();
        });
        promptUserMediaPermission();
      });

      it('Should NOT call sendEvent_(userMediaPermissionGranted) when browser getUserMedia rejects', function (done) {
        spyGetUserMediaReject(new DOMException('Permission denied', 'NotAllowedError'));
        airconsole.getUserMedia({ audio: true }).catch(function () {
          const grantedCalls = airconsole.sendEvent_.calls
            .all()
            .filter(function (call) {
              return call.args[0] === 'userMediaPermissionGranted';
            });
          expect(grantedCalls.length).toBe(0);
          done();
        });
        dispatchCustomMessageEvent({
          action: 'event',
          type: 'userMediaPermissionGranted',
        });
      });
    });
  }); // end 'media permission flows' part 1

  // --- Group 7: _is_userMediaPermission_update broadcast callbacks ---

  describe('_is_userMediaPermission_update broadcast callbacks', function () {
    beforeEach(function () {
      initAirConsoleAsController();
    });

    afterEach(teardown);

    function broadcastPermissionUpdate(userMediaPermission) {
      dispatchCustomMessageEvent({
        action: 'update',
        device_id: DEVICE_ID,
        device_data: {
          location: LOCATION,
          _is_userMediaPermission_update: true,
          userMediaPermission: userMediaPermission,
        },
      });
    }

    it('Should call onUserMediaAccessGranted(device_id) when granted=true', function () {
      spyOn(airconsole, 'onUserMediaAccessGranted');
      broadcastPermissionUpdate({ granted: true });
      expect(airconsole.onUserMediaAccessGranted).toHaveBeenCalledWith(
        DEVICE_ID,
      );
    });

    it('Should call onUserMediaAccessDenied(device_id) when granted=false', function () {
      spyOn(airconsole, 'onUserMediaAccessDenied');
      broadcastPermissionUpdate({
        granted: false
      });
      expect(airconsole.onUserMediaAccessDenied).toHaveBeenCalledWith(
        DEVICE_ID,
      );
    });

    it('Should not call either callback when userMediaPermission is null', function () {
      spyOn(airconsole, 'onUserMediaAccessGranted');
      spyOn(airconsole, 'onUserMediaAccessDenied');
      broadcastPermissionUpdate(null);
      expect(airconsole.onUserMediaAccessGranted).not.toHaveBeenCalled();
      expect(airconsole.onUserMediaAccessDenied).not.toHaveBeenCalled();
    });

    it('Should not call either callback when _is_userMediaPermission_update is absent', function () {
      spyOn(airconsole, 'onUserMediaAccessGranted');
      spyOn(airconsole, 'onUserMediaAccessDenied');
      dispatchCustomMessageEvent({
        action: 'update',
        device_id: DEVICE_ID,
        device_data: {
          location: LOCATION,
          userMediaPermission: { granted: true },
        },
      });
      expect(airconsole.onUserMediaAccessGranted).not.toHaveBeenCalled();
      expect(airconsole.onUserMediaAccessDenied).not.toHaveBeenCalled();
    });
  });

  // --- Group 9: Constraint forwarding to browser getUserMedia ---

  describe('constraint forwarding to browser getUserMedia', function () {
    beforeEach(function () {
      initAirConsoleAsController();
      spyOn(airconsole, 'sendEvent_').and.callFake(replyNoPreference);
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(
        Promise.resolve(makeFakeStream()),
      );
    });

    afterEach(teardown);

    function expectConstraintsForwarded(constraints, done) {
      airconsole.getUserMedia(constraints).then(function () {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(
          constraints,
        );
        done();
      });
      dispatchCustomMessageEvent({
        action: 'event',
        type: 'userMediaPermissionGranted',
      });
    }

    it('Should forward {audio: true} to navigator.mediaDevices.getUserMedia', function (done) {
      expectConstraintsForwarded({ audio: true }, done);
    });
  });

  // --- Groups 8, 10, 11: shared boilerplate (part 2, after Groups 7 and 9) ---
  describe('media permission flows', function () {
    beforeEach(function () {
      initAirConsoleAsController();
      // Simulate the platform echo for denial events.
      // In the new flow, the controller caches the error locally.
      spyOn(airconsole, 'sendEvent_').and.callFake(function (eventType, eventData) {
        // Pipe the event back
        dispatchCustomMessageEvent({
          action: 'event',
          type: eventType,
          data: eventData
        });
        replyNoPreference(eventType);
      });
    });

    afterEach(teardown);

    function spyGetUserMediaReject(err) {
      spyOn(navigator.mediaDevices, 'getUserMedia').and.callFake(function () {
        return Promise.reject(err);
      });
    }

    function dispatchDenied() {
      dispatchCustomMessageEvent({
        action: 'event',
        type: 'userMediaPermissionDenied',
      });
    }

    // --- Group 8: promptUserMediaPermission + non-NotAllowedError ---
    // When browser getUserMedia fails with any error, the implementation
    // notifies the platform via sendEvent_(userMediaPermissionDenied) and the platform echoes
    // back the error, which triggers rejectMediaPermission_ locally.

    describe('promptUserMediaPermission non-NotAllowedError immediate rejection', function () {
      it('Should reject the promise with the original NotFoundError', function (done) {
        const notFoundError = makeNotFoundError();
        spyGetUserMediaReject(notFoundError);
        airconsole.getUserMedia({ audio: true }).catch(function (error) {
          expect(error).toBe(notFoundError);
          expect(error.name).toBe('NotFoundError');
          done();
        });
        promptUserMediaPermission();
      });
    });
    // --- Group 11: Re-entry after settlement ---

    describe('post-settlement re-entry', function () {
      it('Should allow a subsequent getUserMedia call after successful resolution', function (done) {
        airconsole.getUserMedia({ audio: true }).catch(function () {
          // Second call should start a new request (confirmed by sendEvent_ being called again)
          airconsole.sendEvent_.calls.reset();
          airconsole.getUserMedia({ audio: true });
          expect(airconsole.sendEvent_).toHaveBeenCalledWith(
            'requestUserMediaPermission',
            jasmine.objectContaining({ constraints: { audio: true } }),
          );
          done();
        });
        dispatchDenied();
      });
    });
  }); // end 'media permission flows'

  // --- Group 12: destroy() ---

  describe('destroy', function () {
    beforeEach(initAirConsoleAsController);
    afterEach(teardown);

    it('Should remove the window message event listener', function () {
      spyOn(window, 'removeEventListener');
      const listener = airconsole.messageEventListener_;
      airconsole.destroy();
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'message',
        listener,
      );
    });

    it('Should clear a pending mediaPermissionTimeout_ on destroy', function () {
      jasmine.clock().install();
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(
        new Promise(function () {}),
      );
      spyOn(airconsole, 'sendEvent_');
      airconsole.getUserMedia({ audio: true }).catch(function () {});
      expect(airconsole.mediaPermissionTimeout_).toBeDefined();

      airconsole.destroy();
      expect(airconsole.mediaPermissionTimeout_).toBeUndefined();
      jasmine.clock().uninstall();
    });

    it('Should not throw when no media permission timeout is pending', function () {
      expect(function () {
        airconsole.destroy();
      }).not.toThrow();
    });

    it('Should reject pending getUserMedia Promise on destroy', function (done) {
      jasmine.clock().install();
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(
        new Promise(function () {}),
      );
      spyOn(airconsole, 'sendEvent_');
      airconsole.getUserMedia({ audio: true }).catch(function (error) {
        expect(error.name).toBe('AirConsole.UserMediaError');
        expect(error.message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.timeout);
        done();
      });
      airconsole.destroy();
      jasmine.clock().uninstall();
    });

    it('Should clear mediaPermissionPending_ when destroy rejects pending Promise', function (done) {
      jasmine.clock().install();
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(
        new Promise(function () {}),
      );
      spyOn(airconsole, 'sendEvent_');
      airconsole.getUserMedia({ audio: true }).catch(function () {
        expect(airconsole.mediaPermissionPending_).toBe(false);
        done();
      });
      airconsole.destroy();
      jasmine.clock().uninstall();
    });
  }); // end 'destroy'

  // --- Group 13: Race condition and edge case coverage ---

  describe('race condition coverage', function () {
    beforeEach(function () {
      jasmine.clock().install();
      initAirConsoleAsController();
      spyOn(airconsole, 'sendEvent_');
    });

    afterEach(function () {
      jasmine.clock().uninstall();
      teardown();
    });

    it('Should not send userMediaPermissionDenied when browser failure arrives after timeout', function (done) {
      var browserReject;
      spyOn(navigator.mediaDevices, 'getUserMedia').and.callFake(function () {
        return new Promise(function (resolve, reject) {
          browserReject = reject;
        });
      });

      airconsole.getUserMedia({ audio: true }).catch(function () {
        // Timeout has fired. Now simulate the late browser failure.
        airconsole.sendEvent_.calls.reset();
        browserReject(new DOMException('Late denial', 'NotAllowedError'));

        // Give microtasks a chance to run
        setTimeout(function () {
          expect(airconsole.sendEvent_).not.toHaveBeenCalledWith(
            'userMediaPermissionDenied',
            jasmine.anything(),
          );
          done();
        }, 0);
        jasmine.clock().tick(1);
      });

      // Trigger promptUserMediaPermission to start the browser flow
      dispatchCustomMessageEvent({ action: 'event', type: 'promptUserMediaPermission' });
      // Fire the 60s timeout
      jasmine.clock().tick(60001);
    });

    it('Should stop orphaned stream tracks when browser succeeds after timeout', function (done) {
      var stopSpy = jasmine.createSpy('stop');
      var fakeStream = {
        getAudioTracks: function () { return [{}]; },
        getTracks: function () { return [{ stop: stopSpy }]; },
      };
      spyOn(navigator.mediaDevices, 'getUserMedia').and.callFake(function () {
        // Simulate: timeout fires before browser resolves.
        // Setting mediaPermissionPending_ to false models what cleanUpMediaPermission_ does.
        airconsole.mediaPermissionPending_ = false;
        return Promise.resolve(fakeStream);
      });

      airconsole.getUserMedia({ audio: true }).catch(function () {
        // Give microtasks time to process the browser success callback.
        setTimeout(function () {
          expect(stopSpy).toHaveBeenCalled();
          done();
        }, 0);
        jasmine.clock().tick(1);
      });

      dispatchCustomMessageEvent({ action: 'event', type: 'promptUserMediaPermission' });
      jasmine.clock().tick(60001);
    });

    it('Should not set cachedMediaError_ when browser failure arrives after timeout', function (done) {
      var browserReject;
      spyOn(navigator.mediaDevices, 'getUserMedia').and.callFake(function () {
        return new Promise(function (resolve, reject) {
          browserReject = reject;
        });
      });

      airconsole.getUserMedia({ audio: true }).catch(function () {
        browserReject(new DOMException('Late error', 'NotFoundError'));

        setTimeout(function () {
          expect(airconsole.cachedMediaError_).toBeFalsy();
          done();
        }, 0);
        jasmine.clock().tick(1);
      });

      dispatchCustomMessageEvent({ action: 'event', type: 'promptUserMediaPermission' });
      jasmine.clock().tick(60001);
    });
  });

  // --- Group 14: Stale message guard and type verification ---

  describe('stale message guard and error types', function () {
    beforeEach(function () {
      initAirConsoleAsController();
      spyOn(airconsole, 'sendEvent_').and.callFake(replyNoPreference);
    });

    afterEach(teardown);

    it('Should ignore userMediaPermissionGranted after flow is already settled', function (done) {
      spyOn(navigator.mediaDevices, 'getUserMedia');
      airconsole.getUserMedia({ audio: true }).catch(function () {
        // Flow is settled (denied). Now dispatch a stale granted event.
        dispatchCustomMessageEvent({ action: 'event', type: 'userMediaPermissionGranted' });

        setTimeout(function () {
          expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
          done();
        }, 0);
      });
      dispatchCustomMessageEvent({ action: 'event', type: 'userMediaPermissionDenied' });
    });

    it('Should ignore userMediaPermissionDenied after flow is already settled', function (done) {
      var catchCount = 0;
      var fakeStream = makeFakeStream();
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
      airconsole.getUserMedia({ audio: true })
        .then(function () {
          // Flow is settled (granted). Now dispatch a stale denied event.
          dispatchCustomMessageEvent({ action: 'event', type: 'userMediaPermissionDenied' });
        })
        .catch(function () {
          catchCount++;
        });

      dispatchCustomMessageEvent({ action: 'event', type: 'userMediaPermissionGranted' });

      setTimeout(function () {
        expect(catchCount).toBe(0);
        done();
      }, 50);
    });

    it('Should produce errors that are instanceof Error', function (done) {
      airconsole.device_id = AirConsole.SCREEN;
      airconsole.getUserMedia({ audio: true }).catch(function (error) {
        expect(error instanceof Error).toBe(true);
        expect(error.name).toBe('AirConsole.UserMediaError');
        done();
      });
    });

    it('Should forward complex audio constraints to browser getUserMedia', function (done) {
      var complexConstraints = { audio: { echoCancellation: true, noiseSuppression: false } };
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(
        Promise.resolve(makeFakeStream()),
      );
      airconsole.getUserMedia(complexConstraints).then(function () {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(complexConstraints);
        done();
      });
      dispatchCustomMessageEvent({ action: 'event', type: 'userMediaPermissionGranted' });
    });
  });
  // --- Group 15: Preferred audio input device exchange ---
  // First request of a game: stream #1, the request with the device list, then keep / reopen / stream #2.
  // Later request: no open on the hand-off, a list-less request, then a single open.

  describe('preferred audio input device exchange', function () {
    var sent;
    var reply; // undefined: no automatic reply; null or a device id: answered at once

    function eventsOfType(type) {
      return sent.filter(function (e) { return e.type === type; });
    }

    async function settle() {
      for (let i = 0; i < 20; i++) {
        await Promise.resolve();
      }
    }

    function handOff(type) {
      dispatchCustomMessageEvent({ action: 'event', type: type || 'promptUserMediaPermission' });
    }

    function replyPreferred(deviceId) {
      dispatchCustomMessageEvent({ action: 'event', type: 'preferredAudioInputDevice', data: { deviceId: deviceId } });
    }

    function updateScreen(deviceData) {
      dispatchCustomMessageEvent({ action: 'update', device_id: AirConsole.SCREEN, device_data: deviceData });
    }

    function spyGetUserMediaSequence(results) {
      var i = 0;
      spyOn(navigator.mediaDevices, 'getUserMedia').and.callFake(function () {
        const result = results[Math.min(i, results.length - 1)];
        i += 1;
        return result instanceof Error || result instanceof DOMException ? Promise.reject(result) : result;
      });
    }

    beforeEach(function () {
      initAirConsoleAsController();
      sent = [];
      reply = null;
      spyOn(airconsole, 'sendEvent_').and.callFake(function (type, data) {
        sent.push({ type: type, data: data });
        if (type === 'requestPreferredAudioInputDevice' && reply !== undefined) {
          replyPreferred(reply);
        }
      });
    });

    afterEach(teardown);

    describe('first request', function () {
      it('Should ask with the device list and keep stream #1 on a null reply', async function () {
        const stream1 = makeFakeStream('mic-car');
        spyGetUserMediaSequence([Promise.resolve(stream1)]);
        const result = airconsole.getUserMedia({ audio: true });
        handOff();
        expect(await result).toBe(stream1);
        await settle();
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
        expect(eventsOfType('requestPreferredAudioInputDevice')[0].data).toEqual({
          devices: [
            { deviceId: 'mic-builtin', label: 'iPhone Microphone' },
            { deviceId: 'mic-car', label: 'CarPlay' },
          ],
          activeDeviceId: 'mic-car',
        });
        expect(eventsOfType('setAudioInputDevices')[0].data).toEqual({
          devices: [
            { deviceId: 'mic-builtin', label: 'iPhone Microphone' },
            { deviceId: 'mic-car', label: 'CarPlay' },
          ],
          activeDeviceId: 'mic-car',
        });
        expect(stream1.track.stop).not.toHaveBeenCalled();
      });

      it('Should keep stream #1 when the reply names the device it is on', async function () {
        reply = 'mic-car';
        const stream1 = makeFakeStream('mic-car');
        spyGetUserMediaSequence([Promise.resolve(stream1)]);
        const result = airconsole.getUserMedia({ audio: true });
        handOff();
        expect(await result).toBe(stream1);
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
      });

      it('Should stop stream #1, then open stream #2 with the non-exact preferred deviceId', async function () {
        reply = 'mic-builtin';
        const stream1 = makeFakeStream('mic-car');
        const stream2 = makeFakeStream('mic-builtin');
        spyGetUserMediaSequence([Promise.resolve(stream1), Promise.resolve(stream2)]);
        const result = airconsole.getUserMedia({ audio: { echoCancellation: true } });
        handOff();
        expect(await result).toBe(stream2);
        await settle();
        expect(stream1.track.stop).toHaveBeenCalled();
        expect(navigator.mediaDevices.getUserMedia.calls.argsFor(1)[0]).toEqual({
          audio: { echoCancellation: true, deviceId: 'mic-builtin' },
        });
        expect(eventsOfType('setAudioInputDevices')[0].data.activeDeviceId).toBe('mic-builtin');
      });

      it('Should open a fresh stream when stream #1 ended before the reply', async function () {
        reply = undefined;
        const stream1 = makeFakeStream('mic-car');
        const fresh = makeFakeStream('mic-builtin');
        spyGetUserMediaSequence([Promise.resolve(stream1), Promise.resolve(fresh)]);
        const result = airconsole.getUserMedia({ audio: true });
        handOff();
        await settle();
        stream1.track.readyState = 'ended';
        replyPreferred(null);
        expect(await result).toBe(fresh);
        expect(navigator.mediaDevices.getUserMedia.calls.argsFor(1)[0]).toEqual({ audio: true });
      });

      it('Should send userMediaRequestFailed(open-error) when stream #2 fails, and no setAudioInputDevices', async function () {
        reply = 'mic-builtin';
        const openError = new DOMException('Busy', 'NotReadableError');
        spyGetUserMediaSequence([Promise.resolve(makeFakeStream('mic-car')), openError]);
        const result = airconsole.getUserMedia({ audio: true });
        handOff();
        await expectAsync(result).toBeRejectedWith(openError);
        await settle();
        expect(eventsOfType('userMediaRequestFailed')[0].data).toEqual({
          reason: 'open-error',
          error: 'NotReadableError',
        });
        expect(eventsOfType('setAudioInputDevices').length).toBe(0);
      });

      it('Should send userMediaRequestFailed(open-error) when stream #1 fails after the native grant', async function () {
        const openError = new DOMException('No device', 'NotFoundError');
        spyGetUserMediaSequence([openError]);
        const result = airconsole.getUserMedia({ audio: true });
        handOff('userMediaPermissionGranted');
        await expectAsync(result).toBeRejectedWith(openError);
        expect(eventsOfType('userMediaRequestFailed')[0].data).toEqual({ reason: 'open-error', error: 'NotFoundError' });
        expect(eventsOfType('userMediaPermissionDenied').length).toBe(0);
      });

      it('Should accept the permission hand-off only once per request', async function () {
        reply = undefined;
        spyGetUserMediaSequence([Promise.resolve(makeFakeStream('mic-car'))]);
        airconsole.getUserMedia({ audio: true }).catch(function () {});
        handOff('promptUserMediaPermission');
        await settle();
        handOff('userMediaPermissionGranted');
        await settle();
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
      });

      it('Should ignore a preferredAudioInputDevice that is not awaited', async function () {
        reply = undefined;
        const stream1 = makeFakeStream('mic-car');
        spyGetUserMediaSequence([Promise.resolve(stream1), Promise.resolve(makeFakeStream('stray'))]);
        const result = airconsole.getUserMedia({ audio: true });
        replyPreferred('stray');
        handOff();
        await settle();
        replyPreferred(null);
        replyPreferred('stray');
        expect(await result).toBe(stream1);
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
      });
    });

    describe('later request', function () {
      async function completeFirstRequest() {
        const result = airconsole.getUserMedia({ audio: true });
        handOff();
        await result;
        await settle();
        sent = [];
      }

      it('Should not open on the hand-off, ask without a device list, then open once with the saved device', async function () {
        const later = makeFakeStream('mic-builtin');
        spyGetUserMediaSequence([Promise.resolve(makeFakeStream('mic-car')), Promise.resolve(later)]);
        await completeFirstRequest();

        reply = undefined;
        const result = airconsole.getUserMedia({ audio: true });
        handOff();
        await settle();
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
        expect(eventsOfType('requestPreferredAudioInputDevice')[0].data).toEqual({});

        replyPreferred('mic-builtin');
        expect(await result).toBe(later);
        await settle();
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
        expect(navigator.mediaDevices.getUserMedia.calls.argsFor(1)[0]).toEqual({ audio: { deviceId: 'mic-builtin' } });
        expect(eventsOfType('setAudioInputDevices')[0].data.activeDeviceId).toBe('mic-builtin');
      });

      it('Should take the denial path on NotAllowedError', async function () {
        const notAllowed = makeNotAllowedError();
        spyGetUserMediaSequence([Promise.resolve(makeFakeStream('mic-car')), notAllowed]);
        await completeFirstRequest();

        const result = airconsole.getUserMedia({ audio: true });
        handOff();
        await settle();
        expect(eventsOfType('userMediaPermissionDenied').length).toBe(1);
        expect(eventsOfType('userMediaRequestFailed').length).toBe(0);
        dispatchCustomMessageEvent({ action: 'event', type: 'userMediaPermissionDenied' });
        await expectAsync(result).toBeRejectedWith(notAllowed);
      });

      it('Should send userMediaRequestFailed(open-error) on any other error', async function () {
        const busy = new DOMException('Busy', 'NotReadableError');
        spyGetUserMediaSequence([Promise.resolve(makeFakeStream('mic-car')), busy]);
        await completeFirstRequest();

        const result = airconsole.getUserMedia({ audio: true });
        handOff();
        await expectAsync(result).toBeRejectedWith(busy);
        expect(eventsOfType('userMediaRequestFailed')[0].data).toEqual({ reason: 'open-error', error: 'NotReadableError' });
      });
    });

    describe('permission timeout', function () {
      beforeEach(function () {
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(2026, 0, 1));
      });

      afterEach(function () {
        jasmine.clock().uninstall();
      });

      it('Should stop stream #1 and send userMediaRequestFailed(timeout) before rejecting', async function () {
        reply = undefined;
        const stream1 = makeFakeStream('mic-car');
        spyGetUserMediaSequence([Promise.resolve(stream1)]);
        const order = [];
        airconsole.sendEvent_.and.callFake(function (type, data) {
          sent.push({ type: type, data: data });
          order.push(type);
        });
        const result = airconsole.getUserMedia({ audio: true }).catch(function (error) {
          order.push('rejected');
          return error;
        });
        handOff();
        await settle();
        jasmine.clock().tick(PERMISSION_TIMEOUT);
        const error = await result;
        expect(error.message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.timeout);
        expect(stream1.track.stop).toHaveBeenCalled();
        expect(eventsOfType('userMediaRequestFailed')[0].data).toEqual({ reason: 'timeout', error: 'Timeout' });
        expect(order.indexOf('userMediaRequestFailed')).toBeLessThan(order.indexOf('rejected'));
      });

      it('Should use the first-request flow again after a timeout before the reply, and ignore the late reply', async function () {
        reply = undefined;
        spyGetUserMediaSequence([Promise.resolve(makeFakeStream('mic-car'))]);
        const first = airconsole.getUserMedia({ audio: true }).catch(function () {});
        handOff();
        await settle();
        jasmine.clock().tick(PERMISSION_TIMEOUT);
        await first;
        replyPreferred('mic-builtin'); // crosses the timeout: ignored

        airconsole.getUserMedia({ audio: true }).catch(function () {});
        handOff();
        await settle();
        // First-request flow: opens on the hand-off and asks with a device list.
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
        expect(eventsOfType('requestPreferredAudioInputDevice')[1].data.devices.length).toBe(2);
      });

      it('Should use the later-request flow after a timeout that came after the reply', async function () {
        reply = 'mic-builtin';
        spyGetUserMediaSequence([Promise.resolve(makeFakeStream('mic-car')), new Promise(function () {})]);
        const first = airconsole.getUserMedia({ audio: true }).catch(function () {});
        handOff();
        await settle();
        jasmine.clock().tick(PERMISSION_TIMEOUT);
        await first;

        reply = undefined;
        airconsole.getUserMedia({ audio: true }).catch(function () {});
        handOff();
        await settle();
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
        expect(eventsOfType('requestPreferredAudioInputDevice')[1].data).toEqual({});
      });

      it('Should stop the clock while the screen is paused and keep the remaining time', async function () {
        const result = airconsole.getUserMedia({ audio: true }).catch(function (error) { return error; });
        jasmine.clock().tick(30000);
        updateScreen({ paused: { state: true, reason: 'visibility' } });
        jasmine.clock().tick(120000);
        await settle();
        expect(airconsole.mediaPermissionPending_).toBe(true);
        updateScreen({ paused: { state: false, reason: 'resume' } });
        jasmine.clock().tick(29999);
        expect(airconsole.mediaPermissionPending_).toBe(true);
        jasmine.clock().tick(2);
        expect((await result).message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.timeout);
      });

      it('Should wait with the clock stopped when the request starts while the screen is paused', async function () {
        airconsole.devices[AirConsole.SCREEN] = { paused: { state: true, reason: 'audio-focus-loss' } };
        const result = airconsole.getUserMedia({ audio: true }).catch(function (error) { return error; });
        jasmine.clock().tick(120000);
        expect(airconsole.mediaPermissionPending_).toBe(true);
        updateScreen({ paused: { state: false, reason: 'resume' } });
        jasmine.clock().tick(PERMISSION_TIMEOUT);
        expect((await result).message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.timeout);
      });

      it('Should run normally on a screen that has never paused', async function () {
        airconsole.devices[AirConsole.SCREEN] = {};
        const first = airconsole.getUserMedia({ audio: true }).catch(function (error) { return error; });
        updateScreen({ location: LOCATION });
        jasmine.clock().tick(PERMISSION_TIMEOUT);
        expect((await first).message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.timeout);

        airconsole.devices[AirConsole.SCREEN] = undefined;
        const second = airconsole.getUserMedia({ audio: true }).catch(function (error) { return error; });
        expect(airconsole.mediaPermissionPending_).toBe(true);
        jasmine.clock().tick(PERMISSION_TIMEOUT);
        expect((await second).message).toBe(AirConsole.USER_MEDIA_ERROR_TYPE.timeout);
      });
    });
  });
}

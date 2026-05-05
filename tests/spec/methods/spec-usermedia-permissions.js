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

  function makeFakeStream() {
    return {
      getAudioTracks: function() {
        return [{}];
      },
      getTracks: function() {
        return [{
          stop: () => {
          }
        }];
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
      spyOn(airconsole, 'sendEvent_');
    });

    afterEach(function () {
      jasmine.clock().uninstall();
      teardown();
    });

    // Group 1: Early synchronous rejections

    it('Should reject with AirConsole.USERMEDIA_ERROR.notSupportedOnScreen when device_id is SCREEN', function(done) {
      airconsole.device_id = AirConsole.SCREEN;
      airconsole.getUserMedia({ audio: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USERMEDIA_ERROR.notSupportedOnScreen);
        done();
      });
    });

    it('Should reject when device_id is undefined', function(done) {
      airconsole.device_id = undefined;
      airconsole.getUserMedia({ audio: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USERMEDIA_ERROR.notReady);
        done();
      });
    });

    it('Should reject with AirConsole.USERMEDIA_ERROR.alreadyPending when a request is already in progress', function(done) {
      airconsole.mediaPermissionPending_ = true;
      airconsole.getUserMedia({ audio: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USERMEDIA_ERROR.alreadyPending);
        done();
      });
    });

    it('Should reject with AirConsole.USERMEDIA_ERROR.invalidConstraints when constraints are null', function(done) {
      airconsole.getUserMedia(null).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USERMEDIA_ERROR.invalidConstraints);
        done();
      });
    });

    it('Should reject with AirConsole.USERMEDIA_ERROR.invalidConstraints with constraint { audio: true, video: true }', function(done) {
      airconsole.getUserMedia({ video: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USERMEDIA_ERROR.invalidConstraints);
        done();
      });
    });

    it('Should reject with AirConsole.USERMEDIA_ERROR.invalidConstraints with constraint { video: true }', function(done) {
      airconsole.getUserMedia({ video: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USERMEDIA_ERROR.invalidConstraints);
        done();
      });
    });

    it('Should reject with AirConsole.USERMEDIA_ERROR.invalidConstraints with constraint { video: { width: 1280, height: 720 } }', function(done) {
      airconsole.getUserMedia({ video: { width: 1280, height: 720 } }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USERMEDIA_ERROR.invalidConstraints);
        done();
      });
    });

    it('Should reject with AirConsole.USERMEDIA_ERROR.invalidConstraints when constraints have no audio property', function(done) {
      airconsole.getUserMedia({ foo: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USERMEDIA_ERROR.invalidConstraints);
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

    it('Should reject AirConsole.USERMEDIA_ERROR.permissionDenied on userMediaPermissionDenied', function(done) {
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

    it('Should reject with AirConsole.USERMEDIA_ERROR.timeout after 30000ms', function(done) {
      airconsole.getUserMedia({ audio: true }).catch(function(error) {
        expect(error.name).toBe("AirConsole.UserMediaError");
        expect(error.message).toBe(AirConsole.USERMEDIA_ERROR.timeout);
        done();
      });
      jasmine.clock().tick(30001);
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
            expect(airconsole.sendEvent_).toHaveBeenCalledWith(
              'userMediaPermissionDenied',
              jasmine.objectContaining({ errorType: domException.name })
            );
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
          expect(airconsole.sendEvent_).toHaveBeenCalledWith(
            'userMediaPermissionDenied',
              jasmine.objectContaining({ errorType: domException.name })
          );
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
      spyOn(airconsole, 'sendEvent_');
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
      // In the new flow, the controller caches the error locally. Platform echoes back with errorType.
      spyOn(airconsole, 'sendEvent_').and.callFake(function (eventType, eventData) {
        // Pipe the event back
        dispatchCustomMessageEvent({
          action: 'event',
          type: eventType,
          data: eventData
        });
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
      airconsole.getUserMedia({ audio: true });
      expect(airconsole.mediaPermissionTimeout_).toBeDefined();

      airconsole.destroy();
      expect(airconsole.mediaPermissionTimeout_).toBeNull();
      jasmine.clock().uninstall();
    });

    it('Should not throw when no media permission timeout is pending', function () {
      expect(function () {
        airconsole.destroy();
      }).not.toThrow();
    });
  }); // end 'destroy'
}

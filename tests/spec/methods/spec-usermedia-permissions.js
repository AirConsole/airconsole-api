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
    return { getAudioTracks: function () { return [{}]; } };
  }

  function makeNotAllowedError() {
    const err = new Error('Permission denied by user');
    err.name = 'NotAllowedError';
    return err;
  }

  function makeNotFoundError() {
    const err = new Error('Device not found');
    err.name = 'NotFoundError';
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

    it('Should resolve {success:false} when device_id is SCREEN', function(done) {
      airconsole.device_id = AirConsole.SCREEN;
      airconsole.getUserMedia({ audio: true }).then(function(result) {
        expect(result.success).toBe(false);
        expect(result.error.message).toBe(AirConsole.USERMEDIA_ERROR.notSupportedOnScreen);
        done();
      });
    });

    it('Should resolve {success:false} when device_id is undefined', function(done) {
      airconsole.device_id = undefined;
      airconsole.getUserMedia({ audio: true }).then(function(result) {
        expect(result.success).toBe(false);
        expect(result.error.message).toBe(AirConsole.USERMEDIA_ERROR.notReady);
        done();
      });
    });

    it('Should resolve {success:false} when a request is already in progress', function(done) {
      airconsole.media_permission_pending_ = true;
      airconsole.getUserMedia({ audio: true }).then(function(result) {
        expect(result.success).toBe(false);
        expect(result.error.message).toBe(AirConsole.USERMEDIA_ERROR.alreadyPending);
        done();
      });
    });

    it('Should resolve {success:false} when constraints are null', function(done) {
      airconsole.getUserMedia(null).then(function(result) {
        expect(result.success).toBe(false);
        expect(result.error.message).toBe(AirConsole.USERMEDIA_ERROR.invalidConstraints);
        done();
      });
    });

    it('Should resolve {success:false} when constraints are empty', function(done) {
      airconsole.getUserMedia({}).then(function(result) {
        expect(result.success).toBe(false);
        expect(result.error.message).toBe(AirConsole.USERMEDIA_ERROR.invalidConstraints);
        done();
      });
    });

    it('Should resolve {success:false} when constraints have no audio or video property', function(done) {
      airconsole.getUserMedia({ foo: true }).then(function(result) {
        expect(result.success).toBe(false);
        expect(result.error.message).toBe(AirConsole.USERMEDIA_ERROR.invalidConstraints);
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

    it('Should resolve {success:false, reason:temporary} on userMediaPermissionDenied', function(done) {
      airconsole.getUserMedia({ audio: true }).then(function(result) {
        expect(result.success).toBe(false);
        expect(result.reason).toBe('temporary');
        done();
      });
      dispatchCustomMessageEvent({
        action: 'event', type: 'userMediaPermissionDenied',
        data: { reason: AirConsole.MEDIA_PERMISSION_DENIED.temporary }
      });
    });

    it('Should resolve {success:false, reason:permanent} on userMediaPermissionDenied with permanent reason', function(done) {
      airconsole.getUserMedia({ audio: true }).then(function(result) {
        expect(result.success).toBe(false);
        expect(result.reason).toBe('permanent');
        done();
      });
      dispatchCustomMessageEvent({
        action: 'event', type: 'userMediaPermissionDenied',
        data: { reason: AirConsole.MEDIA_PERMISSION_DENIED.permanent }
      });
    });

    it('Should resolve {success:true, stream} on userMediaPermissionGranted when browser succeeds', function(done) {
      const fakeStream = makeFakeStream();
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
      airconsole.getUserMedia({ audio: true }).then(function(result) {
        expect(result.success).toBe(true);
        expect(result.stream).toBe(fakeStream);
        done();
      });
      dispatchCustomMessageEvent({ action: 'event', type: 'userMediaPermissionGranted' });
    });

    it('Should resolve {success:false, error} on userMediaPermissionGranted when browser rejects', function(done) {
      const testError = new Error('getUserMedia failed: Permission denied');
      spyOn(navigator.mediaDevices, 'getUserMedia').and.callFake(function() { return Promise.reject(testError); });
      airconsole.getUserMedia({ audio: true }).then(function(result) {
        expect(result.success).toBe(false);
        expect(result.error).toBe(testError);
        done();
      });
      dispatchCustomMessageEvent({ action: 'event', type: 'userMediaPermissionGranted' });
    });

    it('Should resolve {success:true, stream} on promptUserMediaPermission when browser succeeds', function(done) {
      const fakeStream = makeFakeStream();
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
      airconsole.getUserMedia({ audio: true }).then(function(result) {
        expect(result.success).toBe(true);
        expect(result.stream).toBe(fakeStream);
        done();
      });
      dispatchCustomMessageEvent({ action: 'event', type: 'promptUserMediaPermission' });
    });

    it('Should clear media_permission_pending_ after resolution', function(done) {
      const fakeStream = makeFakeStream();
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(fakeStream));
      airconsole.getUserMedia({ audio: true }).then(function() {
        expect(airconsole.media_permission_pending_).toBe(false);
        done();
      });
      dispatchCustomMessageEvent({ action: 'event', type: 'userMediaPermissionGranted' });
    });

    // Group 3: Timeout

    it('Should resolve {success:false, error:{message:AirConsole.USERMEDIA_ERROR.timeout}} after 30000ms', function(done) {
      airconsole.getUserMedia({ audio: true }).then(function(result) {
        expect(result.success).toBe(false);
        expect(result.error.message).toBe(AirConsole.USERMEDIA_ERROR.timeout);
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
      // Spy on sendEvent_ and simulate the platform echo for denial events that carry an error.
      // In the new flow the controller notifies the platform of the denial (with the error object)
      // and the platform echoes back a userMediaPermissionDenied event containing the error,
      // which triggers rejectMediaPermission_ locally.
      spyOn(airconsole, 'sendEvent_').and.callFake(function (eventType, eventData) {
        if (eventType === 'userMediaPermissionDenied' && eventData && eventData.error) {
          dispatchCustomMessageEvent({
            action: 'event',
            type: 'userMediaPermissionDenied',
            data: { error: eventData.error },
          });
        }
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

    // Dispatches a userMediaPermissionDenied event with an optional reason
    // (defaults to temporary, matching the most common test scenario).
    function dispatchDenied(reason) {
      dispatchCustomMessageEvent({
        action: 'event', type: 'userMediaPermissionDenied',
        data: { reason: reason || AirConsole.MEDIA_PERMISSION_DENIED.temporary }
      });
    }

    // --- Group 4: Promise settlement idempotency and error forwarding ---

    describe('promise settlement and error forwarding', function () {
      it('Should settle the promise only once even if platform sends two events', function (done) {
        let resolutionCount = 0;
        airconsole
          .getUserMedia({ audio: true })
          .then(function (result) {
            resolutionCount++;
            expect(result.success).toBe(false);
            expect(result.reason).toBe('temporary');
          })
          .catch(function () {
            fail('Should not reject after resolution');
          })
          .then(function () {
            // Second event — no-op since promise already settled
            dispatchDenied();
            expect(resolutionCount).toBe(1);
            done();
          });
        dispatchDenied();
      });

      it('Should reject with a browser-style AbortError when browser getUserMedia is aborted', function (done) {
        const browserError = new Error('The operation was aborted.');
        browserError.name = 'AbortError';
        spyGetUserMediaReject(browserError);
        airconsole.getUserMedia({ audio: true }).catch(function (error) {
          expect(airconsole.sendEvent_).toHaveBeenCalledWith(
            'userMediaPermissionDenied',
            jasmine.objectContaining({ error: browserError }),
          );
          done();
        });
        promptUserMediaPermission();
      });
    });

    // --- Group 5: promptUserMediaPermission + NotAllowedError ---
    // Platform sends 'promptUserMediaPermission'; browser getUserMedia fails with NotAllowedError.
    // Implementation fires sendEvent_('userMediaPermissionDenied') then rejects the promise.

    describe('promptUserMediaPermission NotAllowedError rejection flow', function () {
      it('Should fire sendEvent_(userMediaPermissionDenied) with userPromptDuration', function (done) {
        spyGetUserMediaReject(makeNotAllowedError());
        airconsole.getUserMedia({ audio: true }).catch(function () {
          expect(airconsole.sendEvent_).toHaveBeenCalledWith(
            'userMediaPermissionDenied',
            jasmine.objectContaining({
              userPromptDuration: jasmine.any(Number),
            }),
          );
          done();
        });
        promptUserMediaPermission();
      });

      it('Should reject the promise with the NotAllowedError', function (done) {
        const notAllowedError = makeNotAllowedError();
        spyGetUserMediaReject(notAllowedError);
        airconsole.getUserMedia({ audio: true }).catch(function (error) {
          expect(error).toBe(notAllowedError);
          expect(error.name).toBe('NotAllowedError');
          done();
        });
        promptUserMediaPermission();
      });

      it('Should clear media_permission_pending_ after rejection', function (done) {
        spyGetUserMediaReject(makeNotAllowedError());
        airconsole.getUserMedia({ audio: true }).catch(function () {
          expect(airconsole.media_permission_pending_).toBe(false);
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
          expect(result.success).toBe(true);
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
          expect(result.success).toBe(true);
          expect(airconsole.sendEvent_).toHaveBeenCalledWith(
            'userMediaPermissionGranted',
            { constraints: { audio: true } },
          );
          done();
        });
        promptUserMediaPermission();
      });

      it('Should NOT call sendEvent_(userMediaPermissionGranted) when browser getUserMedia rejects', function (done) {
        spyGetUserMediaReject(new Error('Permission denied'));
        airconsole.getUserMedia({ audio: true }).then(function () {
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

    it('Should call onUserMediaAccessGranted(device_id, constraints) when granted=true', function () {
      spyOn(airconsole, 'onUserMediaAccessGranted');
      broadcastPermissionUpdate({ granted: true });
      expect(airconsole.onUserMediaAccessGranted).toHaveBeenCalledWith(
        DEVICE_ID,
        undefined,
      );
    });

    it('Should call onUserMediaAccessDenied(device_id, temporary) when granted=false with temporary reason', function () {
      spyOn(airconsole, 'onUserMediaAccessDenied');
      broadcastPermissionUpdate({
        granted: false,
        reason: AirConsole.MEDIA_PERMISSION_DENIED.temporary,
      });
      expect(airconsole.onUserMediaAccessDenied).toHaveBeenCalledWith(
        DEVICE_ID,
        AirConsole.MEDIA_PERMISSION_DENIED.temporary,
      );
    });

    it('Should call onUserMediaAccessDenied(device_id, permanent) when granted=false with permanent reason', function () {
      spyOn(airconsole, 'onUserMediaAccessDenied');
      broadcastPermissionUpdate({
        granted: false,
        reason: AirConsole.MEDIA_PERMISSION_DENIED.permanent,
      });
      expect(airconsole.onUserMediaAccessDenied).toHaveBeenCalledWith(
        DEVICE_ID,
        AirConsole.MEDIA_PERMISSION_DENIED.permanent,
      );
    });

    it('Should default reason to temporary when granted=false but no reason field', function () {
      spyOn(airconsole, 'onUserMediaAccessDenied');
      broadcastPermissionUpdate({ granted: false });
      expect(airconsole.onUserMediaAccessDenied).toHaveBeenCalledWith(
        DEVICE_ID,
        AirConsole.MEDIA_PERMISSION_DENIED.temporary,
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
      // Simulate the platform echo for denial events carrying an error (see first block for rationale).
      spyOn(airconsole, 'sendEvent_').and.callFake(function (eventType, eventData) {
        if (eventType === 'userMediaPermissionDenied' && eventData && eventData.error) {
          dispatchCustomMessageEvent({
            action: 'event',
            type: 'userMediaPermissionDenied',
            data: { error: eventData.error },
          });
        }
      });
    });

    afterEach(teardown);

    function spyGetUserMediaReject(err) {
      spyOn(navigator.mediaDevices, 'getUserMedia').and.callFake(function () {
        return Promise.reject(err);
      });
    }

    function dispatchDenied(reason) {
      dispatchCustomMessageEvent({
        action: 'event',
        type: 'userMediaPermissionDenied',
        data: {
          reason: reason || AirConsole.MEDIA_PERMISSION_DENIED.temporary,
        },
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

    // --- Group 9b: platform echoes userMediaPermissionDenied with an error object ---

    describe('platform-initiated userMediaPermissionDenied with error', function () {
      it('Should reject the promise with the error when platform sends an AbortError', function (done) {
        var abortError = new Error('The operation was aborted.');
        abortError.name = 'AbortError';
        airconsole.getUserMedia({ audio: true }).catch(function (error) {
          expect(error).toBe(abortError);
          expect(error.name).toBe('AbortError');
          expect(error.message).toBe('The operation was aborted.');
          done();
        });
        dispatchCustomMessageEvent({
          action: 'event',
          type: 'userMediaPermissionDenied',
          data: { error: abortError },
        });
      });

      it('Should clear media_permission_pending_ when platform sends error', function (done) {
        var abortError = new Error('The operation was aborted.');
        abortError.name = 'AbortError';
        airconsole.getUserMedia({ audio: true }).catch(function () {
          expect(airconsole.media_permission_pending_).toBe(false);
          done();
        });
        dispatchCustomMessageEvent({
          action: 'event',
          type: 'userMediaPermissionDenied',
          data: { error: abortError },
        });
      });
    });

    // --- Group 10: userMediaPermissionDenied with missing data field ---

    describe('userMediaPermissionDenied with missing data', function () {
      it('Should default reason to temporary when data field is absent', function (done) {
        airconsole.getUserMedia({ audio: true }).then(function (result) {
          expect(result.success).toBe(false);
          expect(result.reason).toBe(
            AirConsole.MEDIA_PERMISSION_DENIED.temporary,
          );
          done();
        });
        dispatchCustomMessageEvent({
          action: 'event',
          type: 'userMediaPermissionDenied',
        });
      });
    });

    // --- Group 11: Re-entry after settlement ---

    describe('post-settlement re-entry', function () {
      it('Should allow a subsequent getUserMedia call after successful resolution', function (done) {
        airconsole.getUserMedia({ audio: true }).then(function (result) {
          expect(result.success).toBe(false);
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

    it('Should clear a pending media_permission_timeout_ on destroy', function () {
      jasmine.clock().install();
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(
        new Promise(function () {}),
      );
      spyOn(airconsole, 'sendEvent_');
      airconsole.getUserMedia({ audio: true });
      expect(airconsole.media_permission_timeout_).toBeDefined();

      airconsole.destroy();
      expect(airconsole.media_permission_timeout_).toBeNull();
      jasmine.clock().uninstall();
    });

    it('Should not throw when no media permission timeout is pending', function () {
      expect(function () {
        airconsole.destroy();
      }).not.toThrow();
    });
  }); // end 'destroy'
}

function testAudioInputDevices() {
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

  function makeFakeStream() {
    return {
      getAudioTracks: function () {
        return [{}];
      },
      getTracks: function () {
        return [{
          stop: () => {
          }
        }];
      },
    };
  }

  function makeDeviceInfo(overwrites) {
    return Object.assign({
      deviceId: 'phone-mic',
      kind: 'audioinput',
      label: 'Phone microphone',
      groupId: 'group-1'
    }, overwrites || {});
  }

  function lastEventOfType(type) {
    var calls = airconsole.sendEvent_.calls.all();
    for (var i = calls.length - 1; i >= 0; i -= 1) {
      if (calls[i].args[0] === type) {
        return calls[i].args[1];
      }
    }
    return undefined;
  }

  function setAudioInputDevice(deviceId) {
    dispatchCustomMessageEvent({
      action: 'event',
      type: 'setAudioInputDevice',
      data: { deviceId: deviceId },
    });
  }

  describe('microphoneRequested', function () {
    beforeEach(function () {
      initAirConsoleAsController();
      spyOn(airconsole, 'sendEvent_');
    });

    afterEach(function () {
      teardown();
    });

    it('Should inform the platform that a microphone was requested', function () {
      airconsole.getUserMedia({ audio: true });

      expect(airconsole.sendEvent_).toHaveBeenCalledWith('microphoneRequested', {});
    });

    it('Should not inform the platform when the request is rejected before reaching the platform', function (done) {
      airconsole.device_id = AirConsole.SCREEN;

      airconsole.getUserMedia({ audio: true }).catch(function () {
        expect(lastEventOfType('microphoneRequested')).toBeUndefined();
        done();
      });
    });
  });

  describe('setAudioInputDevices', function () {
    beforeEach(function () {
      initAirConsoleAsController();
      spyOn(airconsole, 'sendEvent_');
    });

    afterEach(function () {
      teardown();
    });

    it('Should report the devices and the active device to the platform', function () {
      airconsole.setAudioInputDevices([makeDeviceInfo()], 'phone-mic');

      expect(airconsole.sendEvent_).toHaveBeenCalledWith('audioInputDevicesReported', {
        devices: [{ deviceId: 'phone-mic', label: 'Phone microphone', groupId: 'group-1' }],
        activeDeviceId: 'phone-mic'
      });
    });

    it('Should ignore devices that are not audio inputs', function () {
      airconsole.setAudioInputDevices([
        makeDeviceInfo(),
        makeDeviceInfo({ deviceId: 'cam', kind: 'videoinput', label: 'Camera' }),
        makeDeviceInfo({ deviceId: 'speaker', kind: 'audiooutput', label: 'Speaker' })
      ], 'phone-mic');

      expect(lastEventOfType('audioInputDevicesReported').devices).toEqual([
        { deviceId: 'phone-mic', label: 'Phone microphone', groupId: 'group-1' }
      ]);
    });

    it('Should ignore devices without a deviceId', function () {
      airconsole.setAudioInputDevices([makeDeviceInfo({ deviceId: '' }), makeDeviceInfo()], 'phone-mic');

      expect(lastEventOfType('audioInputDevicesReported').devices).toEqual([
        { deviceId: 'phone-mic', label: 'Phone microphone', groupId: 'group-1' }
      ]);
    });

    it('Should report plain objects without a kind', function () {
      airconsole.setAudioInputDevices([{ deviceId: 'car-mic', label: 'Car microphone' }], 'car-mic');

      expect(lastEventOfType('audioInputDevicesReported').devices).toEqual([
        { deviceId: 'car-mic', label: 'Car microphone', groupId: '' }
      ]);
    });

    it('Should report an empty label for devices the browser did not name', function () {
      airconsole.setAudioInputDevices([makeDeviceInfo({ label: undefined })], 'phone-mic');

      expect(lastEventOfType('audioInputDevicesReported').devices[0].label).toBe('');
    });

    it('Should report an empty list when the microphone is no longer in use', function () {
      airconsole.setAudioInputDevices([]);

      expect(airconsole.sendEvent_).toHaveBeenCalledWith('audioInputDevicesReported', {
        devices: [],
        activeDeviceId: ''
      });
    });

    it('Should report an empty active device when none was given', function () {
      airconsole.setAudioInputDevices([makeDeviceInfo()]);

      expect(lastEventOfType('audioInputDevicesReported').activeDeviceId).toBe('');
    });

    it('Should throw when called on the screen', function () {
      airconsole.device_id = AirConsole.SCREEN;

      expect(function () {
        airconsole.setAudioInputDevices([makeDeviceInfo()], 'phone-mic');
      }).toThrow();
    });
  });

  describe('onAudioInputDeviceChange', function () {
    beforeEach(function () {
      initAirConsoleAsController();
    });

    afterEach(function () {
      teardown();
    });

    it('Should be called when no media permission request is pending', function () {
      // The platform asks for a different audio input long after the permission flow settled, which is exactly the
      // state in which inbound permission events are ignored.
      expect(airconsole.mediaPermissionPending_).toBeFalsy();
      spyOn(airconsole, 'onAudioInputDeviceChange');

      setAudioInputDevice('car-mic');

      expect(airconsole.onAudioInputDeviceChange).toHaveBeenCalledWith('car-mic');
    });

    it('Should be called while a media permission request is pending', function () {
      spyOn(airconsole, 'sendEvent_');
      airconsole.getUserMedia({ audio: true });
      spyOn(airconsole, 'onAudioInputDeviceChange');

      setAudioInputDevice('car-mic');

      expect(airconsole.onAudioInputDeviceChange).toHaveBeenCalledWith('car-mic');
    });

    it('Should not settle a pending getUserMedia promise', function (done) {
      var settled = false;
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(makeFakeStream()));
      spyOn(airconsole, 'sendEvent_');

      airconsole.getUserMedia({ audio: true }).then(
        function () { settled = true; },
        function () { settled = true; }
      );

      setAudioInputDevice('car-mic');

      setTimeout(function () {
        expect(settled).toBe(false);
        expect(airconsole.mediaPermissionPending_).toBe(true);
        done();
      }, 50);
    });

    it('Should still ignore permission events when no request is pending', function () {
      spyOn(airconsole, 'onAudioInputDeviceChange');
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(makeFakeStream()));

      dispatchCustomMessageEvent({ action: 'event', type: 'promptUserMediaPermission' });

      expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
      expect(airconsole.onAudioInputDeviceChange).not.toHaveBeenCalled();
    });
  });
}

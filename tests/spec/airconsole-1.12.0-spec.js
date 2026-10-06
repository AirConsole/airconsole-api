describe("AirConsole 1.12.0", function () {
    function initAirConsole() {
        airconsole = new AirConsole({
            setup_document: false
        });
        airconsole.device_id = AirConsole.SCREEN;
        airconsole.devices[0] = {};
        airconsole.devices[DEVICE_ID] = { uid: 1237, location: LOCATION, custom: {} };
    }

    function tearDown() {
        if (airconsole) {
            window.removeEventListener('message', airconsole.messageEventListener_);
            airconsole = null;
        }
    }

    describe("Photon Engine authentication", function () {
        beforeEach(function () {
            initAirConsole();
        });

        afterEach(function () {
            tearDown();
        });

        testPhotonEngineAuth();
    });
});

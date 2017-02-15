var airconsole = null;
var DEVICE_ID = 2;
var LOCATION = document.location.href;

function dispatchCustomMessageEvent (data, event_type) {
  event_type = event_type || 'message';
  var fake_event = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
  fake_event.initCustomEvent(event_type, false, false, null);
  fake_event.data = data || {};
  window.dispatchEvent(fake_event);
};

function tearDown() {};

function itp(title, fn, overwrite_its) {
  if (overwrite_its && overwrite_its[title]) {
    it(title, overwrite_its[title]);
  } else {
    it(title, fn);
  }
};

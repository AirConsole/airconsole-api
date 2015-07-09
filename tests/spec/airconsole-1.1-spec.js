describe("API 1.1", function() {

  var air_console = null;

  beforeEach(function() {
    // API 1.1 adds a <style/meta> tag. Lets clean up before we run a test
    var head = document.getElementsByTagName("head")[0];
    var head_children = head.childNodes;
    for (var i = head_children.length - 1; i >= 0; i--) {
      var node = head_children[i];
      var remove = false;
      if (node.tagName === 'STYLE') {
        remove = true;
      }
      if (node.tagName === 'META' && node.getAttribute('name') === "viewport") {
        remove = true;
      }
      if (remove) {
        head.removeChild(node);
      }
    }
  });

  afterEach(function() {
    window.removeEventListener('message');
    window.onbeforeunload = null;
    air_console = null;
  });

  it ("should NOT setup document when setup_document is false", function() {
    air_console = new AirConsole({
      setup_document: false
    });
    var body_style = window.getComputedStyle(document.body);
    expect(body_style.webkitUserSelect).toEqual("text");
    expect(body_style.webkitHighlight).toEqual("none");
  });


  it ("should setup document by default on constructing AirConsole object", function() {
    var before_body_style = window.getComputedStyle(document.body);
    // Test on default styles
    expect(before_body_style.webkitUserSelect).toEqual("text");
    expect(before_body_style.webkitHighlight).toEqual("none");

    air_console = new AirConsole();
    // Test some applied styles in API 1.1
    var body_style = window.getComputedStyle(document.body);
    expect(body_style.webkitUserSelect).toEqual("none");
    expect(body_style.webkitHighlight).toEqual("none");
    // Check added meta tag
    var metas = document.getElementsByTagName('meta');
    var meta_viewport_tag = null;
    for (i = 0; i < metas.length; i++) {
      if (metas[i].getAttribute("name") == "viewport") {
         meta_viewport_tag = metas[i];
         break;
      }
    }
    var expected_tag_content = "width=device-width, minimum-scale=1, " +
                               "initial-scale=1, user-scalable=no";
    expect(meta_viewport_tag.getAttribute("content")).toEqual(expected_tag_content);
  });

});

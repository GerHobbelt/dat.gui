//
// OBSOLETE STUFF?
//
// old v0.4 code which needs to be integrated or otherwise thrown away
//

let GUI = {};

GUI.loadJSON = function (json) {
  if (typeof json === "string") {
    json = eval("(" + json + ")");
  }
  GUI.loadedJSON = json;
};

GUI.loadedJSON = null;

GUI.getJSON = function () {
  var guis = [];
  for (var i in GUI.allGuis) {
    guis.push(GUI.allGuis[i].getJSON());
  }
  var obj = { guis: guis };
  return { guis: guis };
};

GUI.closeSave = function () {
  //
};

GUI.save = function () {
  var jsonString = JSON.stringify(GUI.getJSON());

  var dialogue = document.createElement("div");
  dialogue.setAttribute("id", "guidat-save-dialogue");

  var a = document.createElement("a");
  a.setAttribute("href", window.location.href + "?gui=" + escape(jsonString));
  a.innerHTML = "Use this URL.";

  var span2 = document.createElement("span");
  span2.innerHTML = "&hellip; or paste this into the beginning of your source:";

  var textarea = document.createElement("textarea");
  // textarea.setAttribute('disabled', 'true');
  textarea.innerHTML += "GUI.loadJSON(" + jsonString + ");";

  var close = document.createElement("div");
  close.setAttribute("id", "guidat-save-dialogue-close");
  close.addEventListener(
    "click",
    function () {
      GUI.closeSave();
    },
    false
  );

  dialogue.appendChild(a);
  dialogue.appendChild(span2);
  dialogue.appendChild(textarea);
  document.body.appendChild(dialogue);

  textarea.addEventListener(
    "click",
    function () {
      this.select();
    },
    false
  );
};

export default GUI;

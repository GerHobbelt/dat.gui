# dat.GUI API

Details about the classes, methods, and properties provided by dat.GUI. For more
hands-on examples, see the dat.GUI [tutorial](http://workshop.chromeexperiments.com/examples/gui).

<!--- API BEGIN --->

<a name="GUI"></a>

## GUI
A lightweight controller library for JavaScript. It allows you to easily
manipulate variables and fire functions on the fly.

**Kind**: global class  

* [GUI](#GUI)
    * [new GUI([params])](#new_GUI_new)
    * [.domElement](#GUI+domElement) : <code>DOMElement</code>
    * [.parent](#GUI+parent) : <code>dat.gui.GUI</code>
    * [.autoPlace](#GUI+autoPlace) : <code>Boolean</code>
    * [.closeOnTop](#GUI+closeOnTop) : <code>Boolean</code>
    * [.preset](#GUI+preset) : <code>String</code>
    * [.width](#GUI+width) : <code>Number</code>
    * [.name](#GUI+name) : <code>String</code>
    * [.closed](#GUI+closed) : <code>Boolean</code>
    * [.load](#GUI+load) : <code>Object</code>
    * [.useLocalStorage](#GUI+useLocalStorage) : <code>Boolean</code>
    * [.add(object, property, [min], [max], [step])](#GUI+add) ⇒ <code>Controller</code>
    * [.addColor(object, property)](#GUI+addColor) ⇒ <code>Controller</code>
    * [.addPlotter(object, property, max, period, type, fgColor, bgColor)](#GUI+addPlotter) ⇒ <code>Controller</code>
    * [.addImage(object, property)](#GUI+addImage) ⇒ <code>Controller</code>
    * [.remove(controller)](#GUI+remove)
    * [.destroy()](#GUI+destroy)
    * [.addFolder(name)](#GUI+addFolder) ⇒ <code>dat.gui.GUI</code>
    * [.removeFolder(folder)](#GUI+removeFolder)
    * [.open()](#GUI+open)
    * [.close()](#GUI+close)
    * [.hide()](#GUI+hide)
    * [.show()](#GUI+show)
    * [.remember(...objects)](#GUI+remember)
    * [.getRoot()](#GUI+getRoot) ⇒ <code>dat.gui.GUI</code>
    * [.getSaveObject()](#GUI+getSaveObject) ⇒ <code>Object</code>

<a name="new_GUI_new"></a>

### new GUI([params])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [params] | <code>Object</code> |  |  |
| [params.name] | <code>String</code> |  | The name of this GUI. |
| [params.load] | <code>Object</code> |  | JSON object representing the saved state of this GUI. |
| [params.object] | <code>Object</code> |  | Providing your object will create a controller for each property automatically |
| [params.parent] | <code>dat.gui.GUI</code> |  | The GUI I'm nested in. |
| [params.autoPlace] | <code>Boolean</code> | <code>true</code> |  |
| [params.hideable] | <code>Boolean</code> | <code>true</code> | If true, GUI is shown/hidden by <kbd>h</kbd> keypress. |
| [params.closed] | <code>Boolean</code> | <code>false</code> | If true, starts closed |
| [params.closeOnTop] | <code>Boolean</code> | <code>false</code> | If true, close/open button shows on top of the GUI |

**Example**  
```js
// Creating a GUI with options.
var gui = new dat.GUI({name: 'My GUI'});
```
**Example**  
```js
// Creating a GUI and a subfolder.
var gui = new dat.GUI();
var folder1 = gui.addFolder('Flow Field');
```
<a name="GUI+domElement"></a>

### gui.domElement : <code>DOMElement</code>
Outermost DOM Element

**Kind**: instance property of [<code>GUI</code>](#GUI)  
<a name="GUI+parent"></a>

### gui.parent : <code>dat.gui.GUI</code>
The parent <code>GUI</code>

**Kind**: instance property of [<code>GUI</code>](#GUI)  
<a name="GUI+autoPlace"></a>

### gui.autoPlace : <code>Boolean</code>
Handles <code>GUI</code>'s element placement for you

**Kind**: instance property of [<code>GUI</code>](#GUI)  
<a name="GUI+closeOnTop"></a>

### gui.closeOnTop : <code>Boolean</code>
Handles <code>GUI</code>'s position of open/close button

**Kind**: instance property of [<code>GUI</code>](#GUI)  
<a name="GUI+preset"></a>

### gui.preset : <code>String</code>
The identifier for a set of saved values

**Kind**: instance property of [<code>GUI</code>](#GUI)  
<a name="GUI+width"></a>

### gui.width : <code>Number</code>
The width of <code>GUI</code> element

**Kind**: instance property of [<code>GUI</code>](#GUI)  
<a name="GUI+name"></a>

### gui.name : <code>String</code>
The name of <code>GUI</code>. Used for folders. i.e
a folder's name

**Kind**: instance property of [<code>GUI</code>](#GUI)  
<a name="GUI+closed"></a>

### gui.closed : <code>Boolean</code>
Whether the <code>GUI</code> is collapsed or not

**Kind**: instance property of [<code>GUI</code>](#GUI)  
<a name="GUI+load"></a>

### gui.load : <code>Object</code>
Contains all presets

**Kind**: instance property of [<code>GUI</code>](#GUI)  
<a name="GUI+useLocalStorage"></a>

### gui.useLocalStorage : <code>Boolean</code>
Determines whether or not to use <a href="https://developer.mozilla.org/en/DOM/Storage#localStorage">localStorage</a> as the means for
<code>remember</code>ing

**Kind**: instance property of [<code>GUI</code>](#GUI)  
<a name="GUI+add"></a>

### gui.add(object, property, [min], [max], [step]) ⇒ <code>Controller</code>
Adds a new [Controller](Controller) to the GUI. The type of controller created
is inferred from the initial value of <code>object[property]</code>. For
color properties, see [addColor](addColor).

**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>Controller</code> - The controller that was added to the GUI.  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>Object</code> | The object to be manipulated |
| property | <code>String</code> | The name of the property to be manipulated |
| [min] | <code>Number</code> | Minimum allowed value |
| [max] | <code>Number</code> | Maximum allowed value |
| [step] | <code>Number</code> | Increment by which to change value |

**Example**  
```js
// Add a string controller.
var person = {name: 'Sam'};
gui.add(person, 'name');
```
**Example**  
```js
// Add a number controller slider.
var person = {age: 45};
gui.add(person, 'age', 0, 100);
```
<a name="GUI+addColor"></a>

### gui.addColor(object, property) ⇒ <code>Controller</code>
Adds a new color controller to the GUI.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>Controller</code> - The controller that was added to the GUI.  

| Param |
| --- |
| object | 
| property | 

**Example**  
```js
var palette = {
  color1: '#FF0000', // CSS string
  color2: [ 0, 128, 255 ], // RGB array
  color3: [ 0, 128, 255, 0.3 ], // RGB with alpha
  color4: { h: 350, s: 0.9, v: 0.3 } // Hue, saturation, value
};
gui.addColor(palette, 'color1');
gui.addColor(palette, 'color2');
gui.addColor(palette, 'color3');
gui.addColor(palette, 'color4');
```
<a name="GUI+addPlotter"></a>

### gui.addPlotter(object, property, max, period, type, fgColor, bgColor) ⇒ <code>Controller</code>
Adds a new plotter controller to the GUI.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>Controller</code> - The controller that was added to the GUI.  

| Param | Description |
| --- | --- |
| object |  |
| property |  |
| max | The maximum value that the plotter will display (default 10) |
| period | The update interval in ms or use 0 to only update on value change (default 500) |
| type | Type of graph to render - line or bar (default line) |
| fgColor | Foreground color of the graph in hex (default #fff) |
| bgColor | Background color of the graph in hex (default #000) |

**Example**  
```js
var obj = {
  value: 5
};
gui.addPlotter(obj, 'value', 10, 100);
gui.addPlotter(obj, 'value', 10, 0);
```
<a name="GUI+addImage"></a>

### gui.addImage(object, property) ⇒ <code>Controller</code>
Adds an image controller to the GUI.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>Controller</code> - The controller that was added to the GUI.  

| Param |
| --- |
| object | 
| property | 

**Example**  
```js
var images = { path1: 'myImage.png'};
gui.addImage(images, 'path1');
```
<a name="GUI+remove"></a>

### gui.remove(controller)
Removes the given controller from the GUI.

**Kind**: instance method of [<code>GUI</code>](#GUI)  

| Param | Type |
| --- | --- |
| controller | <code>Controller</code> | 

<a name="GUI+destroy"></a>

### gui.destroy()
Removes the root GUI from the document and unbinds all event listeners.
For subfolders, use `gui.removeFolder(folder)` instead.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
<a name="GUI+addFolder"></a>

### gui.addFolder(name) ⇒ <code>dat.gui.GUI</code>
Creates a new subfolder GUI instance.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>dat.gui.GUI</code> - The new folder.  
**Throws**:

- <code>Error</code> if this GUI already has a folder by the specified
name


| Param |
| --- |
| name | 

<a name="GUI+removeFolder"></a>

### gui.removeFolder(folder)
Removes a subfolder GUI instance.

**Kind**: instance method of [<code>GUI</code>](#GUI)  

| Param | Type | Description |
| --- | --- | --- |
| folder | <code>dat.gui.GUI</code> | The folder to remove. |

<a name="GUI+open"></a>

### gui.open()
Opens the GUI.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
<a name="GUI+close"></a>

### gui.close()
Closes the GUI.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
<a name="GUI+hide"></a>

### gui.hide()
Hides the GUI.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
<a name="GUI+show"></a>

### gui.show()
Shows the GUI.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
<a name="GUI+remember"></a>

### gui.remember(...objects)
Mark objects for saving. The order of these objects cannot change as
the GUI grows. When remembering new objects, append them to the end
of the list.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Throws**:

- <code>Error</code> if not called on a top level GUI.


| Param | Type |
| --- | --- |
| ...objects | <code>Object</code> | 

<a name="GUI+getRoot"></a>

### gui.getRoot() ⇒ <code>dat.gui.GUI</code>
**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>dat.gui.GUI</code> - the topmost parent GUI of a nested GUI.  
<a name="GUI+getSaveObject"></a>

### gui.getSaveObject() ⇒ <code>Object</code>
**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>Object</code> - a JSON object representing the current state of
this GUI as well as its remembered properties.  
<!--- API END --->

# dat.GUI API

Details about the classes, methods, and properties provided by dat.GUI. For more
hands-on examples, see the dat.GUI [tutorial](http://workshop.chromeexperiments.com/examples/gui).

<!--- API BEGIN --->

## Classes

<dl>
<dt><a href="#GUI">GUI</a></dt>
<dd><p>A lightweight controller library for JavaScript. It allows you to easily
manipulate variables and fire functions on the fly.</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#autoPlaceVirgin">autoPlaceVirgin</a></dt>
<dd><p>Have we yet to create an autoPlace GUI?</p>
</dd>
<dt><a href="#autoPlaceContainer">autoPlaceContainer</a></dt>
<dd><p>Fixed position div that auto place GUI&#39;s go inside</p>
</dd>
<dt><a href="#hide">hide</a></dt>
<dd><p>Are we hiding the GUI&#39;s ?</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#CSS_NAMESPACE">CSS_NAMESPACE</a></dt>
<dd><p>Outer-most className for GUI&#39;s</p>
</dd>
<dt><a href="#CLOSE_BUTTON_HEIGHT">CLOSE_BUTTON_HEIGHT</a></dt>
<dd><p>The only value shared between the JS and SCSS. Use caution.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#addRow">addRow(gui, [newDom], [liBefore])</a></dt>
<dd><p>Add a row to the end of the GUI or before another row.</p>
</dd>
</dl>

<a name="GUI"></a>

## GUI
A lightweight controller library for JavaScript. It allows you to easily
manipulate variables and fire functions on the fly.

**Kind**: global class  

* [GUI](#GUI)
    * [new GUI([params])](#new_GUI_new)
    * [.domElement](#GUI+domElement) : <code>DOMElement</code>
    * [.add(object, property, [min], [max], [step])](#GUI+add) ⇒ <code>Controller</code>
    * [.addColor(object, property)](#GUI+addColor) ⇒ <code>Controller</code>
    * [.remove(controller)](#GUI+remove)
    * [.destroy()](#GUI+destroy)
    * [.addFolder(name)](#GUI+addFolder) ⇒ <code>dat.gui.GUI</code>
    * [.close()](#GUI+close)
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
| [params.auto] | <code>Boolean</code> | <code>true</code> |  |
| [params.parent] | <code>dat.gui.GUI</code> |  | The GUI I'm nested in. |
| [params.closed] | <code>Boolean</code> |  | If true, starts closed |

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
<a name="GUI+remove"></a>

### gui.remove(controller)
Removes the given controller from the GUI.

**Kind**: instance method of [<code>GUI</code>](#GUI)  

| Param | Type |
| --- | --- |
| controller | <code>Controller</code> | 

<a name="GUI+destroy"></a>

### gui.destroy()
Removes the GUI from the document and unbinds all event listeners.

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

<a name="GUI+close"></a>

### gui.close()
Closes the GUI.

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
<a name="autoPlaceVirgin"></a>

## autoPlaceVirgin
Have we yet to create an autoPlace GUI?

**Kind**: global variable  
<a name="autoPlaceContainer"></a>

## autoPlaceContainer
Fixed position div that auto place GUI's go inside

**Kind**: global variable  
<a name="hide"></a>

## hide
Are we hiding the GUI's ?

**Kind**: global variable  
<a name="CSS_NAMESPACE"></a>

## CSS\_NAMESPACE
Outer-most className for GUI's

**Kind**: global constant  
<a name="CLOSE_BUTTON_HEIGHT"></a>

## CLOSE\_BUTTON\_HEIGHT
The only value shared between the JS and SCSS. Use caution.

**Kind**: global constant  
<a name="addRow"></a>

## addRow(gui, [newDom], [liBefore])
Add a row to the end of the GUI or before another row.

**Kind**: global function  

| Param | Description |
| --- | --- |
| gui |  |
| [newDom] | If specified, inserts the dom content in the new row |
| [liBefore] | If specified, places the new row before another row |

<!--- API END --->

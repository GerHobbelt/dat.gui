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
<dt><a href="#auto_place_virgin">auto_place_virgin</a></dt>
<dd><p>Have we yet to create an autoPlace GUI?</p>
</dd>
<dt><a href="#auto_place_container">auto_place_container</a></dt>
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
<dt><a href="#hideable_guis">hideable_guis</a></dt>
<dd><p>GUI&#39;s which should be hidden</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#addRow">addRow(gui, [dom], [liBefore])</a></dt>
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
    * [.parent](#GUI+parent) : [<code>GUI</code>](#GUI)
    * [.autoPlace](#GUI+autoPlace) : <code>Boolean</code>
    * [.preset](#GUI+preset) : <code>String</code>
    * [.width](#GUI+width) : <code>Number</code>
    * [.name](#GUI+name) : <code>String</code>
    * [.closed](#GUI+closed) : <code>Boolean</code>
    * [.load](#GUI+load) : <code>Object</code>
    * [.useLocalStorage](#GUI+useLocalStorage) : <code>Boolean</code>
    * [.getAllGUIs(recurse, myArray)](#GUI+getAllGUIs) ⇒ <code>name/gui</code>
    * [.add(object, property)](#GUI+add) ⇒ <code>dat.controllers.Controller</code>
    * [.addColor(object, property)](#GUI+addColor) ⇒ <code>dat.controllers.ColorController</code>
    * [.addTextArea(object, property)](#GUI+addTextArea) ⇒ <code>dat.controllers.TextAreaController</code>
    * [.addEasingFunction(object, property)](#GUI+addEasingFunction) ⇒ <code>dat.controllers.EasingFunctionController</code>
    * [.addHifiColor(object, property)](#GUI+addHifiColor) ⇒ <code>dat.controllers.HifiColorController</code>
    * [.addVec3(object, property)](#GUI+addVec3) ⇒ <code>dat.controllers.Vec3Controller</code>
    * [.addQuat(object, property)](#GUI+addQuat) ⇒ <code>dat.controllers.QuatController</code>
    * [.remove(controller)](#GUI+remove)
    * [.destroy()](#GUI+destroy)
    * [.addFolder(name)](#GUI+addFolder) ⇒ <code>dat.gui.GUI</code>
    * [.open()](#GUI+open)
    * [.close()](#GUI+close)
    * [.remember(...objects)](#GUI+remember)
    * [.getRoot()](#GUI+getRoot) ⇒ [<code>GUI</code>](#GUI)
    * [.getSaveObject()](#GUI+getSaveObject) ⇒ <code>Object</code>
    * [.save()](#GUI+save) ⇒ [<code>GUI</code>](#GUI)
    * [.saveAs(presetName)](#GUI+saveAs) ⇒ [<code>GUI</code>](#GUI)
    * [.revert(gui)](#GUI+revert) ⇒ [<code>GUI</code>](#GUI)
    * [.listen(controller)](#GUI+listen) ⇒ [<code>GUI</code>](#GUI)

<a name="new_GUI_new"></a>

### new GUI([params])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [params] | <code>Object</code> |  |  |
| [params.name] | <code>String</code> |  | The name of this GUI. |
| [params.load] | <code>Object</code> |  | JSON object representing the saved state of this GUI. |
| [params.object] | <code>Object</code> |  | Providing your object will create a controller for each property automatically |
| [params.parent] | [<code>GUI</code>](#GUI) |  | The GUI I'm nested in. |
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

### gui.parent : [<code>GUI</code>](#GUI)
The parent <code>GUI</code>

**Kind**: instance property of [<code>GUI</code>](#GUI)  
<a name="GUI+autoPlace"></a>

### gui.autoPlace : <code>Boolean</code>
Handles <code>GUI</code>'s element placement for you

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
<a name="GUI+getAllGUIs"></a>

### gui.getAllGUIs(recurse, myArray) ⇒ <code>name/gui</code>
Gets this current GUI (usually) and all sub-folder GUIs under this GUI as an array of {name/gui} pairs. The "this" current gui uses empty string.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>name/gui</code> - The array of  value pairs  

| Param | Description |
| --- | --- |
| recurse | (optional) By default, it will recurse multiple levels deep. Set to false to only scan current level from current GUI. |
| myArray | (optional) Supply an existing array to use instead.  If supplied, will not push current GUI into array, only the subfolder GUIs. |

<a name="GUI+add"></a>

### gui.add(object, property) ⇒ <code>dat.controllers.Controller</code>
**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>dat.controllers.Controller</code> - The new controller that was added.  

| Param |
| --- |
| object | 
| property | 

<a name="GUI+addColor"></a>

### gui.addColor(object, property) ⇒ <code>dat.controllers.ColorController</code>
**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>dat.controllers.ColorController</code> - The new controller that was added.  

| Param |
| --- |
| object | 
| property | 

<a name="GUI+addTextArea"></a>

### gui.addTextArea(object, property) ⇒ <code>dat.controllers.TextAreaController</code>
**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>dat.controllers.TextAreaController</code> - The new controller that was added.  

| Param |
| --- |
| object | 
| property | 

<a name="GUI+addEasingFunction"></a>

### gui.addEasingFunction(object, property) ⇒ <code>dat.controllers.EasingFunctionController</code>
**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>dat.controllers.EasingFunctionController</code> - The new controller that was added.  

| Param |
| --- |
| object | 
| property | 

<a name="GUI+addHifiColor"></a>

### gui.addHifiColor(object, property) ⇒ <code>dat.controllers.HifiColorController</code>
**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>dat.controllers.HifiColorController</code> - The new controller that was added.  

| Param |
| --- |
| object | 
| property | 

<a name="GUI+addVec3"></a>

### gui.addVec3(object, property) ⇒ <code>dat.controllers.Vec3Controller</code>
**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>dat.controllers.Vec3Controller</code> - The new controller that was added.  

| Param |
| --- |
| object | 
| property | 

<a name="GUI+addQuat"></a>

### gui.addQuat(object, property) ⇒ <code>dat.controllers.QuatController</code>
**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>dat.controllers.QuatController</code> - The new controller that was added.  

| Param |
| --- |
| object | 
| property | 

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

<a name="GUI+open"></a>

### gui.open()
Opens the GUI.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
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

### gui.getRoot() ⇒ [<code>GUI</code>](#GUI)
**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: [<code>GUI</code>](#GUI) - the topmost parent GUI of a nested GUI.  
<a name="GUI+getSaveObject"></a>

### gui.getSaveObject() ⇒ <code>Object</code>
**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: <code>Object</code> - a JSON object representing the current state of
this GUI as well as its remembered properties.  
<a name="GUI+save"></a>

### gui.save() ⇒ [<code>GUI</code>](#GUI)
TODO:
[save description]

**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: [<code>GUI</code>](#GUI) - [description]  
<a name="GUI+saveAs"></a>

### gui.saveAs(presetName) ⇒ [<code>GUI</code>](#GUI)
TODO:
[saveAs description]

**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: [<code>GUI</code>](#GUI) - [description]  

| Param | Type | Description |
| --- | --- | --- |
| presetName | <code>String</code> | [description] |

<a name="GUI+revert"></a>

### gui.revert(gui) ⇒ [<code>GUI</code>](#GUI)
TODO:
[revert description]

**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: [<code>GUI</code>](#GUI) - [description]  

| Param | Type | Description |
| --- | --- | --- |
| gui | [<code>GUI</code>](#GUI) | [description] |

<a name="GUI+listen"></a>

### gui.listen(controller) ⇒ [<code>GUI</code>](#GUI)
TODO:
listen description

**Kind**: instance method of [<code>GUI</code>](#GUI)  
**Returns**: [<code>GUI</code>](#GUI) - [description]  

| Param | Type | Description |
| --- | --- | --- |
| controller | <code>Controller</code> | [description] |

<a name="auto_place_virgin"></a>

## auto\_place\_virgin
Have we yet to create an autoPlace GUI?

**Kind**: global variable  
<a name="auto_place_container"></a>

## auto\_place\_container
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
<a name="hideable_guis"></a>

## hideable\_guis
GUI's which should be hidden

**Kind**: global constant  
<a name="addRow"></a>

## addRow(gui, [dom], [liBefore])
Add a row to the end of the GUI or before another row.

**Kind**: global function  

| Param | Description |
| --- | --- |
| gui |  |
| [dom] | If specified, inserts the dom content in the new row |
| [liBefore] | If specified, places the new row before another row |

<!--- API END --->

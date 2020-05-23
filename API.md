# dat.GUI API

Details about the classes, methods, and properties provided by dat.GUI. For more
hands-on examples, see the dat.GUI [tutorial](http://workshop.chromeexperiments.com/examples/gui).

<!--- API BEGIN --->

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
<dt><a href="#addRow">addRow(gui, [dom], [liBefore])</a></dt>
<dd><p>Add a row to the end of the GUI or before another row.</p>
</dd>
</dl>

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

## addRow(gui, [dom], [liBefore])
Add a row to the end of the GUI or before another row.

**Kind**: global function  

| Param | Description |
| --- | --- |
| gui |  |
| [dom] | If specified, inserts the dom content in the new row |
| [liBefore] | If specified, places the new row before another row |

<!--- API END --->

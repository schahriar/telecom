## Classes

<dl>
<dt><a href="#Line">Line</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#pushBack">pushBack(chunk)</a></dt>
<dd><p>Push a chunk of any type back to the stream
effectively buffering and concatenating to the
next chunk</p>
</dd>
<dt><a href="#write">write(chunk)</a></dt>
<dd><p>Write a chunk of any type to the stream</p>
</dd>
<dt><a href="#end">end([chunk])</a></dt>
<dd><p>End the stream with an optional chunk</p>
</dd>
<dt><a href="#throw">throw(error, ...args)</a></dt>
<dd><p>Throw an async error within the line</p>
</dd>
</dl>

<a name="Line"></a>

## Line
**Kind**: global class  
<a name="Line+state"></a>

### line.state
Line state scoped to current processor

**Kind**: instance property of <code>[Line](#Line)</code>  
**Properties**

| Name | Type |
| --- | --- |
| state | <code>Object</code> | 

<a name="pushBack"></a>

## pushBack(chunk)
Push a chunk of any type back to the stream
effectively buffering and concatenating to the
next chunk

**Kind**: global function  

| Param | Type |
| --- | --- |
| chunk | <code>\*</code> | 

<a name="write"></a>

## write(chunk)
Write a chunk of any type to the stream

**Kind**: global function  

| Param | Type |
| --- | --- |
| chunk | <code>\*</code> | 

<a name="end"></a>

## end([chunk])
End the stream with an optional chunk

**Kind**: global function  

| Param | Type |
| --- | --- |
| [chunk] | <code>\*</code> | 

<a name="throw"></a>

## throw(error, ...args)
Throw an async error within the line

**Kind**: global function  

| Param | Type |
| --- | --- |
| error | <code>Error</code> | 
| ...args | <code>args</code> | 


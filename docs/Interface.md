## Functions

<dl>
<dt><a href="#consume">consume(stream)</a></dt>
<dd><p>Add a new stream to be consumed by associated pipeline</p>
</dd>
<dt><a href="#throw">throw()</a></dt>
<dd><p>Throw a new error within the pipeline (accessible under interface:error listener on the pipeline)</p>
</dd>
<dt><a href="#debug">debug()</a></dt>
<dd><p>Log a debug event to pipeline</p>
</dd>
<dt><a href="#concat">concat()</a> ⇒ <code>function</code></dt>
<dd><p>Required function to cover Line#unshift method, concatenates n number of chunks together</p>
</dd>
</dl>

<a name="Interface"></a>

## Interface
Interface extensible Class

**Kind**: global interface  
<a name="consume"></a>

## consume(stream)
Add a new stream to be consumed by associated pipeline

**Kind**: global function  

| Param | Type |
| --- | --- |
| stream | <code>DuplexStream</code> | 

<a name="throw"></a>

## throw()
Throw a new error within the pipeline (accessible under interface:error listener on the pipeline)

**Kind**: global function  

| Type | Description |
| --- | --- |
| <code>args</code> | error arguments |

<a name="debug"></a>

## debug()
Log a debug event to pipeline

**Kind**: global function  

| Type | Description |
| --- | --- |
| <code>args</code> | debug arguments |

<a name="concat"></a>

## concat() ⇒ <code>function</code>
Required function to cover Line#unshift method, concatenates n number of chunks together

**Kind**: global function  

| Type |
| --- |
| <code>chucks</code> | 


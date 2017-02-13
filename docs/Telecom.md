## Classes

<dl>
<dt><a href="#Telecom">Telecom</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#pipeline">pipeline(interface)</a> ⇒ <code>Pipeline</code></dt>
<dd></dd>
<dt><a href="#parallelize">parallelize(totalForks, handler)</a></dt>
<dd><p>Parallelize a function to n number of processes/cores</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Interface">Interface</a> : <code><a href="#Interface">Interface</a></code></dt>
<dd><p>Telecom Interface with a consumer pool for handling concurrent i/o streams</p>
</dd>
</dl>

<a name="Telecom"></a>

## Telecom
**Kind**: global class  

* [Telecom](#Telecom)
    * [new Telecom()](#new_Telecom_new)
    * [.interfaces](#Telecom+interfaces)

<a name="new_Telecom_new"></a>

### new Telecom()
Creates a new Telecom instance

<a name="Telecom+interfaces"></a>

### telecom.interfaces
**Kind**: instance property of <code>[Telecom](#Telecom)</code>  
**Properties**

| Name | Type |
| --- | --- |
| interfaces | <code>object</code> | 

<a name="pipeline"></a>

## pipeline(interface) ⇒ <code>Pipeline</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| interface | <code>[Interface](#Interface)</code> | 

<a name="parallelize"></a>

## parallelize(totalForks, handler)
Parallelize a function to n number of processes/cores

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| totalForks | <code>Number</code> |  |
| handler | <code>function</code> | parallelized function |

<a name="Interface"></a>

## Interface : <code>[Interface](#Interface)</code>
Telecom Interface with a consumer pool for handling concurrent i/o streams

**Kind**: global typedef  

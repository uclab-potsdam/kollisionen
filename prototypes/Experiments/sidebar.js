const sidebar =
<ul>
    <li>Title: ${d.title} </li> 
    <li>Description: ${d.description}</li>
    <li>Date: ${d.vstart}</li>
    <li>Related objects: ${}</li>
    <li>Keywords: ${}</li>
</ul>
;

document.body.innerHTML = content;
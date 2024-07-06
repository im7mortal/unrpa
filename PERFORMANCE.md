### NATIVE_VS_WASM

```text
Wasm Execution Time: 377ms  
JS Execution Time: 25ms  
Difference: 352ms

Wasm Execution Time: 398ms
JS Execution Time: 22ms  
Difference: 376ms

Wasm Execution Time: 443ms
JS Execution Time: 24ms
Difference: 419ms 

Wasm Execution Time: 10ms
JS Execution Time: 2ms
Difference: 8ms

Wasm Execution Time: 14ms
JS Execution Time: 2ms
Difference: 12ms 

Wasm Execution Time: 18ms
JS Execution Time: 3ms
Difference: 15ms

Wasm Execution Time: 599ms  
JS Execution Time: 17ms 
Difference: 582ms 

Wasm Execution Time: 849ms
JS Execution Time: 17ms
Difference: 832ms

Wasm Execution Time: 482ms
JS Execution Time: 18ms
Difference: 464ms

Wasm Execution Time: 1s
JS Execution Time: 27ms
Difference: ~1s

Wasm Execution Time: 1s
JS Execution Time: 47ms
Difference: ~1s

Wasm Execution Time:  24s  ms (~ 24 seconds )
JS Execution Time:  141ms  ms (~ 141 ms )
Difference:  23s  ms (~ 23 seconds )
```


### Send File to worker

```text
Send
extract: 655628ms - timer ended (11 mins)

Not send
failed; don't want measure again; but it took longer
```

### Switched to @zip.js/zip.js

```text
extract: 131037ms - timer ended
```

### Used size only grouping function

```text
extract: 99286ms - timer ended
```

### Used mock grouping function (1 file; requires a lot of memory)

```text
extract: 225305ms - timer ended
```

### File System Access API try to split write to workers

```text
no split
extract_access: 40576.914794921875 ms
```
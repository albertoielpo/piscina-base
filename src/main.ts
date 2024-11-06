(async () => {
    const raw = new ArrayBuffer(4); // declare 4 bytes of raw data

    // when declaring a view from a raw ArrayBuffer then the pointer is copied
    const uint8 = new Uint8Array(raw); // copy pointer from raw
    uint8.fill(255, 0, 4); // assign to 255 in each postion
    console.log(uint8); // [255, 255, 255, 255]
    const uint16 = new Uint16Array(raw);
    // same data, different view
    console.log(uint16); // [65535, 65535]
    uint16[0] = 61680; // assign 61680 in first position
    // then data are modified in this way
    console.log(uint8, uint16); // Uint8Array(4) [ 240, 240, 255, 255 ] Uint16Array(2) [ 61680, 65535 ]

    // when declaring a view from another view then the data are copied
    const uint8Copy = new Uint8Array(uint8);
    uint8Copy[0] = 0;
    // as you can see data are copied
    console.log(uint8, uint8Copy); // Uint8Array(4) [ 240, 240, 255, 255 ] Uint8Array(4) [ 0, 240, 255, 255 ]

    // node buffer is a particular type array (based on Uint8Array)
    const buffer = Buffer.from(raw); // pointer is copied
    buffer[0] = 1;
    console.log(raw, buffer); // ArrayBuffer { [Uint8Contents]: <01 f0 ff ff>, byteLength: 4 } <Buffer 01 f0 ff ff>

    const bufferCopy = Buffer.from(uint8); // data are copied
    bufferCopy[0] = 2;
    console.log(uint8, bufferCopy); // Uint8Array(4) [ 1, 240, 255, 255 ] <Buffer 02 f0 ff ff>

    const bufferCopy2 = Buffer.from(bufferCopy); // data are copied
    bufferCopy2[0] = 3;
    console.log(bufferCopy, bufferCopy2); // <Buffer 02 f0 ff ff> <Buffer 03 f0 ff ff>

    // is it possible to not copy data from another type array using the underlying ArrayBuffer (.buffer)
    const newUint8 = new Uint8Array(uint8.buffer); // copy pointer from raw
    newUint8[0] = 5;
    console.log(newUint8, uint8); // Uint8Array(4) [ 5, 240, 255, 255 ] Uint8Array(4) [ 5, 240, 255, 255 ]

    // it works also with node buffer
    const newBuffer = Buffer.from(uint8.buffer);
    newBuffer[0] = 6;
    console.log(newBuffer, uint8); // <Buffer 06 f0 ff ff> Uint8Array(4) [ 6, 240, 255, 255 ]

    // or
    const newBuffer2 = Buffer.from(newBuffer.buffer);
    newBuffer2[0] = 7;
    console.log(newBuffer, newBuffer2); // <Buffer 07 f0 ff ff> <Buffer 07 f0 ff ff>
})();

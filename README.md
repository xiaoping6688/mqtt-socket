# mqtt-socket
Eclipse Paho MQTT Client 封装 (javascript)，支持node module引入

## Usage

```js
// for client
mqtt.connect(MQTT_CONIFG, onConnected, onReceived);
mqtt.sendToAll(110, {});
mqtt.sendToUser(YourDevID, 110, {});

//=> @see test.html
```
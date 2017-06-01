# mqtt-socket
Eclipse Paho MQTT Client 封装 (javascript)，支持node module引入

## Usage

```js
// for client
mqtt.connect(MQTT_CONIFG, onConnected, onReceived);
mqtt.sendToAll(110, {});
mqtt.sendToUser(YourDevID, 110, {});

// for server
使用阿里云的[MQTT 物联套件](https://help.aliyun.com/document_detail/42419.html)

//=> @see test.html
```
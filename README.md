# mqtt-socket
Eclipse Paho MQTT Client 封装 (javascript)，实现重连、队列和日志功能，支持node module引入；
> 该例服务端使用阿里云MQTT；另外推荐使用[MQTT.js](https://github.com/mqttjs/MQTT.js)：The MQTT client for Node.js and the browser

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

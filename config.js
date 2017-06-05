var MQTT_CONIFG = {};

MQTT_CONIFG.host = 'mqtt-cn-xxx.mqtt.aliyuncs.com';
MQTT_CONIFG.port = 80;
MQTT_CONIFG.topic = 'Topic_Demo';
MQTT_CONIFG.useTLS = false;
MQTT_CONIFG.accessKey = 'xxx';
MQTT_CONIFG.secretKey = 'xxx';
MQTT_CONIFG.cleansession = true;
MQTT_CONIFG.groupId = 'GID_Demo';
MQTT_CONIFG.preClientId = MQTT_CONIFG.groupId + '@@@';
MQTT_CONIFG.clientId = MQTT_CONIFG.preClientId + YourDevID;
MQTT_CONIFG.noSubscribe = false;

if (typeof module === 'object' && module && typeof module.exports === 'object') {
  module.exports = MQTT_CONIFG;
}

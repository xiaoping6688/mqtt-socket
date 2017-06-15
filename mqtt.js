/**
 * Eclipse Paho MQTT Client 封装
 */
(function (window) {
  'use strict'

  var client = null
  var username = ''
  var password = ''
  var connectCallback = null
  var receiveCallback = null
  var hasShutdown = false
  var logger = null
  var reconHandle = 0
  var reconnectTimeout = 2000
  var MQTT_CONIFG = null
  var hasConnected = false
  var socketQueue = []

  function connect (config, onConnected, onReceived) {
    close(false)

    if (config) {
      MQTT_CONIFG = config
      username = MQTT_CONIFG.accessKey
      password = CryptoJS.HmacSHA1(MQTT_CONIFG.groupId, MQTT_CONIFG.secretKey).toString(CryptoJS.enc.Base64)
    }
    if (onConnected) {
      connectCallback = onConnected
    }
    if (onReceived) {
      receiveCallback = onReceived
    }

    client = new Paho.MQTT.Client(MQTT_CONIFG.host, MQTT_CONIFG.port, MQTT_CONIFG.clientId)
    client.onConnectionLost = onConnectionLost
    client.onMessageArrived = onMessageArrived

    var options = {
      timeout: 3,
      onSuccess: onConnectSuccess,
      onFailure: onConnectFailure
    }

    if (username != null) {
      options.userName = username
      options.password = password
    }

    client.connect(options)
  }

  function reconnect () {
    if (!hasShutdown) {
      clearTimeout(reconHandle)
      reconHandle = setTimeout(connect, reconnectTimeout)
    }
  }

  function close (shutdown) {
    if (shutdown === undefined) shutdown = true

    hasShutdown = shutdown
    hasConnected = false

    if (client) {
      clearTimeout(reconHandle)
      if (client.isConnected()) {
        client.disconnect()
      }
      client = null
    }
  }

  /**
   * 发送消息到聊天室
   */
  function send (cmd, args) {
    trace('[Send] tag: ' + cmd + ' value: ' + (args ? JSON.stringify(args) : ''))
    if (client) {
      if (hasConnected) {
        var msg = {
          tag: cmd,
          value: args
        }

        var message = new Paho.MQTT.Message(JSON.stringify(msg))
        message.destinationName = MQTT_CONIFG.topic
        client.send(message)
      } else {
        trace('指令加入socket队列：' + cmd)
        socketQueue.push({ user: 'all', cmd: cmd, args: args })
      }
    } else {
      trace('发送指令失败：mqtt 未连接')
    }
  }

  /**
   * 单聊
   */
  function sendToUser (id, cmd, args) {
    trace('[Send] to: ' + id + ' tag: ' + cmd + ' value: ' + (args ? JSON.stringify(args) : ''))
    if (client) {
      if (hasConnected) {
        var msg = {
          tag: cmd,
          value: args
        }

        var message = new Paho.MQTT.Message(JSON.stringify(msg))
        message.destinationName = MQTT_CONIFG.topic + '/p2p/' + MQTT_CONIFG.preClientId + id
        client.send(message)
      } else {
        trace('指令加入socket队列：' + cmd)
        socketQueue.push({ user: id, cmd: cmd, args: args })
      }
    } else {
      trace('发送指令失败：mqtt 未连接')
    }
  }

  function setDebuger (value){
    logger = value
  }

  function trace (log, level) {
    if (level == undefined) level = 'log';

    if (typeof logger === 'function') {
      logger(log)
    } else {
      if (typeof DEBUG_ENV === 'string') {
        if (DEBUG_ENV !== 'production') {
          console[level](log)
        }
      } else {
        console[level](log)
      }
    }
  }

  function onConnectSuccess () {
    trace('mqtt connect success')
    hasConnected = true

    if (!MQTT_CONIFG.noSubscribe) {
      client.subscribe(MQTT_CONIFG.topic, {
        qos: MQTT_CONIFG.topicQos,
        onSuccess: function() {
          trace('topic subscribe success')
        }
      })
      
      // client.subscribe(MQTT_CONIFG.topic + '/p2p', {
      //   qos: 0,
      //   onSuccess: function() {
      //     trace('p2p subscribe success')
      //   }
      // })
    }

    if (typeof connectCallback === 'function'){
      connectCallback()
    }

    execQueue()
  }

  function onConnectFailure () {
    trace('mqtt connect failed')

    reconnect()
  }

  function onConnectionLost (response) {
    trace('mqtt connect losted' + (response && response.errorCode !== 0 ? ': ' + response.errorMessage : ''))
    hasConnected = false

    reconnect()
  }

  function onMessageArrived (message) {
    var topic = message.destinationName
    var payload = message.payloadString ? JSON.parse(message.payloadString) : {}
    var tag = payload.tag
    var value = payload.value
    trace('[Received] tag: ' + tag + ' value: ' + (value ? JSON.stringify(value) : '') + ' topic: ' + topic)

    if (typeof receiveCallback === 'function') {
      try {
        receiveCallback(tag, value, topic)
      } catch (err) {
        trace(err, 'error')
      }
    }
  }

  function execQueue () {
    var item = socketQueue.pop()
    if (item) {
      trace('执行socket队列：' + item.cmd)
      if (item.user === 'all') {
        send(item.cmd, item.args)
      } else {
        sendToUser(item.user, item.cmd, item.args)
      }
      execQueue()
    }
  }

  var mqtt = {
    setDebuger: setDebuger,
    connect: connect,
    close: close,
    sendToAll: send,
    sendToUser: sendToUser
  }

  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = mqtt
  } else {
    window.mqtt = mqtt
  }
})(window);

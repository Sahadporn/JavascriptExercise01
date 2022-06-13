const amqp = require("amqplib/callback_api")
const fs = require("fs")

function convertToJson(id, name, age) {
  var msg = {
    _id: id,
    name: name,
    age: parseInt(age),
  }

  return msg
}

function readCsv(channel, exchange, file) {
  const data = fs.readFileSync(file, "utf8")

  var rows = data.slice(data.indexOf("\n") + 1).split("\n")

  rows.map((row) => {
    var values = row.split(",")
    var converted = convertToJson(values[0], values[1], values[2])

    publish(channel, exchange, converted)
  })
}

function publish(channel, exchange, msg) {
  // convert data to json string first
  channel.publish(exchange, "", Buffer.from(JSON.stringify(msg)))
  console.log(" [x] Sent %s", msg)
}

const cred = {
  credentials: require("amqplib").credentials.plain("root", "root"),
}

amqp.connect("amqp://localhost", cred, (error0, connection) => {
  if (error0) throw error0

  connection.createChannel((error1, channel) => {
    if (error1) throw error1

    var exchange = "jsExchange"

    //declare exchange
    channel.assertExchange(exchange, "fanout", {
      durable: true,
    })

    // declare queue
    channel.assertQueue("jsQueue", {
      durable: true,
    })

    // bind queue to exchange
    channel.bindQueue("jsQueue", "jsExchange", "")

    var msg = process.argv.slice(2).join(" ")
    var arr = msg.split(",")

    if (msg[0] == "i") {
      msg = convertToJson(arr[1], arr[2], arr[3])
      publish(channel, exchange, msg)
    } else if (msg[0] == "c") {
      readCsv(channel, exchange, arr[1])
    }
  })

  setTimeout(() => {
    connection.close()
    process.exit(0)
  }, 1000)
})

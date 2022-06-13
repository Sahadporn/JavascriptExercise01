const { MongoClient } = require("mongodb")

const amqp = require("amqplib/callback_api")

const cred = {
  credentials: require("amqplib").credentials.plain("root", "root"),
}

var info_col

// connect to mongodb
MongoClient.connect("mongodb://root:root@localhost:27017/", (error, db) => {
  if (error) throw error

  db = db.db("jsInfo")
  info_col = db.collection("info")
})

// connect to rabbitmq
amqp.connect("amqp://localhost", cred, (error0, connection) => {
  if (error0) throw error0

  connection.createChannel((error1, channel) => {
    if (error1) throw error1

    var exchange = "jsExchange"

    // create an exchange
    channel.assertExchange(exchange, "fanout", {
      durable: true,
    })

    // create a queue
    var q = channel.assertQueue(
      "jsQueue",
      {
        durable: true,
      },
      error2 => {
        if (error2) throw error2

        console.log(" [*] Waiting for logs. To exit press CTRL+C")
      }
    )

    // bind queue to exchange
    channel.bindQueue(q.queue, exchange, "")

    // start consuming
    channel.consume(
      q.queue,
      msg => {
        var content = JSON.parse(msg.content)
        console.log(content)

        // do upsert
        info_col.updateOne(
          { _id: content["_id"] },
          {
            $currentDate: {
              updated_at: true,
            },
            $set: {
              name: content["name"],
              age: parseInt(content["age"]),
            },
            $setOnInsert: { created_at: new Date() },
          },
          { upsert: true },
          (error3, r) => {
            if (error3) throw error3

            if (r.upsertedId === null) {
              console.log("Update Success")
            } else {
              console.log("Save Success")
            }
          }
        )
        channel.ack(msg)
      },
      {
        noAck: false,
      }
    )
  })
})

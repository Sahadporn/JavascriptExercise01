const { MongoClient } = require("mongodb");
const redis = require("redis");

var amqp = require("amqplib/callback_api");

var cred = {
  credentials: require("amqplib").credentials.plain("root", "root"),
};

var info_col;

// connect to mongodb
MongoClient.connect("mongodb://root:root@localhost:27017/", (error, db) => {
  if (error) throw error;

  db = db.db("jsInfoRedis");
  info_col = db.collection("info");
});

// connect to rabbitmq
amqp.connect("amqp://localhost", cred, function (error0, connection) {
  if (error0) throw error0;

  connection.createChannel(function (error1, channel) {
    if (error1) throw error1;

    var exchange = "jsExchange";

    // create an exchange
    channel.assertExchange(exchange, "fanout", {
      durable: true,
    });

    // create a queue
    channel.assertQueue(
      "jsQueue",
      {
        durable: true,
      },
      function (error2, q) {
        if (error2) throw error2;

        console.log(" [*] Waiting for logs. To exit press CTRL+C");

        // bind queue to exchange
        channel.bindQueue(q.queue, exchange, "");

        // start consuming
        channel.consume(
          q.queue,
          function (msg) {
            var content = JSON.parse(msg.content);
            console.log(content);

            var get_redis;
            // connect to redis
            (async () => {
              try {
                const client = redis.createClient({
                  host: "localhost",
                  port: 6379,
                  password: "root",
                });
                await client.connect();
                get_redis = await client.get(content["_id"]);

                // check with redis
                if (get_redis == null) {
                  var date = {
                    created_at: new Date(),
                    updated_at: new Date(),
                  };

                  var merged = Object.assign(content, date);

                //   console.log(JSON.stringify(merged));

                  client.set(merged["_id"], merged["created_at"].toString());
                  info_col.insertOne(merged, (err) => {
                      if (err) throw err;
                      console.log('Save Success');
                  });
                } else {
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
                    },
                    (err) => {
                      if (err) throw err;
                      console.log('Update Success');
                    }
                  );
                }

                client.quit();
              } catch (err) {
                console.error(err);
              }
            })();

            channel.ack(msg);
          },
          {
            noAck: false,
          }
        );
      }
    );
  });
});

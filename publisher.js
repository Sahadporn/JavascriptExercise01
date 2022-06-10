const amqp = require("amqplib/callback_api");
const fs = require("fs");

function convertToJson(id, name, age) {
  var msg = {
    _id: id,
    name: name,
    age: parseInt(age),
  };

  return msg;
}

function readCsv(channel, exchange, file) {
  const data = fs.readFileSync(file, "utf8");

  var rows = data.slice(data.indexOf("\n") + 1).split("\n");

  rows.map(function (row) {
    var values = row.split(",");
    var converted = convertToJson(values[0], values[1], values[2]);
    
    setTimeout(() => {
      publish(channel, exchange, converted);
    }, 500);
  });
}

function publish(channel, exchange, msg) {
  // convert data to json string first
  channel.publish(exchange, "", Buffer.from(JSON.stringify(msg)));
  console.log(" [x] Sent %s", msg);
}

var cred = {
  credentials: require("amqplib").credentials.plain("root", "root"),
};

amqp.connect("amqp://localhost", cred, function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    var exchange = "jsExchange";

    channel.assertExchange(exchange, "fanout", {
      durable: true,
    });

    channel.assertQueue("jsQueue", {
      durable: true,
    });

    channel.bindQueue("jsQueue", "jsExchange", "");

    var msg = process.argv.slice(2).join(" ");

    if (msg[0] == "i") {
      var arr = msg.split(",");
      msg = convertToJson(arr[1], arr[2], arr[3]);
      publish(channel, exchange, msg);
    } else if (msg[0] == "c") {
      readCsv(channel, exchange, msg.substring(2));
    }
  });

  setTimeout(function () {
    connection.close();
    process.exit(0);
  }, 1000);
});

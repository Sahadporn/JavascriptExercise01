const amqp = require("amqplib/callback_api");
const fs = require("fs");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

function convertToJson(id, name, age) {
  var msg = {
    _id: id,
    name: name,
    age: parseInt(age),
  };

  return msg;
}

function readCsv(file) {
  const data = fs.readFileSync(file, "utf8");

  var rows = data.slice(data.indexOf("\n") + 1).split("\n");

  var r = rows.map(function (row) {
    var values = row.split(delimiter);
    convertToJson(values[0], values[1], values[2]);
  });

  console.log(r);
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

    var method = null;

    // readline.question("Who are you?", (name) => {
    //     console.log(`Hey there ${name}!`);
    //     readline.close();
    // });

    var i;
    readline.question("press [i] input or [c] csv: ", (ii) => {
      i = ii;
    });
    if (i == "i") {
      method = true;
    } else if (i == "c") {
      method = false;
    }
    // readline.close();

    // while (method) {
    //     var id = prompt('id: ');
    //     var name = prompt('name: ');
    //     var age = prompt('age: ');

    //     var msg = convertToJson(id, name, age);

    //     // convert data to json string first
    //     channel.publish(exchange, '', Buffer.from(JSON.stringify(msg)));
    //     console.log(" [x] Sent %s", msg);
    // };

    readline.question("input file name: ", (file) => {
      readCsv(file);
    });
    // readline.close();
  });

  setTimeout(function () {
    connection.close();
    process.exit(0);
  }, 500);
});

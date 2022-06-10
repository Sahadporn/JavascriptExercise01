const redis = require("redis");
// const client = redis.createClient({
//   host: "localhost",
//   port: 6379,
//   password: "root",
// });
// var client;
// var client = redis.createClient(6379, '127.0.0.1', 'root');
// client.connect();
// client.on('error', function(error) {
//     console.log("Error ", error);
// })

// client.set('color', 'blue', redis.print);

// client.get('color', function(error, v) {
//     if (error) throw error;

//     console.log(v);
// })

var re;
(async () => {
  try {
    const client = redis.createClient({
      host: "localhost",
      port: 6379,
      password: "root",
    });
    await client.connect();
    console.log(client);
    console.log("connected");
    // client.set('color', 'blue', redis.print);
    re = await client.get("color")
    // client.get('color', function(err, r) {
    //     if (err) throw err;
    //     console.log(r);
    //     ve = r;
    // })
    // client.quit()
    console.log("final", re);
  } catch (err) {
    console.log(re);
    console.error(err);
  }
})();

// console.log("gg", re);

// // client.on("connect", function () {
// //   console.log("Connected!");
// // });

// client.get("framework", (err, value) => {
//   if (err) {
//     throw err;
//   }
//   console.log("Value:", value);
// });

// // client.quit();

// const { promisify } = require('util');

// // promisifyAll(redis);

// const runApplication = async () => {
//     // Connect to redis at 127.0.0.1 port 6379 no password.
//     const client = redis.createClient(
//         {host: "127.0.0.1",
//          port: 6379,
//          password: "root",}
//     );

//     const setAsync = promisify(client.set).bind(client);
//     const getAsync = promisify(client.get).bind(client);

//     await setAsync('foo', 'bar');
//     const fooValue = await getAsync('foo');
//     console.log(fooValue);
// };

// runApplication();
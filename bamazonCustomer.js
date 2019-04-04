var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  //   start();
});

// connection.query("SELECT * FROM products", function(err, res) {
//   if (err) throw err;
//   console.log(res);
//   //snippet in case i need to remember how to insert somethign later
//   //   connection.query(
//   //     "INSERT INTO product(product, department_name, price, stock_quantity) VALUES ('PS4','Entertainment',400,50);",
//   //     function(err, res) {
//   //       if (err) throw err;
//   //S       console.log(res);
//   //     });
//   connection.end();
//   start();
// });

// function start() {
//   console.log(`yay shopping started`);
//   buyItem();
// }

function start() {
  inquirer
    .prompt({
      name: "buyorexit",
      type: "list",
      message:
        "Would you like to [BROWSE] the store, [SHOP] for products, or [EXIT] the store?",
      choices: ["BROWSE", "SHOP", "EXIT"]
    })
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.buyorexit === "BROWSE") {
        readProducts();
      } else if (answer.buyorexit === "SHOP") {
        buyItem();
      } else {
        connection.end();
        console.log("You see it, You like it, You want it, You got it");
      }
    });
}

start();

function readProducts() {
  console.log("Displaying all inventory...\n");

  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    // Log all results of the SELECT statement
    res.forEach(element => {
      console.log(
        `# ${element.item_id}: ${element.product}, price $${
          element.price
        } - stock remaining ${element.stock_quantity}`
      );
    });

    // connection.end();
  });
  start();
}

function buyItem() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product);
            }
            return choiceArray;
          },
          message: "What product would you like to buy?"
        },
        {
          name: "quantity",
          type: "input",
          message: "How many would you like to buy?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        let chosenItem;
        let amountBought = parseInt(answer.quantity);
        for (var i = 0; i < results.length; i++) {
          if (results[i].product === answer.choice) {
            chosenItem = results[i];
          }
        }
        console.log(`Item to be purchased: ${chosenItem.product}`);
        console.log(`Current Stock: ${chosenItem.stock_quantity}`);
        console.log(`Amount bought: ${amountBought}`);
        // determine if inventory was high enough
        if (chosenItem.stock_quantity > amountBought) {
          // bid was high enough, so update db, let the user know, and start over
          let newStock = chosenItem.stock_quantity - amountBought;
          console.log(`new stock: ${newStock}`);
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: newStock
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("Purchase made successfully!");
              let totalPrice = chosenItem.price * amountBought;
              console.log(
                `Total Price for ${answer.quantity} ${
                  chosenItem.product
                }: $${totalPrice} `
              );
              start();
              // readProducts();
            }
          );
        } else {
          // not enough stock, so apologize and start over
          console.log("There is not enough in inventory, try again.");

          start();
          // readProducts();
        }
      });
  });
}

// let buyItem = () => {
//   console.log("Buy");

//   inquirer
//     .prompt([
//       {
//         type: "input",
//         message: "What item would you like to buy?",
//         name: "product"
//       },
//       {
//         type: "input",
//         message: "How many would you like to buy?",
//         name: "quantity"
//       }
//     ])
//     .then(response => {
//       table.forEach(element => {
//         if (response.model === element.model) {
//           if (response.price > element.bid) {
//             console.log("Yay, congrats on getting new shoes!");
//           } else {
//             console.log("Try more!");
//             bidFn();
//           }
//         }
//       });
//       console.log("There's no such shoes");
//     });
// };

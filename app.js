//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); 
const _ = require("lodash"); 

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-joseph:test123@cluster0.49ukw.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("item", itemsSchema); 

const item1 = new Item({
  name: "cook"
});

const item2 = new Item({
  name: "read"
});

const item3 = new Item({
  name: "sleep"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("list", listSchema); 

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {} ); 
    }
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list; 

  const item = new Item({
    name: itemName
  }); 

  if (listName === "Today") {
    item.save(); 
    res.redirect('/'); 
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item); 
      foundList.save();
      res.redirect("/" + listName); 
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemID = req.body.checkbox; 
  const listName = req.body.listName; 

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function(err) {}); 

    res.redirect("/"); 
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList) {
      res.redirect("/" + listName); 
    });
  }
});

app.get("/:customListName", function(req, res) {
  const customListName = _.lowerCase(req.params.customListName); 

  List.findOne({name: customListName}, async function(err, foundList) {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
       
      await list.save(); 
      res.redirect("/" + customListName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  });
});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000; 
}
app.listen(port);


//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();
app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
 // code to connect with the mongoDB atlas.
 const url = process.env.MONO_URL;
mongoose.connect(url , {
  useNewUrlParser : true , 
  dbName : "todolistDB"
})


const itemSchema = {
  name: String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name: "Welcome to todoList!!"
});
const item2 = new Item({
  name: "Click on the + button to add item."
});
const item3 = new Item({
  name: "hit this to delete"
});

 const defaultItems=[item1,item2,item3];

const listSchema = {
  name:String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {

  // let day = date.getDate();

  Item.find({} , function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log("error");
        }
        else{
          console.log("Success");
        }
      });
      res.redirect("/");
    }

    res.render("list", { kindOfDay: "Today" , newListItems:foundItems});
  })
  
});

// here we have implemented the dynamic routing.
app.get("/:customListName" , function(req,res){
  const customListName = _.capitalize(req.params.customListName);
List.findOne({name:customListName}, function(err , foundList){
  if(!err){
    if(!foundList){
      console.log("Dosen't Exist");
      const list = new List({
        name:customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName)
    }
    else {
      res.render("list", { kindOfDay: foundList.name , newListItems:foundList.items});
    }
  }
})


});


app.post("/" , function(req , res){

  let itemName = req.body.newItem ;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName ==="Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName} , function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

  
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);
  if(listName === "Today"){
Item.findByIdAndRemove(checkedItemId , function(err){
    if(err){
      console.log(err)
    }
    else{
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    }
  });
  } else {
    List.findOneAndUpdate({name:listName} , {$pull: {items: { _id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }
  
    
  
});




app.post("/work" , function(req , res){
  let item = req.body.newItem;
  workitems.push(item);
  res.redirect("/work");
})

app.get("/about" , function(req,res){
  res.render("about");
})
app.listen(3000, function () {
  console.log("Server is running 3000.");
});

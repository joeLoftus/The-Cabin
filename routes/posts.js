var express = require("express");
var router  = express.Router();
var Post = require("../models/post");
var middleware = require("../middleware");
var multer = require("multer");
var fs = require("fs");
var parser = require('rss-parser');
var numRSSItems = 5;

//INDEX - show all posts
router.get("/", middleware.isLoggedIn, function(req, res){
    // Get all posts from DB
    Post.find({}, function(err, allPosts){
       if(err){
           console.log(err);
       } else {
            parser.parseURL('https://www.fs.usda.gov/wps/PA_WIDConsumption/rssgetfile?xFSENavChannel00=110617&xFSENavChannel02=120000000000000&pathinfo=/wps/portal/fsinternet/cs/alerts/okawen/alerts-notices/!ut/p/z1/04_Sj9CPykssy0xPLMnMz0vMAfIjo8ziDfxNDDwNwxydLA1cjbyDTV1cjA0gQD8crMAIynW0MPD38AjzC_MxgCmIIka_AQ7gSKx-3Aqi8BvvRcgCYAgYFfk6-6brRxUklmToZual5etH5Gcnlqfm6Uck5qQWlRTr5uWXZCanFgNdEwU2D194EHJRQW5oaESVj4dBpqMiAG7x-3w!/dz/d5/L2dJQSEvUUt3QS80TmxFL1o2XzBPNDBJMVZBQjkwRTJLUzVERDMwMDAwMDAw/?navtype=BROWSEBYSUBJECT&desc=alerts&forestname=', function(err, parsed) {
                 var dates = [];
                 if (err){
                     console.log("err");
                     dates[0] = "This feed has been removed by the forrest service";
                     var errMsg = "This feed has been removed by the forrest service";
                     res.render("posts/index",{posts:allPosts, rssItems: errMsg, dates: dates, numRSSItems: 1});
                 }
                 else{
                    for (var i =0; i<numRSSItems; i++){
                        var newDate = new Date (parsed.feed.entries[i].pubDate);
                        dates[i] =  (newDate.getMonth() + 1).toString() + "/";
                        dates[i] += newDate.getDate() + "/";
                        dates[i] += newDate.getFullYear();
                        }
                    res.render("posts/index",{posts:allPosts, rssItems: parsed.feed.entries, dates: dates, numRSSItems: numRSSItems});
                }
                
            });
        }
    });
});


//CREATE - add new post to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // // get data from form and add to posts array
    var name = req.body.name;
    var image = { data:fs.readFileSync(req.files[0].path),
                    contentType: "image/png" };
    var base64String = image.data.toString('base64');
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newPost = {name: name, image: image, base64: base64String, description: desc, author:author}
    // Create a new post and save to DB
    Post.create(newPost, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to posts page
            console.log(newlyCreated);
            res.redirect("/posts");
        }
    });

});

//NEW - show form to create new post
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("posts/new"); 
});

// SHOW - shows more info about one post
router.get("/:id", function(req, res){
    //find the post with provided ID
    Post.findById(req.params.id).populate("comments").exec(function(err, foundPost){
        if(err){
            console.log(err);
        } else {
            console.log(foundPost)
            //render show template with that post
            res.render("posts/show", {post: foundPost});
        }
    });
});

// EDIT POST ROUTE
router.get("/:id/edit", middleware.checkPostOwnership, function(req, res){
    Post.findById(req.params.id, function(err, foundPost){
        res.render("posts/edit", {post: foundPost});
    });
});

// UPDATE POST ROUTE
router.put("/:id",middleware.checkPostOwnership, function(req, res){
    // find and update the correct post
    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
       if(err){
           res.redirect("/posts");
       } else {
           //redirect somewhere(show page)
           res.redirect("/posts/" + req.params.id);
       }
    });
});

// DESTROY POST ROUTE
router.delete("/:id",middleware.checkPostOwnership, function(req, res){
   Post.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/posts");
      } else {
          res.redirect("/posts");
      }
   });
});


module.exports = router;


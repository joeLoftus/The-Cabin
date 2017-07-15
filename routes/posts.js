var express = require("express");
var router  = express.Router();
var Post = require("../models/post");
var middleware = require("../middleware");
var multer = require("multer");
var fs = require("fs");


//INDEX - show all posts
router.get("/", middleware.isLoggedIn, function(req, res){
    // Get all posts from DB
    Post.find({}, function(err, allPosts){
       if(err){
           console.log(err);
       } else {
          res.render("posts/index",{posts:allPosts});
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


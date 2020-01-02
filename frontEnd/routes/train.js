let express = require("express");
let router = express.Router();

router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    let user = req.user;
    res.render("train", { modelName: modelName, uname: user.user_name });
  } else {
    res.redirect("/");
  }
});

module.exports = router;

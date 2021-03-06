const db = require("../database/db");
let express = require("express");
let router = express.Router();
let request = require("request");
let _ = require("underscore");
const apiBaseUrl = "http://127.0.0.1:8000/upload/";
let ImageUrl = "http://localhost:5001/uploads/";

// @route   POST /getImagePrediction
// @desc    Call Python Script, to get the image prediction for the selected images
// @access  Private
router.post("/getImagePrediction", function(req, res) {
  try {
    const id = JSON.parse(req.body.id).join(",");
    const selectedTrainingAlgo = req.body.trainingAlgo;
    const selectedModel = req.body.modelName;
    console.log("ModelName**********", selectedTrainingAlgo);
    console.log("Request BODY**********", req.body);
    
    let data = [];
    pythonApiData(id, selectedTrainingAlgo, selectedModel, req, res);
  } catch (e) {
    console.log("Error", e);
    res.send(e);
  }
});

function pythonApiData(id, selectedTrainingAlgo, selectedModel, req, res) {
  let resultExImag1 = [];
  console.log("Model selected is********", selectedModel);
  console.log("Training ALgo selected is********", selectedTrainingAlgo);
  // Fetch crop id and location of the cropped images from the experiment_cropped_images table and store in a variable responseJson
  db.query(
    "SELECT * FROM experiment_cropped_images WHERE exp_img_id IN (" + id + ");",
    function(err, result) {
      db.query(
        "SELECT * FROM experiment_images WHERE id IN (" + id + ");",
        (err, resultExImag, fields) => {
          resultExImag1 = resultExImag;
          let responseJson;
          if (!result || result.length === 0) {
            responseJson = _.map(
              _.groupBy(resultExImag, "id"),
              (value, key) => {
                let fullImageData = {
                  exp_img_id: value[0].id,
                  [value[0].id]: _.map(value, value => {
                    return {
                      link: ImageUrl + value.exp_images,
                      crop_id: value.id
                    };
                  })
                };
                console.log("FULL IMAGE DATA: ", fullImageData);
                return fullImageData;
              }
            );
          } else {
            // _.map() -> Underscore function
            responseJson = _.map(
              _.groupBy(result, "exp_img_id"),
              (value, key) => {
                let cropImageData = {
                  exp_img_id: value[0].exp_img_id,
                  [value[0].exp_img_id]: _.map(value, value => {
                    return {
                      link: ImageUrl + value.exp_crop_img,
                      crop_id: value.exp_img_id
                    };
                  })
                };
                console.log("Crop Image Data: ", cropImageData);
                return cropImageData;
              }
            );
          }
          callPythonApi(responseJson, resultExImag1, selectedTrainingAlgo, selectedModel, req, res);
        }
      );
    }
  );
}

function callPythonApi(responseJson, resultExImag1, selectedTrainingAlgo, selectedModel, req, res) {
  console.log("Python ML Api called");
  console.log("STRINGYFY RESPONSE JSON", JSON.stringify(responseJson));

  // Call the python API, passing the responseJson data
  request(
    {
      method: "POST",
      uri: apiBaseUrl,
      form: { data: JSON.stringify(responseJson) , selectedTrainingAlgo, selectedModel},
      rejectUnauthorized: false
    },
    function(error, response, body) {
      if (error) {
        console.error("upload failed:", error);
        req.session.predictionDataerror = error;
        req.session.predictionData = "";
        res.send(error);
        console.log(response);
      } else {
        let n = body.search("not found");

        if (n > 0) {
          req.session.predictionDataerror = "Api url not found";
          req.session.predictionData = "";
          res.send(error);
        } else {
          try {
            // Everything went right, and we get a response from the Python API
            let pyResponse = JSON.parse(body);
            console.log("pyResponse: ", pyResponse);

            let now = new Date(new Date().toString().split("GMT")[0] + " UTC")
              .toISOString()
              .split(".")[0]
              .replace("T", "-");

            let dataImage = [];

            let exp_id = "";
            let crop_id = "";

            // Get data from resultExImag1 for each original images selected by the user
            for (let i = 0; i < resultExImag1.length; i++) {
              dataImage[resultExImag1[i].id] = resultExImag1[i].exp_images;
              exp_id = resultExImag1[i].exp_id;
              user_id = resultExImag1[i].user_id;
              created_at = resultExImag1[i].created_at;
              updated_at = resultExImag1[i].updated_at;
            }

            // Insert the prediction received from the Python API, into the prediction table
            for (let k = 0; k < pyResponse.length; k++) {
              let type = pyResponse[k].type;

              db.query(
                "SELECT * FROM experiment_cropped_images WHERE exp_img_id in (" +
                  pyResponse[k].exp_img_id +
                  ") AND exp_id in (" +
                  exp_id +
                  ")",
                function(err, results) {
                  if (results) {
                    results.forEach(function(result) {
                      db.query(
                        "INSERT INTO prediction (user_id, exp_img_id, exp_id, name, img, crop_id, exp_type, created_at, updated_at,training_algo,model_name ) VALUES (?, ?, ?,?, ?, ?,?,?,?,?,?)",
                        [
                          user_id,
                          result.exp_img_id,
                          exp_id,
                          result.exp_label_name,
                          result.exp_crop_img,
                          result.id,
                          type.toUpperCase(),
                          created_at,
                          now,
                          selectedTrainingAlgo,
                          selectedModel
                        ]
                      );
                    });
                  }
                }
              );
            }

            for (let k = 0; k < pyResponse.length; k++) {
              let predTypePercentage = JSON.stringify(pyResponse[k].prediction);
              console.log("stringify: ", predTypePercentage);
              db.query(
                "INSERT INTO prediction_type (exp_img_id, exp_id, exp_type, img, created_at, pred_percentage, training_algo,model_name) VALUES (?, ?, ?,?,?, ?, ?, ?)",
                [
                  pyResponse[k].exp_img_id,
                  exp_id,
                  pyResponse[k].type.toUpperCase(),
                  dataImage[pyResponse[k].exp_img_id],
                  now,
                  predTypePercentage,
                  selectedTrainingAlgo,
                  selectedModel
                ]
              );
            }

            req.session.predictionData = "";
            req.session.predictionData = pyResponse;
            // res.redirect("/prediction/view");
            res.redirect("/prediction/view/" + exp_id);
          } catch (e) {
            console.log("Error", e);
            req.session.predictionDataerror = e;
            req.session.predictionData = "";
            res.send(error);
          }
        }
      }
    }
  );
}

// @route   GET /prediction/view
// @desc    Display predictions on the web interface
// @access  Private
router.get("/view/:id", function(req, res) {
  if (req.isAuthenticated()) {
    let user = req.user;
    let id = req.params.id;

    if (req.session.predictionData) {
      let responseData = req.session.predictionData;
      console.log("Response Data: ", responseData);
      setTimeout(function() {
        req.session.predictionData = "";
      }, 2000);

      let smallArr = [];

      for (let i = 0; i < responseData.length; i++) {
        let image_id = responseData[i].exp_img_id;
        smallArr.push(image_id);
      }

      let array = smallArr.toString();
      console.log("ARRAY----- ", array);

      // Get prediction to be displayed on the web interface
      db.query(
        "SELECT exp_images,exp_id,id,DATE_FORMAT(created_at,'%m/%d/%Y %T') AS created_at FROM experiment_images WHERE id IN (" +
          array +
          ");",
        function(err, resultImg) {
          if (resultImg) {
            res.render("viewPrediction", {
              uname: user.user_name,
              data: responseData,
              dataImg: resultImg,
              id: id
            });
            console.log("dataImg:------------- ", resultImg);
          }
        }
      );
    } else {
      res.redirect("back");
    }
  }
});

// @route   GET /prediction/view
// @desc    Display predictions on the web interface
// @access  Private
router.get("/view/validate/:id", function(req, res) {
  if (req.isAuthenticated()) {
    let user = req.user;
    let id = req.params.id;
    // if (req.session.predictionData) {
    //   let responseData = req.session.predictionData;
    //   console.log("Response Data: ", responseData);
    //   setTimeout(function() {
    //     req.session.predictionData = "";
    //   }, 2000);

    //   let smallArr = [];

    //   for (let i = 0; i < responseData.length; i++) {
    //     let image_id = responseData[i].exp_img_id;
    //     smallArr.push(image_id);
    //   }

      // Get prediction to be displayed on the web interface
      db.query(
        "SELECT exp_id,img AS exp_images,exp_img_id AS id,exp_type FROM prediction_type WHERE exp_id = " +
          id +
          " AND user_validate is NULL " +
          " AND exp_validate = 0 ;",
        function(err, resultImg) {
          console.log("SELECT QUERY=-=====", this.sql);
          if (resultImg) {
            res.render("viewPrediction", {
              uname: user.user_name,
              // data: responseData,
              dataImg: resultImg,
              id: id
            });
            console.log("dataImg:------------- ", resultImg);
          }
        }
      );
    // } else {
    //   res.redirect("back");
    // }
  }
});

// @route   POST /checkCrop
// @desc    Enable Predict button, if image is previously cropped
// @access  Private
router.post("/checkCrop", function(req, res) {
  const id = JSON.parse(req.body.id).join(",");

  if ("undefined" !== id && id !== "" && id !== null) {
    db.query(
      "SELECT * FROM experiment_cropped_images WHERE exp_img_id IN (" +
        id +
        ")",
      function(err, results) {
        if (results.length > 0) {
          res.json({ data: 200 });
        } else {
          res.json({ data: 500 });
        }
      }
    );
  } else {
    res.json({ data: 500 });
  }
});

module.exports = router;

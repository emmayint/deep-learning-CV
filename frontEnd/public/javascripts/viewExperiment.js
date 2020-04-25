// IDs of all selected(ticked) checkboxes above each image(Check Box Image Top).
// Example: cbIt1, cbIt2, cbIt3
let selectedImageTopCheckBoxIds = new Set();

// IDs of all images for whom the checkbox above image is selected(ticked)
// Example: 1, 2, 3, 4 (The values of this set correspond to the set of 'selectedImageTopCheckBoxIds')
let selectedImageIds = new Set();

// IDs of all selected toggle buttons below each image(toggle button is actually a checkbox with CSS)
// Example: cbToggle1, cbToggle2, cbToggle3
let selectedImagesCropToggleCheckBoxIds = new Set();

// IDs of all images for whom the crop toggle button is Selected(True). i.e, the images which have been selected for cropping
// Example: 1, 2, 3, 4 (The values of this set correspond to the set of 'selectedImagesCropToggleCheckBoxIds')
let selectedImagesForCroppingIds = new Set();

let rect;

$(document).ready(function () {
  // Disable all crop buttons on page load
  $(".cropBtn").prop("disabled", true);
  // Click listener for class 'checkboxImageTop'
  $(".checkboxImageTop").click(function () {
    let clickedCheckBox = this;
    let checkBoxId = clickedCheckBox.id;

    if ($(".checkboxImageTop").is(":checked")) {
      $(".uploadexp").prop("disabled", false);
    } else {
      $(".uploadexp").prop("disabled", true);
    }

    updateSelectedItems(checkBoxId);
  });

  // Click listener for 'Crop' button beneath each image
  $(".checkBoxToggleCrop").click(function () {
    let clickedToggleCheckBox = this;
    let toggleCheckBoxId = clickedToggleCheckBox.id;
    let cropButtonId = toggleCheckBoxId.replace("cbToggle", "btnCrop");
    toggleCropButtonEnablement(toggleCheckBoxId, cropButtonId);
  });

  // Click listener for 'Select All' button
  $("#btnSelectAll").click(function () {
    checkAllImageTopCheckBoxes(true);
  });

  // Click listener for 'Unselect All' button
  $("#btnUnselectAll").click(function () {
    checkAllImageTopCheckBoxes(false);
  });

  $("#btnEnableCrop").click(function () {
    enableAllCropButtons(true);
  });

  $("#btnDisableCrop").click(function () {
    enableAllCropButtons(false);
  });

  $("#deleteBtn").click(function (e) {
    deleteImages(e);
  });

  // To enable Attach Label feature
  // $('.cropBtn').click(function (e) {
  //     $("#cropPromtBox").modal('show');
  // });

  $(".promtSubmit").click(function (e) {
    cropImages(e);
  });

  $("#prediction").click(function (e) {
    viewPredictionPage(e);
  });

  $(".checkboxImageTop").click(function (e) {
    checkCrop(e);
  });

  // Croppr
  const cropInstance = [];
  var lock = false;

  const callback = function (id, value) {
    console.log("cropbox moved in from image# " + id);

    if (!lock) {
      lock = true;
      cropInstance.forEach(function (cropper, index) {
        if (index !== id) {
          console.log("moving cropbox " + index);
          // cropper.moveTo(value.x, value.y);
          cropper.resizeTo(value.width, value.height);
          cropper.moveTo(value.x, value.y);
        }
        if (cropInstance.length - 1 === index) lock = false;
      });
    }
  };

  let images = $(".large-image");

  for (let i = 0; i < images.length; i++) {
    let cropper = new Croppr(images[i], {
      startSize: [280, 280, "px"],
      returnMode: "raw",
      onCropEnd: function (value) {
        console.log(value.x, value.y, value.width, value.height);

        let top = value.y;
        let right = value.x + value.width;
        let bottom = value.y + value.height;
        let left = value.x;

        let $clip = $("#clip");
        $clip.css("position", "absolute");
        $clip.css("top", -1 * top);
        $clip.css("left", -1 * left);
        rect =
          "rect(" +
          top +
          "px, " +
          right +
          "px, " +
          bottom +
          "px, " +
          left +
          "px)";
        console.log(rect);
        $clip.css("clip", rect);
        callback(i, value);
      }
    });

    cropInstance.push(cropper);
  }

  //Get request to get training algorithm
  $.ajax({
    type: "GET",
    url: window.location.href + "/getTrainingAlgo",
    success: function (result) {
      populate_models_data(result);
    },
    error: function (err) {
      console.log(err);
    }
  });
});

function enableAllCropButtons(isCropEnabled) {
  $(".checkBoxToggleCrop").prop("checked", isCropEnabled);
  $(".cropBtn").attr("disabled", !isCropEnabled);
  if (isCropEnabled) {
    let allcheckBoxToggleCropList = document.querySelectorAll(
      ".checkBoxToggleCrop"
    );

    for (i = 0; i < allcheckBoxToggleCropList.length; i++) {
      let toggleCheckBoxId = allcheckBoxToggleCropList[i].id;
      let imageId = toggleCheckBoxId.replace("cbToggle", "");
      selectedImagesCropToggleCheckBoxIds.add(toggleCheckBoxId);
      selectedImagesForCroppingIds.add(imageId);
    }
  } else {
    selectedImagesCropToggleCheckBoxIds.clear();
    selectedImagesForCroppingIds.clear();
  }
}

function checkAllImageTopCheckBoxes(isChecked) {
  let allImageTopCheckBoxesList = document.querySelectorAll(
    ".checkboxImageTop"
  );

  for (i = 0; i < allImageTopCheckBoxesList.length; i++) {
    let checkBoxId = allImageTopCheckBoxesList[i].id;
    $("#" + checkBoxId).prop("checked", isChecked);
    updateSelectedItems(checkBoxId);
  }
}

function toggleCropButtonEnablement(toggleCheckBoxId, cropButtonId) {
  let imageId = toggleCheckBoxId.replace("cbToggle", "");
  let isChecked = $("#" + toggleCheckBoxId).is(":checked");

  $("#" + cropButtonId).prop("disabled", isChecked ? false : true);

  if (isChecked) {
    selectedImagesCropToggleCheckBoxIds.add(toggleCheckBoxId);
    selectedImagesForCroppingIds.add(imageId);
  } else {
    selectedImagesCropToggleCheckBoxIds.delete(toggleCheckBoxId);
    selectedImagesForCroppingIds.delete(imageId);
  }
}

function updateSelectedItems(clickedCheckBoxId) {
  let imageId = clickedCheckBoxId.replace("cbIt", "");
  let isChecked = $("#" + clickedCheckBoxId).is(":checked");

  // console.log(isChecked);

  if (isChecked) {
    selectedImageIds.add(imageId);
    selectedImageTopCheckBoxIds.add(clickedCheckBoxId);
  } else {
    selectedImageIds.delete(imageId);
    selectedImageTopCheckBoxIds.delete(clickedCheckBoxId);
  }

  // console.log(selectedImageIds);
  let imageIdArray = Array.from(selectedImageIds);
  $("#demo").text(imageIdArray);
  $("#demo1").text(
    "Are you sure you want to delete " + imageIdArray.length + " image(s) ?"
  );

  if (imageIdArray.length === 0) {
    $("#demo1").text("No Image Selected");
  }
}

function deleteImages(e) {
  e.preventDefault();
  let expID = document.getElementById("deleteExpID").value;
  let imageIdArray = Array.from(selectedImageIds);
  const data = {
    foo: imageIdArray
  };
  $.ajax({
    type: "POST",
    url: window.location.href + "/deleteImages",
    data: {
      images: JSON.stringify(imageIdArray)
    },
    success: function (result) {
      location.href = "/viewExperiment/" + expID;
      // location.href = "/home";
    },
    error: function (err) {
      console.log(err);
    }
  });
}

function cropImages(e) {
  e.preventDefault();

  let imageIdArray = Array.from(selectedImagesForCroppingIds);

  const data = {
    foo: imageIdArray
  };
  const data1 = {
    bar: rect
  };

  $("#rectId").val(rect);

  var labelName = $("#labelName").val();

  $.ajax({
    type: "POST",
    url: window.location.href + "/cropImages",
    data: {
      id: JSON.stringify(imageIdArray),
      rect,
      labelName
    },
    success: function (result) {
      location.href = window.location.href;
    },
    error: function (err) {
      console.log(err);
    }
  });
}

function viewPredictionPage(e) {
  // Display loading gif when predict button is pressed
  $("#loadingPredict").show();
  let expID = document.getElementById("expID").value;

  console.log("EXPERIMENT ID________", expID);
  let imageIdArray = Array.from(selectedImageIds);
  var selectedTrainingAlgo = document.getElementById("training_algo").children[document.getElementById("training_algo").value].text;
  var selectedModel = document.getElementById("model").value.split(',');
  $.ajax({
    type: "POST",
    url: "/prediction/getImagePrediction",
    data: {
      id: JSON.stringify(imageIdArray),
      trainingAlgo: selectedTrainingAlgo,
      modelName: selectedModel[0]
    },
    success: function (result) {
      console.log("cropped data=======>", result);
      $("#loadingPredict").hide();
      window.location.replace("/prediction/view/" + expID);
    },
    error: function (err) {
      console.log(err);
    }
  });
}

// Enable predict button only if the images are previosuly cropped
function checkCrop(e) {
  let imageIdArray = Array.from(selectedImageIds);

  $.ajax({
    type: "POST",
    url: "/prediction/checkCrop",
    data: {
      id: JSON.stringify(imageIdArray)
    },
    success: function (result) {
      if (result.data == 200) {
        if ($(".checkboxImageTop").is(":checked")) {
          $("#prediction").prop("disabled", false);
        } else {
          // $("#prediction").prop("disabled", true);
        }
      } else {
        // $("#prediction").prop("disabled", true);
      }
    },
    error: function (err) {
      console.log(err);
    }
  });
}

function populate_models_data(trainingalgo_data) {
  var training_algo_arr = new Array("Select Training Algorithm");

  // Choose model algo and type
  for (i = 0; i < trainingalgo_data.length; i++) {
    training_algo_arr.push(trainingalgo_data[i].selected_model);
  };

  $.each(training_algo_arr, function (i, item) {
    $('#training_algo').append($('<option>', {
      id: item,
      value: i,
      text: item,
    }, '</option>'));
  });

  $('#training_algo').change(function () {
    var c = $(this).val();
    var selectedAlgo = $(this)[0].children[c].text;
    $('#modelnote').css("display", "block");
    //Get request to get training algorithm
    $.ajax({
      type: "GET",
      url: window.location.href + "/getModels/" + selectedAlgo,
      success: function (result) {
        var s_a = new Array("Select Model");
        for (i = 0; i < result.length; i++) {
          s_a.push(result[i].model_fullname + ',' + result[i].favorite);
        }
        $('#model').empty();
        if (c == 0) {
          $('#model').append($('<option>', {
            value: '0',
            text: 'Select Model',
          }, '</option>'));
        } else {

            $.each(s_a, function (i, item_model) {
              if(s_a[i] == 'Select Model'){
                $('#model').append($('<option>', {
                  value: 'Select Model',
                  text: 'Select Model'
                }, '</option>'));
              }
              else{
                var s_split = s_a[i].split(',');
                if(s_split[1] == 1){
                  $('#model').append($('<option>', {
                    value: item_model,
                    text: '***' + s_split[0]
                  }, '</option>'));
                }
                else{
                  $('#model').append($('<option>', {
                    value: item_model,
                    text: s_split[0]
                  }, '</option>'));
                }
              }
            });
        }
        $('#model').change(function () {
          $("#prediction").prop("disabled", false);
        });
      },
      error: function (err) {
        console.log(err);
      }
    });
  });
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
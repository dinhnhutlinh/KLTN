(async () => {
  // ==================== Test Code =============================
  // const allComments = Array.from(document.querySelectorAll([class="${CLASS_NAMES.FB_COMMENT_DIV}"]));
  // ==================== END TEST CODE =========================
  const dedupArray = (arr) => {
    return arr.filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t["comment_id"] === value["comment_id"] &&
            t["rep_comment_id"] === value["rep_comment_id"]
        )
    );
  };
  const data = dedupArray(buildCommentIdx());
  let level;
  await chrome.storage.local.get(["levelValue"]).then(async (result) => {
    if(result.levelValue == undefined){
      level = 0.6;
    }else{
      level = result.levelValue;
      await chrome.storage.local.set({ levelValue: level});
    }
    console.log("Value currently is " + level);
  });

  // TODO: Send the data to the ML model to check if the comments are offensive
  // const res  = call_api(data)
  let res = data;
  // TODO: Set the changedComments variable to allow redos based on the response
  changedComments = [];

  let predict_results;
  var formdata = new FormData();

  data.forEach((ele) => {
    formdata.append("comments", ele["comment_text"]);
  });
  var requestOptions = {
    method: "POST",
    body: formdata,
    redirect: "follow",
  };

  await fetch(
    "https://foxhound-intimate-oriole.ngrok-free.app/api/detect/",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      predict_results = JSON.parse(result);
      console.log("predict_results:", predict_results);
    })
    .catch((error) => console.log("error", error));
  console.log("predict_results:", predict_results);

  res.forEach((ele, index) => {
    let isToxic = checkIsToxic(predict_results[index], level);
    if (isToxic) {
      changedComments.push(ele);
    }
  });
  console.log("xxxxxxxx", changedComments);
  // check res in api

  // TODO: Apply the changes on the comment with href(s) returned from the server (sample on how to change 1 comment below)
  changedComments.forEach((ele) => {
    const testComments = getCommentDivFromIdAndRepId(
      ele["comment_id"],
      ele["rep_comment_id"]
    );
    // testComments.forEach(
    //   (comment) =>
    //     {
    // console.log("comment:", comment);
    // let commentText = comment.getElementsByClassName("x1lliihq xjkvuk6 x1iorvi4")[0];
    // console.log("commentText:", commentText);
    // commentText.style.cssText = "background-color:pink;filter:blur(2.5em)";
    //     }
    // );
    testComments.forEach(
      (comment) =>
        (comment.style.cssText = "background-color:pink;filter:blur(2.5em)")
    );
  });

  // ===================== TEST Change single comment =============================================================
  // data.forEach((ele) => {
  //   const testComments = getCommentDivFromIdAndRepId(
  //     ele["comment_id"],
  //     ele["rep_comment_id"]
  //   );
  //   testComments.forEach(
  //     (comment) =>
  //       (comment.style.cssText = "background-color:pink;filter:blur(2.5em)")
  //   );
  //   // testComment.style.cssText = "background-color:pink;filter:blur(2.5em)"
  //   // !DOUBLE CHECK
  //   changedComments.push(ele);
  // });
  // console.log(changedComments);
  // +==================== END  TEST CHANGE SINGLE COMMENT ==================================================
})();

function checkIsToxic(predict_result, level) {
  // let tempLevel = level == undefined ? 0.6 : level;
  let predictions = predict_result["prediction"];
  for ([key, value] of Object.entries(predictions)) {
    if (value > level) {
      return true;
    }
  }
  return false;
}

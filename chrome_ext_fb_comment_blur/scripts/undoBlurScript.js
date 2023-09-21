// Select all comments presents on the page
(() => {
  // Revert the styles back to normal
  changedComments.forEach((ele) => {
    let comments = getCommentDivFromIdAndRepId(
      ele["comment_id"],
      ele["rep_comment_id"]
    );
    comments.forEach((comment) => (comment.style.cssText = ""));
    // comments.forEach(
    //     (comment) =>
    //       {
    //         // console.log("comment:", comment);
    //         let commentText = comment.getElementsByClassName("x1lliihq xjkvuk6 x1iorvi4")[0];
    //         // console.log("commentText:", commentText);
    //         commentText.style.cssText = "";
    //       }
    //   );
  });
  changedComments = [];
})();

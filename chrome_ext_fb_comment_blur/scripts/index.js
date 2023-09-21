const CLASS_NAMES = {
  // Comment with text (not inclusive of comments with images or emoji)
  FB_COMMENT_DIV: "x1r8uery x1iyjqo2 x6ikm8r x10wlt62 x1pi30zi",
  //x1r8uery x1iyjqo2 x6ikm8r x10wlt62 x1pi30zi
  FB_COMMENT_TEXT_DIV: "xdj266r x11i5rnm xat24cr x1mh8g0r x1vvkbs",
  FB_COMMENT_DATE_A:
    "x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xt0b8zv xi81zsa xo1l8bm",
  FB_OVERLAY:
    "x1n2onr6 x1ja2u2z x1afcbsf xdt5ytf x1a2a7pz x71s49j x1qjc9v5 x1qpq9i9 xdney7k xu5ydu1 xt3gfkd x78zum5 x1plvlek xryxfnj xcatxm7 xrgej4m xh8yej3",
  FB_MAIN_CONTENT: "x9f619 x1n2onr6 x1ja2u2z",
  FB_COMMENT_TEXT: "x9f619 x1n2onr6 x1ja2u2z",
};
// .x1r8uery.x1iyjqo2.x6ikm8r.x10wlt62.x1pi30zi
// Blurred Styles
const blurredStyles = {
  backgroundColor: "blue",
  filter: "blur(2.5rem)",
};
// ========================= MESSAGE PASSING STUFFS =========================
let myPort = chrome.runtime.connect({ name: "facebook_blur_port" });

const sendMessageToService = (message) => {
  myPort.postMessage(message);
};

const handleMessage = (messageFromSw) => {
  console.log("CONTENT_HANDLE_MESS:", messageFromSw);
};

// ========================= CONTEN SCRIPT LOGIC ================================
// Client uses these function to crawl the comments data and send to the AI model
const getCommentHrefFromElement = (ele) => {
  return ele.querySelector(`a[class="${CLASS_NAMES.FB_COMMENT_DATE_A}"]`).href;
};
const extractIdAndRepIdFromHref = (href) => {
  const url = new URL(href);
  const params = new URLSearchParams(url.search);
  const commentId = params.get("comment_id"); // __
  const repCommentId = params.get("reply_comment_id");
  return [commentId, repCommentId];
};
const compactArray = (arr) => {
  return arr.reduce(function (res, el) {
    if (el !== null) {
      res.push(el); //from ww  w .  ja  v  a2s.  c om
    }
    return res;
  }, []);
};

const buildCommentIdx = () => {
  // Select all the comments
  const allComments = Array.from(
    document.querySelectorAll(`[class="${CLASS_NAMES.FB_COMMENT_DIV}"]`)
  );
  console.log("allComments:", allComments);
  let data = allComments.map((ele) => {
    // Sample: href="https://www.facebook.com/mew629/posts/pfbid022Fo8Zc1weinwndeLztsgqK1ginp8eYtRNKtPmsi4LaUPTuZ31otEX3jpVoawS6Yil?comment_id=806188640824780&__tn__=R*F"
    const comment_text_ele = ele.querySelector(
      `[class="${CLASS_NAMES.FB_COMMENT_TEXT_DIV}"]`
    );
    // console.log("comment text ele:", comment_text_ele)
    // if (comment_text_ele && comment_text_ele?.textContent) {
    const comment_text = comment_text_ele?.textContent;
    const comment_href = getCommentHrefFromElement(ele);
    const [comment_id, rep_comment_id] =
      extractIdAndRepIdFromHref(comment_href);
    return {
      comment_text: comment_text ? comment_text : "",
      comment_href,
      comment_id,
      rep_comment_id,
    };
    // }
    // return null;
  });
  data = compactArray(data);
  console.log("DATA:", data);
  return data;
};
const getCommentDivFromIdAndRepId = (id, rep_comment_id) => {
  const commentAnchors = Array.from(
    document.querySelectorAll(`a[class="${CLASS_NAMES.FB_COMMENT_DATE_A}"]`)
  );
  const matchingCommentAnchors = commentAnchors.filter((ele) => {
    const href = ele.href;
    const [comment_id, rep_id] = extractIdAndRepIdFromHref(href);
    return id == comment_id && rep_comment_id == rep_id;
  });
  // return matchingCommentAnchors.parentElement.parentElement.parentElement;
  return matchingCommentAnchors.map(
    (ele) =>
      ele.parentElement.parentElement.parentElement.parentElement.parentElement
  );
};

const getCommentDivFromHref = (href) => {
  const [id, rep_id] = extractIdAndRepIdFromHref(href);
  return getCommentDivFromIdAndRepId(id, rep_id);
};

const SERVER_ROOT_ADDR = "https://foxhound-intimate-oriole.ngrok-free.app/";
const API_ROUTES = {
  PICK_TOXIC_COMMENT_FROM_LIST: "/pick-toxic-comment/",
};
// Retrieve the comments with toxic contents
const getToxicComments = async (data) => {
  const endpoint = `${SERVER_ROOT_ADDR}/${API_ROUTES.PICK_TOXIC_COMMENT_FROM_LIST}`;
  const response = await fetch(endpoint);
  const jsonData = await response.json();
  console.log(jsonData);
  return [];
};

let changedComments = [];
// DOM newCommentObserver stuffs
const targetNode = document.querySelector(
  `[class="${CLASS_NAMES.FB_MAIN_CONTENT}"]`
);

const config = { attributes: true, childList: true, subtree: true };
let commentNum = -1;

const handleNumCommentChange = () => {
  const message = {
    from: "facebook_tab",
    body: "new_comment_added",
  };
  sendMessageToService(message);
};

// Predicate: Khi nao co comment moi
const checkNewCommentsAppear = (mutationList, newCommentObserver) => {
  // const isCommentNode = (node) => {
  //     console.log("CLASS NAME: ", node.className)
  //     return node.className === CLASS_NAMES.FB_COMMENT_DIV;
  // }
  const allComments = Array.from(
    document.querySelectorAll(`[class="${CLASS_NAMES.FB_COMMENT_DIV}"]`)
  );
  if (allComments.length !== commentNum) {
    commentNum = allComments.length;
    console.log("NUM COMMENTS CHANGES");
    handleNumCommentChange();
  }
};

const newCommentObserver = new MutationObserver(checkNewCommentsAppear);
// ========================== Document lifecycle handing ======================
const setUpScript = (e) => {
  // Register the listenner
  newCommentObserver.observe(targetNode, config);
  myPort.onMessage.addListener(handleMessage);
};

const tearDownScript = (e) => {
  // Undo the stuffs: remove the listener(S)
  newCommentObserver.disconnect();
};

// ========================== Document lifecycle ===============================
window.addEventListener("load", setUpScript);
window.addEventListener("unload", tearDownScript);
// window.addEventListener('click', () => {
//     const testMess = {greeting: 'haahah'};
//     sendMessageToService(testMess)
// })
// ========================== REPEAT SEND MESS TO SW AFTER 25 SECONDS TO KEEP SW ALIVE ===============================
setInterval(() => {
  const message = {
    from: "facebook_tab",
    body: "keep_alive",
  };
  sendMessageToService(message);
}, 25000);

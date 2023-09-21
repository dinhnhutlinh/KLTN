let portFromCS;

// ========================= COMMUNICATIACTIVE STUFF =====================
chrome.runtime.onConnect.addListener(onConnectHandler);

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "ACTIVE",
  });
});
const registerMessageHandler = (handler) => {
  portFromCS.onMessage.addListener(handler);
};

function onConnectHandler(p) {
  portFromCS = p;
  console.log("CACTIVENECTED TO PORT:", portFromCS);
  // Register handler
  registerMessageHandler(handleMessage);
}

const sendMessage = (mess) => {
  portFromCS.postMessage(mess);
};

const isMessageFromFbTab = (mess) => {
  return mess?.from === "facebook_tab";
};
const handleMessage = async (messFromCS, port) => {
  //
  const senderTab = port.sender.tab;
  console.log("SW::HANDLING MESSAGE:", messFromCS);
  if (isMessageFromFbTab(messFromCS)) {
    // Check if current state is ACTIVE
    const currentState = await chrome.action.getBadgeText({
      tabId: senderTab.id,
    });
    if (messFromCS?.body === "new_comment_added" && currentState === "ACTIVE" || messFromCS?.body === "keep_alive" && currentState === "ACTIVE") {
      console.log("Executing blur script");
      await chrome.scripting.executeScript({
        target: { tabId: senderTab.id, allFrames: true },
        files: ["scripts/blurScript.js"],
      });
    }
  }
};

// ========================= COMMUNICATIACTIVE TO KEEP SW ALIVE =====================


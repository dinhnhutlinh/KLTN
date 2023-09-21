const button_blur = document.querySelector("#blur");
const level_input = document.getElementsByName("level");

const facebook_prefix = "https://www.facebook.com/";
let isBlur;
let checkValue;

chrome.storage.local.set({ isBlur: isBlur }).then(async () => {
  await chrome.storage.local.get(["isBlur"]).then((result) => {
    if (result.isBlur == undefined) {
      isBlur = true;
    } else {
      isBlur = result.isBlur;
    }
    button_blur.textContent = isBlur ? "ON" : "OFF";
  });
});

chrome.storage.local.set({ levelValue: checkValue }).then(async () => {
  await chrome.storage.local.get(["levelValue"]).then((result) => {
    checkValue = result.levelValue ? result.levelValue : "0.6";
  });
  level_input.forEach((ele) => {
    checkValue == ele.value ? (ele.checked = true) : (ele.checked = false);
  });
});

// ========================= MESSAGE PASSING STUFFS =========================
// let myPort = chrome.runtime.connect({name:"facebook_blur_port"});

// const sendMessageToService = (message) => {
//     myPort.postMessage(message);
// }

// const handleMessage = (messageFromSw) => {
//     console.log("CONTENT_HANDLE_MESS:", messageFromSw);
// }

// ========================= EXECUTE POPUP =========================

const radioLevelValueChange = (event) => {
  let tempCheckValue = checkValue;
  checkValue = event.currentTarget.value;
  console.log(checkValue + "   ", tempCheckValue);
  if (checkValue != tempCheckValue) {
    chrome.storage.local.set({ levelValue: checkValue }).then(() => {
      console.log("Value is set");
      // const levelMess = {from: 'facebook_tab',
      //                 body: 'change_level_value'};
      // sendMessageToService(levelMess)
      // myPort.onMessage.addListener(handleMessage)
    });
  }
};

level_input.forEach((ele) => {
  ele.addEventListener("change", radioLevelValueChange);
});

button_blur.addEventListener("click", async () => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  // button_blur.textContent = isBlur ? "INACTIVE" : "ACTIVE";
  console.log("button clicked", isBlur);
  isBlur = !isBlur;

  if (currentTab.url.startsWith(facebook_prefix)) {
    // Next state will always be the opposite
    const nextState = isBlur ? "ACTIVE" : "INACTIVE";
    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: currentTab.id,
      text: nextState,
    });
    if (nextState === "ACTIVE") {
      await chrome.scripting.executeScript({
        target: { tabId: currentTab.id, allFrames: true },
        files: ["scripts/blurScript.js"],
      });
    } else if (nextState === "INACTIVE") {
      await chrome.scripting.executeScript({
        target: { tabId: currentTab.id, allFrames: true },
        files: ["scripts/undoBlurScript.js"],
      });
    }
  }
  chrome.storage.local.set({ isBlur: isBlur }).then(() => {
    button_blur.textContent = isBlur ? "ON" : "OFF";
  });
});

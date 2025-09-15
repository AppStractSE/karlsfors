let iframe = null;

function initializeIframe(el) {
  iframe = document.createElement("iframe");
  iframe.src = "https://karlsfors.appstract.se/";
  iframe.style.border = "0";
  iframe.style.width = "100%";
  iframe.height = "0";
  el.appendChild(iframe);
}

const el = document.getElementsByTagName("appstract-form");
if (el && el.length > 0) {
  initializeIframe(el[0]);
}

window.addEventListener("message", (e) => {
  const data = e.data;
  if (data && data.appstract) {
    const msg = data.message;
    if (msg.type === "height" && iframe) {
      iframe.height = Math.max(msg.data, 0).toString();
      // console.log("[Appstract] height set to:", iframe.height);
    }
  }
});

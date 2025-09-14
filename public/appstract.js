const el = document.getElementsByTagName("appstract-form");

if (el && el.length > 0) {
  this.initIframe(el[0]);
}
window.onmessage = (e) => {
  const data = e.data;
  if (data && data.appstract) {
    const msg = data.message;
    if (msg.type == "height") {
      if (this.iframe) {
        this.iframe.height = Math.max(msg.data, 400).toString();
        console.log("[Appstract] height set to: ", this.iframe.height);
      }
    }

    return;
  }
};

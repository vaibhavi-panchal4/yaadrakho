export const showToast = (msg) => {
  const el = document.createElement("div");

  el.innerText = msg;
  el.style.position = "fixed";
  el.style.bottom = "20px";
  el.style.left = "50%";
  el.style.transform = "translateX(-50%)";
  el.style.background = "#000";
  el.style.color = "#fff";
  el.style.padding = "10px 20px";
  el.style.borderRadius = "8px";
  el.style.zIndex = "999";

  document.body.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 2000);
};

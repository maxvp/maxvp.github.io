// Initialize marquee elements
function initMarquees() {
  const marquees = document.querySelectorAll(".home-marquee");

  marquees.forEach((marquee) => {
    const track = marquee.querySelector(".home-marquee-track");
    const text = marquee.dataset.marqueeText;

    if (!track || !text) return;

    // Skip if already initialized
    if (track.children.length > 0) return;

    // Create two segments for seamless looping
    const segment1 = document.createElement("span");
    segment1.className = "home-marquee-seg";
    segment1.textContent = text.repeat(8) + "\u00A0";

    const segment2 = document.createElement("span");
    segment2.className = "home-marquee-seg";
    segment2.textContent = text.repeat(8) + "\u00A0";

    track.appendChild(segment1);
    track.appendChild(segment2);
  });
}

// Run immediately if DOM is ready, otherwise wait
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMarquees);
} else {
  // For iOS Safari, add a small delay to ensure everything is ready
  setTimeout(initMarquees, 0);
}

// Also run on window load as a fallback for iOS Safari
window.addEventListener("load", () => {
  initMarquees();
});

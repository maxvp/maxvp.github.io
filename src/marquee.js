// Initialize marquee elements
document.addEventListener("DOMContentLoaded", () => {
  const marquees = document.querySelectorAll(".home-marquee");

  marquees.forEach((marquee) => {
    const track = marquee.querySelector(".home-marquee-track");
    const text = marquee.dataset.marqueeText;

    if (!track || !text) return;

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
});

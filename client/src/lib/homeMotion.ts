import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initHomeMotion() {
  const listeners: Array<() => void> = [];
  const ctx = gsap.context(() => {
    const revealItems = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    gsap.fromTo(revealItems, { autoAlpha: 0, y: 24 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: gsap.utils.distribute({ amount: 0.22, from: "start" }),
      delay: 0.12,
    });

    const hero = document.querySelector<HTMLElement>(".hero-section");
    const heroCopy = document.querySelector<HTMLElement>(".hero-copy");
    const searchCard = document.querySelector<HTMLElement>(".hero-search-card");
    if (hero && heroCopy && searchCard) {
      const mapTilt = gsap.utils.mapRange(-1, 1, -5, 5);
      const clamp = gsap.utils.clamp(-1, 1);
      const onPointerMove = (event: PointerEvent) => {
        const bounds = hero.getBoundingClientRect();
        const x = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1);
        const y = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
        gsap.to(heroCopy, { x: mapTilt(x) * -0.45, y: mapTilt(y) * -0.35, duration: 0.8, overwrite: true, ease: "power2.out" });
        gsap.to(searchCard, { x: mapTilt(x) * 0.7, y: mapTilt(y) * 0.55, rotateY: mapTilt(x) * 0.2, duration: 0.8, overwrite: true, ease: "power2.out" });
      };
      const resetPointer = () => gsap.to([heroCopy, searchCard], { x: 0, y: 0, rotateY: 0, duration: 0.9, ease: "power3.out" });
      hero.addEventListener("pointermove", onPointerMove);
      hero.addEventListener("pointerleave", resetPointer);
      listeners.push(() => {
        hero.removeEventListener("pointermove", onPointerMove);
        hero.removeEventListener("pointerleave", resetPointer);
      });
    }

    const cards = gsap.utils.toArray<HTMLElement>("[data-scroll-card]");
    ScrollTrigger.batch(cards, {
      start: "top 88%",
      once: true,
      interval: 0.08,
      batchMax: 4,
      onEnter: (elements) => gsap.fromTo(elements, { autoAlpha: 0, y: 32, rotateX: 4 }, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.65, ease: "power3.out", stagger: 0.08, overwrite: true }),
    });

    cards.forEach((card) => {
      const image = card.querySelector<HTMLElement>(".product-image img");
      if (!image) return;
      gsap.fromTo(image, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom 20%", scrub: 0.7 } });
    });
  });

  return () => {
    listeners.forEach((remove) => remove());
    ctx.revert();
  };
}

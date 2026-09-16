import { CSSProperties, useEffect, useMemo, useState } from "react";

const INTRO_DURATION = 4550;

function makeSeeds() {
  return Array.from({ length: 30 }, (_, index) => {
    const angle = (index / 30) * Math.PI * 2 + (index % 4) * 0.17;
    const radius = 118 + (index % 7) * 27;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.62 - 18;
    const x2 = x * (1.08 + (index % 3) * 0.07);
    const y2 = y - 34 - (index % 5) * 8;
    const rotate = 80 + ((index * 53) % 260);
    const delay = 620 + (index % 10) * 42;
    const scale = 0.72 + (index % 4) * 0.13;
    return { x, y, x2, y2, rotate, delay, scale, scale2: scale * 0.92 };
  });
}

function makeChillies() {
  return [
    { x: -218, y: -72, r: -31, d: 690, s: 0.9, s2: 0.774 },
    { x: 220, y: -52, r: 42, d: 760, s: 1.02, s2: 0.877 },
    { x: -178, y: 118, r: 27, d: 840, s: 0.82, s2: 0.705 },
    { x: 184, y: 124, r: -39, d: 910, s: 0.88, s2: 0.757 },
    { x: -82, y: -164, r: 74, d: 980, s: 0.72, s2: 0.619 },
    { x: 98, y: -172, r: -68, d: 1040, s: 0.75, s2: 0.645 },
  ];
}

export function BrandIntro() {
  const [visible, setVisible] = useState(true);
  const [skipping, setSkipping] = useState(false);
  const seeds = useMemo(makeSeeds, []);
  const chillies = useMemo(makeChillies, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.add("sarksh-intro-running");

    const timer = window.setTimeout(
      () => setVisible(false),
      reduced ? 850 : INTRO_DURATION,
    );

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("sarksh-intro-running");
    };
  }, []);

  useEffect(() => {
    if (!visible) document.body.classList.remove("sarksh-intro-running");
  }, [visible]);

  const skipIntro = () => {
    if (skipping) return;
    setSkipping(true);
    window.setTimeout(() => setVisible(false), 420);
  };

  if (!visible) return null;

  return (
    <div className={`sarksh-intro${skipping ? " sarksh-intro--skip" : ""}`} aria-hidden="true">
      <div className="sarksh-intro-ambient sarksh-intro-ambient--one" />
      <div className="sarksh-intro-ambient sarksh-intro-ambient--two" />
      <div className="sarksh-intro-grain" />

      <div className="sarksh-intro-stage">
        <div className="sarksh-intro-camera">
          <div className="sarksh-intro-seeds">
            {seeds.map((seed, index) => (
              <i
                key={index}
                className="sarksh-seed"
                style={{
                  "--seed-x": `${seed.x}px`,
                  "--seed-y": `${seed.y}px`,
                  "--seed-x2": `${seed.x2}px`,
                  "--seed-y2": `${seed.y2}px`,
                  "--seed-r": `${seed.rotate}deg`,
                  "--seed-delay": `${seed.delay}ms`,
                  "--seed-scale": seed.scale,
                  "--seed-scale2": seed.scale2,
                } as CSSProperties}
              />
            ))}
          </div>

          <div className="sarksh-intro-chillies">
            {chillies.map((chilli, index) => (
              <i
                key={index}
                className="sarksh-chilli"
                style={{
                  "--chilli-x": `${chilli.x}px`,
                  "--chilli-y": `${chilli.y}px`,
                  "--chilli-r": `${chilli.r}deg`,
                  "--chilli-delay": `${chilli.d}ms`,
                  "--chilli-scale": chilli.s,
                  "--chilli-scale2": chilli.s2,
                } as CSSProperties}
              />
            ))}
          </div>

          <div className="sarksh-intro-pack" aria-label="SARKSH Foods chilli powder carton assembling">
            <div className="sarksh-pack-face sarksh-pack-front">
              <img src="/assets/chilli-box-front-v3.png" alt="" decoding="sync" />
            </div>
            <div className="sarksh-pack-face sarksh-pack-back">
              <img src="/assets/chilli-box-front-v3.png" alt="" decoding="sync" />
            </div>
            <div className="sarksh-pack-face sarksh-pack-right">
              <img src="/assets/chilli-box-side.png" alt="" decoding="sync" />
            </div>
            <div className="sarksh-pack-face sarksh-pack-left">
              <img src="/assets/chilli-box-side.png" alt="" decoding="sync" />
            </div>
            <div className="sarksh-pack-face sarksh-pack-top">
              <img src="/assets/chilli-box-top.png" alt="" decoding="sync" />
            </div>
            <div className="sarksh-pack-face sarksh-pack-bottom">
              <img src="/assets/chilli-box-top.png" alt="" decoding="sync" />
            </div>
            <div className="sarksh-pack-highlight" />
          </div>

          <div className="sarksh-intro-shadow" />
        </div>
      </div>

      <div className="sarksh-intro-copy">
        <span>FROM SEED TO SPICE</span>
        <strong>SARKSH FOODS</strong>
        <small>LEGACY OF ELEGANCE</small>
      </div>

      <div className="sarksh-intro-portal" />
      <button type="button" className="sarksh-intro-skip" onClick={skipIntro} aria-label="Skip brand introduction">
        Skip
      </button>
    </div>
  );
}

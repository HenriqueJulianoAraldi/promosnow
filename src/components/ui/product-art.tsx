import type { ProductArt as Art } from "@/domain/catalog";
export function ProductArt({ kind }: { kind: Art }) {
  return (
    <svg
      viewBox="0 0 320 230"
      fill="none"
      className="product-art"
      aria-hidden="true"
    >
      <ellipse
        cx="162"
        cy="203"
        rx="76"
        ry="10"
        fill="currentColor"
        opacity=".08"
      />
      {kind === "box" && (
        <g stroke="#8e9780" strokeWidth="4">
          <path d="m100 80 60-30 60 30v80l-60 30-60-30V80Zm0 0 60 30 60-30m-60 30v80" />
        </g>
      )}
      {kind === "headphones" && (
        <g stroke="#272536" strokeWidth="17" strokeLinecap="round">
          <path d="M91 137v-30a69 69 0 0 1 138 0v30" />
          <path
            d="M105 99v-8a55 55 0 0 1 110 0v8"
            stroke="#5e5a75"
            strokeWidth="7"
          />
          <rect
            x="80"
            y="119"
            width="38"
            height="66"
            rx="18"
            fill="#49455f"
            strokeWidth="6"
            transform="rotate(-9 99 150)"
          />
          <rect
            x="202"
            y="119"
            width="38"
            height="66"
            rx="18"
            fill="#49455f"
            strokeWidth="6"
            transform="rotate(9 221 150)"
          />
        </g>
      )}
      {kind === "coffee" && (
        <g>
          <path d="M102 55h93l16 134H90L102 55Z" fill="#e5ddd0" />
          <path d="M112 55h73v43h-73z" fill="#383431" />
          <rect x="106" y="44" width="87" height="17" rx="8" fill="#49413a" />
          <path d="M116 113h66l-5 63h-55l-6-63Z" fill="#885c40" />
          <path
            d="M182 123h14c23 0 20 39-17 34"
            stroke="#49413a"
            strokeWidth="8"
          />
          <rect x="88" y="185" width="127" height="14" rx="6" fill="#383431" />
          <circle cx="158" cy="79" r="4" fill="#e5a878" />
        </g>
      )}
      {kind === "keyboard" && (
        <g transform="translate(42 77) rotate(-8 118 50)">
          <rect width="238" height="108" rx="15" fill="#50635c" />
          <rect x="5" y="3" width="228" height="97" rx="12" fill="#e2e7df" />
          {Array.from({ length: 36 }, (_, i) => (
            <rect
              key={i}
              x={14 + (i % 12) * 18}
              y={14 + Math.floor(i / 12) * 19}
              width="14"
              height="14"
              rx="3"
              fill={i % 9 === 0 ? "#a6b8a4" : "#fafbf5"}
            />
          ))}
          <rect x="67" y="74" width="101" height="14" rx="3" fill="#fafbf5" />
          <rect x="14" y="74" width="45" height="14" rx="3" fill="#b9c7b4" />
          <rect x="176" y="74" width="44" height="14" rx="3" fill="#b9c7b4" />
        </g>
      )}
      {kind === "lamp" && (
        <g>
          <ellipse cx="168" cy="193" rx="55" ry="11" fill="#625f4f" />
          <path
            d="m170 187-33-58 45-62"
            stroke="#716e5e"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <circle cx="137" cy="129" r="9" fill="#4a483d" />
          <path d="m180 53 39 36-63 25-4-46 28-15Z" fill="#a5a18a" />
          <path d="m155 113 65-24" stroke="#e9e1c0" strokeWidth="7" />
          <circle cx="177" cy="65" r="5" fill="#625f4f" />
        </g>
      )}
      {kind === "speaker" && (
        <g>
          <rect
            x="106"
            y="53"
            width="108"
            height="143"
            rx="42"
            fill="#384c65"
          />
          <rect x="115" y="62" width="90" height="125" rx="34" fill="#5d748c" />
          {Array.from({ length: 56 }, (_, i) => (
            <circle
              key={i}
              cx={130 + (i % 7) * 10}
              cy={82 + Math.floor(i / 7) * 12}
              r="1.8"
              fill="#354b62"
            />
          ))}
          <path
            d="M142 49v-9c0-15 36-15 36 0v9"
            stroke="#384c65"
            strokeWidth="6"
          />
          <rect x="144" y="155" width="32" height="14" rx="4" fill="#e7dccc" />
        </g>
      )}
      {kind === "bottle" && (
        <g transform="rotate(8 160 120)">
          <rect x="139" y="32" width="43" height="31" rx="9" fill="#545e52" />
          <path
            d="M137 60h46l14 27v95c0 21-76 21-76 0V87l16-27Z"
            fill="#9caa91"
          />
          <path
            d="M135 98v76"
            stroke="#b9c5b0"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <rect
            x="143"
            y="111"
            width="33"
            height="32"
            rx="10"
            stroke="#718369"
            strokeWidth="2"
          />
        </g>
      )}
    </svg>
  );
}

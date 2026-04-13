import { SUIT, tileToText, type Tile } from "./mahjongEngine";

type TileAssetProps = {
  tile?: Tile;
  size?: "hand" | "chip" | "meld";
  className?: string;
  face?: "front" | "back";
};

const CHINESE_NUM = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

const PIP_LAYOUT: Record<number, Array<[number, number]>> = {
  1: [[42, 58]],
  2: [
    [42, 34],
    [42, 82],
  ],
  3: [
    [42, 30],
    [42, 58],
    [42, 86],
  ],
  4: [
    [27, 34],
    [57, 34],
    [27, 82],
    [57, 82],
  ],
  5: [
    [27, 34],
    [57, 34],
    [42, 58],
    [27, 82],
    [57, 82],
  ],
  6: [
    [26, 28],
    [58, 28],
    [26, 58],
    [58, 58],
    [26, 88],
    [58, 88],
  ],
  7: [
    [42, 20],
    [26, 34],
    [58, 34],
    [26, 58],
    [58, 58],
    [26, 86],
    [58, 86],
  ],
  8: [
    [42, 20],
    [26, 34],
    [58, 34],
    [26, 58],
    [58, 58],
    [26, 86],
    [58, 86],
    [42, 98],
  ],
  9: [
    [26, 24],
    [42, 24],
    [58, 24],
    [26, 58],
    [42, 58],
    [58, 58],
    [26, 92],
    [42, 92],
    [58, 92],
  ],
};

const TONG_PIP_COLORS = [
  "#cf3a2f",
  "#2b4f98",
  "#2f7b4f",
  "#ba6e22",
  "#b5352c",
  "#2a6e83",
  "#8e3328",
  "#345f43",
  "#29487f",
];

function drawTong(rank: number) {
  const layout = PIP_LAYOUT[rank] ?? [];

  return layout.map(([x, y], index) => {
    const fill = TONG_PIP_COLORS[index % TONG_PIP_COLORS.length];

    return (
      <g key={`tong-${x}-${y}-${index}`}>
        <circle
          cx={x}
          cy={y}
          r="7.4"
          fill="#f9f9f5"
          stroke="#3f4f74"
          strokeWidth="0.9"
        />
        <circle cx={x} cy={y} r="4.15" fill={fill} />
      </g>
    );
  });
}

function drawBamboo(rank: number) {
  const layout = PIP_LAYOUT[rank] ?? [];
  const stemColors = ["#2f7a4d", "#347f50", "#2a6f45"];
  const highlightColors = ["#a7d0ac", "#b4d8b5", "#9cc8a4"];

  return layout.map(([x, y], index) => {
    const stem = stemColors[index % stemColors.length];
    const highlight = highlightColors[index % highlightColors.length];
    return (
      <g key={`bamboo-${x}-${y}-${index}`} transform={`translate(${x} ${y})`}>
        <rect
          x="-5"
          y="-14"
          width="10"
          height="28"
          rx="5"
          fill={stem}
          stroke="#244f35"
          strokeWidth="0.7"
        />
        <rect x="-2" y="-10" width="4" height="20" rx="2" fill={highlight} />
        <circle cx="0" cy="-14" r="3.7" fill="#1f5a39" />
        <circle cx="0" cy="14" r="3.7" fill="#1f5a39" />
      </g>
    );
  });
}

function drawCharacter(rank: number) {
  return (
    <>
      <text
        x="42"
        y="56"
        textAnchor="middle"
        fill="#972f1f"
        fontFamily="'Noto Serif SC', 'STSong', serif"
        fontSize="28"
        fontWeight="700"
      >
        {CHINESE_NUM[rank - 1]}
      </text>
      <text
        x="42"
        y="86"
        textAnchor="middle"
        fill="#972f1f"
        fontFamily="'Noto Serif SC', 'STSong', serif"
        fontSize="26"
        fontWeight="700"
      >
        萬
      </text>
    </>
  );
}

function drawCenter(tile: Tile, rank: number) {
  if (tile.startsWith(SUIT.WAN)) {
    return drawCharacter(rank);
  }

  if (tile.startsWith(SUIT.BAMBOO)) {
    return drawBamboo(rank);
  }

  return drawTong(rank);
}

function TileAsset(props: TileAssetProps) {
  const {
    tile = `${SUIT.WAN}1` as Tile,
    size = "hand",
    className,
    face = "front",
  } = props;
  const rank = Number(tile.slice(1));
  const isBack = face === "back";

  return (
    <svg
      className={`tile-asset tile-asset--${size}${className ? ` ${className}` : ""}`}
      viewBox="0 0 84 116"
      role="img"
      aria-label={isBack ? "牌背" : tileToText(tile)}
    >
      {isBack ? (
        <>
          <rect
            x="1"
            y="1"
            width="82"
            height="114"
            rx="11"
            fill="#eee5d4"
            opacity="0.72"
          />
          <rect
            x="3"
            y="3"
            width="78"
            height="110"
            rx="10"
            fill="#f7efdf"
            stroke="#b89f79"
          />
          <rect
            x="6"
            y="6"
            width="72"
            height="104"
            rx="8"
            fill="#3b6b47"
            stroke="#2a4c33"
          />
          <rect
            x="11"
            y="11"
            width="62"
            height="94"
            rx="6"
            fill="none"
            stroke="rgba(243, 228, 200, 0.4)"
            strokeWidth="1"
          />
          <path
            d="M16 22 L68 74 M16 34 L68 86 M16 46 L68 98 M16 58 L56 98 M28 18 L68 58 M16 74 L40 98"
            stroke="rgba(228, 243, 226, 0.2)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            d="M68 22 L16 74 M68 34 L16 86 M68 46 L16 98 M68 58 L28 98 M56 18 L16 58 M68 74 L44 98"
            stroke="rgba(228, 243, 226, 0.16)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="42" cy="58" r="12" fill="rgba(239, 246, 235, 0.2)" />
          <circle
            cx="42"
            cy="58"
            r="7"
            fill="none"
            stroke="rgba(247, 239, 220, 0.64)"
            strokeWidth="1.1"
          />
        </>
      ) : (
        <>
          <rect
            x="1"
            y="1"
            width="82"
            height="114"
            rx="11"
            fill="#ecdfc5"
            opacity="0.72"
          />
          <rect
            x="3"
            y="3"
            width="78"
            height="110"
            rx="10"
            fill="#fffaf0"
            stroke="#b69b72"
          />
          <rect
            x="6"
            y="6"
            width="72"
            height="104"
            rx="8"
            fill="#fcf3df"
            stroke="#ddc8a5"
          />
          <rect
            x="9"
            y="9"
            width="66"
            height="14"
            rx="5"
            fill="rgba(255, 255, 255, 0.28)"
          />
          <rect
            x="9"
            y="93"
            width="66"
            height="12"
            rx="5"
            fill="rgba(173, 133, 79, 0.08)"
          />

          {drawCenter(tile, rank)}
        </>
      )}
    </svg>
  );
}

export default TileAsset;

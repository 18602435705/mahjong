import "./MaskImage.css";

function MaskImage() {
  return (
    <div className="wrapper">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1268 214"
        // preserveAspectRatio="none"
      >
        <defs>
          <mask id="hole">
            <rect width="100%" height="100%" fill="white" rx="24" ry="24" />
            <path
              d="M14,0 Q10,0 8,2 L2,13 Q0,15 -2,13 L-8,2 Q-10,0 -14,0 Z"
              fill="black"
              transform="translate(600, -0.5)"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="red" mask="url(#hole)" />
      </svg>
    </div>
  );
}

export default MaskImage;

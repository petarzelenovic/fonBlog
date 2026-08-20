export default function Logo({ className = "h-10 w-auto", variant = "default" }) {
  const onDark = variant === "onDark";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 280"
      role="img"
      aria-label="Fon Blog"
      className={className}
    >
      <g
        transform="translate(28 30) scale(.88)"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M10 55 C60 33 111 44 142 76 V216 C104 185 58 178 10 196Z"
          className={onDark ? "stroke-white" : "stroke-[#004A7C] dark:stroke-white"}
          strokeWidth="14"
        />
        <path
          d="M142 76 C173 44 224 33 274 55 V196 C226 178 180 185 142 216Z"
          stroke="#D058A0"
          strokeWidth="14"
        />
        <path
          d="M35 89 C72 74 105 80 124 98"
          stroke="#FFCD67"
          strokeWidth="11"
        />
        <path
          d="M35 128 C72 113 105 119 124 137"
          stroke="#60C3AD"
          strokeWidth="11"
        />
        <path
          d="M160 98 C180 80 213 74 249 89"
          stroke="#9B95C9"
          strokeWidth="11"
        />
        <path
          d="M160 137 C180 119 213 113 249 128"
          stroke="#F48580"
          strokeWidth="11"
        />
      </g>
      <g
        fontFamily="Inter, Manrope, Arial, sans-serif"
        fontSize="112"
        fontWeight="760"
        letterSpacing="-4"
      >
        <text
          x="327"
          y="178"
          className={onDark ? "fill-white" : "fill-[#004A7C] dark:fill-white"}
        >
          Fon
        </text>
        <text x="516" y="178" fill="#D058A0">
          Blog
        </text>
      </g>
    </svg>
  );
}

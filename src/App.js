import { useMemo, useState } from "react";

import {
  hslToRgb,
  calcLuminance,
  calcContrast,
  findLightnessForContrast,
} from "./utils";

const lightColor = "rgba(241, 239, 234, 0.7)";
const darkColor = "rgba(14, 18, 13, 0.7)";

const generateHueGradient = (saturation) =>
  `hsl(0, ${saturation * 100}%, 50%),  hsl(60, ${
    saturation * 100
  }%, 50%), hsl(120, ${saturation * 100}%, 50%), hsl(180, ${
    saturation * 100
  }%, 50%), hsl(240, ${saturation * 100}%, 50%), hsl(300, ${
    saturation * 100
  }%, 50%), hsl(360,  ${saturation * 100}%, 50%)`;

const ContrastLabel = ({ contrastColor, saturation, lightPair }) => (
  <div
    style={{
      position: "absolute",
      top: -48,
      left: findLightnessForContrast(0, saturation, contrastColor) * 512 - 64,
      textAlign: "center",
      width: 128,
    }}
  >
    <div style={{ marginBottom: 4 }}>
      <span
        style={{
          backgroundColor: `hsl(${contrastColor[0]}, ${
            contrastColor[1] * 100
          }%, ${contrastColor[2] * 100}%)`,
          color: !lightPair ? "black" : "white",
          borderRadius: 3,
          padding: "1px 4px",
          fontSize: 12,
          fontWeight: 900,
          margin: "0 4px",
        }}
      >
        {calcContrast(
          calcLuminance(hslToRgb(contrastColor)),
          calcLuminance(!lightPair ? [0, 0, 0] : [1, 1, 1])
        ).toFixed(2)}
      </span>
    </div>
    <div>
      <span
        style={{
          color: "white",
          backgroundColor: "black",
          borderRadius: 3,
          padding: "1px 4px",
          fontSize: 12,
          fontWeight: 900,
          margin: "0 4px",
        }}
      >
        ← Aa
      </span>
      <span
        style={{
          color: "black",
          backgroundColor: "white",
          borderRadius: 3,
          padding: "1px 4px",
          fontSize: 12,
          fontWeight: 900,
          margin: "0 4px",
        }}
      >
        Aa →
      </span>
    </div>
  </div>
);

const SquareColorSpace = ({
  contrastColor,
  saturation,
  lightPair,
  setContrastColor,
  points,
  width = 512,
  height = 512,
}) => (
  <div style={{ position: "relative" }}>
    <Axis orientation="horizontal" bottom={-32}>
      lightness
    </Axis>

    <Axis orientation="vertical" left={32}>
      hue
    </Axis>

    <ContrastLabel
      contrastColor={contrastColor}
      saturation={saturation}
      lightPair={lightPair}
    />

    <main
      onPointerMove={(e) => {
        // Convert our mouse xy to 0, 1
        var rect = e.target.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;

        // Hue varies on y, lightness varies on x
        setContrastColor([y * 360, saturation, x]);
      }}
      style={{
        position: "relative",
        width,
        height,
        backgroundImage: `linear-gradient(to bottom, ${generateHueGradient(
          saturation
        )})`,
      }}
    >
      <main
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 50%)",
        }}
      />
      <main
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0) 50%, rgba(255,255,255,1) 100%)",
        }}
      />
      <svg
        viewBox="0 0 1 1"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          pointerEvents: "none",
        }}
      >
        <polyline
          // We need to pad our points out, otherwise lines show above the spectrum
          points={`
                  ${lightPair ? "0, -1," : "1, -1,"}
                  ${points
                    .map(([l, h]) => [l, h / 360])
                    .flat()
                    .join(",")}
                  ${lightPair ? "0, 2," : "1, 2,"}
                  `}
          stroke={lightPair ? darkColor : lightColor}
          strokeWidth={0.004}
          fill={lightPair ? "url(#dots-black)" : "url(#dots-white)"}
          style={{ pointerEvents: "none" }}
        />
        <circle
          cx={contrastColor[2]}
          cy={contrastColor[0] / 360}
          r={0.02}
          stroke={lightPair ? lightColor : darkColor}
          strokeWidth={0.005}
          fill={`hsl(${contrastColor[0]}, ${contrastColor[1] * 100}%, ${
            contrastColor[2] * 100
          }%)`}
        />
      </svg>
    </main>
  </div>
);

const RadialColorSpace = ({
  contrastColor,
  saturation,
  lightPair,
  setContrastColor,
  points,
  width = 512,
  height = 512,
}) => {
  points = points
    .map(([l, h]) => [
      (1 - l) * 0.5 * Math.cos((h - 90) * (Math.PI / 180)) + 0.5,
      (1 - l) * 0.5 * Math.sin((h - 90) * (Math.PI / 180)) + 0.5,
    ])
    .flat()
    .join(",");

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          clipPath: "ellipse(200px 200px at 50% 0%)",
          right: 0,
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          transform: "scale(1.1)",
          borderRadius: "100%",
          textAlign: "center",
          borderColor: "black",
          border: "1px solid",
          borderTop: "1px solid black",
        }}
      >
        <span
          style={{
            position: "absolute",
            right: 68,
            top: 65,
            transform: "rotate(50deg)",
          }}
        >
          &gt;
        </span>
        <span
          style={{
            fontFamily: "Menlo",
            backgroundColor: "rgb(241, 239, 234)",
            padding: "8px 16px",
            position: "relative",
            fontWeight: "bold",
            fontSize: 14,
            top: -12,
          }}
        >
          hue
        </span>
        <span
          style={{
            position: "absolute",
            left: 68,
            top: 65,
            transform: "rotate(-50deg)",
          }}
        >
          &lt;
        </span>
      </div>

      <Axis orientation="vertical" right={-32} top="50%" width="50%">
        lightness
      </Axis>

      <main
        onPointerMove={(e) => {
          // Convert our mouse xy to -1, 1
          var rect = e.target.getBoundingClientRect();
          var x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          var y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

          // Convert our cartesian coords to polar
          let r = Math.sqrt(x * x + y * y);
          const phi = Math.atan2(y, x);

          // Clamp our radius to 0 — 1 (for when mouse falls outside of circle)
          r = Math.min(1, Math.max(0, r));

          // Hue is angular, lightness is radial
          setContrastColor([(phi * 180) / Math.PI + 90, saturation, 1 - r]);
        }}
        style={{
          position: "relative",
          width,
          height,
          borderRadius: "50%",
          overflow: "hidden",
          backgroundImage: `conic-gradient(${generateHueGradient(saturation)})`,
        }}
      >
        {/* Lightness gradients */}
        <main
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            backgroundImage:
              "radial-gradient(closest-side, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 1) 100%)",
          }}
        />
        <main
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            backgroundImage:
              "radial-gradient(closest-side, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 50%)",
          }}
        />

        <svg
          viewBox="0 0 1 1"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            pointerEvents: "none",
          }}
        >
          <defs>
            <mask id="poly-mask">
              {lightPair ? (
                <circle cx={0.5} cy={0.5} r={0.5} fill="white" />
              ) : null}
              <polyline points={points} fill="black" />
            </mask>
          </defs>

          <circle
            cx={0.5}
            cy={0.5}
            r={0.5}
            mask="url(#poly-mask)"
            fill="url(#dots-black)"
            stroke="black"
            strokeWidth={0.004}
          />

          <polyline
            points={points}
            stroke={lightPair ? darkColor : lightColor}
            strokeWidth={0.004}
            fill={lightPair ? "none" : "url(#dots-white)"}
            style={{ pointerEvents: "none" }}
          />

          <circle
            cx={
              (1 - contrastColor[2]) *
                0.5 *
                Math.cos((contrastColor[0] - 90) * (Math.PI / 180)) +
              0.5
            }
            cy={
              (1 - contrastColor[2]) *
                0.5 *
                Math.sin((contrastColor[0] - 90) * (Math.PI / 180)) +
              0.5
            }
            r={0.02}
            stroke={lightPair ? "white" : "black"}
            strokeWidth={0.005}
            fill={`hsl(${contrastColor[0]}, ${contrastColor[1] * 100}%, ${
              contrastColor[2] * 100
            }%)`}
          />
        </svg>
      </main>
    </div>
  );
};

const Axis = ({
  orientation = "horizontal",
  top,
  left,
  bottom,
  right,
  width = "100%",
  children,
}) => (
  <div
    style={{
      position: "absolute",
      right,
      left,
      top,
      bottom,
      width,
      height: 0,
      textAlign: "center",
      transform: orientation === "vertical" ? "rotate(-90deg)" : "initial",
      transformOrigin: "100% 50%",
      borderTop: "1px solid black",
    }}
  >
    <span style={{ position: "absolute", left: -2, top: -11 }}>&lt;</span>
    <span
      style={{
        fontFamily: "Menlo",
        backgroundColor: "rgb(241, 239, 234)",
        padding: "8px 16px",
        position: "relative",
        fontWeight: "bold",
        fontSize: 14,
        top: -12,
      }}
    >
      {children}
    </span>
    <span style={{ position: "absolute", right: -2, top: -11 }}>&gt;</span>
  </div>
);

const Patterns = () => (
  <svg style={{ width: 0, height: 0, position: "absolute" }}>
    <defs>
      <pattern
        id="dots-black"
        width=".01"
        height=".01"
        patternUnits="userSpaceOnUse"
        viewBox="0,0,1,1"
      >
        <circle
          fill="rgba(14, 18, 13, 0.5)"
          cx="0.25"
          cy="0.25"
          r="0.25"
        ></circle>
        <circle
          fill="rgba(14, 18, 13, 0.5)"
          cx="0.75"
          cy="0.75"
          r="0.25"
        ></circle>
      </pattern>

      <pattern
        id="dots-white"
        width=".01"
        height=".01"
        patternUnits="userSpaceOnUse"
        viewBox="0,0,1,1"
      >
        <circle
          fill="rgba(241, 239, 234, 0.5)"
          cx="0.25"
          cy="0.25"
          r="0.25"
        ></circle>
        <circle
          fill="rgba(241, 239, 234, 0.5)"
          cx="0.75"
          cy="0.75"
          r="0.25"
        ></circle>
      </pattern>
    </defs>
  </svg>
);

function App({ pathResolution = 64 }) {
  const [saturation, setSaturation] = useState(1);
  const [contrastColor, setContrastColor] = useState([0, 0, 1.0]);

  var l2 = (calcLuminance(hslToRgb(contrastColor)) + 0.05) / 4.5 - 0.05;
  const lightPair = l2 < 0;

  const points = useMemo(() => {
    return [...Array(pathResolution)].map((_, i) => {
      let h, s, l;

      h = (360 / (pathResolution - 1)) * i;
      s = saturation;
      l = findLightnessForContrast(h, s, contrastColor);

      return [l, h];
    });
  }, [saturation, pathResolution, contrastColor]);

  return (
    <div>
      <Patterns />

      <div
        style={{
          cursor: "none",
          padding: 64,
          position: "relative",
          display: "inline-block",
          backgroundColor: "rgb(241, 239, 234)",
        }}
      >
        <SquareColorSpace
          contrastColor={contrastColor}
          saturation={saturation}
          points={points}
          setContrastColor={setContrastColor}
          lightPair={lightPair}
        />
      </div>

      <div
        style={{
          cursor: "none",
          padding: 64,
          position: "relative",
          display: "inline-block",
          backgroundColor: "rgb(241, 239, 234)",
        }}
      >
        <RadialColorSpace
          contrastColor={contrastColor}
          saturation={saturation}
          points={points}
          setContrastColor={setContrastColor}
          lightPair={lightPair}
        />
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          left: 64,
          top: 16,
          width: 512,
        }}
      >
        <label
          style={{
            fontFamily: "Menlo",
            padding: "8px 16px",
            position: "relative",
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          saturation
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={saturation}
          onChange={(e) => setSaturation(parseFloat(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

export default App;

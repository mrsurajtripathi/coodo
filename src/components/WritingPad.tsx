import React, { useEffect, useRef, useState } from "react";

const WritingPad = ({
  character = "क",
  width = 700,
  height = 400,
  lineWidth = 6,
  onSave,
}) => {
  const canvasRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);

  // ---------------------------------------
  // Canvas setup
  // ---------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = "#111827";

    drawBackground(ctx);
  }, [width, height, lineWidth, character]);

  // ---------------------------------------
  // Background / writing lines
  // ---------------------------------------

  const drawBackground = (ctx) => {
    ctx.clearRect(0, 0, width, height);

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Writing lines
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;

    const lineSpacing = 70;

    for (let y = 70; y < height; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Character guide
    ctx.font = "220px Noto Sans Devanagari, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "rgba(100, 100, 100, 0.12)";

    ctx.fillText(
      character,
      width / 2,
      height / 2
    );
  };

  // ---------------------------------------
  // Get pointer position
  // ---------------------------------------

  const getPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  // ---------------------------------------
  // Start drawing
  // ---------------------------------------

  const startDrawing = (event) => {
    event.preventDefault();

    const canvas = canvasRef.current;

    canvas.setPointerCapture?.(event.pointerId);

    const position = getPosition(event);

    setIsDrawing(true);
    setCurrentStroke([position]);

    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
  };

  // ---------------------------------------
  // Drawing
  // ---------------------------------------

  const draw = (event) => {
    if (!isDrawing) return;

    event.preventDefault();

    const position = getPosition(event);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineTo(position.x, position.y);
    ctx.stroke();

    setCurrentStroke((previous) => [
      ...previous,
      position,
    ]);
  };

  // ---------------------------------------
  // Finish stroke
  // ---------------------------------------

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (currentStroke.length > 0) {
      setStrokes((previous) => [
        ...previous,
        currentStroke,
      ]);
    }

    setCurrentStroke([]);
  };

  // ---------------------------------------
  // Redraw everything
  // ---------------------------------------

  const redraw = (strokeList) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    drawBackground(ctx);

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    strokeList.forEach((stroke) => {
      if (!stroke.length) return;

      ctx.beginPath();

      ctx.moveTo(
        stroke[0].x,
        stroke[0].y
      );

      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(
          stroke[i].x,
          stroke[i].y
        );
      }

      ctx.stroke();
    });
  };

  // ---------------------------------------
  // Undo
  // ---------------------------------------

  const undo = () => {
    if (!strokes.length) return;

    const updatedStrokes = strokes.slice(0, -1);

    setStrokes(updatedStrokes);

    redraw(updatedStrokes);
  };

  // ---------------------------------------
  // Clear
  // ---------------------------------------

  const clear = () => {
    setStrokes([]);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    drawBackground(ctx);
  };

  // ---------------------------------------
  // Save
  // ---------------------------------------

  const save = () => {
    const canvas = canvasRef.current;

    const image = canvas.toDataURL("image/png");

    if (onSave) {
      onSave(image);
    }

    // Download
    const link = document.createElement("a");

    link.download = `hindi-${character}.png`;
    link.href = image;

    link.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Header */}

      <div className="flex items-center justify-between mb-4">

        <div>
          <h2 className="text-xl font-bold">
            हिंदी लिखें
          </h2>

          <p className="text-sm text-gray-500">
            नीचे दिए अक्षर को लिखें
          </p>
        </div>

        <div className="text-5xl font-bold">
          {character}
        </div>

      </div>

      {/* Canvas */}

      <div
        className="
          relative
          w-full
          border
          border-gray-300
          rounded-xl
          overflow-hidden
          bg-white
          shadow-sm
        "
      >

        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="
            block
            w-full
            h-auto
            touch-none
            cursor-crosshair
          "
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
        />

      </div>

      {/* Toolbar */}

      <div className="flex gap-3 mt-4">

        <button
          type="button"
          onClick={undo}
          disabled={!strokes.length}
          className="
            px-4
            py-2
            rounded-lg
            bg-gray-100
            hover:bg-gray-200
            disabled:opacity-50
          "
        >
          ↶ Undo
        </button>

        <button
          type="button"
          onClick={clear}
          className="
            px-4
            py-2
            rounded-lg
            bg-gray-100
            hover:bg-gray-200
          "
        >
          🧹 Clear
        </button>

        <button
          type="button"
          onClick={save}
          className="
            px-4
            py-2
            rounded-lg
            bg-blue-600
            text-white
            hover:bg-blue-700
          "
        >
          ✓ Save
        </button>

      </div>

    </div>
  );
};

export default WritingPad;
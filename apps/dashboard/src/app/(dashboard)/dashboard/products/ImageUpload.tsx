"use client";
import { useState, useRef } from "react";

export function ImageUpload({ productId, hasImage }: { 
  productId: string; 
  hasImage: boolean 
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 👇 Image compress karne ka function
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        // Max 400x400 mein resize karo
        const MAX = 400;
        let w = img.width;
        let h = img.height;
        
        if (w > h && w > MAX) { h = (h * MAX) / w; w = MAX; }
        else if (h > MAX) { w = (w * MAX) / h; h = MAX; }
        
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        
        // 0.7 = 70% quality — achhi quality + chhota size
        resolve(canvas.toDataURL("image/jpeg", 0.7));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    try {
      const base64 = await compressImage(file); // 👈 compress karo pehle
      console.log("Uploading image size:", (base64.length / 1024).toFixed(1), "KB");

      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, image: base64 }),
      });

      if (res.ok) {
        setDone(true);
        setTimeout(() => window.location.reload(), 500);
      } else {
        const err = await res.json();
        console.error("Upload failed:", err);
        alert("Image save nahi hui, dobara try karo");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input 
        ref={inputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleChange} 
        disabled={loading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="mt-2 block cursor-pointer text-xs text-blue-500 underline disabled:opacity-50"
      >
        {loading ? "Saving..." : done ? "✅ Saved!" : hasImage ? "Change Image" : "➕ Add Image"}
      </button>
    </>
  );
}
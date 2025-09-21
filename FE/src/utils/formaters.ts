async function fileToBase64WithMime(file: File): Promise<{ data: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        data: (reader.result as string).split(",")[1], // strip data:... prefix
        mime: file.type || "application/octet-stream",
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export { fileToBase64WithMime };
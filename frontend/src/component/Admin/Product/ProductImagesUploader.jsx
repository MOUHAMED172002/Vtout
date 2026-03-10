import React, { useState, useEffect } from "react";


/**
 * ProductImagesUploader
 * - Si productId fourni : liste et permet d'uploader et associer des images (utilise bucket 'product-images')
 * - Si productId null : affiche un uploader local (retourne files via onChange)
 */
export default function ProductImagesUploader({ productId = null, onChange = () => { } }) {
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const BUCKET = "product-images";

  useEffect(() => {
    if (productId) fetchImages();
    // eslint-disable-next-line
  }, [productId]);

  async function fetchImages() {
    const { data, error } = await supabase
      .from("product_images")
      .select("id, image_url, is_main")
      .eq("product_id", productId)
      .order("id", { ascending: true });
    if (!error) setExistingImages(data || []);
  }

  async function handleFilesSelected(e) {
    const selected = Array.from(e.target.files || []);
    if (!productId) {
      setFiles(selected);
      onChange(selected);
      return;
    }
    for (const f of selected) {
      const filename = `${productId}/${Date.now()}_${f.name}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(filename, f, { upsert: false });
      if (upErr) {
        console.error("upload err", upErr);
        continue;
      }
      const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(filename).publicURL;
      const { error: insErr } = await supabase.from("product_images").insert([{ product_id: productId, image_url: publicUrl }]);
      if (insErr) console.error("insert image err", insErr);
    }
    await fetchImages();
  }

  async function deleteImage(id, imageUrl) {
    const { error } = await supabase.from("product_images").delete().eq("id", id);
    if (!error) {
      // best-effort: try remove storage file (crude path parsing)
      try {
        const segments = imageUrl.split("/");
        const path = segments.slice(-2).join("/");
        await supabase.storage.from(BUCKET).remove([path]);
      } catch (e) { }
      fetchImages();
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Images</label>
      <input type="file" accept="image/*" multiple onChange={handleFilesSelected} />
      {!productId && files.length > 0 && (
        <div className="flex gap-2 mt-2">
          {files.map((f, idx) => (
            <img key={idx} src={URL.createObjectURL(f)} alt={f.name} className="w-16 h-16 object-cover rounded" />
          ))}
        </div>
      )}
      {productId && existingImages.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {existingImages.map((img) => (
            <div key={img.id} className="relative border rounded overflow-hidden">
              <img src={img.image_url} alt="" className="w-full h-24 object-cover" />
              <div className="absolute top-1 right-1 flex gap-1">
                <button className="btn btn-xs btn-error" onClick={() => deleteImage(img.id, img.image_url)}>Suppr</button>
              </div>
              {img.is_main && <div className="absolute bottom-1 left-1 badge badge-primary">Principal</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
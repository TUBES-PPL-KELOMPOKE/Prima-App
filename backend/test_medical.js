const body = JSON.stringify({
  pasien_id: "test123",
  judul: "Test Upload",
  type: "pemeriksaan",
  attachment_url: "https://example.com/test.pdf"
});

const res = await fetch("https://backend-prima.vercel.app/medical/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body,
});

const json = await res.json();
console.log("Status:", res.status);
console.log("Response:", JSON.stringify(json, null, 2));

// DATA LAYER: You only need to edit this file to update titles!

const manualTitles = {
  1: "Dalayawon ang Dios",
  2: "Bato nga Nangin-Kuta",
  3: "O Dios, Gugma Mo",
  4: "Matahum nga Banwa",
  5: "Pagtuo Ko O Dios",
  6: "Dios nga Gugma",
  7: "Dios nga Gugma",
  // 👉 Just keep adding your titles here like this:
  // 6: "Your Next Title",
  // 45: "Another Title",
};

// This automatically builds all 200 hymns. 
// If a title isn't typed above, it defaults to "Ambahanon #ID"
export const HYMN_DATABASE = Array.from({ length: 201 }, (_, i) => {
  const id = i + 1;
  const numStr = String(id).padStart(3, '0'); // creates 001, 002, 015, etc.
  
  return {
    id: id,
    title: manualTitles[id] || `Ambahanon #${id}`,
    image: `/scans/hymn-${numStr}.jpg`
  };
});
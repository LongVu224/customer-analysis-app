// Helper to get blob storage URL for images
// Uses the storage URL from environment variables
export const getImgUrl = (imgName) => {
  return process.env.REACT_APP_STORAGE_URL + imgName;
}

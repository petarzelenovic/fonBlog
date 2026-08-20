import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { MAX_IMAGE_SIZE } from "../constants";
import { app } from "../firebase";

export function uploadImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Nema fajla za otpremanje"));
      return;
    }
    if (!file.type.startsWith("image/")) {
      reject(new Error("Možeš otpremiti samo slike"));
      return;
    }
    if (file.size >= MAX_IMAGE_SIZE) {
      reject(new Error("Slika mora biti manja od 3 MB"));
      return;
    }

    const storage = getStorage(app);
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Number(progress.toFixed(0)));
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

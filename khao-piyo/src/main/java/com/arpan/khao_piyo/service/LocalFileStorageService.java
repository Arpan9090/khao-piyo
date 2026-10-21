package com.arpan.khao_piyo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalFileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String uploadFile(MultipartFile file) {
        try {
            // Ensure the upload directory exists
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Generate a unique file name to avoid collision/overwriting
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + File.separator + fileName);

            // Save file bytes to the local path
            Files.write(filePath, file.getBytes());

            // Return accessible local URL path to be stored in MongoDB
            return "http://localhost:8080/uploads/" + fileName;

        } catch (Exception e) {
            throw new RuntimeException("Could not store file locally. Error: " + e.getMessage(), e);
        }
    }

    public boolean deleteFile(String imageUrl) {
        try {
            if (imageUrl == null || imageUrl.isEmpty()) {
                return false;
            }

            // Extract the filename from the URL (e.g., gets "xyz_image.jpg")
            String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);

            // Resolve path relative to your upload directory
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();

            // Delete the file if it exists on disk
            return Files.deleteIfExists(filePath);

        } catch (Exception e) {
            throw new RuntimeException("Could not delete file locally. Error: " + e.getMessage(), e);
        }
    }
}
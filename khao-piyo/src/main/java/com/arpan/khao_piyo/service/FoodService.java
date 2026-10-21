package com.arpan.khao_piyo.service;

import com.arpan.khao_piyo.entity.FoodEntity;
import com.arpan.khao_piyo.io.FoodRequest;
import com.arpan.khao_piyo.io.FoodResponse;
import com.arpan.khao_piyo.repository.FoodRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class FoodService {

    private FoodRepository foodRepository;
    private LocalFileStorageService fileStorageService;

    public FoodResponse addFood(FoodRequest request, MultipartFile file){
        FoodEntity newFoodEntity = converToEntity(request);
        String imageUrl = fileStorageService.uploadFile(file);
        newFoodEntity.setImageUrl(imageUrl);

        newFoodEntity = foodRepository.save(newFoodEntity);

        return convertToResponse(newFoodEntity);
    }

    public List<FoodResponse> readFoods(){
        List<FoodEntity> dbEntries = foodRepository.findAll();
        return dbEntries.stream().map(obj -> convertToResponse(obj)).collect(Collectors.toList());

    }

    public FoodResponse readFood(String id){
        FoodEntity existingFood = foodRepository.findById(id).orElseThrow(() -> new RuntimeException("Food not found with the given id" + id));
        return convertToResponse(existingFood);
    }

    public void deleteFood(String foodId){
        // 1. Find the food item in MongoDB to get its image URL
        FoodEntity food = foodRepository.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food item not found with id: " + foodId));

        // 2. Delete the physical image file from the local 'uploads/' folder
        if (food.getImageUrl() != null) {
            fileStorageService.deleteFile(food.getImageUrl());
        }

        foodRepository.deleteById(foodId);
    }

    private FoodEntity converToEntity(FoodRequest request){
        return FoodEntity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .build();
    }

    private FoodResponse convertToResponse(FoodEntity entity) {
        return FoodResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .price(entity.getPrice())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .imageUrl(entity.getImageUrl())
                .build();

    }
}

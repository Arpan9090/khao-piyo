package com.arpan.khao_piyo.controller;

import com.arpan.khao_piyo.io.FoodRequest;
import com.arpan.khao_piyo.io.FoodResponse;
import com.arpan.khao_piyo.service.FoodService;
import lombok.AllArgsConstructor;
import org.springframework.boot.json.JsonParseException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@AllArgsConstructor
@CrossOrigin("*")
public class FoodController {

    private final FoodService foodService;

    @PostMapping()
    public ResponseEntity<FoodResponse> addFood(@RequestPart("food") String foodString,
                                          @RequestPart("file")MultipartFile file){
        ObjectMapper objectMapper = new ObjectMapper();
        FoodRequest request = null;
        try {
            request = objectMapper.readValue(foodString, FoodRequest.class);
        } catch (JsonParseException e) {
            return ResponseEntity.badRequest().build();
        }

        FoodResponse response = foodService.addFood(request, file);
        return ResponseEntity.ok(response);
    }


    @GetMapping()
    public ResponseEntity<List<FoodResponse>> readFoods(){
        List<FoodResponse> dbFoodResponse = foodService.readFoods();
        return ResponseEntity.ok(dbFoodResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodResponse> readFood(@PathVariable String id){
        FoodResponse res = foodService.readFood(id);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteFood(@PathVariable String id) {
        try {
            foodService.deleteFood(id);
            return new ResponseEntity<>("Food item deleted successfully", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while deleting the food item", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

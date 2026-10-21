package com.arpan.khao_piyo.repository;

import com.arpan.khao_piyo.entity.FoodEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodRepository extends MongoRepository<FoodEntity, String > {
}

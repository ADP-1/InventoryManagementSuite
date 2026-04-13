package com.inventory.app.module.inventory.mapper;

import com.inventory.app.module.inventory.dto.request.ProductRequest;
import com.inventory.app.module.inventory.dto.response.ProductResponse;
import com.inventory.app.module.inventory.entity.Category;
import com.inventory.app.module.inventory.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface ProductMapper {

    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "categoryId", source = "category.id")
    ProductResponse toResponse(Product product);

    @Mapping(target = "name", source = "request.name")
    @Mapping(target = "description", source = "request.description")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "category", source = "category")
    Product toEntity(ProductRequest request, Category category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "category", ignore = true)
    void updateEntity(ProductRequest request, @MappingTarget Product product);
}

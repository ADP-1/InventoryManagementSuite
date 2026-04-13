package com.inventory.app.module.inventory.service;

import com.inventory.app.common.exception.BadRequestException;
import com.inventory.app.common.exception.DuplicateResourceException;
import com.inventory.app.common.exception.ResourceNotFoundException;
import com.inventory.app.common.response.PagedResponse;
import com.inventory.app.module.inventory.dto.request.CategoryRequest;
import com.inventory.app.module.inventory.dto.response.CategoryResponse;
import com.inventory.app.module.inventory.entity.Category;
import com.inventory.app.module.inventory.mapper.CategoryMapper;
import com.inventory.app.module.inventory.repository.CategoryRepository;
import com.inventory.app.module.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryMapper categoryMapper;

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Category", "name", request.getName());
        }

        Category category = categoryMapper.toEntity(request);
        category.setActive(true);
        category = categoryRepository.save(category);

        log.info("Created category: {}", category.getName());
        return categoryMapper.toResponse(category);
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(UUID id) {
        Category category = getActiveCategoryById(id);
        return categoryMapper.toResponse(category);
    }

    @Transactional(readOnly = true)
    public PagedResponse<CategoryResponse> findAll(Pageable pageable) {
        Page<CategoryResponse> page = categoryRepository.findAllByActiveTrue(pageable)
                .map(categoryMapper::toResponse);
        return PagedResponse.of(page);
    }

    @Transactional
    public CategoryResponse update(UUID id, CategoryRequest request) {
        Category category = getActiveCategoryById(id);

        if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Category", "name", request.getName());
        }

        categoryMapper.updateEntity(request, category);
        category = categoryRepository.save(category);

        log.info("Updated category: {}", category.getId());
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public void delete(UUID id) {
        Category category = getActiveCategoryById(id);

        if (productRepository.existsByCategoryIdAndActiveTrue(id)) {
            throw new BadRequestException("Cannot delete category with active products");
        }

        category.setActive(false);
        categoryRepository.save(category);
        log.info("Soft deleted category: {}", id);
    }

    private Category getActiveCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        
        if (!category.isActive()) {
            throw new ResourceNotFoundException("Category", "id", id);
        }
        
        return category;
    }
}

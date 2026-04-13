package com.inventory.app.module.inventory.service;

import com.inventory.app.common.exception.DuplicateResourceException;
import com.inventory.app.common.exception.InsufficientStockException;
import com.inventory.app.common.exception.ResourceNotFoundException;
import com.inventory.app.common.response.PagedResponse;
import com.inventory.app.module.inventory.dto.request.ProductRequest;
import com.inventory.app.module.inventory.dto.request.StockAdjustmentRequest;
import com.inventory.app.module.inventory.dto.response.ProductResponse;
import com.inventory.app.module.inventory.entity.Category;
import com.inventory.app.module.inventory.entity.Product;
import com.inventory.app.module.inventory.entity.StockAdjustmentType;
import com.inventory.app.module.inventory.entity.StockAudit;
import com.inventory.app.module.inventory.mapper.ProductMapper;
import com.inventory.app.module.inventory.repository.CategoryRepository;
import com.inventory.app.module.inventory.repository.ProductRepository;
import com.inventory.app.module.inventory.repository.StockAuditRepository;
import com.inventory.app.module.user.entity.User;
import com.inventory.app.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockAuditRepository stockAuditRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product", "sku", request.getSku());
        }

        Category category = getActiveCategory(request.getCategoryId());

        Product product = productMapper.toEntity(request, category);
        product.setActive(true);
        product = productRepository.save(product);

        log.info("Created product: {} with SKU: {}", product.getName(), product.getSku());
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(UUID id) {
        Product product = getActiveProductById(id);
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> findAll(Pageable pageable) {
        Page<ProductResponse> page = productRepository.findAllByActiveTrue(pageable)
                .map(productMapper::toResponse);
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> findByCategory(UUID categoryId, Pageable pageable) {
        Page<ProductResponse> page = productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable)
                .map(productMapper::toResponse);
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> search(String keyword, Pageable pageable) {
        Page<ProductResponse> page = productRepository.findByNameContainingIgnoreCaseAndActiveTrue(keyword, pageable)
                .map(productMapper::toResponse);
        return PagedResponse.of(page);
    }

    @Transactional
    public ProductResponse update(UUID id, ProductRequest request) {
        Product product = getActiveProductById(id);

        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product", "sku", request.getSku());
        }

        if (!product.getCategory().getId().equals(request.getCategoryId())) {
            Category newCategory = getActiveCategory(request.getCategoryId());
            product.setCategory(newCategory);
        }

        productMapper.updateEntity(request, product);
        product = productRepository.save(product);

        log.info("Updated product: {}", product.getId());
        return productMapper.toResponse(product);
    }

    @Transactional
    public void delete(UUID id) {
        Product product = getActiveProductById(id);
        product.setActive(false);
        productRepository.save(product);
        log.info("Soft deleted product: {}", id);
    }

    @Transactional
    public ProductResponse addStock(UUID id, StockAdjustmentRequest request) {
        Product product = getActiveProductById(id);
        product.setQuantity(product.getQuantity() + request.getQuantity());
        product = productRepository.save(product);

        logStockAudit(product, StockAdjustmentType.ADD, request.getQuantity(), request.getReason());
        log.info("Added {} stock to product: {}", request.getQuantity(), product.getSku());

        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse deductStock(UUID id, StockAdjustmentRequest request) {
        Product product = getActiveProductById(id);

        if (product.getQuantity() < request.getQuantity()) {
            throw new InsufficientStockException(
                    String.format("Not enough stock for product %s. Available: %d, Requested: %d",
                            product.getSku(), product.getQuantity(), request.getQuantity()));
        }

        product.setQuantity(product.getQuantity() - request.getQuantity());
        product = productRepository.save(product);

        logStockAudit(product, StockAdjustmentType.DEDUCT, request.getQuantity(), request.getReason());
        log.info("Deducted {} stock from product: {}", request.getQuantity(), product.getSku());

        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getLowStockProducts(int threshold, Pageable pageable) {
        Page<ProductResponse> page = productRepository.findByQuantityLessThanEqualAndActiveTrue(threshold, pageable)
                .map(productMapper::toResponse);
        return PagedResponse.of(page);
    }

    // --- Helper Methods ---

    private Product getActiveProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        if (!product.isActive()) {
            throw new ResourceNotFoundException("Product", "id", id);
        }
        return product;
    }

    private Category getActiveCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        if (!category.isActive()) {
            throw new ResourceNotFoundException("Category", "id", categoryId);
        }
        return category;
    }

    private void logStockAudit(Product product, StockAdjustmentType type, int quantity, String reason) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        StockAudit audit = StockAudit.builder()
                .product(product)
                .adjustmentType(type)
                .quantity(quantity)
                .reason(reason)
                .performedBy(user)
                .build();

        stockAuditRepository.save(audit);
    }
}

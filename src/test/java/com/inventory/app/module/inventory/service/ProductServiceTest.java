package com.inventory.app.module.inventory.service;

import com.inventory.app.common.exception.DuplicateResourceException;
import com.inventory.app.common.exception.InsufficientStockException;
import com.inventory.app.module.inventory.dto.request.ProductRequest;
import com.inventory.app.module.inventory.dto.request.StockAdjustmentRequest;
import com.inventory.app.module.inventory.dto.response.ProductResponse;
import com.inventory.app.module.inventory.entity.Category;
import com.inventory.app.module.inventory.entity.Product;
import com.inventory.app.module.inventory.mapper.ProductMapper;
import com.inventory.app.module.inventory.repository.CategoryRepository;
import com.inventory.app.module.inventory.repository.ProductRepository;
import com.inventory.app.module.inventory.repository.StockAuditRepository;
import com.inventory.app.module.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private StockAuditRepository stockAuditRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductMapper productMapper;

    @InjectMocks private ProductService productService;

    @Test
    void createProduct_duplicateSku_throwsException() {
        ProductRequest request = new ProductRequest();
        request.setSku("EXISTING-SKU");

        when(productRepository.existsBySku("EXISTING-SKU")).thenReturn(true);

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void deductStock_insufficientStock_throwsException() {
        UUID productId = UUID.randomUUID();
        Product product = Product.builder().quantity(10).active(true).build();
        product.setId(productId);
        
        StockAdjustmentRequest request = new StockAdjustmentRequest();
        request.setQuantity(20);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.deductStock(productId, request))
                .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    void softDelete_success() {
        UUID productId = UUID.randomUUID();
        Product product = Product.builder().active(true).build();
        product.setId(productId);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        productService.delete(productId);

        assertThat(product.isActive()).isFalse();
        verify(productRepository).save(product);
    }
}

package com.inventory.app.module.inventory.controller;

import com.inventory.app.common.response.ApiResponse;
import com.inventory.app.common.response.PagedResponse;
import com.inventory.app.module.inventory.dto.request.ProductRequest;
import com.inventory.app.module.inventory.dto.request.StockAdjustmentRequest;
import com.inventory.app.module.inventory.dto.response.ProductResponse;
import com.inventory.app.module.inventory.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/inventory/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ProductResponse>> findById(@PathVariable UUID id) {
        ProductResponse response = productService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> findAll(Pageable pageable) {
        PagedResponse<ProductResponse> response = productService.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/category/{categoryId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> findByCategory(
            @PathVariable UUID categoryId, Pageable pageable) {
        PagedResponse<ProductResponse> response = productService.findByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> search(
            @RequestParam String keyword, Pageable pageable) {
        PagedResponse<ProductResponse> response = productService.search(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> softDelete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @PatchMapping("/{id}/stock/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductResponse>> addStock(
            @PathVariable UUID id, @Valid @RequestBody StockAdjustmentRequest request) {
        ProductResponse response = productService.addStock(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/stock/deduct")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProductResponse>> deductStock(
            @PathVariable UUID id, @Valid @RequestBody StockAdjustmentRequest request) {
        ProductResponse response = productService.deductStock(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getLowStockProducts(
            @RequestParam(defaultValue = "10") int threshold, Pageable pageable) {
        PagedResponse<ProductResponse> response = productService.getLowStockProducts(threshold, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

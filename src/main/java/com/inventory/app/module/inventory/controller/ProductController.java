package com.inventory.app.module.inventory.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;

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
@Tag(name = "Products")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden — insufficient role permissions"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
})
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create product")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Created"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get product by ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> findById(@PathVariable UUID id) {
        ProductResponse response = productService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List all active products (paginated)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> findAll(@ParameterObject Pageable pageable) {
        PagedResponse<ProductResponse> response = productService.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/category/{categoryId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get products by category")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> findByCategory(
            @PathVariable UUID categoryId, @ParameterObject Pageable pageable) {
        PagedResponse<ProductResponse> response = productService.findByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search products by name or SKU")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> search(
            @Parameter(description = "Keyword to search in name or SKU") @RequestParam String keyword, 
            @ParameterObject Pageable pageable) {
        PagedResponse<ProductResponse> response = productService.search(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update product")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft delete product")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "No Content")
    public ResponseEntity<ApiResponse<Void>> softDelete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @PatchMapping("/{id}/stock/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Add stock quantity")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<ApiResponse<ProductResponse>> addStock(
            @PathVariable UUID id, @Valid @RequestBody StockAdjustmentRequest request) {
        ProductResponse response = productService.addStock(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/stock/deduct")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Deduct stock quantity")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<ApiResponse<ProductResponse>> deductStock(
            @PathVariable UUID id, @Valid @RequestBody StockAdjustmentRequest request) {
        ProductResponse response = productService.deductStock(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get low stock products")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getLowStockProducts(
            @Parameter(description = "Low stock threshold") @RequestParam(defaultValue = "10") int threshold, 
            @ParameterObject Pageable pageable) {
        PagedResponse<ProductResponse> response = productService.getLowStockProducts(threshold, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

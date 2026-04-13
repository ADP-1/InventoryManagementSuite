package com.inventory.app.module.customer.controller;

import com.inventory.app.common.response.ApiResponse;
import com.inventory.app.common.response.PagedResponse;
import com.inventory.app.module.billing.dto.response.InvoiceResponse;
import com.inventory.app.module.customer.dto.request.CustomerRequest;
import com.inventory.app.module.customer.dto.response.CustomerResponse;
import com.inventory.app.module.customer.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> create(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse response = customerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CustomerResponse>> findById(@PathVariable UUID id) {
        CustomerResponse response = customerService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<CustomerResponse>>> findAll(Pageable pageable) {
        PagedResponse<CustomerResponse> response = customerService.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<CustomerResponse>>> search(
            @RequestParam String keyword, Pageable pageable) {
        PagedResponse<CustomerResponse> response = customerService.search(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody CustomerRequest request) {
        CustomerResponse response = customerService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> softDelete(@PathVariable UUID id) {
        customerService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Customer deleted successfully", null));
    }

    @GetMapping("/{id}/invoices")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<InvoiceResponse>>> getInvoiceHistory(
            @PathVariable UUID id, Pageable pageable) {
        PagedResponse<InvoiceResponse> response = customerService.getInvoiceHistory(id, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

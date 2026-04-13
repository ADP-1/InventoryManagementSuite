package com.inventory.app.module.billing.controller;

import com.inventory.app.common.response.ApiResponse;
import com.inventory.app.common.response.PagedResponse;
import com.inventory.app.module.billing.dto.request.InvoiceRequest;
import com.inventory.app.module.billing.dto.response.InvoiceResponse;
import com.inventory.app.module.billing.entity.InvoiceStatus;
import com.inventory.app.module.billing.service.BillingService;
import com.inventory.app.module.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/billing/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final BillingService billingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> create(
            @Valid @RequestBody InvoiceRequest request,
            @AuthenticationPrincipal User currentUser) {
        InvoiceResponse response = billingService.createInvoice(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<InvoiceResponse>> findById(@PathVariable UUID id) {
        InvoiceResponse response = billingService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PagedResponse<InvoiceResponse>>> findAll(Pageable pageable) {
        PagedResponse<InvoiceResponse> response = billingService.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<InvoiceResponse>>> findByCustomer(
            @PathVariable UUID customerId, Pageable pageable) {
        PagedResponse<InvoiceResponse> response = billingService.findByCustomer(customerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PagedResponse<InvoiceResponse>>> findByStatus(
            @PathVariable InvoiceStatus status, Pageable pageable) {
        PagedResponse<InvoiceResponse> response = billingService.findByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> confirm(@PathVariable UUID id) {
        InvoiceResponse response = billingService.confirmInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> pay(@PathVariable UUID id) {
        InvoiceResponse response = billingService.markAsPaid(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> cancel(@PathVariable UUID id) {
        InvoiceResponse response = billingService.cancelInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

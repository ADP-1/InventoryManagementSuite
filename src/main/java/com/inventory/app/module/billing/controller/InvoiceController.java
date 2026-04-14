package com.inventory.app.module.billing.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;

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
@Tag(name = "Invoices")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden — insufficient role permissions"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
})
public class InvoiceController {

    private final BillingService billingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    @Operation(summary = "Create invoice (deducts stock automatically)", 
               description = "Stock is deducted immediately on creation. Unit price is snapshotted from current product price at time of invoice creation.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Created"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
    })
    public ResponseEntity<ApiResponse<InvoiceResponse>> create(
            @Valid @RequestBody InvoiceRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails currentUser) {
        InvoiceResponse response = billingService.createInvoice(request, currentUser.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get invoice by ID with line items")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<ApiResponse<InvoiceResponse>> findById(@PathVariable UUID id) {
        InvoiceResponse response = billingService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "List all invoices (paginated)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<ApiResponse<PagedResponse<InvoiceResponse>>> findAll(@ParameterObject Pageable pageable) {
        PagedResponse<InvoiceResponse> response = billingService.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get invoices by customer")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<ApiResponse<PagedResponse<InvoiceResponse>>> findByCustomer(
            @PathVariable UUID customerId, @ParameterObject Pageable pageable) {
        PagedResponse<InvoiceResponse> response = billingService.findByCustomer(customerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Filter invoices by status")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<ApiResponse<PagedResponse<InvoiceResponse>>> findByStatus(
            @Parameter(description = "Invoice status to filter by") @PathVariable InvoiceStatus status, 
            @ParameterObject Pageable pageable) {
        PagedResponse<InvoiceResponse> response = billingService.findByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Confirm invoice (DRAFT → ISSUED)")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request")
    })
    public ResponseEntity<ApiResponse<InvoiceResponse>> confirm(@PathVariable UUID id) {
        InvoiceResponse response = billingService.confirmInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Mark invoice as paid (ISSUED → PAID)")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request")
    })
    public ResponseEntity<ApiResponse<InvoiceResponse>> pay(@PathVariable UUID id) {
        InvoiceResponse response = billingService.markAsPaid(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Cancel invoice and restore stock", 
               description = "Cancels the invoice and restores stock for all line items. Only DRAFT and ISSUED invoices can be cancelled. PAID invoices are terminal.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request")
    })
    public ResponseEntity<ApiResponse<InvoiceResponse>> cancel(@PathVariable UUID id) {
        InvoiceResponse response = billingService.cancelInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

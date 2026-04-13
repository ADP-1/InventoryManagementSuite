package com.inventory.app.module.billing.service;

import com.inventory.app.common.exception.BadRequestException;
import com.inventory.app.common.exception.ResourceNotFoundException;
import com.inventory.app.common.response.PagedResponse;
import com.inventory.app.common.util.InvoiceNumberGenerator;
import com.inventory.app.module.billing.dto.request.InvoiceItemRequest;
import com.inventory.app.module.billing.dto.request.InvoiceRequest;
import com.inventory.app.module.billing.dto.response.InvoiceResponse;
import com.inventory.app.module.billing.entity.Invoice;
import com.inventory.app.module.billing.entity.InvoiceItem;
import com.inventory.app.module.billing.entity.InvoiceStatus;
import com.inventory.app.module.billing.mapper.InvoiceMapper;
import com.inventory.app.module.billing.repository.InvoiceRepository;
import com.inventory.app.module.customer.entity.Customer;
import com.inventory.app.module.customer.repository.CustomerRepository;
import com.inventory.app.module.inventory.dto.request.StockAdjustmentRequest;
import com.inventory.app.module.inventory.entity.Product;
import com.inventory.app.module.inventory.repository.ProductRepository;
import com.inventory.app.module.inventory.service.ProductService;
import com.inventory.app.module.user.entity.User;
import com.inventory.app.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final InvoiceMapper invoiceMapper;
    private final InvoiceNumberGenerator invoiceNumberGenerator;

    // ─── Create Invoice ───────────────────────────────────────────────────────

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request, UUID createdByUserId) {
        // Validate customer
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        if (!customer.isActive()) {
            throw new BadRequestException("Customer is inactive and cannot be invoiced");
        }

        // Validate creator user
        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", createdByUserId));

        // Build line items + calculate subtotal
        List<InvoiceItem> lineItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (InvoiceItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            if (!product.isActive()) {
                throw new BadRequestException("Product '" + product.getName() + "' is inactive and cannot be added to an invoice");
            }

            // Snapshot unit price at time of invoice creation
            BigDecimal unitPrice = product.getPrice();
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            subtotal = subtotal.add(totalPrice);

            lineItems.add(InvoiceItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .build());
        }

        // Calculate tax, total
        BigDecimal taxPercent = request.getTaxPercent().setScale(2, RoundingMode.HALF_UP);
        BigDecimal tax = subtotal.multiply(taxPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal discount = request.getDiscount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax).subtract(discount).setScale(2, RoundingMode.HALF_UP);

        if (total.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Invoice total cannot be negative. Check discount amount.");
        }

        // Build and save invoice
        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumberGenerator.generate())
                .customer(customer)
                .user(createdBy)
                .status(InvoiceStatus.DRAFT)
                .subtotal(subtotal)
                .taxPercent(taxPercent)
                .tax(tax)
                .discount(discount)
                .total(total)
                .notes(request.getNotes())
                .build();

        // Attach items to invoice
        for (InvoiceItem item : lineItems) {
            item.setInvoice(invoice);
        }
        invoice.setItems(lineItems);

        invoice = invoiceRepository.save(invoice);

        // Deduct stock AFTER invoice is saved (rollback via @Transactional if save fails)
        for (InvoiceItem item : invoice.getItems()) {
            StockAdjustmentRequest adj = new StockAdjustmentRequest();
            adj.setQuantity(item.getQuantity());
            adj.setReason("Invoice created: " + invoice.getInvoiceNumber());
            productService.deductStock(item.getProduct().getId(), adj);
        }

        log.info("Created invoice: {} for customer: {}", invoice.getInvoiceNumber(), customer.getEmail());
        return invoiceMapper.toResponse(invoice);
    }

    // ─── Confirm Invoice (DRAFT → ISSUED) ────────────────────────────────────

    @Transactional
    public InvoiceResponse confirmInvoice(UUID invoiceId) {
        Invoice invoice = getInvoiceById(invoiceId);

        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT invoices can be confirmed. Current status: " + invoice.getStatus());
        }

        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice = invoiceRepository.save(invoice);
        log.info("Confirmed invoice: {}", invoice.getInvoiceNumber());
        return invoiceMapper.toResponse(invoice);
    }

    // ─── Mark as Paid (ISSUED → PAID) ────────────────────────────────────────

    @Transactional
    public InvoiceResponse markAsPaid(UUID invoiceId) {
        Invoice invoice = getInvoiceById(invoiceId);

        if (invoice.getStatus() != InvoiceStatus.ISSUED) {
            throw new BadRequestException("Only ISSUED invoices can be marked as paid. Current status: " + invoice.getStatus());
        }

        invoice.setStatus(InvoiceStatus.PAID);
        invoice = invoiceRepository.save(invoice);
        log.info("Marked invoice as paid: {}", invoice.getInvoiceNumber());
        return invoiceMapper.toResponse(invoice);
    }

    // ─── Cancel Invoice (DRAFT|ISSUED → CANCELLED) ───────────────────────────

    @Transactional
    public InvoiceResponse cancelInvoice(UUID invoiceId) {
        Invoice invoice = getInvoiceById(invoiceId);

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("PAID invoices cannot be cancelled.");
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BadRequestException("Invoice is already cancelled.");
        }

        invoice.setStatus(InvoiceStatus.CANCELLED);
        invoice = invoiceRepository.save(invoice);

        // Restore stock for each line item
        for (InvoiceItem item : invoice.getItems()) {
            StockAdjustmentRequest adj = new StockAdjustmentRequest();
            adj.setQuantity(item.getQuantity());
            adj.setReason("Invoice cancellation: " + invoice.getInvoiceNumber());
            productService.addStock(item.getProduct().getId(), adj);
        }

        log.info("Cancelled invoice: {}", invoice.getInvoiceNumber());
        return invoiceMapper.toResponse(invoice);
    }

    // ─── Queries ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public InvoiceResponse findById(UUID invoiceId) {
        Invoice invoice = getInvoiceById(invoiceId);
        return invoiceMapper.toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public PagedResponse<InvoiceResponse> findAll(Pageable pageable) {
        Page<InvoiceResponse> page = invoiceRepository.findAll(pageable)
                .map(invoiceMapper::toResponse);
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<InvoiceResponse> findByCustomer(UUID customerId, Pageable pageable) {
        Page<InvoiceResponse> page = invoiceRepository.findByCustomerId(customerId, pageable)
                .map(invoiceMapper::toResponse);
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<InvoiceResponse> findByStatus(InvoiceStatus status, Pageable pageable) {
        Page<InvoiceResponse> page = invoiceRepository.findByStatus(status, pageable)
                .map(invoiceMapper::toResponse);
        return PagedResponse.of(page);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private Invoice getInvoiceById(UUID id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));
    }
}

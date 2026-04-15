package com.inventory.app.module.billing.service;

import com.inventory.app.common.exception.BadRequestException;
import com.inventory.app.common.exception.ResourceNotFoundException;
import com.inventory.app.common.util.InvoiceNumberGenerator;
import com.inventory.app.module.billing.dto.request.InvoiceItemRequest;
import com.inventory.app.module.billing.dto.request.InvoiceRequest;
import com.inventory.app.module.billing.dto.response.InvoiceResponse;
import com.inventory.app.module.billing.entity.Invoice;
import com.inventory.app.module.billing.entity.InvoiceStatus;
import com.inventory.app.module.billing.mapper.InvoiceMapper;
import com.inventory.app.module.billing.repository.InvoiceRepository;
import com.inventory.app.module.customer.entity.Customer;
import com.inventory.app.module.customer.repository.CustomerRepository;
import com.inventory.app.module.inventory.entity.Product;
import com.inventory.app.module.inventory.repository.ProductRepository;
import com.inventory.app.module.inventory.service.ProductService;
import com.inventory.app.module.user.entity.User;
import com.inventory.app.module.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock private InvoiceRepository invoiceRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductService productService;
    @Mock private InvoiceMapper invoiceMapper;
    @Mock private InvoiceNumberGenerator invoiceNumberGenerator;

    @InjectMocks private BillingService billingService;

    private User adminUser;
    private Customer customer;
    private Product product;

    @BeforeEach
    void setUp() {
        adminUser = User.builder().email("admin@test.com").build();
        adminUser.setId(UUID.randomUUID());

        customer = Customer.builder().active(true).email("cust@test.com").build();
        customer.setId(UUID.randomUUID());

        product = Product.builder().name("Test Product").sku("SKU-123").price(new BigDecimal("100.00")).quantity(50).active(true).build();
        product.setId(UUID.randomUUID());
    }

    @Test
    void createInvoice_success() {
        InvoiceRequest request = new InvoiceRequest();
        request.setCustomerId(customer.getId());
        
        InvoiceItemRequest itemRequest = new InvoiceItemRequest();
        itemRequest.setProductId(product.getId());
        itemRequest.setQuantity(2);
        
        request.setItems(List.of(itemRequest));
        request.setTaxPercent(new BigDecimal("10"));
        request.setDiscount(new BigDecimal("5"));

        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(invoiceNumberGenerator.generate()).thenReturn("INV-001");
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));
        when(invoiceMapper.toResponse(any(Invoice.class))).thenReturn(new InvoiceResponse());

        InvoiceResponse response = billingService.createInvoice(request, adminUser.getEmail());

        assertThat(response).isNotNull();
        verify(invoiceRepository).save(any(Invoice.class));
        verify(productService).deductStock(eq(product.getId()), any());
    }

    @Test
    void createInvoice_customerNotFound() {
        InvoiceRequest request = new InvoiceRequest();
        request.setCustomerId(UUID.randomUUID());

        when(customerRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> billingService.createInvoice(request, "admin@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void cancelInvoice_success() {
        Invoice invoice = Invoice.builder()
                .status(InvoiceStatus.ISSUED)
                .invoiceNumber("INV-001")
                .items(List.of())
                .build();
        invoice.setId(UUID.randomUUID());

        when(invoiceRepository.findByIdWithDetails(invoice.getId())).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any())).thenReturn(invoice);
        when(invoiceMapper.toResponse(any())).thenReturn(new InvoiceResponse());

        billingService.cancelInvoice(invoice.getId());

        assertThat(invoice.getStatus()).isEqualTo(InvoiceStatus.CANCELLED);
        verify(invoiceRepository).save(invoice);
    }

    @Test
    void cancelInvoice_paidInvoice_throwsBadRequest() {
        Invoice invoice = Invoice.builder().status(InvoiceStatus.PAID).build();
        invoice.setId(UUID.randomUUID());
        when(invoiceRepository.findByIdWithDetails(invoice.getId())).thenReturn(Optional.of(invoice));

        assertThatThrownBy(() -> billingService.cancelInvoice(invoice.getId()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("PAID invoices cannot be cancelled");
    }
}

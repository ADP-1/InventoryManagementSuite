package com.inventory.app.module.customer.service;

import com.inventory.app.common.exception.BadRequestException;
import com.inventory.app.common.exception.DuplicateResourceException;
import com.inventory.app.common.exception.ResourceNotFoundException;
import com.inventory.app.common.response.PagedResponse;
import com.inventory.app.module.billing.dto.response.InvoiceResponse;
import com.inventory.app.module.billing.mapper.InvoiceMapper;
import com.inventory.app.module.billing.repository.InvoiceRepository;
import com.inventory.app.module.customer.dto.request.CustomerRequest;
import com.inventory.app.module.customer.dto.response.CustomerResponse;
import com.inventory.app.module.customer.entity.Customer;
import com.inventory.app.module.customer.mapper.CustomerMapper;
import com.inventory.app.module.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import com.inventory.app.module.customer.dto.response.CustomerDetailsResponse;
import com.inventory.app.module.customer.dto.response.CustomerStats;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceMapper invoiceMapper;

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Customer", "email", request.getEmail());
        }

        Customer customer = customerMapper.toEntity(request);
        customer.setActive(true);
        customer = customerRepository.save(customer);
        log.info("Created customer with email: {}", customer.getEmail());
        return customerMapper.toResponse(customer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return customerMapper.toResponse(customer);
    }

    @Transactional(readOnly = true)
    public CustomerDetailsResponse getDetails(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        
        CustomerStats stats = invoiceRepository.getCustomerStats(id);
        
        // Ensure stats is never null and totalSpent is never null (though COALESCE handles it)
        if (stats == null) {
            stats = CustomerStats.builder()
                    .totalInvoices(0)
                    .totalSpent(BigDecimal.ZERO)
                    .firstTransactionDate(null)
                    .build();
        }
        
        return CustomerDetailsResponse.builder()
                .profile(customerMapper.toResponse(customer))
                .stats(stats)
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<CustomerResponse> findAll(Pageable pageable) {
        Page<CustomerResponse> page = customerRepository.findAllByActiveTrue(pageable)
                .map(customerMapper::toResponse);
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<CustomerResponse> search(String keyword, Pageable pageable) {
        Page<CustomerResponse> page = customerRepository.searchByKeyword(keyword, pageable)
                .map(customerMapper::toResponse);
        return PagedResponse.of(page);
    }

    @Transactional
    public CustomerResponse update(UUID id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        if (!customer.getEmail().equals(request.getEmail()) && customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Customer", "email", request.getEmail());
        }

        customerMapper.updateEntity(request, customer);
        customer = customerRepository.save(customer);
        log.info("Updated customer with id: {}", id);
        return customerMapper.toResponse(customer);
    }

    @Transactional
    public void delete(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        if (!customer.isActive()) {
            return;
        }

        long activeInvoicesCount = customerRepository.countActiveInvoicesByCustomerId(id);
        if (activeInvoicesCount > 0) {
            throw new BadRequestException("Cannot delete customer with active invoices");
        }

        customer.setActive(false);
        customerRepository.save(customer);
        log.info("Soft-deleted customer with id: {}", id);
    }

    @Transactional(readOnly = true)
    public PagedResponse<InvoiceResponse> getInvoiceHistory(UUID customerId, Pageable pageable) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer", "id", customerId);
        }

        Page<InvoiceResponse> page = invoiceRepository.findByCustomerId(customerId, pageable)
                .map(invoiceMapper::toResponse);
        return PagedResponse.of(page);
    }
}

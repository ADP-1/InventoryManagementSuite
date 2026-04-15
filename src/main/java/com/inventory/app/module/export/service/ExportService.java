package com.inventory.app.module.export.service;

import com.inventory.app.module.billing.entity.Invoice;
import com.inventory.app.module.billing.entity.InvoiceStatus;
import com.inventory.app.module.billing.repository.InvoiceRepository;
import com.inventory.app.module.customer.entity.Customer;
import com.inventory.app.module.customer.repository.CustomerRepository;
import com.inventory.app.module.inventory.entity.Product;
import com.inventory.app.module.inventory.repository.ProductRepository;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Transactional(readOnly = true)
    public byte[] exportProductsCsv() {
        List<Product> products = productRepository.findAll().stream()
                .filter(Product::isActive)
                .toList();

        return generateCsv(new String[]{"SKU", "Name", "Category", "Price", "Quantity", "Created Date"},
                products.stream().map(p -> new String[]{
                        p.getSku(),
                        p.getName(),
                        p.getCategory().getName(),
                        p.getPrice().toString(),
                        String.valueOf(p.getQuantity()),
                        p.getCreatedAt().format(DATE_FORMATTER)
                }).toList());
    }

    @Transactional(readOnly = true)
    public byte[] exportCustomersCsv() {
        List<Customer> customers = customerRepository.findAll().stream()
                .filter(Customer::isActive)
                .toList();

        return generateCsv(new String[]{"Name", "Email", "Phone", "Address", "Created Date"},
                customers.stream().map(c -> new String[]{
                        c.getName(),
                        c.getEmail(),
                        c.getPhone() != null ? c.getPhone() : "",
                        c.getAddress() != null ? c.getAddress() : "",
                        c.getCreatedAt().format(DATE_FORMATTER)
                }).toList());
    }

    @Transactional(readOnly = true)
    public byte[] exportInvoicesCsv(InvoiceStatus status, LocalDateTime from, LocalDateTime to) {
        List<Invoice> invoices = invoiceRepository.findAll().stream()
                .filter(i -> (status == null || i.getStatus() == status))
                .filter(i -> (from == null || !i.getCreatedAt().isBefore(from)))
                .filter(i -> (to == null || !i.getCreatedAt().isAfter(to)))
                .toList();

        return generateCsv(new String[]{"Invoice Number", "Customer", "Status", "Subtotal", "Tax", "Discount", "Total", "Created Date"},
                invoices.stream().map(i -> new String[]{
                        i.getInvoiceNumber(),
                        i.getCustomer().getName(),
                        i.getStatus().toString(),
                        i.getSubtotal().toString(),
                        i.getTax().toString(),
                        i.getDiscount().toString(),
                        i.getTotal().toString(),
                        i.getCreatedAt().format(DATE_FORMATTER)
                }).toList());
    }

    private byte[] generateCsv(String[] headers, List<String[]> data) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Write UTF-8 BOM for Excel compatibility
            out.write(0xef);
            out.write(0xbb);
            out.write(0xbf);

            try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
                writer.writeNext(headers);
                writer.writeAll(data);
            }
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV", e);
        }
    }
}
